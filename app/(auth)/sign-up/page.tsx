import type { Metadata } from "next"

import { AuthShell } from "@/components/SheareHome/auth-shell"
import { SignUpForm } from "@/components/SheareAuth/sign-up-form"

export const metadata: Metadata = {
  title: "Sign up - HireLoop",
}

export default function SignUpPage() {
  return (
    <AuthShell>
      <SignUpForm />
    </AuthShell>
  )
}
