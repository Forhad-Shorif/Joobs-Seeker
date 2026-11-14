"use client"

/**
 * 📄 ফাইল: components/profile-view.tsx
 * কাজ: প্রোফাইল পেজের UI (client side)।
 *
 * Design goal:
 * - Hero-টা ছোট ও premium look
 * - Account form-টা compact, যাতে page বেশি লম্বা না হয়
 * - AddInfo dropdown + desktop-এ একটা সুন্দর CTA card
 *
 * 💡 এখন এখানে কোনো GET/cards নেই।
 *    পরে তুমি backend থেকে user data GET করে cards বানাবে।
 */

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type ChangeEvent, type FormEvent } from "react"
import {
  BadgeCheck,
  Camera,
  ChevronDown,
  ChevronRight,
  FileText,
  ImagePlus,
  Loader2,
  LogOut,
  Mail,
  Plus,
  Save,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react"

import { Field, inputClass } from "@/components/SheareProfile/Profileform"
import { SiteHeader } from "@/components/SheareHome/site-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { uploadImageToCloudinary } from "@/lib/SheareAction/ProfileAction/upload-image"
import { authClient } from "@/lib/auth-client"
import { compressImage } from "@/lib/everything/image"
import { showToast } from "@/lib/utils/toast"

/** সার্ভার পেজ (app/(auth)/profile/page.tsx) থেকে আসা ইউজারের তথ্য */
export type ProfileUser = {
  name: string
  email: string
  image: string
  coverImage: string
}

// প্রোফাইল ছবির সর্বোচ্চ সাইজ ৫MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

export function ProfileView({ initialUser }: { initialUser: ProfileUser }) {
  const router = useRouter()

  // ------------------------------------------------------------------
  // 🔐 ইউজারের ইমেইল
  // ------------------------------------------------------------------
  // 💡 সার্ভার পেজ আগেই session চেক করে initialUser পাঠিয়ে দেয়।
  //    তাই এখানে আবার client-side session fetch করার দরকার নেই।
  const userEmail = initialUser.email

  // ---------- অ্যাকাউন্ট: নাম + ছবি ----------
  // avatar = ছবির preview (file হলে data URL, না হলে normal URL)
  // cover  = cover image-এর ছোট URL (Cloudinary থেকে আসে)
  const [name, setName] = useState(initialUser.name)
  const [avatar, setAvatar] = useState(initialUser.image)
  const [cover, setCover] = useState(initialUser.coverImage)
  const [isSavingAccount, setIsSavingAccount] = useState(false)

  // ছবি না থাকলে নামের প্রথম অক্ষর দেখায়
  const initial = name.trim().charAt(0).toUpperCase() || "U"

  // ⚠️ এখনো GET implement করা হয়নি, তাই user-এর AddInfo data নেই।
  //    পরে GET করে data পেলে এখানে চেক করবে:
  //    const hasAddInfo = Boolean(details.headline || details.skills.length)
  //    - true  → user-এর information দেখাবে
  //    - false → নিচের AddInfo CTA দেখাবে
  const hasAddInfo = false

  // লগআউট করে হোম পেজে পাঠায়
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

  // ছবি বাছাই: এখানে শুধু preview বানানো হচ্ছে।
  // Save changes চাপলে handleSaveAccount ছবিটা Cloudinary-তে upload করবে।
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

  // কভার ছবি বাছাই: preview বানাই, Save চাপলে Cloudinary-তে upload হবে
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

      setCover(await compressImage(file, 1280, 0.82))
      showToast.success("Cover selected. Click Save changes to apply.")
    } catch (error) {
      console.error("Cover image processing failed:", error)
      showToast.error("Could not read this image. Please try another one.")
    } finally {
      input.value = ""
    }
  }

  // 👤 নাম + প্রোফাইল ছবি আপডেট
  // 💡 image file হলে আগে Cloudinary-তে upload হবে,
  //    তারপর Better Auth-এর updateUser-এ শুধু ছোট URL যাবে।
  async function handleSaveAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!name.trim()) {
      showToast.error("Name cannot be empty.")
      return
    }

    setIsSavingAccount(true)

    try {
      // 1) নতুন file হলে Cloudinary-তে upload → ছোট URL
      //    আগে থেকেই URL হলে সেটাই ব্যবহার করি
      const imageUrl = avatar.startsWith("data:")
        ? await uploadImageToCloudinary(avatar)
        : avatar.trim()

      const coverUrl = cover.startsWith("data:")
        ? await uploadImageToCloudinary(cover)
        : cover.trim()

      // 2) Better Auth user record-এ নাম + ছোট image/cover URL save
      //    MongoDB-তে base64 নয়, শুধু Cloudinary link যাবে
      const { error } = await authClient.updateUser({
        name: name.trim(),
        image: imageUrl,
        coverImage: coverUrl,
      })

      if (error) {
        showToast.error(error.message || "Could not update your profile.")
        return
      }

      setAvatar(imageUrl)
      setCover(coverUrl)
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

      <main className="relative mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        {/* নিচের দিকের হালকা violet/blue glow — premium feel-এর জন্য */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden"
        >
          <div className="absolute -top-40 left-1/4 size-96 rounded-full bg-violet-600/15 blur-[120px]" />
          <div className="absolute -top-32 right-10 size-72 rounded-full bg-blue-500/10 blur-[100px]" />
        </div>

        {/* হোম > আমার প্রোফাইল + AddInfo dropdown */}
        <div className="relative mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-white/70">My profile</span>
          </div>

          {/* shadcn-style dropdown:
              AddInfo click → menu open → Profile form click → form page */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/70 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-200">
              <Plus className="size-3.5" />
              AddInfo
              <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-44 border border-white/10 bg-[#0b0b0e] text-white"
            >
              <DropdownMenuItem
                onClick={() => router.push("/profile/add-info")}
                className="cursor-pointer focus:bg-violet-500/15 focus:text-violet-200"
              >
                <FileText className="size-4" />
                Profile form
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ================= হিরো: ছোট, clean, premium ================= */}
        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.025] shadow-[0_30px_80px_-45px_rgba(139,92,246,0.45)]">
          <div className="group relative h-32 overflow-hidden bg-[#0d0d11] sm:h-44">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt="Profile cover"
                className="size-full object-cover transition duration-700 group-hover:scale-105"
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(139,92,246,0.5),rgba(59,130,246,0.28)_45%,rgba(5,5,5,0)_78%)]" />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent)] [background-size:42px_42px]"
                />
                <div className="absolute -top-24 right-10 size-64 rounded-full bg-violet-600/30 blur-[90px]" />
              </>
            )}

            {/* নিচের দিকটা avatar-এর সাথে মিশে যাওয়ার জন্য gradient */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"
            />

            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white/55 uppercase backdrop-blur">
                Cover photo
              </span>

              <label
                htmlFor="profile-cover"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:border-violet-300/40 hover:bg-black/70"
              >
                <ImagePlus className="size-3.5" />
                Change cover
              </label>
            </div>
          </div>

          <div className="relative px-5 pb-5 sm:px-7 sm:pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="relative -mt-14 sm:-mt-16">
                  <div className="group relative size-28 rounded-[32px] bg-gradient-to-br from-violet-400 via-fuchsia-400 to-blue-400 p-[3px] shadow-[0_20px_60px_-20px_rgba(139,92,246,0.9)] sm:size-32">
                    <div className="relative size-full overflow-hidden rounded-[29px] bg-[#0a0a0c]">
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

                      {/* desktop hover → camera overlay */}
                      <label
                        htmlFor="profile-photo"
                        className="absolute inset-0 grid cursor-pointer place-items-center bg-black/55 opacity-0 transition group-hover:opacity-100"
                      >
                        <span className="grid size-10 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur">
                          <Camera className="size-5" />
                        </span>
                        <span className="sr-only">Change profile photo</span>
                      </label>
                    </div>
                  </div>

                  {/* mobile-এ hover নেই, তাই ছোট camera button সবসময় দেখায় */}
                  <label
                    htmlFor="profile-photo"
                    className="absolute -right-1 -bottom-1 grid size-9 cursor-pointer place-items-center rounded-full border-2 border-[#0a0a0c] bg-violet-600 text-white shadow-lg transition hover:bg-violet-500 sm:hidden"
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

                  <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-white/40">
                    <Mail className="size-3.5 shrink-0" />
                    {userEmail}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Open to work
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
          </div>
        </section>

        {/* Hero-এর labels যেসব hidden input-এর সাথে connected */}
        <input
          id="profile-photo"
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="sr-only"
        />
        <input
          id="profile-cover"
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          className="sr-only"
        />

        {/* ================= বডি: account উপরে, AddInfo নিচে ================= */}
        <div className="relative mt-5 space-y-5">
          <section
            id="account"
            className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6"
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-violet-300/80 uppercase">
              <UserRound className="size-4" />
              Account
            </div>
            <h2 className="mt-2 text-lg font-semibold">Personal information</h2>

            <form onSubmit={handleSaveAccount} className="mt-5 space-y-4">
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

              {/* ছবি update হয় hero-এর cover/avatar click করে */}
              <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">
                    Profile photos
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-white/35">
                    Click your photo or cover above. Images are compressed and
                    saved as small Cloudinary URLs.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar("")}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs text-white/40 transition hover:bg-rose-500/10 hover:text-rose-300"
                    >
                      <Trash2 className="size-3.5" />
                      Remove photo
                    </button>
                  )}

                  {cover && (
                    <button
                      type="button"
                      onClick={() => setCover("")}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs text-white/40 transition hover:bg-rose-500/10 hover:text-rose-300"
                    >
                      <Trash2 className="size-3.5" />
                      Remove cover
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-white/30">
                  Images are saved as small Cloudinary URLs.
                </p>
                <button
                  type="submit"
                  disabled={isSavingAccount}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-medium text-white shadow-[0_0_35px_-14px_rgba(139,92,246,1)] transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {isSavingAccount ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {isSavingAccount ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>

          {/* ================= AddInfo: condition অনুযায়ী info অথবা CTA ================= */}
          {hasAddInfo ? (
            // ✅ user AddInfo করে থাকলে (পরে GET করলে) এখানে তার information দেখাবে
            <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-violet-300/80 uppercase">
                <Sparkles className="size-4" />
                AddInfo
              </div>
              <h2 className="mt-2 text-lg font-semibold">
                Your profile details
              </h2>

              {/* 💡 TODO: পরে GET করা details এখানে cards আকারে বসাও */}
              <p className="mt-2 text-sm text-white/45">
                Your saved profile details will appear here.
              </p>
            </section>
          ) : (
            // ❌ এখনো AddInfo data নেই → শুধু AddInfo CTA দেখাচ্ছি
            <section className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-r from-violet-600/20 via-violet-500/5 to-blue-500/10 p-5 sm:p-6">
              <div
                aria-hidden
                className="absolute -top-20 right-8 size-48 rounded-full bg-violet-500/20 blur-3xl"
              />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-violet-300/25 bg-violet-500/15 text-violet-200">
                    <FileText className="size-5" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">Add your info</h2>
                      <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-violet-200 uppercase">
                        AddInfo
                      </span>
                    </div>
                    <p className="mt-1 max-w-2xl text-sm text-white/50">
                      Add your headline, skills, experience and personal
                      details. Your saved details will appear here.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/profile/add-info")}
                  className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-medium text-white shadow-[0_0_35px_-14px_rgba(139,92,246,1)] transition hover:bg-violet-500"
                >
                  <Plus className="size-4" />
                  Open profile form
                </button>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
