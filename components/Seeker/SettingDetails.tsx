"use client"

import { useState } from "react"

import { ProfileForm } from "@/components/SheareProfile/Profileform"
import type { ProfileDetails } from "@/lib/Type/user-info"

/**
 * 📄 components/Seeker/SettingDetails.tsx
 *
 * Profile page-এর exact same `ProfileForm` reuse করছি।
 * তাই data shape, fields আর backend save logic একই।
 *
 * Submit করলে `ProfileForm` → `saveUserInfo()` → backend `/UserInfo`
 */
export default function SettingDetails({
  email,
  initialDetails,
}: {
  email: string
  initialDetails: ProfileDetails
}) {
  const [details, setDetails] = useState<ProfileDetails>(initialDetails)

  return (
    <ProfileForm email={email} details={details} onDetailsChange={setDetails} />
  )
}
