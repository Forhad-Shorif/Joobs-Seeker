import Image from "next/image"
import Link from "next/link"

const navLinks = [
  { label: "Browse Jobs", href: "#jobs" },
  { label: "Company", href: "#features" },
  { label: "Pricing", href: "#pricing" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#151515]/90 backdrop-blur">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" aria-label="HireLoop home">
          <Image
            src="/image/logo.png"
            alt="HireLoop"
            width={154}
            height={44}
            className="h-9 w-auto md:h-10"
          />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-white/80 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}

          <span className="h-6 w-px bg-white/15" />

          <Link href="#" className="text-sm font-medium text-violet-400 transition hover:text-violet-300">
            Sign In
          </Link>

          <Link
            href="#"
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500"
          >
            Get Started
          </Link>
        </div>

        <Link
          href="#"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white md:hidden"
        >
          Get Started
        </Link>
      </nav>
    </header>
  )
}
