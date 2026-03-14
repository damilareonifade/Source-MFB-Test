import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IWebhookDriver } from './webhook-driver.interface';
import { WalletService } from '../../wallet/wallet.service';

/**
 * Mock webhook driver — useful for local testing without a real payment provider.
 *
 * POST /api/webhook/mock
 * {
 *   "event": "deposit",
 *   "data": {
 *     "account_number": "1234567890",
 *     "amount": 5000,        // in naira (major units)
 *     "reference": "mock-ref-001"   // optional
 *   }
 * }
 *
 * No signature validation — always accepts.
 */
@Injectable()
export class MockDriver implements IWebhookDriver {
  readonly driverName = 'mock';
  private readonly logger = new Logger(MockDriver.name);

  constructor(private readonly walletService: WalletService) {}

  validate(_headers: Record<string, string>, _body: unknown, _raw: string): boolean {
    return true;
  }

  async process(body: unknown): Promise<{ status: string; message?: string }> {
    const payload = body as Record<string, unknown>;
    const event = payload['event'] as string;

    if (event === 'deposit') {
      return this.handleDeposit(payload['data'] as Record<string, unknown>);
    }

    this.logger.log(`Mock: unhandled event "${event}" — ignored`);
    return { status: 'ignored', message: `Event "${event}" not handled` };
  }

  private async handleDeposit(data: Record<string, unknown>) {
    const accountNumber = data['account_number'] as string;
    const amountMajor = Number(data['amount']);
    const amountMinor = Math.round(amountMajor * 100);
    const reference = (data['reference'] as string | undefined) ?? uuidv4();

    await this.walletService.externalDeposit(
      accountNumber,
      amountMinor,
      'Mock deposit',
      reference,
    );

    this.logger.log(`Mock deposit of ₦${amountMajor} credited to ${accountNumber}`);
    return { status: 'processed' };
  }
}
