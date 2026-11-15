"use server"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { getPaymentStatus } from "@/lib/SheareAction/SeekerAction/PaymentAction/payment-store"

/**
 * Login kora user er plan — backend er payment status theke.
 *
 * payment: true  -> professional (unlimited apply)
 * payment: false -> free (FREE_APPLICATION_LIMIT sesh hole payment page)
 *
 * email session theke newa, client theke na.
 */

export type PlanStatus = {
  plan: "free" | "professional"
  paidAt?: string
}

export async function getMyPlanStatus(): Promise<PlanStatus> {
  const session = await auth.api.getSession({ headers: await headers() })
  const email = session?.user?.email

  if (!email) return { plan: "free" }

  const status = await getPaymentStatus(email)

  return {
    plan: status.payment ? "professional" : "free",
    paidAt: status.paidAt,
  }
}
