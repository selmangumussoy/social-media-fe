"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, MessageCircle, User, PenSquare } from "lucide-react"
import { cn } from "@/lib/utils"

const mobileMenuItems = [
  {
    icon: Home,
    label: "Ana Sayfa",
    href: "/",
  },
  {
    icon: Compass,
    label: "Keşfet",
    href: "/explore",
  },
  {
    icon: PenSquare,
    label: "Oluştur",
    href: "/create-post",
  },
  {
    icon: MessageCircle,
    label: "Mesajlar",
    href: "/chat",
  },
  {
    icon: User,
    label: "Profil",
    href: "/profile",
  },
]

export function MobileNav() {
  const pathname = usePathname()

  const isAuthPage = pathname === "/login" || pathname === "/register"

  if (isAuthPage) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card lg:hidden">
      <div className="flex items-center justify-around">
        {mobileMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("h-6 w-6", isActive && "fill-primary")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
