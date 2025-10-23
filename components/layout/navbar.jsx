"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Search, Moon, Sun, PenSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/hooks/useTheme"
import { useSelector } from "react-redux"
import { useState } from "react"

export function Navbar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const currentUser = useSelector((state) => state.user.currentUser)
  const unreadCount = useSelector((state) => state.notifications.unreadCount)
  const [searchQuery, setSearchQuery] = useState("")

  const isAuthPage = pathname === "/login" || pathname === "/register"

  if (isAuthPage) return null

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-sm">
            <span className="text-xl font-bold text-white">E</span>
          </div>
          <span className="hidden text-xl font-bold text-foreground sm:inline">Entelektüel</span>
        </Link>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Kitap, yazar veya konu ara..."
            className="w-full rounded-xl pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Create Post Button */}
          <Link href="/create-post">
            <Button
              size="sm"
              className="hidden gap-2 rounded-full shadow-sm transition-all hover:scale-105 hover:shadow-md sm:flex"
            >
              <PenSquare className="h-4 w-4" />
              <span>Yeni Gönderi</span>
            </Button>
            <Button size="icon" variant="ghost" className="rounded-full transition-all hover:scale-105 sm:hidden">
              <PenSquare className="h-5 w-5" />
            </Button>
          </Link>

          {/* Theme Toggle */}
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full transition-all hover:scale-105"
            onClick={toggleTheme}
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          {/* Notifications */}
          <Link href="/notifications">
            <Button size="icon" variant="ghost" className="relative rounded-full transition-all hover:scale-105">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs shadow-sm">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* User Avatar */}
          <Link href="/profile">
            <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-border/30 transition-all hover:ring-primary/50 hover:scale-105">
              <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} alt={currentUser?.name} />
              <AvatarFallback>{currentUser?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </nav>
  )
}
