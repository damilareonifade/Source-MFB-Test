export interface CalculatorInterface {
  supported(): boolean;
  compare(a: string, b: string): number;
  add(amount: string, addend: string): string;
  subtract(amount: string, subtrahend: string): string;
  multiply(amount: string, multiplier: number | string): string;
  divide(amount: string, divisor: number | string): string;
  ceil(number: string): string;
  floor(number: string): string;
  absolute(number: string): string;
  round(number: string, roundingMode: number): string;
  share(amount: string, ratio: number | string, total: number | string): string;
  mod(amount: string, divisor: number | string): string;
}
