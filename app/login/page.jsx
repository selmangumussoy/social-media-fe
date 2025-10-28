"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { setUser } from "@/store/slices/userSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { BookOpen, User, Lock } from "lucide-react"
import toast from "react-hot-toast"
import { login } from "@/services/authService"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { token, user } = await login(username, password)

      if (token) {
        dispatch(setUser(user))  // backend user bilgisi dönerse store'a kaydediyoruz
        toast.success("✅ Giriş başarılı!")
        router.push("/")
      } else {
        toast.error("Token alınamadı, giriş başarısız.")
      }
    } catch (err) {
      toast.error("❌ Giriş başarısız! " + (err.response?.data?.message || "Hatalı kullanıcı adı veya şifre"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-green-50 to-cream-50 p-4 dark:from-purple-950/20 dark:via-green-950/20 dark:to-stone-950">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-green-500 shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Entelektüel</h1>
            <p className="mt-2 text-sm text-muted-foreground">Kitap ve düşünce platformuna hoş geldiniz</p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Giriş Yap</CardTitle>
              <CardDescription>Kullanıcı adı ve şifrenizi girin</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Kullanıcı Adı</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="username"
                        type="text"
                        placeholder="kullaniciadi"
                        className="pl-10"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Şifre</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex-col gap-4">
              <p className="text-center text-sm text-muted-foreground">
                Hesabınız yok mu?{" "}
                <Link href="/register" className="font-semibold text-primary hover:underline">
                  Kayıt olun
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
  )
}
