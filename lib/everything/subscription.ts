/**
 * 📄 lib/everything/subscription.ts
 *
 * Free plan: সর্বোচ্চ ১০টা job-এ apply করা যায়।
 * Payment সফল হলে plan "professional" হয়ে যায় → limit থাকে না।
 *
 * ⚠️ এটা simple client-side flag (localStorage)।
 * পরে backend-এ subscription save হলে এই flag-এর জায়গায় API check বসবে।
 */

const PLAN_KEY = "hireloop:plan"

// payment হয়ে professional plan active কি না
export function isProfessional(): boolean {
  if (typeof window === "undefined") return false

  return window.localStorage.getItem(PLAN_KEY) === "professional"
}

// payment সফল হলে একবার call হয়
export function setProfessional(): void {
  if (typeof window === "undefined") return

  window.localStorage.setItem(PLAN_KEY, "professional")
}
