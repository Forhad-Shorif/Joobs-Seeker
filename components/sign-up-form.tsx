'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowRight, Eye, EyeOff, Image as ImageIcon, Lock, Mail, UserRound } from "lucide-react"
import { FaGithub, FaGoogle } from "react-icons/fa6"

import { AuthField } from "@/components/auth-field"
import { authClient } from "@/lib/auth-client"
import { showToast } from "@/lib/toast"

// Password koto strong, seta check korar rules
const passwordRules = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "One uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "One number", test: (value: string) => /\d/.test(value) },
]

export function SignUpForm() {
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Avatar Image URL state for live preview
  const [avatarUrl, setAvatarUrl] = useState("")

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const passedRules = passwordRules.filter((rule) => rule.test(password)).length

  /**
   * 🧾 ACCOUNT CREATE (Using Object.fromEntries)
   * ------------------------------------------------------------------
   */
  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setErrorMessage("")

    // 👉 আপনার চাওয়া মেথডটি এখানে ব্যবহার করা হয়েছে
    const formData = new FormData(event.currentTarget)
    const user = Object.fromEntries(formData.entries()) as {
      name: string
      email: string
      password: string
      image?: string
    }

    // যদি ইমেজ ফিল্ড খালি থাকে, তবে undefined করে দেওয়া ভালো
    const Userdata = {
      name: user.name,
      email: user.email,
      password: user.password,
      image: avatarUrl || undefined,
    }

    console.log(Userdata)

    try {
      const { data, error } = await authClient.signUp.email(Userdata)
      console.log(data)

      if (error) {
        showToast.error("Some thing went rong")
        return
      }

      // ✅ Account create + auto login সফল হয়েছে
      showToast.success("Account created! Welcome to HireLoop.")
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Sign up error:", error)
      setErrorMessage("Something went wrong. Please try again.")
      showToast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  /**
   * 🌐 GOOGLE / GITHUB SIGN UP
   * ------------------------------------------------------------------
   */
  // async function handleSocialSignUp(provider: "google" | "github") {
  //   try {
  //     setLoading(true)

  //     const { data , error } = await authClient.signIn.social({ provider, callbackURL: "/" })
      
  //      console.log(data)
  //     if (error) {
  //       showToast.error(
  //         `${provider === "google" ? "Google" : "GitHub"} login is not set up yet.`,
  //       )
  //       setLoading(false)
  //     }
  //   } catch (error) {
  //     console.error(`${provider} sign up failed:`, error)
  //     showToast.error(`${provider === "google" ? "Google" : "GitHub"} login is not set up yet.`)
  //     setLoading(false)
  //   }
  // }

    const handleGoogleSignIn = async () => {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    };
  
    // GitHub Sign In Handler
    const handleGithubSignIn = async () => {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
      });
    };

  return (
    <div>
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 shadow-2xl shadow-black/40 sm:p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Create your account</h2>
          <p className="mt-2 text-sm text-white/45">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-violet-300 hover:text-violet-200">
              Sign in
            </Link>
          </p>
        </div>

        {/* Social buttons */}
        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            // onClick={() => handleSocialSignUp("google")}
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white/80 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaGoogle className="size-4" />
            Google
          </button>
          <button
            type="button"
            // onClick={() => handleSocialSignUp("github")}
            onClick={handleGithubSignIn}
            disabled={loading}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white/80 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaGithub className="size-4" />
            GitHub
          </button>
        </div>

        <p className="my-6 flex items-center gap-3 text-[11px] tracking-wider text-white/25 uppercase">
          <span className="h-px flex-1 bg-white/10" />
          or continue with email
          <span className="h-px flex-1 bg-white/10" />
        </p>

        {/* Error box */}
        {errorMessage && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3.5 py-3 text-xs text-rose-200">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSignUp}>
          {/* Profile photo URL input with live preview */}
          <div className="flex items-center gap-4">
            <div
              className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.04] bg-cover bg-center text-white/40"
              style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
            >
              {!avatarUrl && <UserRound className="size-6" />}
            </div>

            <div className="w-full">
              <AuthField
                id="image"
                name="image"
                label="Profile Photo URL"
                icon={ImageIcon}
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </div>
          </div>

          <AuthField
            id="name"
            name="name"
            label="Full name"
            icon={UserRound}
            type="text"
            placeholder="Ayesha Rahman"
            autoComplete="name"
            required
          />

          <AuthField
            id="email"
            name="email"
            label="Email address"
            icon={Mail}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <div className="space-y-2">
            <AuthField
              id="password"
              name="password"
              label="Password"
              icon={Lock}
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="flex size-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              }
            />

            {/* Password strength bar */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {passwordRules.map((rule, index) => (
                <span
                  key={rule.label}
                  className={`h-1 rounded-full transition ${index < passedRules ? "bg-emerald-400" : "bg-white/10"
                    }`}
                />
              ))}
            </div>

            <ul className="space-y-1.5 pt-1">
              {passwordRules.map((rule) => {
                const passed = rule.test(password)

                return (
                  <li
                    key={rule.label}
                    className={`flex items-center gap-2 text-xs ${passed ? "text-emerald-400" : "text-white/35"
                      }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${passed ? "bg-emerald-400" : "bg-white/20"}`}
                    />
                    {rule.label}
                  </li>
                )
              })}
            </ul>
          </div>

          <label className="flex items-start gap-2.5 text-xs leading-relaxed text-white/45">
            <input
              type="checkbox"
              name="terms"
              required
              className="mt-0.5 size-4 shrink-0 rounded border-white/20 bg-white/5 accent-violet-600"
            />
            <span>
              I agree to the{" "}
              <Link href={"ds"} className="text-white/70 hover:text-white">
                Terms
              </Link>
              {" "}
              and{" "}
              <Link href={""} className="text-white/70 hover:text-white">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-medium text-white shadow-[0_0_35px_-12px_rgba(139,92,246,1)] transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
            <ArrowRight className="size-4" />
          </button>
        </form >
      </div >
    </div>
  )
}