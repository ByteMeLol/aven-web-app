# Aven API starter

This API is an initial backend scaffold, not production-ready financial software.

## Start
1. Install PostgreSQL and create a database named `aven_finance`.
2. Copy `.env.example` to `.env` and edit `DATABASE_URL`, `FRONTEND_ORIGIN`, and `JWT_SECRET`.
3. Run:
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   npm run dev
   ```
4. Health check: `GET http://localhost:4000/api/health`.

## Critical security caveat
The example `POST /api/transactions` route deliberately demonstrates validation and database transaction structure, but it accepts a `userId` in the request body. Do **not** expose it publicly as-is. Before connecting the frontend:
- implement authentication and verified sessions;
- derive the user ID only from the authenticated server session;
- enforce wallet ownership and authorization in every request;
- hash passwords with Argon2id or bcrypt;
- hash one-time codes, expire them quickly, rate-limit sending and verification, and prevent replay;
- use database row locking or safe conditional updates to prevent concurrent overspending;
- implement a balanced double-entry ledger for transfers and reconcile every balance from ledger entries;
- write tests for duplicate requests, concurrency, insufficient funds, and rollback cases;
- keep provider secrets server-side and verify signed payment webhooks.

The current example ledger entry records the user's wallet side for income/expense tracking. A real internal transfer must create balanced debit and credit entries in one atomic transaction. Do not use this API for real deposits, withdrawals, or payments until a qualified security review and provider integration are complete.
