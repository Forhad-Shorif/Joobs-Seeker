"use client"

import { useRouter } from "next/navigation"
import { useState, type ChangeEvent, type FormEvent } from "react"
import {
  Camera,
  ImagePlus,
  Loader2,
  Mail,
  Save,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react"

import { Field, inputClass } from "@/components/SheareProfile/Profileform"
import { uploadImageToCloudinary } from "@/lib/SheareAction/ProfileAction/upload-image"
import { authClient } from "@/lib/auth-client"
import { compressImage } from "@/lib/everything/image"
import { showToast } from "@/lib/utils/toast"

type SettingUser = {
  name: string
  email: string
  image: string
  coverImage: string
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

/**
 * 📄 components/Seeker/SettingProfile.tsx
 *
 * Login user-এর name, profile image আর cover image update করে।
 * ছবি file হলে browser-এ compress হয় → Cloudinary upload → শুধু URL DB-তে যায়।
 */
export default function SettingProfile({
  initialUser,
}: {
  initialUser: SettingUser
}) {
  const router = useRouter()

  const [name, setName] = useState(initialUser.name)
  const [avatar, setAvatar] = useState(initialUser.image)
  const [cover, setCover] = useState(initialUser.coverImage)
  const [isSaving, setIsSaving] = useState(false)

  const initial = name.trim().charAt(0).toUpperCase() || "U"

  function isValidImage(file: File) {
    if (!file.type.startsWith("image/")) {
      showToast.error("Please choose an image file.")
      return false
    }

    if (file.size > MAX_IMAGE_SIZE) {
      showToast.error("Image must be 5MB or smaller.")
      return false
    }

    return true
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target
    const file = input.files?.[0]

    if (!file || !isValidImage(file)) return

    try {
      setAvatar(await compressImage(file))
      showToast.success("Photo selected. Click Save changes to apply.")
    } catch (error) {
      console.error("Profile image processing failed:", error)
      showToast.error("Could not read this image. Please try another one.")
    } finally {
      input.value = ""
    }
  }

  async function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target
    const file = input.files?.[0]

    if (!file || !isValidImage(file)) return

    try {
      setCover(await compressImage(file, 1280, 0.82))
      showToast.success("Cover selected. Click Save changes to apply.")
    } catch (error) {
      console.error("Cover image processing failed:", error)
      showToast.error("Could not read this image. Please try another one.")
    } finally {
      input.value = ""
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!name.trim()) {
      showToast.error("Name cannot be empty.")
      return
    }

    setIsSaving(true)

    try {
      // data URL মানে নতুন file; URL হলে আগেরটাই ব্যবহার হবে
      const imageUrl = avatar.startsWith("data:")
        ? await uploadImageToCloudinary(avatar)
        : avatar.trim()

      const coverUrl = cover.startsWith("data:")
        ? await uploadImageToCloudinary(cover)
        : cover.trim()

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
      setIsSaving(false)
    }
  }

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0b0b0e]/80 shadow-[0_30px_80px_-55px_rgba(139,92,246,0.65)]">
      <form onSubmit={handleSave} className="flex flex-1 flex-col">
        {/* Header */}
        <div className="px-5 pt-5 sm:px-6 sm:pt-6">
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-violet-300/80 uppercase">
            <UserRound className="size-3.5" />
            Profile Information
          </div>

          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Your profile
          </h2>
          <p className="mt-1 text-sm text-white/45">
            Update your name, profile photo and cover image.
          </p>
        </div>

        {/* Cover — card-এর একদম edge থেকে edge */}
        <div className="group relative mt-5 h-40 overflow-hidden bg-[#0d0d11]">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt="Cover preview"
              className="size-full object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(139,92,246,0.55),rgba(59,130,246,0.28)_45%,rgba(5,5,5,0)_80%)]" />
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent)] [background-size:32px_32px]"
              />
              <div className="absolute -top-20 right-16 size-56 rounded-full bg-violet-600/30 blur-[80px]" />
            </>
          )}

          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-black/10 to-transparent"
          />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
            <span className="rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[10px] font-medium tracking-[0.16em] text-white/55 uppercase backdrop-blur">
              Cover photo
            </span>

            <label
              htmlFor="setting-cover"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:border-violet-300/40 hover:bg-black/70"
            >
              <ImagePlus className="size-3.5" />
              Change cover
            </label>
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
            <p className="text-[10px] text-white/50">
              16:9 recommended · max 5MB
            </p>

            {cover && (
              <button
                type="button"
                onClick={() => setCover("")}
                className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[10px] text-white/55 backdrop-blur transition hover:text-rose-300"
              >
                <Trash2 className="size-3" />
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="relative flex flex-1 flex-col px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="group relative size-24 shrink-0 rounded-[28px] bg-gradient-to-br from-violet-400 via-fuchsia-400 to-blue-400 p-[3px] shadow-[0_20px_50px_-18px_rgba(139,92,246,0.95)]">
              <div className="relative size-full overflow-hidden rounded-[25px] bg-[#0a0a0c]">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt={`${name || "User"} profile photo`}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-2xl font-semibold text-white">
                    {initial}
                  </span>
                )}

                <label
                  htmlFor="setting-avatar"
                  className="absolute inset-0 grid cursor-pointer place-items-center bg-black/55 opacity-0 transition group-hover:opacity-100"
                >
                  <span className="grid size-9 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur">
                    <Camera className="size-4" />
                  </span>
                  <span className="sr-only">Change profile photo</span>
                </label>
              </div>
            </div>

            <div className="min-w-0 flex-1 pb-1">
              <p className="text-sm font-medium text-white">Profile photo</p>
              <p className="mt-0.5 text-[11px] text-white/35">
                JPG, PNG or WebP · max 5MB
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label
                  htmlFor="setting-avatar"
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 text-xs font-medium text-white/75 transition hover:border-violet-400/40 hover:bg-white/10 hover:text-white"
                >
                  <Upload className="size-3.5" />
                  Change photo
                </label>

                {avatar && (
                  <button
                    type="button"
                    onClick={() => setAvatar("")}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs text-white/35 transition hover:bg-rose-500/10 hover:text-rose-300"
                  >
                    <Trash2 className="size-3.5" />
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Field id="setting-name" label="Full name">
              <input
                id="setting-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                className={inputClass}
                required
              />
            </Field>

            <Field id="setting-email" label="Email">
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/35" />
                <input
                  id="setting-email"
                  value={initialUser.email}
                  readOnly
                  className={`${inputClass} pl-10 text-white/50`}
                />
              </div>
            </Field>
          </div>

          <input
            id="setting-avatar"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="sr-only"
          />
          <input
            id="setting-cover"
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="sr-only"
          />

          <div className="mt-auto flex flex-col gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-white/30">
              Changes appear on your public profile.
            </p>

            <button
              type="submit"
              disabled={isSaving}
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-medium text-white shadow-[0_12px_35px_-18px_rgba(139,92,246,1)] transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </section>
  )
}
