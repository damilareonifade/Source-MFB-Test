import { Module } from '@nestjs/common';
import { WalletModule } from '../wallet/wallet.module';
import { PaystackDriver } from './drivers/paystack.driver';
import { FlutterwaveDriver } from './drivers/flutterwave.driver';
import { MockDriver } from './drivers/mock.driver';
import { WebhookManager } from './webhook.manager';
import { WebhookController } from './webhook.controller';

@Module({
  imports: [WalletModule],
  controllers: [WebhookController],
  providers: [PaystackDriver, FlutterwaveDriver, MockDriver, WebhookManager],
})
export class WebhookModule {}
