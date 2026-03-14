/**
 * Immutable Currency value object.
 * Mirrors Currency class.
 */
export class Currency {
  constructor(
    private readonly _code: string,
    private readonly _symbol: string,
    private readonly _name: string,
    private readonly _subunit: string,
    private readonly _per: number = 100,
    private readonly _numeric: number = 0,
  ) {
    if (!_code) throw new Error('Currency code should not be empty string');
  }

  static create(code: string, symbol: string, name: string, subunit: string, per = 100, numeric = 0): Currency {
    return new Currency(code, symbol, name, subunit, per, numeric);
  }

  getCode(): string   { return this._code; }
  symbol(): string    { return this._symbol; }
  name(): string      { return this._name; }
  subunit(): string   { return this._subunit; }
  per(): number       { return this._per; }
  numeric(): number   { return this._numeric; }

  /** Number of decimal digits. e.g. NGN (per=100) → 2, JPY (per=1) → 0 */
  subunitLength(): number {
    return String(this._per).length - 1;
  }

  equals(other: Currency): boolean {
    return this._code === other._code;
  }

  toString(): string { return this._code; }
  toJSON(): string   { return this._code; }
}
