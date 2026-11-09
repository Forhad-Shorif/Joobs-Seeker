import Image from "next/image"
import Link from "next/link"
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6"

const columns = [
  {
    title: "Product",
    links: ["Browse Jobs", "Companies", "Pricing", "Saved Jobs"],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Blog", "Contact"],
  },
  {
    title: "Resources",
    links: ["Help Center", "Career Guides", "Resume Builder", "Privacy"],
  },
]

const socials = [
  { label: "X", href: "#", icon: FaXTwitter },
  { label: "LinkedIn", href: "#", icon: FaLinkedin },
  { label: "GitHub", href: "#", icon: FaGithub },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#050505] px-5 pt-14 pb-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr] lg:gap-16">
          <div>
            <Link href="/" aria-label="HireLoop home">
              <Image
                src="/image/logo.png"
                alt="HireLoop"
                width={154}
                height={44}
                className="h-8 w-auto"
              />
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
              Curated opportunities from world-class companies, matched to your skills and
              goals.
            </p>

            <div className="mt-6 flex gap-2">
              {socials.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:border-violet-400/40 hover:text-white"
                >
                  <Icon className="size-4" />
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-xs font-semibold tracking-[0.18em] text-white/35 uppercase">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-sm text-white/55 transition hover:text-white"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.07] pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 HireLoop. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="#" className="transition hover:text-white/70">
              Privacy Policy
            </Link>
            <Link href="#" className="transition hover:text-white/70">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
