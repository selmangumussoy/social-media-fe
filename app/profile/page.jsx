"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Calendar, LinkIcon } from "lucide-react"
import { PostCard } from "@/components/feed/post-card"
import { EmptyState } from "@/components/common/empty-state"
import Link from "next/link"
import toast from "react-hot-toast"

export default function ProfilePage() {
  const currentUser = useSelector((state) => state.user.currentUser)
  const posts = useSelector((state) => state.posts.posts)
  const savedPostIds = useSelector((state) => state.posts.savedPosts)
  const [activeTab, setActiveTab] = useState("posts")

  const userPosts = posts.filter((post) => post.author.id === currentUser?.id)
  const savedPosts = posts.filter((post) => savedPostIds.includes(post.id))

  const handleShare = () => {
    toast.success("Profil linki kopyalandı!")
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <EmptyState title="Kullanıcı bulunamadı" description="Lütfen giriş yapın" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      {/* Profile Header */}
      <Card className="mb-6 overflow-hidden rounded-2xl border-border/50 shadow-sm">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 sm:h-48" />

        <CardContent className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <Avatar className="-mt-16 h-32 w-32 border-4 border-card ring-2 ring-border/30 sm:-mt-20">
              <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
              <AvatarFallback className="text-3xl">{currentUser.name.charAt(0)}</AvatarFallback>
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

          {/* User Info */}
          <div className="space-y-3">
            <div>
              <h1 className="text-2xl font-bold">{currentUser.name}</h1>
              <p className="text-muted-foreground">@{currentUser.username}</p>
            </div>

            {currentUser.bio && <p className="leading-relaxed">{currentUser.bio}</p>}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {currentUser.joinDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(currentUser.joinDate).toLocaleDateString("tr-TR", { year: "numeric", month: "long" })}{" "}
                    tarihinde katıldı
                  </span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div>
                <span className="font-bold">{currentUser.posts}</span>{" "}
                <span className="text-muted-foreground">Gönderi</span>
              </div>
              <button className="hover:underline">
                <span className="font-bold">{currentUser.followers}</span>{" "}
                <span className="text-muted-foreground">Takipçi</span>
              </button>
              <button className="hover:underline">
                <span className="font-bold">{currentUser.following}</span>{" "}
                <span className="text-muted-foreground">Takip</span>
              </button>
            </div>
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

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-6">
          {userPosts.length > 0 ? (
            userPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <EmptyState title="Henüz gönderi yok" description="İlk gönderinizi paylaşın" />
          )}
        </TabsContent>

        {/* Saved Tab */}
        <TabsContent value="saved" className="space-y-6">
          {savedPosts.length > 0 ? (
            savedPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <EmptyState title="Henüz kayıtlı gönderi yok" description="Beğendiğiniz gönderileri kaydedin" />
          )}
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about">
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardContent className="space-y-4 pt-6">
              <div>
                <h3 className="mb-2 font-semibold">Biyografi</h3>
                <p className="text-muted-foreground">{currentUser.bio || "Henüz biyografi eklenmemiş"}</p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">İstatistikler</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-border/50 p-4 shadow-sm">
                    <p className="text-2xl font-bold">{currentUser.posts}</p>
                    <p className="text-sm text-muted-foreground">Toplam Gönderi</p>
                  </div>
                  <div className="rounded-xl border border-border/50 p-4 shadow-sm">
                    <p className="text-2xl font-bold">{currentUser.followers}</p>
                    <p className="text-sm text-muted-foreground">Takipçi</p>
                  </div>
                  <div className="rounded-xl border border-border/50 p-4 shadow-sm">
                    <p className="text-2xl font-bold">{currentUser.following}</p>
                    <p className="text-sm text-muted-foreground">Takip Edilen</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">İlgi Alanları</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className="rounded-full">Edebiyat</Badge>
                  <Badge className="rounded-full">Felsefe</Badge>
                  <Badge className="rounded-full">Bilim</Badge>
                  <Badge className="rounded-full">Tarih</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
