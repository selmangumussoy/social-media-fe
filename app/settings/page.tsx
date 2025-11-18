"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, Bell, Palette, Upload, Loader2, Calendar, Users, Globe } from "lucide-react" // Yeni ikonlar eklendi
import { useTheme } from "@/hooks/useTheme"
import toast from "react-hot-toast"

// Servis metodlarını import et (Yollarınızı kontrol edin)
import { updateProfile as updateProfileApi } from "@/services/profileService"
import { getMeProfile } from "@/services/userService"

// --- Tip Tanımlamaları ---
interface ProfileFormData {
  id: string | null;
  name: string;
  username: string;
  email: string;
  bio: string;
  phone: string;
  picture: string; // Resim URL'si
  website: string;
  birthDay: string | null;
  gender: string | null; // EK: Formda olacak
  socialLinks: string | null; // EK: Formda olacak
}

// Backend'in beklediği tüm alanları içeren başlangıç durumu
const initialFormData: ProfileFormData = {
  id: null,
  name: "",
  username: "",
  email: "",
  bio: "",
  phone: "",
  picture: "",
  website: "",
  birthDay: null,
  gender: null,
  socialLinks: null,
};


// Resim yükleme servisi simülasyonu
async function uploadFile(file: File): Promise<string> {
  console.log("Dosya yükleniyor:", file.name);
  await new Promise(resolve => setTimeout(resolve, 500));
  return "https://cdn.example.com/new-avatar-" + Date.now() + ".jpg";
}


export default function SettingsPage() {
  const currentUserId = useSelector((state: any) => state.user.currentUser?.id);
  const { theme, toggleTheme } = useTheme();

  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // --- 1. Veri Çekme (getMeProfile) ---
  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getMeProfile();

        if (data) {
          setFormData({
            ...initialFormData,
            ...data,
            id: currentUserId || data.id || null
          });
        } else {
          toast.error("Profil bilgileri yüklenemedi. Lütfen tekrar deneyin.");
        }
      } catch (error) {
        console.error("Profil yükleme hatası:", error);
        toast.error("Profil bilgileri yüklenirken bir sorun oluştu.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [currentUserId]);

  // --- Form Değişiklik İşleyicileri ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPictureFile(e.target.files[0])
    }
  }


  // --- 2. Veri Güncelleme (updateProfileApi) ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    const userId = formData.id;
    if (!userId) {
      toast.error("Kullanıcı ID bulunamadı. Güncelleme yapılamıyor.");
      return;
    }

    setIsSaving(true);
    let finalPictureUrl = formData.picture;

    // Dosya yükleme
    if (pictureFile) {
      toast.loading("Resim yükleniyor...", { id: "uploading" });
      try {
        const uploadedUrl = await uploadFile(pictureFile);
        toast.dismiss("uploading");

        if (uploadedUrl) {
          finalPictureUrl = uploadedUrl;
        } else {
          throw new Error("Resim yüklenemedi.");
        }
      } catch (error) {
        toast.dismiss("uploading");
        toast.error("Resim yükleme başarısız.");
        setIsSaving(false);
        return;
      }
    }

    // API'ye gönderilecek final veriyi hazırla (ID'yi çıkar)
    const { id, ...payload } = {
      ...formData,
      picture: finalPictureUrl,
    };

    toast.loading("Profil güncelleniyor...", { id: "saving" });
    try {
      // updateProfileApi çağrıldığında, formData'dan gelen tüm alanlar (birthDay, gender, socialLinks dahil) payload içinde gönderilir.
      await updateProfileApi(userId, payload);

      toast.dismiss("saving");
      toast.success("Profil başarıyla güncellendi!");

      setFormData(prev => ({ ...prev, picture: finalPictureUrl }));
      setPictureFile(null);

    } catch (error) {
      toast.dismiss("saving");
      toast.error("Profil güncelleme başarısız oldu.");
    } finally {
      setIsSaving(false);
    }
  }

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Şifre güncellendi!")
  }

  // --- Yükleme Durumu Gösterimi ---
  if (isLoading) {
    return (
        <div className="mx-auto max-w-3xl p-8 text-center min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Profil yükleniyor...</p>
        </div>
    )
  }

  if (!formData.id && !isLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center">
          <p>Profil yüklenemedi veya kullanıcı oturumu bulunamadı.</p>
        </div>
    )
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

                  {/* Avatar Yükleme Alanı */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Avatar className="h-20 w-20 flex-shrink-0">
                      <AvatarImage
                          src={pictureFile ? URL.createObjectURL(pictureFile) : formData.picture || "/placeholder.svg"}
                          alt={formData.name}
                      />
                      <AvatarFallback className="text-2xl">{formData.name ? formData.name.charAt(0) : '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="picture-upload" className="flex items-center gap-2 cursor-pointer w-fit p-2 border rounded-md hover:bg-muted/50 transition-colors">
                        <Upload className="h-4 w-4" />
                        {pictureFile ? `Seçilen: ${pictureFile.name}` : "Yeni Profil Resmi Yükle"}
                      </Label>
                      <Input
                          id="picture-upload"
                          name="pictureFile"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                      />
                      <p className="text-sm text-muted-foreground">JPG, PNG veya GIF</p>
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

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-posta</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon Numarası</Label>
                      <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="555 555 55 55"
                      />
                    </div>
                  </div>

                  {/* EK: birthDay ve gender alanları */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="birthDay" className="flex items-center gap-2"><Calendar className="h-4 w-4"/>Doğum Tarihi</Label>
                      <Input
                          id="birthDay"
                          name="birthDay"
                          type="date"
                          value={formData.birthDay || ''}
                          onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender" className="flex items-center gap-2"><Users className="h-4 w-4"/>Cinsiyet</Label>
                      {/* Gerçek projede Select bileşeni kullanılmalı */}
                      <Input
                          id="gender"
                          name="gender"
                          type="text"
                          value={formData.gender || ''}
                          onChange={handleChange}
                          placeholder="Erkek/Kadın/Diğer"
                      />
                    </div>
                  </div>
                  {/* EK: socialLinks ve website alanları */}
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2"><Globe className="h-4 w-4"/>Web Sitesi</Label>
                    <Input
                        id="website"
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://www.websiteniz.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialLinks">Sosyal Bağlantılar (JSON veya Link)</Label>
                    <Textarea
                        id="socialLinks"
                        name="socialLinks"
                        placeholder="Instagram: https://... , Twitter: https://..."
                        className="min-h-16 resize-none"
                        value={formData.socialLinks || ''}
                        onChange={handleChange}
                    />
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

                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Kaydediliyor...
                        </>
                    ) : (
                        "Değişiklikleri Kaydet"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Diğer Tab'lar (Aynı Kaldı) */}
          <TabsContent value="security">...</TabsContent>
          <TabsContent value="notifications">...</TabsContent>
          <TabsContent value="appearance">...</TabsContent>
        </Tabs>
      </div>
  )
}