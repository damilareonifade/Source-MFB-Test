import { CalculatorInterface } from './calculator.interface';

export class BigIntCalculator implements CalculatorInterface {
  supported(): boolean {
    return true;
  }

  compare(a: string, b: string): number {
    const ai = BigInt(a);
    const bi = BigInt(b);
    if (ai < bi) return -1;
    if (ai > bi) return 1;
    return 0;
  }

  add(amount: string, addend: string): string {
    return String(BigInt(amount) + BigInt(addend));
  }

  subtract(amount: string, subtrahend: string): string {
    return String(BigInt(amount) - BigInt(subtrahend));
  }

  multiply(amount: string, multiplier: number | string): string {
    const result = Number(amount) * Number(multiplier);
    this.assertIntegerBounds(result);
    return String(result);
  }

  divide(amount: string, divisor: number | string): string {
    const result = Number(amount) / Number(divisor);
    this.assertIntegerBounds(result);
    return String(result);
  }

  ceil(number: string): string {
    return String(Math.ceil(Number(number)));
  }

  floor(number: string): string {
    return String(Math.floor(Number(number)));
  }

  absolute(number: string): string {
    return number.startsWith('-') ? number.slice(1) : number;
  }

  round(number: string, roundingMode: number): string {
    const n = Number(number);
    switch (roundingMode) {
      case 5: return String(Math.ceil(n));   // ROUND_UP
      case 6: return String(Math.floor(n));  // ROUND_DOWN
      case 7: return String(Math.round(n));  // ROUND_HALF_POSITIVE_INFINITY
      case 8: return String(Math.floor(n + 0.5)); // ROUND_HALF_NEGATIVE_INFINITY
      default: return String(Math.round(n));
    }
  }

  share(amount: string, ratio: number | string, total: number | string): string {
    return String(Math.floor((Number(amount) * Number(ratio)) / Number(total)));
  }

  mod(amount: string, divisor: number | string): string {
    return String(BigInt(amount) % BigInt(divisor));
  }

  private assertIntegerBounds(amount: number): void {
    if (amount > Number.MAX_SAFE_INTEGER) throw new RangeError('Integer overflow');
    if (amount < Number.MIN_SAFE_INTEGER) throw new RangeError('Integer underflow');
  }
}
