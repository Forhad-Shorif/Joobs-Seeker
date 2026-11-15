/**
 * 📄 lib/everything/subscription.ts
 * ==================================================================
 * 📌 কী: user-এর plan মনে রাখার ছোট helper।
 *        "free" = ১০টা application, "professional" = unlimited।
 *
 * 🔁 কীভাবে:
 *      - payment সফল হলে → /success পেজ → setProfessional() call হয়
 *      - "Apply Now" চাপলে → ApplyBtn → isProfessional() দেখে limit check করে
 *
 * 📦 কোথায় রাখে:
 *      browser-এর localStorage (key: "hireloop:plan")
 *
 * ⚠️ কেন এটা simple রাখা হয়েছে:
 *      এখন backend-এ subscription API নেই, তাই browser-এ flag রাখা হচ্ছে।
 *      real project-এ এটা করা উচিত নয় — Stripe webhook দিয়ে backend-এ
 *      plan save করে ApplyBtn-এ server-side check করা লাগবে,
 *      নাহলে localStorage clear করলেই ১০-এর limit bypass হবে।
 * ==================================================================
 */

const PLAN_KEY = "hireloop:plan"

// payment হয়ে professional plan active কি না (ApplyBtn এটা দেখে)
export function isProfessional(): boolean {
  if (typeof window === "undefined") return false

  return window.localStorage.getItem(PLAN_KEY) === "professional"
}

// payment সফল হলে একবার call হয় (/success পেজ থেকে)
export function setProfessional(): void {
  if (typeof window === "undefined") return

  window.localStorage.setItem(PLAN_KEY, "professional")
}
