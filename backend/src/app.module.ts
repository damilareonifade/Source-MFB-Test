import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './users/entities/user.entity';
import { WalletEntity } from './wallet/entities/wallet.entity';
import { TransactionEntity } from './transactions/entities/transaction.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';
import { TransactionsModule } from './transactions/transactions.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '3306'),
      username: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASS ?? '',
      database: process.env.DB_NAME ?? 'banking_db',
      entities: [UserEntity, WalletEntity, TransactionEntity],
      synchronize: false,
      logging: false,
    }),
    UsersModule,
    AuthModule,
    WalletModule,
    TransactionsModule,
    WebhookModule,
  ],
})
export class AppModule {}
