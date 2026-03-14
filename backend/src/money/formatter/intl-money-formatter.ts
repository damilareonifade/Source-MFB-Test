import { MoneyFormatter } from './money-formatter.interface';
import { Currency } from '../currency';
import { Money } from '../money';

export class IntlMoneyFormatter implements MoneyFormatter {
  constructor(private readonly locale: string = 'en-US') {}

  format(money: Money, currency: Currency): string {
    const whole = money.whole();
    const num = parseFloat(whole);
    try {
      const formatted = new Intl.NumberFormat(this.locale, {
        style: 'currency',
        currency: currency.getCode(),
        minimumFractionDigits: 0,
        maximumFractionDigits: currency.subunitLength(),
      }).format(num);
      return formatted.replace(currency.getCode(), currency.symbol()).trim();
    } catch {
      return `${currency.symbol()}${num.toLocaleString(this.locale)}`;
    }
  }
}
