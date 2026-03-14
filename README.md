# SourceMFB — Core Banking Wallet System

A full-stack banking wallet system built with NestJS + TypeORM + MySQL (backend) and React + Vite (frontend).

---

## How to Run

### Option 1: Docker Compose (recommended)

```bash
docker-compose up --build
```

- Backend: http://localhost:3000/api
- Frontend: http://localhost:5173

> The backend container runs migrations automatically on startup.

### Option 2: Manual (npm)

**Prerequisites**: MySQL 8 running on localhost:3306 with database `banking_db`

**Backend**:
```bash
cd backend
npm install
cp .env.example .env   # edit DB credentials as needed
npm run migration:run  # runs TypeORM migrations
npm run start:dev
```

**Frontend**:
```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:3000/api
npm run dev
```

---

## Database Schema

### users
| Column | Type | Notes |
|---|---|---|
| id | int PK auto-increment | |
| email | varchar(255) unique | |
| password_hash | varchar(255) | bcrypt 10 rounds |
| account_number | varchar(10) unique | 10-digit, auto-generated |
| created_at | datetime | |
| updated_at | datetime | |

### wallets
| Column | Type | Notes |
|---|---|---|
| id | int PK auto-increment | |
| user_id | int FK→users.id | one wallet per user |
| balance | bigint default 0 | stored in kobo (minor units) |
| currency | varchar(10) default 'NGN' | |
| created_at | datetime | |
| updated_at | datetime | |

### transactions
| Column | Type | Notes |
|---|---|---|
| id | int PK auto-increment | |
| wallet_id | int FK→wallets.id | |
| reference | varchar(100) unique | UUID per operation |
| type | enum('credit','debit') | |
| amount | bigint | always positive, in kobo |
| balance_after | bigint | snapshot after txn |
| description | varchar(200) nullable | |
| counterparty_account | varchar(10) nullable | the other side |
| created_at | datetime | |

---

## Concurrency & Race Condition Handling

**Problem**: Two simultaneous transfers could both read the same balance, both pass the balance check, and both debit — resulting in a negative balance.

**Solution**: Optimistic locking via compare-and-swap UPDATE.

### Deposits (single wallet):
1. Read the wallet's current balance.
2. Attempt an UPDATE with a `WHERE balance = :expected` condition.
3. If `affected = 0`, another request changed the balance — retry the loop.
4. If `affected = 1`, the update succeeded atomically.

### Transfers (two wallets):
Same optimistic lock on the **sender's debit**, wrapped in a `queryRunner` transaction so both the debit and credit either both commit or both rollback:
1. Read sender balance, check sufficiency.
2. Open a DB transaction.
3. CAS-UPDATE sender balance. If `affected = 0`, rollback and retry.
4. Increment receiver balance (no race on credit side).
5. Write both transaction log rows.
6. Commit.

This guarantees money never leaves the sender without arriving at the receiver, and no concurrent request can produce a negative balance.

---

## Repository Structure

```
/backend       — NestJS API (TypeORM + MySQL)
/frontend      — React + Vite SPA
docker-compose.yml
postman_collection.json
README.md
schema.sql
```

Each sub-directory has its own `.gitignore` that excludes:
- `node_modules/` and `dist/` — build artifacts
- `.env` / `.env.*` — secrets (commit `.env.example` instead)
- IDE folders (`.vscode/`, `.idea/`) and OS files (`.DS_Store`)

The root `.gitignore` covers shared IDE/OS files and the `Claude.md` instruction files.

---

## Trade-offs & Notes

- **Migrations**: Uses TypeORM migrations (not `synchronize: true`). Run `npm run migration:run` before starting.
- **Bigint handling**: MySQL returns `bigint` columns as strings in Node.js. A column transformer converts them to JavaScript numbers. For very large balances (> Number.MAX_SAFE_INTEGER), a BigInt library would be needed.
- **Amount units**: All amounts stored in kobo (minor units). The API accepts major units (NGN) for deposit and transfer, and returns both raw kobo and formatted NGN strings.
- **Frontend**: Basic inline styles, no design system. Focus is on backend correctness.
- **No refresh tokens**: JWT is issued with a 7-day expiry. Logout clears localStorage.
- **Postman collection**: See `postman_collection.json` for all endpoints with example responses.
