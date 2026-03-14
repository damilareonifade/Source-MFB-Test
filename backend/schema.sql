-- Banking Wallet System — Schema
-- Run: mysql -u root -p banking_db < schema.sql

CREATE DATABASE IF NOT EXISTS `banking_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `banking_db`;

CREATE TABLE IF NOT EXISTS `users` (
  `id`             INT          NOT NULL AUTO_INCREMENT,
  `email`          VARCHAR(255) NOT NULL,
  `password_hash`  VARCHAR(255) NOT NULL,
  `account_number` VARCHAR(10)  NOT NULL,
  `created_at`     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_users_email` (`email`),
  UNIQUE KEY `UQ_users_account_number` (`account_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `wallets` (
  `id`         INT         NOT NULL AUTO_INCREMENT,
  `user_id`    INT         NOT NULL,
  `balance`    BIGINT      NOT NULL DEFAULT 0,
  `currency`   VARCHAR(10) NOT NULL DEFAULT 'NGN',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_wallets_user_id` (`user_id`),
  CONSTRAINT `FK_wallets_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `transactions` (
  `id`                   INT           NOT NULL AUTO_INCREMENT,
  `wallet_id`            INT           NOT NULL,
  `reference`            VARCHAR(100)  NOT NULL,
  `type`                 ENUM('credit','debit') NOT NULL,
  `amount`               BIGINT        NOT NULL,
  `balance_after`        BIGINT        NOT NULL,
  `description`          VARCHAR(200)  NULL,
  `counterparty_account` VARCHAR(10)   NULL,
  `created_at`           DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_transactions_reference` (`reference`),
  CONSTRAINT `FK_transactions_wallet_id` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
