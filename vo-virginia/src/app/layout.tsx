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
  title: "Vó Virgínia - Aprenda Matemática Brincando!",
  description:
    "Pratique adição, subtração, multiplicação e divisão de forma divertida com a Vó Virgínia!",
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
