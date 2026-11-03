import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const app = express()
const prisma = new PrismaClient()
const port = Number(process.env.PORT ?? 4000)

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173' }))
app.use(express.json({ limit: '32kb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'aven-finance-api' })
})

// Demo endpoint only. In production, protect all user data routes with verified
// authentication and derive userId from the authenticated session, never from request input.
app.get('/api/currencies', (_req, res) => {
  res.json({ currencies: ['TZS', 'USD', 'EUR', 'GBP', 'KES'] })
})

const createTransactionSchema = z.object({
  userId: z.string().min(1), // Replace with authenticated session identity before production.
  walletId: z.string().min(1),
  description: z.string().trim().min(1).max(120),
  category: z.string().trim().max(60).optional(),
  type: z.enum(['EXPENSE', 'INCOME']),
  amount: z.number().finite().positive().max(1_000_000_000),
  currency: z.string().regex(/^[A-Z]{3}$/),
  idempotencyKey: z.string().min(12).max(120),
})

app.post('/api/transactions', async (req, res) => {
  const parsed = createTransactionSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid transaction details', details: parsed.error.flatten() })
  }

  const data = parsed.data
  try {
    const existing = await prisma.transaction.findUnique({ where: { idempotencyKey: data.idempotencyKey } })
    if (existing) return res.status(200).json({ transaction: existing, reused: true })

    const wallet = await prisma.wallet.findFirst({
      where: { id: data.walletId, userId: data.userId, currency: data.currency },
    })
    if (!wallet) return res.status(404).json({ error: 'Wallet not found for this user and currency' })

    if (data.type === 'EXPENSE' && wallet.balance.lessThan(data.amount)) {
      return res.status(422).json({ error: 'Insufficient wallet balance' })
    }

    const signedAmount = data.type === 'EXPENSE' ? -data.amount : data.amount
    const result = await prisma.$transaction(async tx => {
      const transaction = await tx.transaction.create({
        data: {
          userId: data.userId,
          type: data.type,
          description: data.description,
          category: data.category,
          amount: data.amount,
          currency: data.currency,
          idempotencyKey: data.idempotencyKey,
          status: 'COMPLETED',
        },
      })
      await tx.ledgerEntry.create({
        data: {
          transactionId: transaction.id,
          walletId: wallet.id,
          amount: signedAmount,
          currency: data.currency,
        },
      })
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: signedAmount } },
      })
      return transaction
    })
    return res.status(201).json({ transaction: result })
  } catch (error) {
    console.error('Transaction creation failed', error)
    return res.status(500).json({ error: 'Unable to create transaction' })
  }
})

app.listen(port, () => {
  console.log(`Aven API listening on http://localhost:${port}`)
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
