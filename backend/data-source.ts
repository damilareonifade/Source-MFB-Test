import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { UserEntity } from './src/users/entities/user.entity';
import { WalletEntity } from './src/wallet/entities/wallet.entity';
import { TransactionEntity } from './src/transactions/entities/transaction.entity';
import { CreateUsersTable1703000000001 } from './src/migrations/1703000000001-CreateUsersTable';
import { CreateWalletsTable1703000000002 } from './src/migrations/1703000000002-CreateWalletsTable';
import { CreateTransactionsTable1703000000003 } from './src/migrations/1703000000003-CreateTransactionsTable';
import * as dotenv from 'dotenv';
dotenv.config();

console.log('DB CONFIG:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306'),
  username: process.env.DB_USER ?? 'root',
  password: "",
  database: process.env.DB_NAME ?? 'banking_db',
  entities: [UserEntity, WalletEntity, TransactionEntity],
  migrations: [
    CreateUsersTable1703000000001,
    CreateWalletsTable1703000000002,
    CreateTransactionsTable1703000000003,
  ],
  synchronize: true,
  logging: true,
});
