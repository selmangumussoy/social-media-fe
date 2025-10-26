"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Compass, MessageCircle, User, Settings, Bookmark, LogOut, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDispatch } from "react-redux"
import { logout } from "@/store/slices/userSlice"
import toast from "react-hot-toast"

// Dialog importları
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const menuItems = [
  { icon: Home, label: "Ana Sayfa", href: "/" },
  { icon: Compass, label: "Keşfet", href: "/explore" },
  { icon: MessageCircle, label: "Mesajlar", href: "/chat" },
  { icon: Bookmark, label: "Kaydedilenler", href: "/saved" },
  { icon: User, label: "Profil", href: "/profile" },
  { icon: Settings, label: "Ayarlar", href: "/settings" },
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

          {/* ➕ Oluştur Butonu */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                  variant="default"
                  className="w-full justify-start gap-3 rounded-xl text-base font-semibold transition-all hover:scale-[1.02]"
              >
                <Plus className="h-5 w-5" />
                Oluştur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Yeni Gönderi Türü Seç</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
                {/* Kitap Alıntısı */}
                <Link href="/create-post/quote" className="w-full">
                  <div className="border rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition hover:shadow-md hover:border-primary">
                    <span className="text-4xl">📚</span>
                    <h3 className="font-semibold text-lg">Kitap Alıntısı</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Sevdiğiniz bir alıntıyı paylaşın
                    </p>
                  </div>
                </Link>

                {/* Blog Yazısı */}
                <Link href="/create-post/blog" className="w-full">
                  <div className="border rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition hover:shadow-md hover:border-primary">
                    <span className="text-4xl">📝</span>
                    <h3 className="font-semibold text-lg">Blog Yazısı</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Düşüncelerinizi yazıya dökün
                    </p>
                  </div>
                </Link>

                {/* Düşünce */}
                <button
                    className="border rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition hover:shadow-md hover:border-primary"
                >
                  <span className="text-4xl">💭</span>
                  <h3 className="font-semibold text-lg">Düşünce Paylaş</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Hızlıca düşüncelerinizi yazın
                  </p>
                </button>
              </div>
            </DialogContent>
          </Dialog>

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