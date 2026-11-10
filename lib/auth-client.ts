import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"

import type { auth } from "@/lib/auth"

/**
 * 🔐 BETTER AUTH CLIENT
 * ------------------------------------------------------------------
 * এই ফাইল browser (client side) থেকে login / signup / session-এর
 * কাজগুলো করে। উদাহরণ:
 *
 *   authClient.signIn.email({...})   → email দিয়ে login
 *   authClient.signUp.email({...})   → email দিয়ে account খোলা
 *   authClient.useSession()          → current user-এর তথ্য পাওয়া
 *   authClient.getSession()          → একবার session চেক করা
 *   authClient.updateUser({...})     → name / image update
 *   authClient.signOut()             → logout
 *
 * baseURL:
 * - Localhost-এ কিছু সেট করতে হয় না, browser নিজেই current domain ব্যবহার করে।
 * - Deploy করার পর app আর API একই domain-এ থাকলে কিছু সেট করতে হয় না।
 * - আলাদা domain হলে hosting-এর environment variable-এ
 *   NEXT_PUBLIC_APP_URL=https://tomar-domain.com সেট করো।
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  // server-এর additional fields (যেমন: role) client-এ type-safe করে।
  // এই line থাকলে authClient.signUp.email({ role: "seeker" }) লিখলে
  // TypeScript error দেবে না।
  plugins: [inferAdditionalFields<typeof auth>()],
})
