import Image from "next/image"
import Link from "next/link"

const footerLinks = [
  { label: "Browse Jobs", href: "#jobs" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-black px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
        <Link href="/" aria-label="HireLoop home">
          <Image src="/image/logo.png" alt="HireLoop" width={154} height={44} className="h-8 w-auto" />
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-white/50 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <p className="text-xs text-white/40">© 2026 HireLoop. All rights reserved.</p>
      </div>
    </footer>
  )
}
