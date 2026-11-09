import type { Metadata } from "next"

import { AuthShell } from "@/components/auth-shell"
import SignPage from "@/components/sign-in-form"

export const metadata: Metadata = {
  title: "Sign in - HireLoop",
}

export default function SignInPage() {
  return (
    <AuthShell>
      <SignPage />
    </AuthShell>
  )
}
