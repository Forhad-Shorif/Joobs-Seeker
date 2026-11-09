import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"

import type { auth } from "@/lib/auth"

/**
 * 🔐 BETTER AUTH CLIENT
 * ------------------------------------------------------------------
 * Ei file ta browser (client side) theke login / signup / session er
 * kaj gulo kore. Example:
 *
 *   authClient.signIn.email({...})   -> email diye login
 *   authClient.signUp.email({...})   -> email diye account khula
 *   authClient.useSession()          -> current user er info paoa
 *   authClient.updateUser({...})     -> name / image update
 *   authClient.signOut()             -> logout
 *
 * baseURL:
 * - Localhost e kisu set korte hobe na, browser nijei current domain use kore.
 * - Deploy korar por jodi app and API same domain e thake, tokhon o kisu
 *   set korte hobe na.
 * - Jodi alada domain hoy, tokhon hosting er environment variable e
 *   NEXT_PUBLIC_APP_URL=https://tomar-domain.com set koro.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  // Server er additional fields (jemon: role) client e type-safe kore.
  // Ei line thakle signUp.email({ role: "seeker" }) likhle TypeScript error debe na.
  plugins: [inferAdditionalFields<typeof auth>()],
})
