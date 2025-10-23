"use client"

import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { updateProfile } from "@/store/slices/userSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, Bell, Palette } from "lucide-react"
import { useTheme } from "@/hooks/useTheme"
import toast from "react-hot-toast"

export default function SettingsPage() {
  const currentUser = useSelector((state) => state.user.currentUser)
  const dispatch = useDispatch()
  const { theme, toggleTheme } = useTheme()

  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    bio: currentUser?.bio || "",
    avatar: currentUser?.avatar || "",
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    dispatch(updateProfile(formData))
    toast.success("Profil güncellendi!")
  }

  const handleSavePassword = (e) => {
    e.preventDefault()
    toast.success("Şifre güncellendi!")
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground">Hesap ayarlarınızı yönetin</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Güvenlik</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Bildirimler</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Görünüm</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profil Bilgileri</CardTitle>
              <CardDescription>Profil bilgilerinizi güncelleyin</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={formData.avatar || "/placeholder.svg"} alt={formData.name} />
                    <AvatarFallback className="text-2xl">{formData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input
                      id="avatar"
                      name="avatar"
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={formData.avatar}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ad Soyad</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Kullanıcı Adı</Label>
                    <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biyografi</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Kendinizden bahsedin..."
                    className="min-h-24 resize-none"
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>

                <Button type="submit">Değişiklikleri Kaydet</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Güvenlik</CardTitle>
              <CardDescription>Şifrenizi ve güvenlik ayarlarınızı yönetin</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                  <Input id="currentPassword" type="password" placeholder="••••••••" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Yeni Şifre</Label>
                  <Input id="newPassword" type="password" placeholder="••••••••" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Yeni Şifre Tekrar</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••••" />
                </div>

                <Button type="submit">Şifreyi Güncelle</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Tercihleri</CardTitle>
              <CardDescription>Hangi bildirimleri almak istediğinizi seçin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Beğeniler</p>
                  <p className="text-sm text-muted-foreground">Gönderileriniz beğenildiğinde bildirim al</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Yorumlar</p>
                  <p className="text-sm text-muted-foreground">Gönderilerinize yorum yapıldığında bildirim al</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Yeni Takipçiler</p>
                  <p className="text-sm text-muted-foreground">Yeni takipçi kazandığınızda bildirim al</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mesajlar</p>
                  <p className="text-sm text-muted-foreground">Yeni mesaj aldığınızda bildirim al</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>

              <Button>Tercihleri Kaydet</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Görünüm</CardTitle>
              <CardDescription>Uygulamanın görünümünü özelleştirin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-4 font-semibold">Tema</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    onClick={theme === "dark" ? toggleTheme : undefined}
                    className={`rounded-lg border-2 p-4 transition-all ${
                      theme === "light" ? "border-primary bg-primary/5" : "border-border hover:border-primary"
                    }`}
                  >
                    <div className="mb-2 flex h-20 items-center justify-center rounded bg-white">
                      <div className="text-4xl">☀️</div>
                    </div>
                    <p className="font-medium">Açık Tema</p>
                  </button>

                  <button
                    onClick={theme === "light" ? toggleTheme : undefined}
                    className={`rounded-lg border-2 p-4 transition-all ${
                      theme === "dark" ? "border-primary bg-primary/5" : "border-border hover:border-primary"
                    }`}
                  >
                    <div className="mb-2 flex h-20 items-center justify-center rounded bg-gray-900">
                      <div className="text-4xl">🌙</div>
                    </div>
                    <p className="font-medium">Koyu Tema</p>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
