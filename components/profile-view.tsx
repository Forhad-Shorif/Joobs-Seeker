"use client"

/**
 * 📄 ফাইল: components/profile-view.tsx
 * কাজ: প্রোফাইল পেজের পুরো UI (client side)।
 *  - উপরে হিরো: ছবি, নাম, ইমেইল, স্ট্যাটাস
 *  - বাম কার্ড: নাম + ছবি আপডেট
 *  - ডান ফর্ম: components/Profileform.tsx
 * সার্ভার পেজ app/profile/page.tsx থেকে name/email/image আসে।
 */

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"
import {
  BadgeCheck,
  Camera,
  ChevronRight,
  ImagePlus,
  Loader2,
  LogOut,
  Mail,
  Save,
  UserRound,
} from "lucide-react"

import { Field, ProfileForm, inputClass } from "@/components/Profileform"
import { SiteHeader } from "@/components/site-header"
import { authClient } from "@/lib/auth-client"
import { compressImage } from "@/lib/image"
import {
  emptyProfileDetails,
  loadProfileDetails,
  saveProfileCover,
  type ProfileDetails,
} from "@/lib/profile-details"
import { showToast } from "@/lib/toast"

/** সার্ভার পেজ (app/profile/page.tsx) থেকে আসা ইউজারের তথ্য */
export type ProfileUser = {
  name: string
  email: string
  image: string
}

// প্রোফাইল ছবির সর্বোচ্চ সাইজ ৫MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

