import { NextResponse } from "next/server"

import { db } from "@/lib/mongodb"
import type { ProfileDetails } from "@/lib/profile-details"

/**
 * 📄 ফাইল: app/api/profile-details/route.ts
 * কাজ: প্রোফাইল ফর্মের ডেটা backend-এ (MongoDB) save ও load করা।
 *
 * এখানে শুধু দুইটা জিনিস আসে:
 *   1. user-এর email
 *   2. user-এর form details
 *
 * MongoDB collection: "profile-details"
 */

const COLLECTION_NAME = "profile-details"

// email-কে ছোট হাতের অক্ষরে রেখে দিলে একই email বারবার মিলবে
function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

/**
 * POST /api/profile-details
 * কাজ: user-এর email + details MongoDB-তে save করা।
 * আগে ডেটা থাকলে update হবে, না থাকলে নতুন document তৈরি হবে।
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string
      details?: ProfileDetails
    }

    const email = body.email ? normalizeEmail(body.email) : ""
    const details = body.details

    // ---------- ছোট validation ----------
    if (!email) {
      return NextResponse.json({ message: "email দরকার।" }, { status: 400 })
    }

    if (!details || typeof details !== "object") {
      return NextResponse.json({ message: "details দরকার।" }, { status: 400 })
    }

    // ---------- MongoDB-তে save ----------
    const collection = db.collection(COLLECTION_NAME)

    await collection.updateOne(
      { email },
      {
        $set: {
          email,
          details,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Profile details save failed:", error)
    return NextResponse.json(
      { message: "প্রোফাইল ডেটা save করা যায়নি।" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/profile-details?email=user@example.com
 * কাজ: email দিয়ে আগের save করা details আনা।
 * ডেটা না থাকলে details: null ফেরত যায়।
 */
export async function GET(request: Request) {
  try {
    const emailParam = new URL(request.url).searchParams.get("email")

    if (!emailParam) {
      return NextResponse.json({ message: "email দরকার।" }, { status: 400 })
    }

    const email = normalizeEmail(emailParam)
    const collection = db.collection(COLLECTION_NAME)
    const document = await collection.findOne({ email })

    return NextResponse.json({ details: document?.details ?? null })
  } catch (error) {
    console.error("Profile details load failed:", error)
    return NextResponse.json(
      { message: "প্রোফাইল ডেটা আনা যায়নি।" },
      { status: 500 }
    )
  }
}
