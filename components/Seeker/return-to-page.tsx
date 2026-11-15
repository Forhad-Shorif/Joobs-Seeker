"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * 📄 components/Seeker/return-to-page.tsx
 * ==================================================================
 * /success page e payment verify howar por ei component chole.
 *
 * 1.2 second por router.replace(href) — ager page e ferot.
 * (replace, tai back chaaple abar success page e ashbe na)
 *
 * Plan backend e save hoy (user.payment = true), tai ekhane
 * localStorage e kichu likhte hoy na — ApplyBtn backend theke check kore.
 * ==================================================================
 */
export function ReturnToPage({ href }: { href: string }) {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => router.replace(href), 1200)
    return () => clearTimeout(timer)
  }, [href, router])

  return (
    <button
      type="button"
      onClick={() => router.replace(href)}
      className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
    >
      Continue
    </button>
  )
}