export function ProfileView({ initialUser }: { initialUser: ProfileUser }) {
  const router = useRouter()

  // ---------- অ্যাকাউন্ট: নাম + ছবি ----------
  // avatar = প্রিভিউ ছবি (data URL), isSavingAccount = সেভ চলছে কি না
  const [name, setName] = useState(initialUser.name)
  const [avatar, setAvatar] = useState(initialUser.image)
  const [isSavingAccount, setIsSavingAccount] = useState(false)

  // ---------- ডান দিকের ফর্মের ডেটা ----------
  const [details, setDetails] = useState<ProfileDetails>({
    ...emptyProfileDetails,
  })

  // পেজ খুললে email দিয়ে আগের সেভ করা ডিটেইলস লোড করে
  // (আসল ডেটা আসে lib/profile-details.ts থেকে)
  useEffect(() => {
    let cancelled = false

    loadProfileDetails(initialUser.email).then((saved) => {
      if (!cancelled) setDetails(saved)
    })

    return () => {
      cancelled = true
    }
  }, [initialUser.email])

  // কতগুলো ফিল্ড পূরণ হয়েছে → তার উপর ভিত্তি করে প্রোফাইল স্ট্রেংথ %
  const completeness = useMemo(() => {
    const checks = [
      Boolean(name.trim()),
      Boolean(avatar),
      Boolean(details.headline.trim()),
      details.skills.length > 0,
      Boolean(details.experience),
      Boolean(details.phone.trim()),
      Boolean(details.city.trim()),
      Boolean(details.homeAddress.trim()),
      Boolean(details.personalDetails.trim()),
    ]

    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  }, [name, avatar, details])

  // ছবি না থাকলে নামের প্রথম অক্ষর (fallback "U") দেখায়
  const initial = name.trim().charAt(0).toUpperCase() || "U"

  // লগআউট করে হোম পেজে পাঠায় (lib/auth-client.ts দিয়ে)
  async function handleSignOut() {
    try {
      await authClient.signOut()
      showToast.success("You have been logged out.")
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Sign out failed:", error)
      showToast.error("Could not log out. Please try again.")
    }
  }

  // ছবি বাছাই: image কিনা + ৫MB সীমা চেক → lib/image.ts দিয়ে ছোট প্রিভিউ বানায়
  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target
    const file = input.files?.[0]
    if (!file) return

    try {
      if (!file.type.startsWith("image/")) {
        showToast.error("Please choose an image file.")
        return
      }

      if (file.size > MAX_IMAGE_SIZE) {
        showToast.error("Image must be 5MB or smaller.")
        return
      }

      setAvatar(await compressImage(file))
      showToast.success("Photo selected. Click Save changes to apply.")
    } catch (error) {
      console.error("Image processing failed:", error)
      showToast.error("Could not read this image. Please try another one.")
    } finally {
      // একই ছবি আবার বাছাই করলেও onChange যেন কাজ করে
      input.value = ""
    }
  }

  // কভার ছবি বাছাই: চেক করে ছোট করে → email দিয়ে সাথে সাথে সেভ করে
  async function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target
    const file = input.files?.[0]
    if (!file) return

    try {
      if (!file.type.startsWith("image/")) {
        showToast.error("Please choose an image file.")
        return
      }

      if (file.size > MAX_IMAGE_SIZE) {
        showToast.error("Image must be 5MB or smaller.")
        return
      }

      // কভার বড় জায়গায় দেখায়, তাই 1280px পর্যন্ত রাখি
      const coverImage = await compressImage(file, 1280, 0.82)
      await saveProfileCover(initialUser.email, coverImage)

      setDetails((current) => ({ ...current, coverImage }))
      showToast.success("Cover image updated!")
    } catch (error) {
      console.error("Cover image update failed:", error)
      showToast.error("Could not update the cover image. Please try again.")
    } finally {
      input.value = ""
    }
  }

  // নাম + ছবি সেভ করে (better-auth এর updateUser কল)
  async function handleSaveAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!name.trim()) {
      showToast.error("Name cannot be empty.")
      return
    }

    setIsSavingAccount(true)

    try {
      const payload: { name: string; image?: string } = { name: name.trim() }
      if (avatar) payload.image = avatar

      const { error } = await authClient.updateUser(payload)

      if (error) {
        showToast.error(error.message || "Could not update your profile.")
        return
      }

      showToast.success("Profile updated!")
      router.refresh()
    } catch (error) {
      console.error("Profile update failed:", error)
      showToast.error("Could not update your profile. Please try again.")
    } finally {
      setIsSavingAccount(false)
    }
  }

  return (
    <div className="min-h-svh bg-[#050505] text-white">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        {/* হোম > My profile ব্রেডক্রাম্ব */}
        <div className="mb-6 flex items-center gap-1.5 text-xs text-white/40">
          <Link href="/" className="transition hover:text-white">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-white/70">My profile</span>
        </div>

        {/* ================= হিরো: কভার + অ্যাভাটার + নাম ================= */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
          {/* কভার: ইউজার ছবি দিলে সেটা, না দিলে গ্রেডিয়েন্ট */}
          <div className="relative h-36 overflow-hidden bg-[#0d0d11] sm:h-48">
            {details.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={details.coverImage}
                alt="Profile cover"
                className="size-full object-cover"
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(139,92,246,0.45),rgba(59,130,246,0.22)_45%,rgba(5,5,5,0)_78%)]" />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent)] [background-size:42px_42px]"
                />
                <div className="absolute -top-28 right-8 size-72 rounded-full bg-violet-600/30 blur-[100px]" />
              </>
            )}

            {/* কভার বদলানোর বাটন — ফাইল ইনপুটটা নিচে অ্যাকাউন্ট কার্ডে আছে */}
            <label
              htmlFor="profile-cover"
              className="absolute top-3 right-3 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/70 sm:top-4 sm:right-4"
            >
              <ImagePlus className="size-3.5" />
              Change cover
            </label>
          </div>

          <div className="px-5 pb-6 sm:px-8 sm:pb-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              {/* অ্যাভাটার + নাম + ইমেইল */}
              <div className="flex items-end gap-4">
                <div className="relative -mt-14 sm:-mt-16">
                  <div className="size-24 overflow-hidden rounded-3xl border-4 border-[#0a0a0c] bg-gradient-to-br from-violet-500 to-blue-500 shadow-2xl shadow-black/60 sm:size-28">
                    {avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatar}
                        alt={`${name} profile photo`}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-3xl font-semibold text-white">
                        {initial}
                      </span>
                    )}
                  </div>

                  {/* ক্যামেরা আইকনে ক্লিক করলে ফাইল পিকার খোলে */}
                  <label
                    htmlFor="profile-photo"
                    className="absolute -right-1 -bottom-1 flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-[#0a0a0c] bg-violet-600 text-white shadow-lg transition hover:bg-violet-500"
                  >
                    <Camera className="size-4" />
                    <span className="sr-only">Change profile photo</span>
                  </label>
                </div>

                <div className="min-w-0 pb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                      {name || "Your name"}
                    </h1>
                    <BadgeCheck className="size-5 shrink-0 text-violet-400" />
                  </div>

                  <p className="mt-1 truncate text-sm text-white/45">
                    {details.headline || "Add a headline to stand out"}
                  </p>

                  <p className="mt-2 flex items-center gap-1.5 truncate text-xs text-white/40">
                    <Mail className="size-3.5 shrink-0" />
                    {initialUser.email}
                  </p>
                </div>
              </div>

              {/* স্ট্যাটাস ব্যাজ + লগআউট বাটন */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  {details.status || "Open to work"}
                </span>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-white/70 transition hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <LogOut className="size-3.5" />
                  Log out
                </button>
              </div>
            </div>

            {/* প্রোফাইল কত % পূরণ হয়েছে → প্রোগ্রেস বার */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-white/70">
                  Profile strength
                </span>
                <span className="font-semibold text-violet-300">
                  {completeness}%
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-400 transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-white/35">
                Complete your details to get better job matches.
              </p>
            </div>
          </div>
        </section>

        {/* ================= দুই কলামের বডি ================= */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start">
          {/* ---------- বাম কার্ড: নাম + ছবি আপডেট ---------- */}
          <section
            id="account"
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-7 lg:sticky lg:top-24"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent"
            />

            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-violet-300/80 uppercase">
              <UserRound className="size-4" />
              Account
            </div>

            <h2 className="mt-3 text-lg font-semibold">Personal information</h2>
            <p className="mt-1 text-sm text-white/45">
              Update your name, photo and cover image.
            </p>

            <form onSubmit={handleSaveAccount} className="mt-6 space-y-5">
              {/* ছবির প্রিভিউ + Change বাটন */}
              <div className="flex items-center gap-4">
                <div className="size-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500 to-blue-500">
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatar}
                      alt="Profile photo preview"
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-lg font-semibold">
                      {initial}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white/80">
                    Profile photo
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/35">
                    JPG, PNG or WebP. Max 5MB.
                  </p>
                </div>

                <label
                  htmlFor="profile-photo"
                  className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-white/80 transition hover:border-violet-400/40 hover:bg-white/10 hover:text-white"
                >
                  <Camera className="size-3.5" />
                  Change
                </label>
              </div>

              {/* কভার ছবির ফিল্ড — বাছাই করলেই সাথে সাথে সেভ হয়ে যায় */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-white/80">Cover image</p>
                <div className="flex items-center gap-3">
                  <div className="h-14 flex-1 overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(120deg,rgba(139,92,246,0.35),rgba(59,130,246,0.2),rgba(5,5,5,0))]">
                    {details.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={details.coverImage}
                        alt="Cover preview"
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-[11px] text-white/40">
                        No cover yet
                      </span>
                    )}
                  </div>

                  <label
                    htmlFor="profile-cover"
                    className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-white/80 transition hover:border-violet-400/40 hover:bg-white/10 hover:text-white"
                  >
                    <ImagePlus className="size-3.5" />
                    Choose
                  </label>
                </div>
                <p className="text-[11px] text-white/35">
                  16:9 recommended, max 5MB. Saves automatically.
                </p>
              </div>

              {/* লুকানো ফাইল ইনপুট — দুই জায়গার "Change" লেবেল এটাই খোলে */}
              <input
                id="profile-photo"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="sr-only"
              />

              {/* কভার ছবির লুকানো ইনপুট — হিরোর "Change cover" আর কার্ডের "Choose" এটাই খোলে */}
              <input
                id="profile-cover"
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="sr-only"
              />

              <Field id="profile-name" label="Full name">
                <input
                  id="profile-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  className={inputClass}
                  required
                />
              </Field>

              <button
                type="submit"
                disabled={isSavingAccount}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-medium text-white shadow-[0_0_35px_-14px_rgba(139,92,246,1)] transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingAccount ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {isSavingAccount ? "Saving..." : "Save changes"}
              </button>
            </form>
          </section>

          {/* ---------- ডান দিকের ফর্ম (আলাদা ফাইল: Profileform.tsx) ---------- */}
          <ProfileForm
            email={initialUser.email}
            details={details}
            onDetailsChange={setDetails}
          />
        </div>
      </main>
    </div>
  )
}
