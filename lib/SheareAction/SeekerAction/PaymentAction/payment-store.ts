import "server-only"

/**
 * Payment er sob backend call ei ek file e.
 *
 *   savePayment(sessionId)   -> /success page: Stripe verify + DB save
 *   getPaymentStatus(email)  -> user payment: true kina
 *   getPayments(email)       -> billing history
 *
 * Auth header ekhon pathai na — JWKS setup hole ei file e add hobe.
 */

const API_BASE_URL = (
  process.env.PAYMENT_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  ""
).replace(/\/+$/, "")

const TIMEOUT_MS = 10_000

export type PaymentRecord = {
  email: string
  userId?: string
  sessionId: string
  plan: string
  amount: number
  currency: string
  status: string
  paidAt: Date
}

export type PaymentStatus = {
  payment: boolean
  plan: "free" | "professional"
  paidAt?: string
}

// backend er JSON e paidAt string, UI te Date lage
type RawPayment = Omit<PaymentRecord, "paidAt"> & { paidAt: string }

/** backend e ek jaygay theke call kore — error hole throw kore */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL .env e set kora nei")
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    ...init,
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    throw new Error(`${path} failed: ${response.status} ${detail}`.trim())
  }

  return (await response.json()) as T
}

/** payment successful hole — /success page theke */
export async function savePayment(input: {
  sessionId: string
}): Promise<PaymentRecord> {
  const data = await request<RawPayment>("/PaymentPost/checkout-verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: input.sessionId }),
  })

  return { ...data, paidAt: new Date(data.paidAt) }
}

/** user payment koreche kina — backend nijei bole dey */
export async function getPaymentStatus(email: string): Promise<PaymentStatus> {
  return request<PaymentStatus>(
    `/PaymentPost/status?email=${encodeURIComponent(email)}`
  )
}

/** billing history — notun payment age */
export async function getPayments(email: string): Promise<PaymentRecord[]> {
  const data = await request<{ payments?: RawPayment[] }>(
    `/PaymentPost/history?email=${encodeURIComponent(email)}`
  )

  return (data.payments ?? []).map((payment) => ({
    ...payment,
    paidAt: new Date(payment.paidAt),
  }))
}
