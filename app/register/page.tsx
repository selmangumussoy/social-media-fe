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
import { BookOpen, Lock, User, Phone } from 'lucide-react'
import toast from "react-hot-toast"
import { signUp } from "@/services/authService"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
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

    // Backend'e uygun payload
    const signUpPayload = {
      password: formData.password,
      phoneNumber: formData.phoneNumber,
      fullName: formData.fullName,
      username: formData.username,
    }

    try {
      const response = await signUp(signUpPayload)

      // Redux'a basit kullanıcı objesi
      dispatch(setUser({
        id: "temp-id",
        username: formData.username,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
      }))

      toast.success("Kayıt başarılı! Hoş geldiniz!")
      router.push("/")
    } catch (error: any) {
      console.error("Kayıt Başarısız:", error);
      const errorMessage = error.message || "Kayıt sırasında bir hata oluştu.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-green-50 to-cream-50 p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-green-500 shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Entelektüel</h1>
            <p className="mt-2 text-sm text-muted-foreground">Düşünce dünyasına katılın</p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Kayıt Ol</CardTitle>
              <CardDescription>Yeni bir hesap oluşturun</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Ad Soyad</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Ahmet Yılmaz"
                        className="pl-10"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Kullanıcı Adı</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="kullanici123"
                        className="pl-10"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                  </div>
                </div>

                {/* Phone Number */}
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

                {/* Password */}
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

                {/* Confirm Password */}
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
