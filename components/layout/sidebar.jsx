"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, MessageCircle, User, Settings, Bookmark, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDispatch } from "react-redux"
import { logout } from "@/store/slices/userSlice"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

const menuItems = [
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
    icon: MessageCircle,
    label: "Mesajlar",
    href: "/chat",
  },
  {
    icon: Bookmark,
    label: "Kaydedilenler",
    href: "/saved",
  },
  {
    icon: User,
    label: "Profil",
    href: "/profile",
  },
  {
    icon: Settings,
    label: "Ayarlar",
    href: "/settings",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const dispatch = useDispatch()
  const router = useRouter()

  const isAuthPage = pathname === "/login" || pathname === "/register"

  if (isAuthPage) return null

  const handleLogout = () => {
    dispatch(logout())
    toast.success("Çıkış yapıldı")
    router.push("/login")
  }

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 flex-col border-r border-border/50 bg-sidebar p-4 lg:flex">
      <nav className="flex flex-1 flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 rounded-xl text-base transition-all hover:scale-[1.02]",
                  isActive && "bg-gradient-to-r from-primary/10 to-secondary/10 font-semibold shadow-sm",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 rounded-xl text-base text-destructive transition-all hover:scale-[1.02]"
        onClick={handleLogout}
      >
        <LogOut className="h-5 w-5" />
        Çıkış Yap
      </Button>
    </aside>
  )
}
