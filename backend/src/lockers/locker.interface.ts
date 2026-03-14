import { Money } from '../money/money';

export interface LockerInterface {
  creditLock(wallet: any, amount: Money, transaction: any): Promise<boolean>;
  debitLock(wallet: any, amount: Money, transaction: any): Promise<boolean>;
  shouldInitiateTransaction(wallet: any, amount: Money, transaction: any): boolean;
}
