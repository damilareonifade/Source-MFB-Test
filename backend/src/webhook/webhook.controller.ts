import { Controller, Post, Param, Body, Headers } from '@nestjs/common';
import { WebhookManager } from './webhook.manager';

/**
 * Single entry point for all provider webhooks — mirrors.
 *
 * POST /api/webhook/:provider
 *
 * The :provider segment is used to route to the correct driver:
 *   POST /api/webhook/paystack     → PaystackDriver
 *   POST /api/webhook/flutterwave  → FlutterwaveDriver
 *   POST /api/webhook/mock         → MockDriver
 */
@Controller('webhook')
export class WebhookController {
  constructor(private readonly manager: WebhookManager) {}

  @Post(':provider')
  async handle(
    @Param('provider') provider: string,
    @Body() body: unknown,
    @Headers() headers: Record<string, string>,
  ): Promise<{ status: string; message?: string }> {
    return this.manager.processWebhook(provider, headers, body);
  }
}
