import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "codequest.city — Coding Education City for Vibe Coders",
  description: "Learn Agentic AI by playing. Build fundamentals. Control your agents. Grow with the city. An education-first RPG where you learn by doing, not watching.",
  keywords: ["coding education", "AI agents", "learn to code", "vibe coding", "gamified learning", "n8n", "automation", "developer fundamentals", "agentic AI"],
  openGraph: {
    title: "codequest.city — Coding Education City for Vibe Coders",
    description: "Learn Agentic AI by playing. Build fundamentals. Control your agents. Grow with the city.",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "codequest.city Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "codequest.city — Coding Education City for Vibe Coders",
    description: "Learn Agentic AI by playing. Build fundamentals. Control your agents.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  )
}
