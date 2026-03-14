import { Currency } from '../currency';
import { Money } from '../money';

export interface MoneyFormatter {
  format(money: Money, currency: Currency): string;
}
