export interface IWebhookDriver {
  readonly driverName: string;

  /**
   * Validate the incoming request — signature check, IP allowlist, etc.
   * Return false to reject with 400 before processing.
   */
  validate(headers: Record<string, string>, body: unknown, raw: string): boolean;

  /**
   * Process the validated payload and credit / debit wallets as needed.
   */
  process(body: unknown): Promise<{ status: string; message?: string }>;
}
