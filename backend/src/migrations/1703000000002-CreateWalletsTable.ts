import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWalletsTable1703000000002 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`wallets\` (
        \`id\`         INT NOT NULL AUTO_INCREMENT,
        \`user_id\`    INT NOT NULL,
        \`balance\`    BIGINT NOT NULL DEFAULT 0,
        \`currency\`   VARCHAR(10) NOT NULL DEFAULT 'NGN',
        \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_wallets_user_id\` (\`user_id\`),
        CONSTRAINT \`FK_wallets_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `wallets`');
  }
}
