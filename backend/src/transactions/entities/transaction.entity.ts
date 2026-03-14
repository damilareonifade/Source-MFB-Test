import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { WalletEntity } from '../../wallet/entities/wallet.entity';

export type TransactionType = 'credit' | 'debit';

@Index('idx_transactions_wallet_created', ['walletId', 'createdAt'])
@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'wallet_id' })
  walletId: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  reference: string;

  @Column({ type: 'enum', enum: ['credit', 'debit'] })
  type: TransactionType;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ name: 'balance_after', type: 'bigint' })
  balanceAfter: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description: string | null;

  @Column({ name: 'counterparty_account', type: 'varchar', length: 10, nullable: true })
  counterpartyAccount: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => WalletEntity, (wallet) => wallet.transactions)
  @JoinColumn({ name: 'wallet_id' })
  wallet: WalletEntity;
}
