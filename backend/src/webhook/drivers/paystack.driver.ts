import { Injectable, Logger } from '@nestjs/common';
import { createHmac } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { IWebhookDriver } from './webhook-driver.interface';
import { WalletService } from '../../wallet/wallet.service';

/**
 * Mocked Paystack webhook driver.
 *
 * Expected payload for a deposit:
 * {
 *   "event": "charge.success",
 *   "data": {
 *     "reference": "txn_abc123",
 *     "amount": 500000,          // in kobo (minor units)
 *     "currency": "NGN",
 *     "customer": { "email": "user@example.com" },
 *     "metadata": { "account_number": "1234567890" }
 *   }
 * }
 *
 * Real Paystack sends x-paystack-signature = HMAC-SHA512(rawBody, secretKey).
 * Validation is bypassed in mock mode (PAYSTACK_SECRET not set).
 */
@Injectable()
export class PaystackDriver implements IWebhookDriver {
  readonly driverName = 'paystack';
  private readonly logger = new Logger(PaystackDriver.name);

  constructor(private readonly walletService: WalletService) {}

  validate(headers: Record<string, string>, _body: unknown, raw: string): boolean {
    const secret = process.env.PAYSTACK_SECRET;
    if (!secret) {
      // No secret configured → mock mode, skip validation
      return true;
    }
    const signature = headers['x-paystack-signature'];
    const expected = createHmac('sha512', secret).update(raw).digest('hex');
    return signature === expected;
  }

  async process(body: unknown): Promise<{ status: string; message?: string }> {
    const payload = body as Record<string, unknown>;
    const event = payload['event'] as string;

    if (event === 'charge.success') {
      return this.handleChargeSuccess(payload['data'] as Record<string, unknown>);
    }

    this.logger.log(`Paystack: unhandled event "${event}" — ignored`);
    return { status: 'ignored', message: `Event "${event}" not handled` };
  }

  private async handleChargeSuccess(data: Record<string, unknown>) {
    const amountMinor = Number(data['amount']); // already in kobo
    const reference = (data['reference'] as string) ?? uuidv4();
    const metadata = (data['metadata'] ?? {}) as Record<string, unknown>;
    const accountNumber = metadata['account_number'] as string | undefined;

    if (!accountNumber) {
      this.logger.warn('Paystack charge.success missing metadata.account_number');
      return { status: 'ignored', message: 'No account_number in metadata' };
    }

    await this.walletService.externalDeposit(
      accountNumber,
      amountMinor,
      'Paystack deposit',
      reference,
    );

    this.logger.log(`Paystack deposit of ${amountMinor} kobo credited to ${accountNumber}`);
    return { status: 'processed' };
  }
}
