"use server"

import type { ProfileDetails, ProfileDocument } from "@/lib/Type/user-info"
import { emptyProfileDetails } from "@/lib/Type/user-info"

/**
 * 📄 lib/SheareAction/ProfileAction/userinfo.tsx
 *
 * Profile page আর Settings page — দুটোই একই backend collection-এ
 * একই flat document shape-এ details save করে।
 *
 * MongoDB-তে document এমন দেখায় (কোনো nested `details` নেই):
 * {
 *   _id: ObjectId,            ← MongoDB নিজেই বানায়, client থেকে id যায় না
 *   email: "user@example.com",
 *   headline: "Frontend Developer",
 *   skills: ["React"],
 *   experience: "3 - 5 years",
 *   status: "Career break",
 *   city: "Dhaka",
 *   dateOfBirth: "2026-12-02",
 *   gender: "Other",
 *   nationality: "Bangladesh"
 * }
 *
 * POST /UserInfo        → email দিয়ে upsert (create অথবা update)
 * GET  /UserInfo/:email → আগের saved details load
 */

function getBackendUrl() {
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL

  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is missing in .env")
  }

  return backendUrl.replace(/\/$/, "")
}

/**
 * Backend থেকে আসা data-কে form-এর নিরাপদ shape-এ আনি।
 *
 * শুধু form-এর field গুলো নেওয়া হয়, তাই document-এর `_id`, `createdAt`
 * ইত্যাদি কখনো form state-এ বা পরের save payload-এ ঢুকতে পারে না।
 */
function normalizeDetails(value: unknown): ProfileDetails {
  const data = (value ?? {}) as Partial<Record<keyof ProfileDetails, unknown>>

  const text = (key: keyof ProfileDetails) =>
    typeof data[key] === "string"
      ? (data[key] as string)
      : (emptyProfileDetails[key] as string)

  return {
    headline: text("headline"),
    skills: Array.isArray(data.skills)
      ? data.skills.filter(
          (skill): skill is string => typeof skill === "string"
        )
      : [],
    experience: text("experience"),
    status: text("status"),
    city: text("city"),
    dateOfBirth: text("dateOfBirth"),
    gender: text("gender"),
    nationality: text("nationality"),
  }
}

export async function saveUserInfo(email: string, details: ProfileDetails) {
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail) {
    throw new Error("Email is required to save profile details.")
  }

  // Flat document — email সহ সব field একই level-এ।
  // কোনো `_id`/`id` পাঠানো হয় না; MongoDB নিজেই বানাবে।
  const payload: ProfileDocument = {
    ...normalizeDetails(details),
    email: normalizedEmail,
  }

  const response = await fetch(`${getBackendUrl()}/UserInfo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(
      message || `Could not save profile details (${response.status}).`
    )
  }

  return { ok: true as const }
}

export async function getUserInfo(email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) return null

  const response = await fetch(
    `${getBackendUrl()}/UserInfo/${encodeURIComponent(normalizedEmail)}`,
    { cache: "no-store" }
  )

  // নতুন user-এর আগে কোনো details নেই
  if (response.status === 404) return null

  if (!response.ok) {
    const message = await response.text()
    throw new Error(
      message || `Could not load profile details (${response.status}).`
    )
  }

  const data = (await response.json()) as Record<string, unknown> | null

  // নতুন flat document থেকে সরাসরি পড়ি;
  // পুরোনো nested { email, details } document থাকলেও সেটাও কাজ করবে।
  const source =
    data && typeof data.details === "object" && data.details !== null
      ? data.details
      : data

  return normalizeDetails(source)
}
