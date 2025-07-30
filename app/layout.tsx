import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Legato - India's Premier Music Marketplace",
  description:
    "Buy and sell musical instruments across India. From traditional tabla to modern guitars - connect with musicians nationwide on Legato.",
  keywords: "music instruments, tabla, guitar, harmonium, sitar, drums, India, marketplace, buy, sell",
  authors: [{ name: "Legato Team" }],
  creator: "Legato",
  publisher: "Legato",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://legato.com"),
  openGraph: {
    title: "Legato - India's Premier Music Marketplace",
    description: "Buy and sell musical instruments across India. Connect with musicians nationwide.",
    url: "https://legato.com",
    siteName: "Legato",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Legato - Music Marketplace",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Legato - India's Premier Music Marketplace",
    description: "Buy and sell musical instruments across India. Connect with musicians nationwide.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
