import type { Metadata } from "next"
import { Nunito, Baloo_2 } from "next/font/google"
import Providers from "@/components/Providers"
import "./globals.css"

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
})

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://vo-virginia.vercel.app"),
  title: "Vó Virgínia - Aprenda Matemática Brincando!",
  description:
    "Pratique adição, subtração, multiplicação e divisão de forma divertida com a Vó Virgínia!",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Vó Virgínia",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "Vó Virgínia - Aprenda Matemática Brincando!",
    description: "Pratique adição, subtração, multiplicação e divisão de forma divertida com a Vó Virgínia!",
    url: "https://vo-virginia.vercel.app",
    siteName: "Vó Virgínia",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Vó Virgínia - Aprenda Matemática Brincando" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vó Virgínia - Aprenda Matemática Brincando!",
    description: "Pratique adição, subtração, multiplicação e divisão de forma divertida com a Vó Virgínia!",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${nunito.variable} ${baloo.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
