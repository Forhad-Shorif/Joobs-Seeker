import { redirect } from "next/navigation"

/**
 * 📄 app/dashboard/seeker/payment/page.tsx
 *
 * পুরোনো URL: /dashboard/seeker/payment
 * আসল payment page: /payment (app/payment/page.tsx)
 *
 * তাই এই route-এ কেউ আসলে সরাসরি payment page-এ পাঠিয়ে দিই।
 */
export default function SeekerPaymentRedirect() {
  redirect("/payment")
}
