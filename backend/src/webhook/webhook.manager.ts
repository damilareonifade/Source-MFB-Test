import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { IWebhookDriver } from './drivers/webhook-driver.interface';
import { PaystackDriver } from './drivers/paystack.driver';
import { FlutterwaveDriver } from './drivers/flutterwave.driver';
import { MockDriver } from './drivers/mock.driver';

/**
 * WebhookManager mirrors the PHP WebhookManager pattern:
 *  - holds a map of registered drivers keyed by provider name
 *  - resolves the driver from the URL :provider param
 *  - validates then processes the payload
 */
@Injectable()
export class WebhookManager {
  private readonly logger = new Logger(WebhookManager.name);
  private readonly drivers: Map<string, IWebhookDriver>;

  constructor(
    paystackDriver: PaystackDriver,
    flutterwaveDriver: FlutterwaveDriver,
    mockDriver: MockDriver,
  ) {
    this.drivers = new Map<string, IWebhookDriver>([
      [paystackDriver.driverName, paystackDriver],
      [flutterwaveDriver.driverName, flutterwaveDriver],
      [mockDriver.driverName, mockDriver],
    ]);
  }

  async processWebhook(
    provider: string,
    headers: Record<string, string>,
    body: unknown,
  ): Promise<{ status: string; message?: string }> {
    const driver = this.drivers.get(provider.toLowerCase());

    if (!driver) {
      throw new NotFoundException(`Webhook provider "${provider}" not found`);
    }

    const raw = JSON.stringify(body);

    if (!driver.validate(headers, body, raw)) {
      this.logger.warn(`Webhook signature validation failed for provider "${provider}"`);
      throw new BadRequestException('Invalid webhook signature');
    }

    return driver.process(body);
  }
}
