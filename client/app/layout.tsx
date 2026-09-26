import { Metadata } from "next"
import { Geist_Mono, Inter, Manrope } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider, HouseholdProvider, MembersProvider } from "@/providers"
import { cn } from "@/lib/utils"

const manropeHeading = Manrope({
  subsets: ["latin"],
  variable: "--font-heading",
})

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Ledgium",
  description: "Household finance management",
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
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
        manropeHeading.variable
      )}
    >
      <body>
        <AuthProvider>
          <HouseholdProvider>
            <MembersProvider>
              <ThemeProvider>{children}</ThemeProvider>
            </MembersProvider>
          </HouseholdProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
