import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransactionsTable1703000000003 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`transactions\` (
        \`id\`                   INT NOT NULL AUTO_INCREMENT,
        \`wallet_id\`            INT NOT NULL,
        \`reference\`            VARCHAR(100) NOT NULL,
        \`type\`                 ENUM('credit','debit') NOT NULL,
        \`amount\`               BIGINT NOT NULL,
        \`balance_after\`        BIGINT NOT NULL,
        \`description\`          VARCHAR(200) NULL,
        \`counterparty_account\` VARCHAR(10) NULL,
        \`created_at\`           DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_transactions_reference\` (\`reference\`),
        CONSTRAINT \`FK_transactions_wallet_id\` FOREIGN KEY (\`wallet_id\`) REFERENCES \`wallets\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `transactions`');
  }
}
