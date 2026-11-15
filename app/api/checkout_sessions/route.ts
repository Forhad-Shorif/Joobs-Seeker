import { NextResponse } from "next/server"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { stripe } from "@/lib/stripe"

/**
 * 📄 app/api/checkout_sessions/route.ts
 * ==================================================================
 * 📌 কী: Stripe Checkout session বানানোর API route।
 *
 * 📌 কে ডাকে:
 *      payment পেজের form (components/Seeker/payment-view.tsx)
 *        <form action="/api/checkout_sessions" method="POST">
 *          <input type="hidden" name="from" value={returnTo} />
 *          <button type="submit">Upgrade Plan</button>
 *        </form>
 *
 * 📌 কী কী লাগে:
 *      ১. STRIPE_SECRET_KEY → .env (lib/stripe.ts এ ব্যবহার হয়)
 *      ২. PRICE_ID → Stripe ড্যাশবোর্ডে Professional Tier প্রোডাক্টের price id
 *      ৩. origin → কোন ডোমেইনে ফেরত পাঠাবে (header থেকে)
 *      ৪. from → form-এর hidden input (payment শেষে কোন পেজে ফিরবে)
 *
 * 📌 কী করে:
 *      ১. Stripe-এ একটা checkout session বানায় (mode: "payment")
 *      ২. user-কে session.url-এ (Stripe-এর payment পেজ) পাঠায় (303 redirect)
 *
 * 📌 session-এর ভিতরে দুটো URL:
 *      - success_url → /success?session_id=...&from=...  (payment সফল হলে)
 *      - cancel_url  → /payment?from=...&checkout=cancelled (user cancel করলে)
 *
 * 📌 error হলে:
 *      সাদা JSON না দেখিয়ে আবার /payment?...&checkout=failed এ পাঠায়,
 *      আর আসল error সার্ভার লগে থাকে।
 * ==================================================================
 */

// Professional Tier-এর Stripe Price ID (.env-এ রাখলে ভালো)
const PRICE_ID = "price_1UbdLQRpQxlURnHzL0QU2AGb"

export async function POST(request: Request) {
  // form থেকে `from` নিই — payment শেষে user এই page-এ ফিরে যাবে
  const form = await request.formData()
  const from = String(form.get("from") ?? "")

  // শুধু app-এর ভিতরের path
  const returnTo = from.startsWith("/") ? from : "/dashboard/seeker"

  const headersList = await headers()
  const origin = headersList.get("origin") ?? new URL(request.url).origin

  // logged-in user-এর email — payment history যেন ঠিক এই account-এ save হয়
  // (Stripe-এর payment page-এ user অন্য email দিলেও history ঠিক থাকবে)
  const userSession = await auth.api.getSession({ headers: headersList })
  const userEmail = userSession?.user?.email

  try {
    // Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Professional Tier-এর দাম Stripe ড্যাশবোর্ড থেকে
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "payment",
      // Stripe-এর পেজে email আগেই ভরা থাকবে
      customer_email: userEmail,
      // success page এই email দিয়ে history save করবে
      metadata: { email: userEmail ?? "" },
      // payment শেষে success page → সেখান থেকে আগের page-এ
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&from=${encodeURIComponent(returnTo)}`,
      // user cancel করলে আবার payment page-এ
      cancel_url: `${origin}/payment?from=${encodeURIComponent(returnTo)}&checkout=cancelled`,
    })

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.")
    }

    return NextResponse.redirect(session.url, 303)
  } catch (error) {
    console.error("Stripe checkout session failed:", error)

    // error হলেও user-কে সাদা JSON না দেখিয়ে payment page-এ ফেরত পাঠাই
    return NextResponse.redirect(
      `${origin}/payment?from=${encodeURIComponent(returnTo)}&checkout=failed`,
      303
    )
  }
}
