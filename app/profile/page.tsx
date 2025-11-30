"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useSelector } from "react-redux"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Settings, Link as LinkIcon, Loader2, Bookmark } from "lucide-react"
import { PostCard } from "@/components/feed/post-card"
import { EmptyState } from "@/components/common/empty-state"
import Link from "next/link"
import toast from "react-hot-toast"

// 🧩 Servisler
import { getMeProfile, getMe } from "@/services/userService"
import { getPostsByUser, getPostById } from "@/services/postService"
import { getSavedPostsByUser } from "@/services/savedPostService"

export default function ProfilePage() {
    const { username } = useParams()
    const currentUser = useSelector((state) => state.user.currentUser)

    const [activeTab, setActiveTab] = useState("posts")
    const [profile, setProfile] = useState(null)

    const [userPosts, setUserPosts] = useState([])
    const [savedPosts, setSavedPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [savedLoading, setSavedLoading] = useState(false)

    const isMyProfile = currentUser?.username === username || currentUser?.username?.toLowerCase() === username?.toLowerCase()

    // 1. Profil ve Kullanıcı Postları
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)
                const profileData = await getMeProfile()
                setProfile(profileData)

                const userData = await getMe()
                if (userData && userData.id) {
                    const postsData = await getPostsByUser(userData.id)
                    setUserPosts(postsData || [])
                }
            } catch (err) {
                console.error("Veri getirme hatası:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // 2. Kaydedilenleri Çek
    useEffect(() => {
        const fetchSaved = async () => {
            if (isMyProfile && currentUser?.id) {
                try {
                    setSavedLoading(true)
                    // A) İlişkileri çek
                    const relations = await getSavedPostsByUser(currentUser.id)

                    if (!relations || relations.length === 0) {
                        setSavedPosts([])
                        return
                    }

                    // B) Detayları çek
                    const promises = relations.map(r => getPostById(r.postId))
                    const data = await Promise.all(promises)
                    setSavedPosts(data.filter(p => p !== null))
                } catch (e) {
                    console.error("Kaydedilenler hatası:", e)
                } finally {
                    setSavedLoading(false)
                }
            }
        }
        if (isMyProfile) fetchSaved()
    }, [isMyProfile, currentUser])

    const handleShare = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href)
            toast.success("Profil linki kopyalandı!")
        }
    }

    if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>
    if (!profile) return <div className="text-center p-10">Kullanıcı bulunamadı</div>

    return (
        <div className="mx-auto max-w-4xl p-4">
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
                                    <Settings className="h-4 w-4" /> Profili Düzenle
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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 rounded-xl">
                    <TabsTrigger value="posts">Gönderiler</TabsTrigger>
                    {isMyProfile ? <TabsTrigger value="saved">Kaydedilenler</TabsTrigger> : <TabsTrigger value="saved" disabled className="opacity-50">Kaydedilenler 🔒</TabsTrigger>}
                    <TabsTrigger value="about">Hakkında</TabsTrigger>
                </TabsList>

                <TabsContent value="posts">
                    {userPosts.length > 0 ? (
                        <div className="space-y-6">{userPosts.map((post) => <PostCard key={post.id} post={post} />)}</div>
                    ) : <EmptyState title="Henüz gönderi yok" />}
                </TabsContent>

                <TabsContent value="saved">
                    {savedLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div> :
                        savedPosts.length > 0 ? (
                            <div className="space-y-6">{savedPosts.map((post) => <PostCard key={post.id} post={post} />)}</div>
                        ) : <EmptyState title="Henüz kayıt yok" icon={Bookmark} />}
                </TabsContent>

                <TabsContent value="about">
                    <Card className="rounded-2xl border-border/50 shadow-sm">
                        <CardContent className="space-y-4 pt-6">
                            <div><h3 className="mb-2 font-semibold">Biyografi</h3><p className="text-muted-foreground">{profile.bio || "-"}</p></div>
                            <div><h3 className="mb-2 font-semibold">İletişim</h3><p className="text-muted-foreground">{profile.email || "-"}</p></div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}