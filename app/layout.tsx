import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ToastContainer } from "react-toastify"

// Toast er default design/stylesheet
import "react-toastify/dist/ReactToastify.css"

import "./globals.css"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "HireLoop - Find Your Dream Job Today",
  description:
    "HireLoop connects top talent with world-class companies. Browse thousands of curated opportunities and land your next role faster.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("scroll-smooth antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body className="bg-[#050505] text-white">
        {children}

        {/* Ei container ta thakle sob page e showToast() kaj korbe */}
        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar
          closeButton={false}
          theme="dark"
        />
      </body>
    </html>
  )
}
