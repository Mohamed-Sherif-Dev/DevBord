import type { Metadata } from "next"
import "./globals.css"
import Providers          from "@/components/Providers"

export const metadata: Metadata = {
  title:       "DevBoard — Task Management for Developers",
  description: "Modern, secure task management platform for developer teams",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}