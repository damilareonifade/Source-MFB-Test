import { Currency } from './currency';
import { CalculatorInterface } from './calculator/calculator.interface';
import { BigIntCalculator } from './calculator/bigint-calculator';
import { MoneyFormatter } from './formatter/money-formatter.interface';
import { IntlMoneyFormatter } from './formatter/intl-money-formatter';

export const ROUND_HALF_UP                = 0;
export const ROUND_HALF_DOWN              = 1;
export const ROUND_HALF_EVEN             = 4;
export const ROUND_HALF_ODD              = 3;
export const ROUND_UP                    = 5;
export const ROUND_DOWN                  = 6;
export const ROUND_HALF_POSITIVE_INFINITY = 7;
export const ROUND_HALF_NEGATIVE_INFINITY = 8;

/**
 * Money value object. Stores amounts as integer subunits (kobo, cents…).
 * Mirrors Money class.
 */
export class Money {
  private _amount: string;
  private readonly _currency: Currency;
  private _immutable = true;

  private static _calculator: CalculatorInterface | null = null;
  private static _currencies   = new Map<string, Currency>();
  private static _formatters    = new Map<string, MoneyFormatter>();
  private static _fmtResolvers  = new Map<string, () => MoneyFormatter>();

  // ── Bootstrap default formatter ────────────────────────────────────────────
  static {
    Money._fmtResolvers.set('intl', () => new IntlMoneyFormatter('en-US'));
  }

  constructor(amount: number | string, currency: Currency) {
    const str = String(amount);
    if (!/^-?\d+$/.test(str)) throw new Error(`Amount must be an integer, got: ${amount}`);
    this._amount   = str;
    this._currency = currency;
  }

  // ── Static registry ────────────────────────────────────────────────────────

  static currencies(...list: Currency[]): void {
    for (const c of list) Money._currencies.set(c.getCode(), c);
  }

  static hasCurrency(c: string | Currency): boolean {
    return Money._currencies.has(c instanceof Currency ? c.getCode() : c);
  }

  static currency(code: string): Currency {
    const c = Money._currencies.get(code);
    if (!c) throw new Error(`[${code}] currency not supported.`);
    return c;
  }

  static removeCurrency(c: string | Currency): void {
    Money._currencies.delete(c instanceof Currency ? c.getCode() : c);
  }

  static removeAllCurrencies(): void { Money._currencies.clear(); }

  /** Register or retrieve a money formatter by name. */
  static formatter(name: string, resolver?: () => MoneyFormatter): MoneyFormatter | void {
    if (resolver) {
      Money._fmtResolvers.set(name, resolver);
      Money._formatters.delete(name);
      return;
    }
    if (!Money._formatters.has(name)) {
      const res = Money._fmtResolvers.get(name);
      if (!res) throw new Error(`"${name}" not found as money formatter`);
      Money._formatters.set(name, res());
    }
    return Money._formatters.get(name)!;
  }

  /** Convenience factory: Money.of('NGN', 100000) */
  static of(code: string, amount: number | string): Money {
    return new Money(amount, Money.currency(code));
  }

  // ── Getters ────────────────────────────────────────────────────────────────

  value(): string    { return this._amount; }
  integer(): number  { return parseInt(this._amount, 10); }
  getCurrency(): Currency { return this._currency; }
  isImmutable(): boolean  { return this._immutable; }

  /**
   * Returns major-unit string: 100000 kobo → "1000", 100001 → "1000.01"
   */
  whole(): string {
    const neg = this._amount.startsWith('-');
    const abs = neg ? this._amount.slice(1) : this._amount;
    const sub = this._currency.subunitLength();
    let fmt: string;
    if (abs.length > sub) {
      const int  = abs.slice(0, abs.length - sub);
      const dec  = abs.slice(abs.length - sub);
      fmt = dec ? `${int}.${dec}` : int;
    } else {
      fmt = '0.' + '0'.repeat(sub - abs.length) + abs;
    }
    if (neg) fmt = '-' + fmt;
    return fmt.replace(/\.00$/, '');
  }

  // ── Arithmetic ─────────────────────────────────────────────────────────────

  add(...addends: Money[]): Money {
    let amt = this._amount;
    const calc = this.calc();
    for (const a of addends) { this.assertSameCurrency(a); amt = calc.add(amt, a._amount); }
    return this.newInst(amt);
  }

  subtract(...subs: Money[]): Money {
    let amt = this._amount;
    const calc = this.calc();
    for (const s of subs) { this.assertSameCurrency(s); amt = calc.subtract(amt, s._amount); }
    return this.newInst(amt);
  }

  multiply(multiplier: number | string, mode = ROUND_HALF_UP): Money {
    return this.newInst(this.roundAmt(this.calc().multiply(this._amount, multiplier), mode));
  }

