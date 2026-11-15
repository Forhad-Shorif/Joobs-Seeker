import "server-only"

import type { Collection } from "mongodb"

import { db } from "@/lib/auth"

/**
 * 📄 lib/SheareAction/PaymentAction/payment-store.ts
 * ==================================================================
 * 📌 কী: user-এর payment history MongoDB-তে রাখা/পড়া।
 *        collection: "payments" (database: Jobs-Secar)
 *
 * 📌 কে save করে:
 *      /success পেজ — শুধু Stripe থেকে payment_status === "paid"
 *      verify হওয়ার পরে। তাই ভুয়া record কখনো ঢুকবে না।
 *
 * 📌 কে পড়ে:
 *      /payment পেজ — logged-in user-এর email দিয়ে নিজের history আনে।
 *
 * 📌 কেন sessionId দিয়ে upsert:
 *      /success পেজ refresh করলে একই payment দুইবার save হবে না।
 * ==================================================================
 */

export type PaymentRecord = {
  email: string
  name?: string
  // Stripe checkout session id — একই payment দুইবার save আটকায়
  sessionId: string
  plan: string
  // Stripe-এর amount_total (smallest unit, যেমন 2900 = $29.00)
  amount: number
  currency: string
  status: string
  paidAt: Date
}

function payments(): Collection<PaymentRecord> {
  return db.collection<PaymentRecord>("payments")
}

// payment সফল হলে একবার save হয় (/success পেজ থেকে)
export async function savePayment(record: PaymentRecord): Promise<void> {
  await payments().updateOne(
    { sessionId: record.sessionId },
    { $setOnInsert: record },
    { upsert: true }
  )
}

// একজন user-এর সব payment, নতুনটা আগে
export async function getPayments(email: string): Promise<PaymentRecord[]> {
  return payments().find({ email }).sort({ paidAt: -1 }).toArray()
}
