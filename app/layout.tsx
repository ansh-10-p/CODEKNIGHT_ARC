import type { Metadata } from "next"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  title: "Campus Management",
  description: "Smart campus management system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/*
        suppressHydrationWarning is REQUIRED on <html> when using next-themes.
        next-themes adds the .dark class before React hydrates, which would
        cause a mismatch warning without this prop.
      */}
      <body suppressHydrationWarning>
        <Providers>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}