  divide(divisor: number | string, mode = ROUND_HALF_UP): Money {
    if (Number(divisor) === 0) throw new Error('Division by zero');
    return this.newInst(this.roundAmt(this.calc().divide(this._amount, divisor), mode));
  }

  mod(divisor: Money): Money {
    this.assertSameCurrency(divisor);
    return new Money(this.calc().mod(this._amount, divisor._amount), this._currency);
  }

  absolute(): Money { return this.newInst(this.calc().absolute(this._amount)); }
  negative(): Money { return this.newInst(this.calc().subtract('0', this._amount)); }

  // ── Comparison ─────────────────────────────────────────────────────────────

  compare(other: Money): number { this.assertSameCurrency(other); return this.calc().compare(this._amount, other._amount); }
  equals(other: Money): boolean { return this.isSameCurrency(other) && this._amount === other._amount; }
  greaterThan(o: Money): boolean      { return this.compare(o) > 0; }
  greaterThanOrEqual(o: Money): boolean { return this.compare(o) >= 0; }
  lessThan(o: Money): boolean         { return this.compare(o) < 0; }
  lessThanOrEqual(o: Money): boolean  { return this.compare(o) <= 0; }
  isZero(): boolean     { return this.calc().compare(this._amount, '0') === 0; }
  isPositive(): boolean { return this.calc().compare(this._amount, '0') > 0; }
  isNegative(): boolean { return this.calc().compare(this._amount, '0') < 0; }
  isSameCurrency(other: Money): boolean { return this._currency.equals(other._currency); }

  // ── Allocation ─────────────────────────────────────────────────────────────

  allocate(ratios: number[]): Money[] {
    if (!ratios.length) throw new Error('Ratios cannot be empty');
    const total = ratios.reduce((a, b) => a + b, 0);
    if (total <= 0) throw new Error('Sum of ratios must be > 0');
    const calc = this.calc();
    let remainder = this._amount;
    const results: Money[] = [];
    for (const ratio of ratios) {
      if (ratio < 0) throw new Error('Ratio must be >= 0');
      const share = calc.share(this._amount, ratio, total);
      results.push(new Money(share, this._currency));
      remainder = calc.subtract(remainder, share);
    }
    if (calc.compare(remainder, '0') !== 0) {
      const fracs = ratios.map(r => {
        const s = (r / total) * parseInt(this._amount, 10);
        return s - Math.floor(s);
      });
      let rem = Math.abs(parseInt(remainder, 10));
      while (rem-- > 0) {
        const idx = fracs.indexOf(Math.max(...fracs));
        results[idx] = new Money(results[idx].integer() + 1, this._currency);
        fracs[idx] = -Infinity;
      }
    }
    return results;
  }

  allocateTo(n: number): Money[] {
    if (!Number.isInteger(n) || n <= 0) throw new Error('Target must be a positive integer');
    return this.allocate(new Array(n).fill(1));
  }

  ratioOf(money: Money): string {
    if (money.isZero()) throw new Error('Cannot calculate ratio of zero');
    return this.calc().divide(this._amount, money._amount);
  }

  // ── Mutability ─────────────────────────────────────────────────────────────

  immutable(): this { this._immutable = true;  return this; }
  mutable():   this { this._immutable = false; return this; }

  // ── Formatting ─────────────────────────────────────────────────────────────

  display(name = 'intl'): string {
    return (Money.formatter(name) as MoneyFormatter).format(this, this._currency);
  }

  toString(): string { return this.display(); }

  toJSON(): object {
    return {
      amount:   this._amount,
      display:  this.display(),
      whole:    this.whole(),
      symbol:   this._currency.symbol(),
      currency: this._currency.toJSON(),
    };
  }

  // ── Statics ────────────────────────────────────────────────────────────────

  static min(first: Money, ...rest: Money[]): Money { return rest.reduce((m, c) => c.lessThan(m) ? c : m, first); }
  static max(first: Money, ...rest: Money[]): Money { return rest.reduce((m, c) => c.greaterThan(m) ? c : m, first); }
  static sum(first: Money, ...rest: Money[]): Money { return first.add(...rest); }
  static avg(first: Money, ...rest: Money[]): Money { return first.add(...rest).divide(rest.length + 1); }

  // ── Privates ───────────────────────────────────────────────────────────────

  private newInst(amount: string): Money {
    if (this._immutable) return new Money(amount, this._currency);
    this._amount = amount;
    return this;
  }

  private assertSameCurrency(other: Money): void {
    if (!this.isSameCurrency(other)) throw new Error('Currencies must be identical');
  }

  private roundAmt(amount: string, mode: number): string {
    if (mode === ROUND_UP)   return this.calc().ceil(amount);
    if (mode === ROUND_DOWN) return this.calc().floor(amount);
    return this.calc().round(amount, mode);
  }

  private calc(): CalculatorInterface {
    if (!Money._calculator) {
      Money._calculator = new BigIntCalculator();
    }
    return Money._calculator;
  }
}
