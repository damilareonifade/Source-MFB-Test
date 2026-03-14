import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1703000000001 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\`             INT NOT NULL AUTO_INCREMENT,
        \`email\`          VARCHAR(255) NOT NULL,
        \`password_hash\`  VARCHAR(255) NOT NULL,
        \`account_number\` VARCHAR(10)  NOT NULL,
        \`created_at\`     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\`     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_users_email\` (\`email\`),
        UNIQUE KEY \`UQ_users_account_number\` (\`account_number\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `users`');
  }
}
