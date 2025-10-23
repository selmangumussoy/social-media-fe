"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { setUser } from "@/store/slices/userSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { BookOpen, Mail, Lock, User, FileText, Phone } from 'lucide-react'
import toast from "react-hot-toast"
import { signUp } from "@/services/authService"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    // 👈 Backend SignUpRequest modeline uygun alanlar
    name: "", // name
    surname: "", // 👈 Yeni alan (Backend'de surname)
    email: "", // email
    phoneNumber: "", // 👈 Yeni alan (Backend'de phoneNumber)
    password: "", // password
    confirmPassword: "",
    // username ve bio arayüzde kalsa bile (şimdilik kaldırıyorum) backend'e gitmeyecek
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Şifreler eşleşmiyor")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır")
      setIsLoading(false)
      return
    }

    // 1. 📢 Backend SignUpRequest modeline uygun payload oluşturma
    const signUpPayload = {
      password: formData.password,
      email: formData.email,
      name: formData.name,
      surname: formData.surname,
      phoneNumber: formData.phoneNumber,
    }

    try {
      // 2. 🚀 Gerçek API çağrısı
      const response = await signUp(signUpPayload) // signUp servis metodunu kullanıyoruz

      // 3. ✅ Başarılı Durum: Token alındı ve LocalStorage'a kaydedildi (authService içinde yapıldı)
      // Kullanıcıyı Redux'a kaydetme (Gerekiyorsa, bu alanlar token ile dönmeyebilir, login olduktan sonra profil çekilebilir)
      // Ancak mevcut Redux akışına uyum sağlamak için basit bir kullanıcı objesi oluşturuyoruz:
      const newUser = {
        name: formData.name,
        email: formData.email,
        // Diğer alanları (username, bio) backend'den gelmediği için şimdilik boş/varsayılan bırakıyoruz
        // Gerçek uygulamada, giriş yaptıktan sonra /profile gibi bir endpoint'ten kullanıcı bilgileri çekilir.
        id: "temp-id",
        // JWT/Token bilgisi: response.token içerir
      }

      dispatch(setUser(newUser))

      toast.success("Kayıt başarılı! Hoş geldiniz!")
      router.push("/") // Ana sayfaya yönlendir
    } catch (error) {
      // 4. ❌ Hata Durumu
      console.error("Kayıt Başarısız:", error);
      const errorMessage = error.message || (error.email ? error.email[0] : "Kayıt sırasında bir hata oluştu.");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-green-50 to-cream-50 p-4 dark:from-purple-950/20 dark:via-green-950/20 dark:to-stone-950">
        <div className="w-full max-w-md">
          {/* Logo... (Aynı kaldı) */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-green-500 shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Entelektüel</h1>
            <p className="mt-2 text-sm text-muted-foreground">Düşünce dünyasına katılın</p>
          </div>

          {/* Register Card */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Kayıt Ol</CardTitle>
              <CardDescription>Yeni bir hesap oluşturun</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Ad (name) */}
                <div className="space-y-2">
                  <Label htmlFor="name">Ad</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Ahmet"
                        className="pl-10"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                  </div>
                </div>

                {/* Soyad (surname) 👈 Yeni Alan */}
                <div className="space-y-2">
                  <Label htmlFor="surname">Soyad</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="surname"
                        name="surname"
                        type="text"
                        placeholder="Yılmaz"
                        className="pl-10"
                        value={formData.surname}
                        onChange={handleChange}
                        required
                    />
                  </div>
                </div>

                {/* E-posta (email) */}
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="ornek@email.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                  </div>
                </div>

                {/* Telefon Numarası (phoneNumber) 👈 Yeni Alan */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Telefon Numarası</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        placeholder="+90 5XX XXX XX XX"
                        className="pl-10"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                    />
                  </div>
                </div>

                {/* Şifre (password) */}
                <div className="space-y-2">
                  <Label htmlFor="password">Şifre</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                  </div>
                </div>

                {/* Şifre Tekrar (confirmPassword) */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="w-full text-center text-sm text-muted-foreground">
                Zaten hesabınız var mı?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Giriş yapın
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
  )
}