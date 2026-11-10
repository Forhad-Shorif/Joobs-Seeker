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
  Link2,
  Loader2,
  LogOut,
  Mail,
  Plus,
  Save,
  Sparkles,
  Upload,
  UserRound,
} from "lucide-react"

import { Field, inputClass } from "@/components/Profileform"
import { SiteHeader } from "@/components/site-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { uploadImageToCloudinary } from "@/lib/actions/upload-image"
import { authClient } from "@/lib/auth-client"
import { compressImage } from "@/lib/image"
import { showToast } from "@/lib/toast"

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

  // 🖼️ ছবির উৎস: "url" = লিংক পেস্ট, "file" = কম্পিউটার থেকে আপলোড
  const [imageMode, setImageMode] = useState<"url" | "file">(
    initialUser.image.startsWith("data:") ? "file" : "url",
  )

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
      setImageMode("file")
      showToast.success("Photo selected. Click Save changes to apply.")
    } catch (error) {
      console.error("Image processing failed:", error)
      showToast.error("Could not read this image. Please try another one.")
    } finally {
      // একই ছবি আবার বাছাই করলেও onChange যেন কাজ করে
      input.value = ""
    }
  }

  // কভার ছবি বাছাই: ছোট করি → Cloudinary-তে upload → URL MongoDB-তে save
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

      // 1) কভার বড় জায়গায় দেখায়, তাই 1280px WebP data URL বানাই
      const coverDataUrl = await compressImage(file, 1280, 0.82)

      // 2) Cloudinary-তে upload করে ছোট URL নিই
      const coverUrl = await uploadImageToCloudinary(coverDataUrl)

      // 3) Better Auth user-এর coverImage field-এ শুধু URL save করি
      //    (base64 নয় — তাই MongoDB-তে বড় string যাবে না)
      const { error } = await authClient.updateUser({ coverImage: coverUrl })

      if (error) {
        showToast.error(error.message || "Could not update the cover image.")
        return
      }

      setCover(coverUrl)
      showToast.success("Cover image updated!")
    } catch (error) {
      console.error("Cover image update failed:", error)
      showToast.error("Could not update the cover image. Please try again.")
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
      // 1) Avatar যদি data URL (file) হয় → Cloudinary-তে upload
      //    যদি আগে থেকেই URL হয় → সেটাই ব্যবহার করি
      let imageUrl = avatar.trim()

      if (imageUrl.startsWith("data:")) {
        imageUrl = await uploadImageToCloudinary(imageUrl)
      }

      // 2) Better Auth user record-এ নাম + ছোট image URL save
      //    খালি string পাঠালে আগের ছবি মুছে যাবে
      const { error } = await authClient.updateUser({
        name: name.trim(),
        image: imageUrl,
      })

      if (error) {
        showToast.error(error.message || "Could not update your profile.")
        return
      }

      setAvatar(imageUrl)
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
          <div className="relative h-28 overflow-hidden bg-[#0d0d11] sm:h-36">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
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
                <div className="absolute -top-24 right-10 size-64 rounded-full bg-violet-600/30 blur-[90px]" />
              </>
            )}

            <label
              htmlFor="profile-cover"
              className="absolute top-3 right-3 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/70"
            >
              <ImagePlus className="size-3.5" />
              Change cover
            </label>
          </div>

          <div className="relative px-5 pb-5 sm:px-7 sm:pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="relative -mt-12 sm:-mt-14">
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

                  <label
                    htmlFor="profile-photo"
                    onClick={() => setImageMode("file")}
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
              {/* প্রোফাইল ছবি + নাম — এক লাইনে, যাতে form ছোট হয় */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3 sm:w-52">
                  <div className="size-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500 to-blue-500">
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

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white/80">
                      Profile photo
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/35">
                      Max 5MB
                    </p>
                  </div>
                </div>

                <div className="flex-1">
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
                </div>
              </div>

              {/* ছবির উৎস: URL অথবা ফাইল */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setImageMode("url")}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition ${
                      imageMode === "url"
                        ? "border-violet-400/60 bg-violet-500/15 text-violet-200"
                        : "border-white/10 bg-white/[0.04] text-white/50 hover:text-white"
                    }`}
                  >
                    <Link2 className="size-3.5" />
                    Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode("file")}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition ${
                      imageMode === "file"
                        ? "border-violet-400/60 bg-violet-500/15 text-violet-200"
                        : "border-white/10 bg-white/[0.04] text-white/50 hover:text-white"
                    }`}
                  >
                    <Upload className="size-3.5" />
                    Upload file
                  </button>
                </div>

                {imageMode === "url" ? (
                  <Field id="profile-image-url" label="Profile photo URL">
                    {/* base64 হলে ইনপুটে দেখানো হয় না, কারণ লেখা অনেক বড় */}
                    <input
                      id="profile-image-url"
                      type="url"
                      value={avatar.startsWith("data:") ? "" : avatar}
                      onChange={(event) => setAvatar(event.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className={inputClass}
                    />
                  </Field>
                ) : (
                  <label
                    htmlFor="profile-photo"
                    className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white/70 transition hover:border-white/20 hover:bg-white/[0.08]"
                  >
                    <Upload className="size-4" />
                    {avatar ? "Change photo" : "Choose photo"}
                  </label>
                )}

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

              {/* কভার image — compact row */}
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                <div className="h-12 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(120deg,rgba(139,92,246,0.35),rgba(59,130,246,0.2),rgba(5,5,5,0))]">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt="Cover preview"
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-[10px] text-white/40">
                      No cover
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white/80">
                    Cover image
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/35">
                    16:9 recommended, max 5MB
                  </p>
                </div>

                <label
                  htmlFor="profile-cover"
                  className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-white/80 transition hover:border-violet-400/40 hover:bg-white/10 hover:text-white"
                >
                  <ImagePlus className="size-3.5" />
                  Choose
                </label>
              </div>

              {/* লুকানো ফাইল ইনপুট */}
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

              <div className="flex flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-white/30">
                  Files are uploaded and saved as small URLs.
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
              <h2 className="mt-2 text-lg font-semibold">Your profile details</h2>

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
