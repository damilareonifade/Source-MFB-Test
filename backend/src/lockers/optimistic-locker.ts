import { LockerInterface } from './locker.interface';
import { Money } from '../money/money';
import { DataSource } from 'typeorm';

/**
 * Optimistic locker - retries until the DB row matches expected balance.
 */
export class OptimisticLocker implements LockerInterface {
  constructor(private readonly dataSource: DataSource) {}

  async creditLock(wallet: any, amount: Money, transaction: any): Promise<boolean> {
    let updated = false;
    do {
      // Reload fresh wallet from DB
      const walletRepo = this.dataSource.getRepository(wallet.constructor);
      const fresh = await walletRepo.findOneBy({ id: wallet.id });
      if (!fresh) throw new Error('Wallet not found');

      const currentBalance = fresh.rawAmount;
      const newBalance = parseInt(currentBalance, 10) + amount.integer();

      const result = await walletRepo
        .createQueryBuilder()
        .update()
        .set({ rawAmount: newBalance })
        .where('id = :id AND rawAmount = :currentBalance', {
          id: wallet.id,
          currentBalance,
        })
        .execute();

      updated = result.affected > 0;

      if (updated) {
        wallet.rawAmount = String(newBalance);
        transaction.rawAmount    = String(amount.integer());
        transaction.rawBalance   = String(newBalance);
      }
    } while (!updated);

    return updated;
  }

  async debitLock(wallet: any, amount: Money, transaction: any): Promise<boolean> {
    let updated = false;
    do {
      const walletRepo = this.dataSource.getRepository(wallet.constructor);
      const fresh = await walletRepo.findOneBy({ id: wallet.id });
      if (!fresh) throw new Error('Wallet not found');

      const currentBalance = fresh.rawAmount;
      const newBalance = parseInt(currentBalance, 10) - amount.integer();

      const result = await walletRepo
        .createQueryBuilder()
        .update()
        .set({ rawAmount: newBalance })
        .where('id = :id AND rawAmount = :currentBalance', {
          id: wallet.id,
          currentBalance,
        })
        .execute();

      updated = result.affected > 0;

      if (updated) {
        wallet.rawAmount = String(newBalance);
        transaction.rawAmount  = String(amount.integer());
        transaction.rawBalance = String(newBalance);
      }
    } while (!updated);

    return updated;
  }

  shouldInitiateTransaction(_wallet: any, _amount: Money, _transaction: any): boolean {
    return false;
  }
}
