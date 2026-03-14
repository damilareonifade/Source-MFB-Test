const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('sfb-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

function handleUnauthorized() {
  localStorage.removeItem('sfb-auth');
  globalThis.location.href = '/login';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    handleUnauthorized();
    throw Object.assign(new Error('Unauthorized'), { statusCode: 401 });
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      Array.isArray(body?.message)
        ? body.message.join(', ')
        : body?.message ?? `Request failed with status ${res.status}`;
    throw Object.assign(new Error(message), { statusCode: res.status });
  }

  return body as T;
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  email: string;
  accountNumber: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export async function apiRegister(payload: RegisterPayload): Promise<AuthResponse> {

  console.log(payload, "It gets here");
  
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiLogin(payload: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ─── Wallet Types ─────────────────────────────────────────────────────────────

export interface Wallet {
  id: number;
  accountNumber: string;
  walletName: string;
  balance: number;
  balanceFormatted: string;
  currency: string;
}

// ─── Wallet API ───────────────────────────────────────────────────────────────

interface WalletRaw {
  id: number;
  accountNumber: string;
  balance: number;
  balanceFormatted: string;
  currency: string;
}

export async function apiGetWallet(): Promise<Wallet> {
  const raw = await request<WalletRaw>('/wallet');
  return { ...raw, walletName: 'default' };
}

export interface DepositPayload {
  amount: number;
}

export async function apiDeposit(payload: DepositPayload): Promise<{ wallet: Wallet; transaction: Transaction }> {
  const raw = await request<{ wallet: WalletRaw; transaction: TransactionRaw }>('/wallet/deposit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return {
    wallet: { ...raw.wallet, walletName: 'default' },
    transaction: mapTransaction(raw.transaction),
  };
}

export interface TransferPayload {
  recipient: string;
  amount: number;
  bank?: string;
  remark?: string;
}

export interface TransferResult {
  message: string;
  reference: string;
  amount: number;
  recipient: { accountNumber: string; email: string };
}

export async function apiTransfer(payload: TransferPayload): Promise<TransferResult> {
  return request<TransferResult>('/wallet/transfer', {
    method: 'POST',
    body: JSON.stringify({ recipient: payload.recipient, amount: payload.amount }),
  });
}

// ─── Transaction Types ────────────────────────────────────────────────────────

export type TransactionType = 'credit' | 'debit';
export type TransactionStatus = 'Successful' | 'Failed' | 'Pending';

export interface Transaction {
  id: number;
  reference: string;
  type: TransactionType;
  description: string;
  service: string;
  date: string;
  status: TransactionStatus;
  amount: number;
  amountFormatted: string;
  balanceAfter: number;
  counterpartyAccount: string | null;
}

interface TransactionRaw {
  id: number;
  reference: string;
  type: TransactionType;
  amount: number;
  amountFormatted: string;
  balanceAfter: number;
  description: string | null;
  counterpartyAccount: string | null;
  createdAt: string;
}

function deriveService(txn: TransactionRaw): string {
  const desc = txn.description?.toLowerCase() ?? '';
  if (desc === 'deposit') return 'Deposit';
  if (txn.type === 'credit') return 'In-app inflow';
  return 'Transfer';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const mins = String(d.getMinutes()).padStart(2, '0');
  const ampm = d.getHours() < 12 ? 'am' : 'pm';
  const h12 = d.getHours() % 12 || 12;
  return `${day}-${month}-${year} ${String(h12).padStart(2, '0')}:${mins} ${ampm}`;
}

function mapTransaction(raw: TransactionRaw): Transaction {
  return {
    id: raw.id,
    reference: raw.reference,
    type: raw.type,
    amount: raw.amount,
    amountFormatted: raw.amountFormatted,
    balanceAfter: raw.balanceAfter,
    description: raw.description ?? '',
    counterpartyAccount: raw.counterpartyAccount,
    service: deriveService(raw),
    status: 'Successful',
    date: formatDate(raw.createdAt),
  };
}

export interface TransactionsMeta {
  page: number;
  limit: number;
  total: number;
}

export interface TransactionsResponse {
  data: Transaction[];
  meta: TransactionsMeta;
}

// ─── Transactions API ─────────────────────────────────────────────────────────

export async function apiGetTransactions(page = 1, limit = 20): Promise<TransactionsResponse> {
  const raw = await request<{ data: TransactionRaw[]; meta: TransactionsMeta }>(
    `/transactions?page=${page}&limit=${limit}`
  );
  return {
    data: raw.data.map(mapTransaction),
    meta: raw.meta,
  };
}

// ─── Static mock data kept for UI elements that don't hit the backend ─────────

export const mockVirtualAccount = {
  bankName: 'Globus Bank',
  accountNumber: '0068205419',
};

export interface BankAccount {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export const mockBankAccounts: BankAccount[] = [
  {
    id: 1,
    bankName: 'PROVIDUS BANK',
    accountName: 'Damilare Onifade',
    accountNumber: '9977475156',
  },
];

export const mockNigerianBanks = [
  'Access Bank',
  'First Bank',
  'GTBank',
  'UBA',
  'Zenith Bank',
  'Stanbic IBTC',
  'FCMB',
  'Fidelity Bank',
  'Union Bank',
  'Sterling Bank',
  'Polaris Bank',
  'Globus Bank',
  'Providus Bank',
  'PalmPay',
  'Opay',
  'Kuda Bank',
  'Moniepoint',
];
