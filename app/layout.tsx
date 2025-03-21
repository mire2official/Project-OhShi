import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import MusicPlayerWrapper from "../components/MusicPlayerWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "ORVELLO - Premium Apparel",
  description: "Discover premium quality apparel with custom ORVELLO designs.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        {children}
        <MusicPlayerWrapper />
      </body>
    </html>
  )
}