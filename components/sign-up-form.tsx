'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Lock,
  Mail,
  ShieldCheck,
  Upload,
  UserRound,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { FaGithub, FaGoogle } from "react-icons/fa6"

import { AuthField } from "@/components/auth-field"
import { authClient } from "@/lib/auth-client"
import { compressImage } from "@/lib/image"
import { showToast } from "@/lib/toast"

// ------------------------------------------------------------------
// 🎭 USER ROLE
// ------------------------------------------------------------------
// Signup er somoy user ei tin ta option theke ekta select korbe.
// `type UserRole` server er lib/auth.ts er role field er sathe milte hobe.
type UserRole = "seeker" | "recruiter" | "admin"

const roleOptions: {
  value: UserRole
  label: string
  description: string
  icon: LucideIcon
}[] = [
    {
      value: "seeker",
      label: "Seeker",
      description: "I am looking for a job.",
      icon: UserRound,
    },
    {
      value: "recruiter",
      label: "Recruiter",
      description: "I want to hire talented people.",
      icon: Briefcase,
    },
    {
      value: "admin",
      label: "Admin",
      description: "I will manage the platform.",
      icon: ShieldCheck,
    },
  ]

// Password koto strong, seta check korar rules
const passwordRules = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "One uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "One number", test: (value: string) => /\d/.test(value) },
]

// Profile picture er maximum size: 5MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

export function SignUpForm() {
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // 🎭 Role state: default holo "seeker"
  const [role, setRole] = useState<UserRole>("seeker")

  // 🖼️ Image state
  // imageMode = "url"  -> user image link paste korbe
  // imageMode = "file" -> user nijer computer theke chobi upload korbe
  const [imageMode, setImageMode] = useState<"url" | "file">("url")
  const [avatar, setAvatar] = useState("")
  const [isReadingImage, setIsReadingImage] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const passedRules = passwordRules.filter((rule) => rule.test(password)).length
  const selectedRole = roleOptions.find((option) => option.value === role) ?? roleOptions[0]

  // Image mode paltole purono preview clean kore dei
  function handleImageModeChange(nextMode: "url" | "file") {
    setImageMode(nextMode)
    setAvatar("")
  }

  // User file select korle: check kori -> choto kori -> preview state e rakhi
  async function handleImageFile(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.target
    const file = input.files?.[0]

    if (!file) return

    // File ta really image kina check
    if (!file.type.startsWith("image/")) {
      showToast.error("Please choose an image file.")
      return
    }

    // 5MB er cheye boro hole bondho kori
    if (file.size > MAX_IMAGE_SIZE) {
      showToast.error("Image must be 5MB or smaller.")
      return
    }

    try {
      setIsReadingImage(true)

      // lib/image.ts er helper: chobi 512px e choto kore data URL banay
      setAvatar(await compressImage(file))
      showToast.success("Photo selected.")
    } catch (error) {
      console.error("Image processing failed:", error)
      showToast.error("Could not read this image. Please try another one.")
    } finally {
      setIsReadingImage(false)
      // Ek e chobi abar select korleo onChange jeno kaj kore
      input.value = ""
    }
  }

  /**
   * 🧾 ACCOUNT CREATE
   * ------------------------------------------------------------------
   * Form theke name/email/password nisi, ar role + image state theke nisi.
   */
  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setErrorMessage("")

    const formData = new FormData(event.currentTarget)
    const user = Object.fromEntries(formData.entries()) as {
      name: string
      email: string
      password: string
    }

    try {
      const { error } = await authClient.signUp.email({
        name: user.name,
        email: user.email,
        password: user.password,
        // Image na dile undefined pathai, jate database e empty string na jay
        image: avatar.trim() || undefined,
        // 🎭 User je role select koreche, seta server e pathai
        role,
      })

      if (error) {
        setErrorMessage(error.message || "Could not create your account.")
        showToast.error(error.message || "Could not create your account.")
        return
      }

      // ✅ Account create + auto login sokol hoye geche
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

  // 🌐 GOOGLE / GITHUB SIGN UP
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    })
  }

  const handleGithubSignIn = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/",
    })
  }

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
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white/80 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaGoogle className="size-4" />
            Google
          </button>
          <button
            type="button"
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
          {/* ---------------------------------------------------------- */}
          {/* 🖼️ PROFILE PHOTO: URL diye ba file upload diye                */}
          {/* ---------------------------------------------------------- */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div
                className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.04] bg-cover bg-center text-white/40"
                style={avatar ? { backgroundImage: `url("${avatar}")` } : undefined}
              >
                {!avatar && <UserRound className="size-6" />}
              </div>

              <div className="flex-1 space-y-2">
                {/* Image source choose: URL or File */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleImageModeChange("url")}
                    className={`flex-1 rounded-lg border px-3 py-1.5 text-xs transition ${imageMode === "url"
                        ? "border-violet-400/60 bg-violet-500/15 text-violet-200"
                        : "border-white/10 bg-white/[0.04] text-white/50 hover:text-white"
                      }`}
                  >
                    Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => handleImageModeChange("file")}
                    className={`flex-1 rounded-lg border px-3 py-1.5 text-xs transition ${imageMode === "file"
                        ? "border-violet-400/60 bg-violet-500/15 text-violet-200"
                        : "border-white/10 bg-white/[0.04] text-white/50 hover:text-white"
                      }`}
                  >
                    Upload file
                  </button>
                </div>

                {imageMode === "url" ? (
                  <AuthField
                    id="image"
                    label="Profile Photo URL"
                    icon={ImageIcon}
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatar}
                    onChange={(event) => setAvatar(event.target.value)}
                  />
                ) : (
                  <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white/70 transition hover:border-white/20 hover:bg-white/[0.08]">
                    <Upload className="size-4" />
                    {isReadingImage
                      ? "Reading image..."
                      : avatar
                        ? "Change photo"
                        : "Choose photo"}

                    {/* Real file input ta hide kora, label e click korle input open hobe */}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFile}
                      disabled={isReadingImage}
                    />
                  </label>
                )}
              </div>
            </div>

            {avatar && (
              <button
                type="button"
                onClick={() => setAvatar("")}
                className="text-xs text-white/35 transition hover:text-rose-300"
              >
                Remove photo
              </button>
            )}
          </div>

          {/* ---------------------------------------------------------- */}
          {/* 🎭 ROLE SELECT                                                */}
          {/* ---------------------------------------------------------- */}
          <div className="space-y-2">
            <span className="block text-sm font-medium text-white/80">I am a</span>

            <div className="grid grid-cols-3 gap-2">
              {roleOptions.map((option) => {
                const Icon = option.icon
                const isSelected = role === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value)}
                    aria-pressed={isSelected}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition ${isSelected
                        ? "border-violet-400/60 bg-violet-500/15 text-violet-200 ring-4 ring-violet-500/10"
                        : "border-white/10 bg-white/[0.04] text-white/50 hover:border-white/20 hover:text-white"
                      }`}
                  >
                    <Icon className="size-4" />
                    {option.label}
                  </button>
                )
              })}
            </div>

            <p className="text-xs text-white/35">{selectedRole.description}</p>
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
              <Link href="/terms" className="text-white/70 hover:text-white">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-white/70 hover:text-white">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || isReadingImage}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-medium text-white shadow-[0_0_35px_-12px_rgba(139,92,246,1)] transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
            <ArrowRight className="size-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
