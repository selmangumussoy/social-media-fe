"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, Bell, Palette, Upload, Loader2, Calendar, Users, Globe } from "lucide-react"
import toast from "react-hot-toast"

import { updateProfile as updateProfileApi } from "@/services/profileService"
import { getMeProfile } from "@/services/userService"

interface ProfileFormData {
  id: string | null;
  name: string;
  username: string;
  email: string;
  bio: string;
  phone: string;
  picture: string;
  website: string;
  birthDay: string | null;
  gender: string | null;
  socialLinks: string | null;
}

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

async function uploadFile(file: File): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return "https://cdn.example.com/new-avatar-" + Date.now() + ".jpg";
}

export default function SettingsPage() {
  const currentUserId = useSelector((state: any) => state.user.currentUser?.id);

  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // 🔹 PROFIL GETIRME
  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getMeProfile();

        if (data) {
          setFormData({
            ...initialFormData,
            ...data,
            id: data.id  // ✔ PROFİL ID (DÜZELTİLMİŞ)
          });
        } else {
          toast.error("Profil bilgileri yüklenemedi.");
        }
      } catch (error) {
        console.error("Profil yükleme hatası:", error);
        toast.error("Profil yüklenirken hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: any) => {
    if (e.target.files?.length > 0) {
      setPictureFile(e.target.files[0]);
    }
  };

  // 🔹 PROFİL GÜNCELLEME
  const handleSaveProfile = async (e: any) => {
    e.preventDefault();

    const profileId = formData.id;
    if (!profileId) {
      toast.error("Profil ID bulunamadı!");
      return;
    }

    setIsSaving(true);
    let finalPictureUrl = formData.picture;

    if (pictureFile) {
      toast.loading("Resim yükleniyor...", { id: "upload" });
      try {
        finalPictureUrl = await uploadFile(pictureFile);
        toast.dismiss("upload");
      } catch {
        toast.dismiss("upload");
        toast.error("Resim yüklenemedi.");
        setIsSaving(false);
        return;
      }
    }

    const { id, ...payload } = {
      ...formData,
      picture: finalPictureUrl
    };

    toast.loading("Profil güncelleniyor...", { id: "saving" });

    try {
      await updateProfileApi(profileId, payload);

      toast.dismiss("saving");
      toast.success("Profil güncellendi!");

      setFormData(prev => ({
        ...prev,
        picture: finalPictureUrl
      }));

      setPictureFile(null);
    } catch (error) {
      toast.dismiss("saving");
      toast.error("Profil güncelleme başarısız.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
        <div className="mx-auto max-w-3xl p-8 text-center min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Profil yükleniyor...</p>
        </div>
    );
  }

  if (!formData.id) {
    return (
        <div className="flex min-h-screen items-center justify-center">
          <p>Profil yüklenemedi.</p>
        </div>
    );
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
              <User className="h-4 w-4" /> Profil
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" /> Güvenlik
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" /> Bildirimler
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" /> Görünüm
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profil Bilgileri</CardTitle>
                <CardDescription>Profil bilgilerinizi güncelleyin</CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-6">

                  {/* Avatar */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                          src={pictureFile ? URL.createObjectURL(pictureFile) : formData.picture}
                      />
                      <AvatarFallback>{formData.name?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>

                    <div className="space-y-2">
                      <Label htmlFor="picture-upload" className="flex items-center gap-2 cursor-pointer p-2 border rounded-md">
                        <Upload className="h-4 w-4" />
                        Resim Yükle
                      </Label>
                      <Input id="picture-upload" type="file" className="hidden" onChange={handleFileChange} />
                    </div>
                  </div>

                  {/* İsim - Username */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Tam İsim</Label>
                      <Input name="name" value={formData.name} onChange={handleChange} />
                    </div>

                    <div>
                      <Label>Kullanıcı Adı</Label>
                      <Input name="username" value={formData.username} onChange={handleChange} />
                    </div>
                  </div>

                  {/* Email / Telefon */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>E-posta</Label>
                      <Input name="email" value={formData.email} onChange={handleChange} />
                    </div>

                    <div>
                      <Label>Telefon</Label>
                      <Input name="phone" value={formData.phone} onChange={handleChange} />
                    </div>
                  </div>

                  {/* Doğum tarihi - Cinsiyet */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Doğum Tarihi</Label>
                      <Input type="date" name="birthDay" value={formData.birthDay || ""} onChange={handleChange} />
                    </div>

                    <div>
                      <Label>Cinsiyet</Label>
                      <Input name="gender" value={formData.gender || ""} onChange={handleChange} />
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <Label>Web Sitesi</Label>
                    <Input name="website" value={formData.website} onChange={handleChange} />
                  </div>

                  {/* Sosyal Linkler */}
                  <div>
                    <Label>Sosyal Bağlantılar</Label>
                    <Textarea name="socialLinks" value={formData.socialLinks || ""} onChange={handleChange} />
                  </div>

                  {/* Bio */}
                  <div>
                    <Label>Biyografi</Label>
                    <Textarea name="bio" value={formData.bio} onChange={handleChange} />
                  </div>

                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Kaydet
                  </Button>

                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">...</TabsContent>
          <TabsContent value="notifications">...</TabsContent>
          <TabsContent value="appearance">...</TabsContent>
        </Tabs>
      </div>
  );
}
