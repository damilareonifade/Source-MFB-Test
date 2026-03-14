const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

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

// ─── Mock Auth Store (in-memory "database") ───────────────────────────────────

interface StoredUser {
  id: number;
  email: string;
  passwordHash: string;
  accountNumber: string;
}

const mockUsers: StoredUser[] = [
  {
    id: 1,
    email: 'demo@sourcemfb.com',
    passwordHash: 'password123',
    accountNumber: '2048301957',
  },
];

let nextUserId = 2;

function generateAccountNumber(): string {
  return String(Math.floor(1000000000 + Math.random() * 9000000000));
}

function toBase64Url(str: string): string {
  return btoa(str).replaceAll('=', '').replaceAll('+', '-').replaceAll('/', '_');
}

function makeFakeJwt(payload: { sub: number; email: string }): string {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = toBase64Url(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  }));
  const sig = toBase64Url(`sfb-mock-sig-${payload.sub}`);
  return `${header}.${body}.${sig}`;
}

// ─── Auth API Functions ───────────────────────────────────────────────────────

export async function apiRegister(payload: RegisterPayload): Promise<AuthResponse> {
  await delay(1200);

  const existing = mockUsers.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());
  if (existing) {
    throw Object.assign(new Error('Email is already registered'), { statusCode: 409 });
  }

  if (payload.password.length < 6) {
    throw Object.assign(new Error('Password must be at least 6 characters'), { statusCode: 400 });
  }

  const newUser: StoredUser = {
    id: nextUserId++,
    email: payload.email,
    passwordHash: payload.password,
    accountNumber: generateAccountNumber(),
  };
  mockUsers.push(newUser);

  const token = makeFakeJwt({ sub: newUser.id, email: newUser.email });
  return {
    token,
    user: { id: newUser.id, email: newUser.email, accountNumber: newUser.accountNumber },
  };
}

