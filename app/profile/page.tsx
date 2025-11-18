"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Settings, Calendar, LinkIcon } from "lucide-react"
import { PostCard } from "@/components/feed/post-card"
import { EmptyState } from "@/components/common/empty-state"
import Link from "next/link"
import toast from "react-hot-toast"
import { getMeProfile } from "@/services/userService"
import { useSelector } from "react-redux"

export default function ProfilePage() {
  const posts = useSelector((state: any) => state.posts.posts)
  const savedPostIds = useSelector((state: any) => state.posts.savedPosts)

  const [activeTab, setActiveTab] = useState("posts")
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getMeProfile()
        setProfile(data)
      } catch (err) {
        console.error("Profil getirme hatası:", err)
        toast.error("Profil bilgileri alınamadı")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) {
    return (
        <div className="flex min-h-screen items-center justify-center">
          <p>Profil yükleniyor...</p>
        </div>
    )
  }

  if (!profile) {
    return (
        <div className="flex min-h-screen items-center justify-center">
          <EmptyState title="Kullanıcı bulunamadı" description="Lütfen giriş yapın" />
        </div>
    )
  }

  const userPosts = posts.filter((post: any) => post.author.username === profile.username)
  const savedPosts = posts.filter((post: any) => savedPostIds.includes(post.id))

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Profil linki kopyalandı!")
  }

  return (
      <div className="mx-auto max-w-4xl p-4">
        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden rounded-2xl border-border/50 shadow-sm">
          <div className="h-32 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 sm:h-48" />
          <CardContent className="relative px-6 pb-6">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <Avatar className="-mt-16 h-32 w-32 border-4 border-card ring-2 ring-border/30 sm:-mt-20">
                <AvatarImage src={profile.picture || "/placeholder.svg"} alt={profile.name} />
                <AvatarFallback className="text-3xl">{profile.name?.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-full bg-transparent" onClick={handleShare}>
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Link href="/settings">
                  <Button variant="outline" size="sm" className="gap-2 rounded-full bg-transparent">
                    <Settings className="h-4 w-4" />
                    Profili Düzenle
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>

              {profile.bio && <p className="leading-relaxed">{profile.bio}</p>}

            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 rounded-xl">
            <TabsTrigger value="posts">Gönderiler</TabsTrigger>
            <TabsTrigger value="saved">Kaydedilenler</TabsTrigger>
            <TabsTrigger value="about">Hakkında</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {userPosts.length > 0 ? (
                userPosts.map((post: any) => <PostCard key={post.id} post={post} />)
            ) : (
                <EmptyState title="Henüz gönderi yok" description="İlk gönderinizi paylaşın" />
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            {savedPosts.length > 0 ? (
                savedPosts.map((post: any) => <PostCard key={post.id} post={post} />)
            ) : (
                <EmptyState title="Henüz kayıtlı gönderi yok" description="Beğendiğiniz gönderileri kaydedin" />
            )}
          </TabsContent>

          <TabsContent value="about">
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardContent className="space-y-4 pt-6">
                <div>
                  <h3 className="mb-2 font-semibold">Biyografi</h3>
                  <p className="text-muted-foreground">{profile.bio || "Henüz biyografi eklenmemiş"}</p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">İletişim</h3>
                  <p className="text-muted-foreground">{profile.email || "Email bilgisi yok"}</p>
                  <p className="text-muted-foreground">{profile.phone || "Telefon bilgisi yok"}</p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">Sosyal Bağlantılar</h3>
                  <p className="text-muted-foreground">{profile.socialLinks || "Henüz sosyal bağlantı eklenmemiş"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}
