import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IWebhookDriver } from './webhook-driver.interface';
import { WalletService } from '../../wallet/wallet.service';

/**
 * Mocked Flutterwave webhook driver.
 *
 * Expected payload for a deposit:
 * {
 *   "event": "charge.completed",
 *   "data": {
 *     "tx_ref": "txn_xyz456",
 *     "amount": 5000,            // in naira (major units) — converted ×100 here
 *     "currency": "NGN",
 *     "customer": { "email": "user@example.com" },
 *     "meta": { "account_number": "1234567890" }
 *   }
 * }
 *
 * Real Flutterwave sends verif-hash header = your FLUTTERWAVE_SECRET_HASH env var.
 * Validation is bypassed in mock mode (FLUTTERWAVE_SECRET_HASH not set).
 */
@Injectable()
export class FlutterwaveDriver implements IWebhookDriver {
  readonly driverName = 'flutterwave';
  private readonly logger = new Logger(FlutterwaveDriver.name);

  constructor(private readonly walletService: WalletService) {}

  validate(headers: Record<string, string>, _body: unknown, _raw: string): boolean {
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    if (!secretHash) {
      // No secret configured → mock mode, skip validation
      return true;
    }
    return headers['verif-hash'] === secretHash;
  }

  async process(body: unknown): Promise<{ status: string; message?: string }> {
    const payload = body as Record<string, unknown>;
    const event = payload['event'] as string;

    if (event === 'charge.completed') {
      return this.handleChargeCompleted(payload['data'] as Record<string, unknown>);
    }

    this.logger.log(`Flutterwave: unhandled event "${event}" — ignored`);
    return { status: 'ignored', message: `Event "${event}" not handled` };
  }

  private async handleChargeCompleted(data: Record<string, unknown>) {
    const amountMajor = Number(data['amount']); // naira → convert to kobo
    const amountMinor = Math.round(amountMajor * 100);
    const reference = (data['tx_ref'] as string) ?? uuidv4();
    const meta = (data['meta'] ?? {}) as Record<string, unknown>;
    const accountNumber = meta['account_number'] as string | undefined;

    if (!accountNumber) {
      this.logger.warn('Flutterwave charge.completed missing meta.account_number');
      return { status: 'ignored', message: 'No account_number in meta' };
    }

    await this.walletService.externalDeposit(
      accountNumber,
      amountMinor,
      'Flutterwave deposit',
      reference,
    );

    this.logger.log(`Flutterwave deposit of ₦${amountMajor} credited to ${accountNumber}`);
    return { status: 'processed' };
  }
}
