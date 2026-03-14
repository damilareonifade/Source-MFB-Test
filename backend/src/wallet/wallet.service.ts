import {
  Injectable, BadRequestException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { WalletEntity } from './entities/wallet.entity';
import { TransactionEntity } from '../transactions/entities/transaction.entity';
import { UsersService } from '../users/users.service';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from './dto/transfer.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(WalletEntity)
    private readonly walletRepo: Repository<WalletEntity>,
    @InjectRepository(TransactionEntity)
    private readonly txnRepo: Repository<TransactionEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
  ) {}

  async createForUser(userId: number): Promise<WalletEntity> {
    const wallet = this.walletRepo.create({ userId, balance: 0, currency: 'NGN' });
    return this.walletRepo.save(wallet);
  }

  async getForUser(userId: number) {
    const wallet = await this.walletRepo
      .createQueryBuilder('w')
      .innerJoinAndSelect('w.user', 'u')
      .where('w.user_id = :userId', { userId })
      .getOne();

    if (!wallet) throw new NotFoundException('Wallet not found');

    return {
      id: wallet.id,
      accountNumber: wallet.user.accountNumber,
      balance: Number(wallet.balance),
      balanceFormatted: (Number(wallet.balance) / 100).toFixed(2),
      currency: wallet.currency,
    };
  }

  async deposit(userId: number, dto: DepositDto) {
    const wallet = await this.walletRepo.findOneBy({ userId });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const amountMinor = dto.amount * 100;
    const newBalance = await this.creditWallet(wallet.id, amountMinor, 'Deposit');

    const txn = this.txnRepo.create({
      walletId: wallet.id,
      reference: uuidv4(),
      type: 'credit',
      amount: amountMinor,
      balanceAfter: newBalance,
      description: 'Deposit',
      counterpartyAccount: null,
    });
    await this.txnRepo.save(txn);

    return {
      wallet: {
        id: wallet.id,
        balance: newBalance,
        balanceFormatted: (newBalance / 100).toFixed(2),
        currency: wallet.currency,
      },
      transaction: this.serializeTxn(txn),
    };
  }

  async externalDeposit(
    accountNumber: string,
    amountMinor: number,
    description: string,
    reference: string,
  ): Promise<void> {
    const user = await this.usersService.findByAccountNumber(accountNumber);
    if (!user) throw new NotFoundException('Account not found');

    const wallet = await this.walletRepo.findOneBy({ userId: user.id });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const newBalance = await this.creditWallet(wallet.id, amountMinor, description);

    const txn = this.txnRepo.create({
      walletId: wallet.id,
      reference,
      type: 'credit',
      amount: amountMinor,
      balanceAfter: newBalance,
      description,
      counterpartyAccount: null,
    });
    await this.txnRepo.save(txn);
  }

  async transfer(userId: number, dto: TransferDto) {
    const senderWallet = await this.walletRepo.findOneBy({ userId });
    if (!senderWallet) throw new NotFoundException('Sender wallet not found');

    // Resolve recipient by account number or email
    let recipientUser = await this.usersService.findByAccountNumber(dto.recipient);
    if (!recipientUser) {
      recipientUser = await this.usersService.findByEmail(dto.recipient);
    }
    if (!recipientUser) throw new NotFoundException('Recipient not found');

    if (recipientUser.id === userId) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    const receiverWallet = await this.walletRepo.findOneBy({ userId: recipientUser.id });
    if (!receiverWallet) throw new NotFoundException('Recipient wallet not found');

    const amountMinor = dto.amount * 100;
    const reference = uuidv4();

    const { senderNewBalance, receiverNewBalance } = await this.atomicTransfer(
      senderWallet.id,
      receiverWallet.id,
      amountMinor,
      reference,
      recipientUser.accountNumber,
    );

    return {
      message: 'Transfer successful',
      reference,
      amount: amountMinor,
      recipient: {
        accountNumber: recipientUser.accountNumber,
        email: recipientUser.email,
      },
    };
  }

  // ── Concurrency-safe credit (optimistic lock loop) ────────────────────────

  private async creditWallet(
    walletId: number,
    amountMinor: number,
    description: string,
  ): Promise<number> {
    let updated = false;
    let newBalance = 0;

    while (!updated) {
      const wallet = await this.walletRepo.findOneBy({ id: walletId });
      if (!wallet) throw new NotFoundException('Wallet not found');

      const expectedBalance = Number(wallet.balance);
      newBalance = expectedBalance + amountMinor;

      const result = await this.walletRepo
        .createQueryBuilder()
        .update()
        .set({ balance: newBalance })
        .where('id = :id AND balance = :expected', { id: walletId, expected: expectedBalance })
        .execute();

      updated = (result.affected ?? 0) > 0;
    }

    return newBalance;
  }

  // ── Atomic transfer (optimistic lock + DB transaction) ────────────────────

  private async atomicTransfer(
    senderWalletId: number,
    receiverWalletId: number,
    amountMinor: number,
    reference: string,
    receiverAccountNumber: string,
  ): Promise<{ senderNewBalance: number; receiverNewBalance: number }> {
    let done = false;
    let result = { senderNewBalance: 0, receiverNewBalance: 0 };

    while (!done) {
      const sender = await this.walletRepo.findOneBy({ id: senderWalletId });
      if (!sender) throw new NotFoundException('Sender wallet not found');

      if (Number(sender.balance) < amountMinor) {
        throw new BadRequestException('Insufficient balance');
      }

      const expectedBalance = Number(sender.balance);
      const senderNew = expectedBalance - amountMinor;

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const debitResult = await queryRunner.manager
          .createQueryBuilder()
          .update(WalletEntity)
          .set({ balance: senderNew })
          .where('id = :id AND balance = :expected', {
            id: senderWalletId,
            expected: expectedBalance,
          })
          .execute();

        if ((debitResult.affected ?? 0) === 0) {
          await queryRunner.rollbackTransaction();
          continue; // retry
        }

        await queryRunner.manager.increment(
          WalletEntity,
          { id: receiverWalletId },
          'balance',
          amountMinor,
        );

        const receiver = await queryRunner.manager.findOneBy(WalletEntity, {
          id: receiverWalletId,
        });
        const receiverNew = Number(receiver!.balance);

        // Get sender account number for counterparty
        const senderUser = await queryRunner.manager
          .createQueryBuilder()
          .select('u.account_number', 'accountNumber')
          .from('users', 'u')
          .innerJoin('wallets', 'w', 'w.user_id = u.id')
          .where('w.id = :id', { id: senderWalletId })
          .getRawOne<{ accountNumber: string }>();

        const debitTxn = queryRunner.manager.create(TransactionEntity, {
          walletId: senderWalletId,
          reference,
          type: 'debit',
          amount: amountMinor,
          balanceAfter: senderNew,
          description: `Transfer to ${receiverAccountNumber}`,
          counterpartyAccount: receiverAccountNumber,
        });

        const creditTxn = queryRunner.manager.create(TransactionEntity, {
          walletId: receiverWalletId,
          reference: uuidv4(),
          type: 'credit',
          amount: amountMinor,
          balanceAfter: receiverNew,
          description: `Transfer from ${senderUser?.accountNumber ?? ''}`,
          counterpartyAccount: senderUser?.accountNumber ?? null,
        });

        await queryRunner.manager.save(TransactionEntity, [debitTxn, creditTxn]);
        await queryRunner.commitTransaction();

        result = { senderNewBalance: senderNew, receiverNewBalance: receiverNew };
        done = true;
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    }

    return result;
  }

  private serializeTxn(txn: TransactionEntity) {
    return {
      id: txn.id,
      reference: txn.reference,
      type: txn.type,
      amount: Number(txn.amount),
      amountFormatted: (Number(txn.amount) / 100).toFixed(2),
      balanceAfter: Number(txn.balanceAfter),
      description: txn.description,
      counterpartyAccount: txn.counterpartyAccount,
      createdAt: txn.createdAt,
    };
  }
}