export async function apiLogin(payload: LoginPayload): Promise<AuthResponse> {
  await delay(1000);

  const user = mockUsers.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());
  if (!user) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }
  if (user.passwordHash !== payload.password) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  const token = makeFakeJwt({ sub: user.id, email: user.email });
  return {
    token,
    user: { id: user.id, email: user.email, accountNumber: user.accountNumber },
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Wallet {
  id: number;
  accountNumber: string;
  walletName: string;
  balance: number;
  balanceFormatted: string;
  currency: string;
}

export interface BankAccount {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
}

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

export interface TransactionsMeta {
  page: number;
  limit: number;
  total: number;
}

export interface TransactionsResponse {
  data: Transaction[];
  meta: TransactionsMeta;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const mockWallet: Wallet = {
  id: 1,
  accountNumber: '1234567890',
  walletName: 'default',
  balance: 4314,
  balanceFormatted: '43.14',
  currency: 'NGN',
};

export const mockVirtualAccount = {
  bankName: 'Globus Bank',
  accountNumber: '0068205419',
};

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

const generateRef = () => `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export const mockTransactions: Transaction[] = [
  {
    id: 1,
    reference: generateRef(),
    type: 'debit',
    description: 'TRF to DAMILARE DANIEL ONIFADE(8148049590) PalmPay',
    service: 'Transfer',
    date: '19-11-2025 01:51 pm',
    status: 'Successful',
    amount: 20000,
    amountFormatted: '200.00',
    balanceAfter: 4314,
    counterpartyAccount: '8148049590',
  },
  {
    id: 2,
    reference: generateRef(),
    type: 'debit',
    description: 'TRF to DAMILARE DANIEL ONIFADE(8148049590) PalmPay Food',
    service: 'Transfer',
    date: '19-11-2025 01:49 pm',
    status: 'Successful',
    amount: 70000,
    amountFormatted: '700.00',
    balanceAfter: 24314,
    counterpartyAccount: '8148049590',
  },
  {
    id: 3,
    reference: generateRef(),
    type: 'debit',
    description: 'TRF to DAMILARE DANIEL ONIFADE(8148049590) PalmPay',
    service: 'Transfer',
    date: '13-11-2025 07:01 pm',
    status: 'Successful',
    amount: 3500000,
    amountFormatted: '35,000.00',
    balanceAfter: 94314,
    counterpartyAccount: '8148049590',
  },
  {
    id: 4,
    reference: generateRef(),
    type: 'credit',
    description: 'ByteLabs Utility Account paid you via In-App Inflow',
    service: 'In-app inflow',
    date: '11-11-2025 11:13 am',
    status: 'Successful',
    amount: 3500000,
    amountFormatted: '35,000.00',
    balanceAfter: 3594314,
    counterpartyAccount: null,
  },
  {
    id: 5,
    reference: generateRef(),
    type: 'debit',
    description: 'TRF to DAMILARE DANIEL ONIFADE(8148049590) PalmPay',
    service: 'Transfer',
    date: '18-10-2025 05:20 pm',
    status: 'Successful',
    amount: 50000,
    amountFormatted: '500.00',
    balanceAfter: 94314,
    counterpartyAccount: '8148049590',
  },
  {
    id: 6,
    reference: generateRef(),
    type: 'credit',
    description: 'Wallet funding via bank transfer',
    service: 'Deposit',
    date: '15-10-2025 09:45 am',
    status: 'Successful',
    amount: 10000000,
    amountFormatted: '100,000.00',
    balanceAfter: 10094314,
    counterpartyAccount: null,
  },
  {
    id: 7,
    reference: generateRef(),
    type: 'debit',
    description: 'TRF to JOHN DOE(7012345678) GTBank',
    service: 'Transfer',
    date: '10-10-2025 03:22 pm',
    status: 'Failed',
    amount: 500000,
    amountFormatted: '5,000.00',
    balanceAfter: 10094314,
    counterpartyAccount: '7012345678',
  },
  {
    id: 8,
    reference: generateRef(),
    type: 'credit',
    description: 'Payment received from JANE SMITH',
    service: 'In-app inflow',
    date: '05-10-2025 11:00 am',
    status: 'Successful',
    amount: 250000,
    amountFormatted: '2,500.00',
    balanceAfter: 10594314,
    counterpartyAccount: null,
  },
];

// ─── API Functions ────────────────────────────────────────────────────────────

export async function apiGetWallet(): Promise<Wallet> {
  await delay(800);
  return { ...mockWallet };
}

export async function apiGetTransactions(
  page = 1,
  limit = 20
): Promise<TransactionsResponse> {
  await delay(600);
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    data: mockTransactions.slice(start, end),
    meta: { page, limit, total: mockTransactions.length },
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
  await delay(1400);
  if (payload.amount > mockWallet.balance / 100) {
    throw new Error('Insufficient balance');
  }
  return {
    message: 'Transfer successful',
    reference: generateRef(),
    amount: payload.amount,
    recipient: { accountNumber: payload.recipient, email: '' },
  };
}

export interface DepositPayload {
  amount: number;
}

export interface DepositResult {
  wallet: Wallet;
  transaction: Transaction;
}

export async function apiDeposit(payload: DepositPayload): Promise<DepositResult> {
  await delay(1100);
  const amountMinor = payload.amount * 100;
  const newBalance = mockWallet.balance + amountMinor;
  mockWallet.balance = newBalance;
  mockWallet.balanceFormatted = (newBalance / 100).toFixed(2);
  return {
    wallet: { ...mockWallet },
    transaction: {
      id: Date.now(),
      reference: generateRef(),
      type: 'credit',
      description: 'Deposit',
      service: 'Deposit',
      date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-') + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      status: 'Successful',
      amount: amountMinor,
      amountFormatted: payload.amount.toFixed(2),
      balanceAfter: newBalance,
      counterpartyAccount: null,
    },
  };
}
