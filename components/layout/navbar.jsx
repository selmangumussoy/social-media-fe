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
import { useEffect, useState } from "react"
import { searchUsers } from "@/services/userService"

export function Navbar() {
  // HOOKS ÇAĞRILARI - Koşulsuz ve En Üstte
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const currentUser = useSelector((state) => state.user.currentUser)
  const unreadCount = useSelector((state) => state.notifications.unreadCount)

  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)

  // Hydration mismatch çözümü (Koşulsuz)
  useEffect(() => {
    setMounted(true)
  }, [])

  // 1. Durum Kontrolü
  const isAuthPage = pathname === "/login" || pathname === "/register"

  // 🔎 Debounce search (Koşulsuz)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([])
      setShowDropdown(false)
      return
    }

    const timeout = setTimeout(async () => {
      // Bu kısım, searchUsers'ın bir API çağrısı olduğunu varsayar
      // ve hatalı bir render'a yol açabilecek asenkron bir durumu tetiklemez.
      const data = await searchUsers(searchQuery)
      setResults(data)
      setShowDropdown(true)
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchQuery])

  // 2. Erken Dönüş (Tüm Hooks'lar çağrıldıktan sonra)
  if (isAuthPage) {
    return null
  }

  // ... (Geri kalan render mantığı)
  return (
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-sm">
              <span className="text-xl font-bold text-white">E</span>
            </div>
            <span className="hidden text-xl font-bold text-foreground sm:inline">
            Entelektüel
          </span>
          </Link>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
                type="search"
                placeholder="Kullanıcı ara..."
                className="w-full rounded-xl pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowDropdown(true)}
            />

            {/* Search Dropdown */}
            {showDropdown && results.length > 0 && (
                <div className="absolute left-0 right-0 top-12 z-[9999] rounded-xl border bg-card shadow-lg animate-in fade-in slide-in-from-top-2">

                  {results.map((user) => (
                      <Link
                          key={user.id}
                          // Rota Tutarlılığı: /profile/profileId
                          href={`/profile/${user.id}`}
                          className="flex items-center gap-3 p-3 hover:bg-muted transition"
                          onClick={() => setShowDropdown(false)}
                      >

                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {user.fullName?.charAt(0) || user.userName?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col">
                          <span className="font-medium">{user.fullName}</span>
                          <span className="text-sm text-muted-foreground">
            @{user.userName}
          </span>
                        </div>
                      </Link>
                  ))}

                </div>
            )}

          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">

            {/* Create Post */}
            <Link href="/create-post">
              <Button size="sm" className="hidden sm:flex gap-2 rounded-full shadow-sm hover:scale-105">
                <PenSquare className="h-4 w-4" />
                Yeni Gönderi
              </Button>
              <Button size="icon" variant="ghost" className="sm:hidden rounded-full">
                <PenSquare className="h-5 w-5" />
              </Button>
            </Link>

            {/* Theme Toggle */}
            <Button size="icon" variant="ghost" onClick={toggleTheme} className="rounded-full">
              {mounted && (theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />)}
            </Button>

            {/* Notifications */}
            <Link href="/notifications">
              <Button size="icon" variant="ghost" className="relative rounded-full">
                <Bell className="h-5 w-5" />

                {unreadCount > 0 && (
                    <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full bg-destructive text-xs flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                )}
              </Button>
            </Link>

            {/* Avatar */}
            {mounted && currentUser?.id && (
                <Link href={`/profile/${currentUser.id}`}>
                  <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-border/30 hover:ring-primary/50 hover:scale-105">
                    <AvatarImage src={currentUser.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {currentUser?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
            )}

          </div>
        </div>
      </nav>
  )
}