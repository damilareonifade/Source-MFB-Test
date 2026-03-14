import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from './entities/transaction.entity';
import { WalletEntity } from '../wallet/entities/wallet.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly txnRepo: Repository<TransactionEntity>,
    @InjectRepository(WalletEntity)
    private readonly walletRepo: Repository<WalletEntity>,
  ) {}

  async findForUser(userId: number, page: number, limit: number) {
    const wallet = await this.walletRepo.findOneBy({ userId });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const [data, total] = await this.txnRepo.findAndCount({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: data.map((t) => ({
        id: t.id,
        reference: t.reference,
        type: t.type,
        amount: Number(t.amount),
        amountFormatted: (Number(t.amount) / 100).toFixed(2),
        balanceAfter: Number(t.balanceAfter),
        description: t.description,
        counterpartyAccount: t.counterpartyAccount,
        createdAt: t.createdAt,
      })),
      meta: { page, limit, total },
    };
  }
}
