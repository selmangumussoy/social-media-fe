import { Poppins, Merriweather } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
})
const merriweather = Merriweather({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
})

export const metadata = {
  title: "Entelektüel - Kitap ve Düşünce Platformu",
  description: "Bilimsel yazılar, kitap alıntıları ve düşünce yazılarının paylaşıldığı sosyal platform",
    generator: 'v0.app'
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${poppins.className} ${merriweather.variable}`}>
        <Providers>
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="min-h-screen flex-1 pb-20 lg:pb-0">{children}</main>
          </div>
          <MobileNav />
        </Providers>
      </body>
    </html>
  )
}
