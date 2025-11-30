"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Settings, Link as LinkIcon, Loader2, Bookmark } from "lucide-react"
import { PostCard } from "@/components/feed/post-card"
import { EmptyState } from "@/components/common/empty-state"
import Link from "next/link"
import toast from "react-hot-toast"

// Services
import { getMeProfile, getMe } from "@/services/userService"
import { getPostsByUser, getPostById } from "@/services/postService"
import { getSavedPostsByUser } from "@/services/savedPostService"
import { getUserStatsByUserId } from "@/services/userStatsService"

// Redux
import { setPosts } from "@/store/slices/postSlice"

export default function ProfilePage() {
    const { username } = useParams()
    const dispatch = useDispatch()
    const currentUser = useSelector((state) => state.user.currentUser)
    const reduxPosts = useSelector((state) => state.posts.posts)

    const [activeTab, setActiveTab] = useState("posts")
    const [profile, setProfile] = useState(null)

    const [localUserPosts, setLocalUserPosts] = useState([])
    const [localSavedPosts, setLocalSavedPosts] = useState([])

    const [mySavedPostIds, setMySavedPostIds] = useState([])
    const [stats, setStats] = useState({
        followerCount: 0,
        followedCount: 0,
        postCount: 0
    })

    const [loading, setLoading] = useState(true)
    const [savedLoading, setSavedLoading] = useState(false)

    const isMyProfile =
        currentUser?.username?.toLowerCase() === username?.toLowerCase()

    // ----------------------------- DATA LOAD (PROFILE + POSTS + STATS) -----------------------------
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)

                const profileData = await getMeProfile()
                setProfile(profileData)

                const userData = await getMe()

                if (userData?.id) {
                    // POSTS
                    const postsData = await getPostsByUser(userData.id)
                    setLocalUserPosts(postsData || [])

                    if (activeTab === "posts") {
                        dispatch(setPosts(postsData || []))
                    }

                    // USER STATS
                    const statsData = await getUserStatsByUserId(userData.id)
                    setStats({
                        followerCount: statsData?.followerCount || 0,
                        followedCount: statsData?.followedCount || 0,
                        postCount: statsData?.postCount || 0
                    })
                }

                // SAVED POSTS (ONLY IF LOGGED IN)
                if (currentUser?.id) {
                    const mySaved = await getSavedPostsByUser(currentUser.id)
                    setMySavedPostIds(mySaved.map((s) => s.postId))
                }

            } catch (err) {
                console.error("Veri getirme hatası:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [dispatch])

    // ----------------------------- SAVED POSTS -----------------------------
    useEffect(() => {
        const fetchSaved = async () => {
            if (isMyProfile && currentUser?.id) {
                try {
                    setSavedLoading(true)

                    const relations = await getSavedPostsByUser(currentUser.id)
                    if (!relations?.length) {
                        setLocalSavedPosts([])
                        return
                    }

                    const posts = await Promise.all(
                        relations.map((r) => getPostById(r.postId))
                    )

                    const validPosts = posts.filter((p) => p != null)

                    setLocalSavedPosts(validPosts)

                    if (activeTab === "saved") {
                        dispatch(setPosts(validPosts))
                    }

                } catch (e) {
                    console.error("Kaydedilenler hatası:", e)
                } finally {
                    setSavedLoading(false)
                }
            }
        }

        if (isMyProfile) fetchSaved()
    }, [isMyProfile, currentUser, activeTab, dispatch])

    // ----------------------------- TAB CHANGE -----------------------------
    useEffect(() => {
        if (activeTab === "posts") {
            dispatch(setPosts(localUserPosts))
        } else if (activeTab === "saved") {
            dispatch(setPosts(localSavedPosts))
        }
    }, [activeTab, localUserPosts, localSavedPosts, dispatch])

    // ----------------------------- SHARE PROFILE -----------------------------
    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        toast.success("Profil linki kopyalandı!")
    }

    // ----------------------------- LOADING STATES -----------------------------
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="animate-spin" />
            </div>
        )
    }

    if (!profile) {
        return <div className="text-center p-10">Kullanıcı bulunamadı</div>
    }

    // ----------------------------- PAGE -----------------------------
    return (
        <div className="mx-auto max-w-4xl p-4">

            {/* HEADER CARD */}
            <Card className="mb-6 overflow-hidden rounded-2xl border-border/50 shadow-sm">
                <div className="h-32 sm:h-48 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20" />

                <CardContent className="relative px-6 pb-6">

                    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                        {/* AVATAR */}
                        <Avatar className="-mt-16 h-32 w-32 border-4 border-card ring-2 ring-border/30 sm:-mt-20">
                            <AvatarImage src={profile.picture || "/placeholder.svg"} />
                            <AvatarFallback className="text-3xl">
                                {profile.name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>

                        {/* BUTTONS */}
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

                    {/* ----------- USER STATS ----------- */}
                    <div className="flex items-center gap-10 mt-4 text-center">

                        <div>
                            <p className="text-xl font-bold">{stats.postCount}</p>
                            <p className="text-muted-foreground text-sm">Gönderi</p>
                        </div>

                        <div>
                            <p className="text-xl font-bold">{stats.followerCount}</p>
                            <p className="text-muted-foreground text-sm">Takipçi</p>
                        </div>

                        <div>
                            <p className="text-xl font-bold">{stats.followedCount}</p>
                            <p className="text-muted-foreground text-sm">Takip</p>
                        </div>

                    </div>

                    {/* PROFILE INFO */}
                    <div className="space-y-3 mt-4">
                        <h1 className="text-2xl font-bold">{profile.name}</h1>
                        <p className="text-muted-foreground">@{profile.username}</p>

                        {profile.bio && (
                            <p className="leading-relaxed">{profile.bio}</p>
                        )}
                    </div>

                </CardContent>
            </Card>

            {/* ----------------------------- TABS ----------------------------- */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

                <TabsList className="grid w-full grid-cols-3 rounded-xl">
                    <TabsTrigger value="posts">Gönderiler</TabsTrigger>
                    {isMyProfile ? (
                        <TabsTrigger value="saved">Kaydedilenler</TabsTrigger>
                    ) : (
                        <TabsTrigger disabled className="opacity-50">Kaydedilenler 🔒</TabsTrigger>
                    )}
                    <TabsTrigger value="about">Hakkında</TabsTrigger>
                </TabsList>

                {/* POSTS */}
                <TabsContent value="posts">
                    {reduxPosts?.length ? (
                        <div className="space-y-6">
                            {reduxPosts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    isSavedInitial={mySavedPostIds.includes(post.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState title="Henüz gönderi yok" />
                    )}
                </TabsContent>

                {/* SAVED POSTS */}
                <TabsContent value="saved">
                    {savedLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin" />
                        </div>
                    ) : reduxPosts?.length ? (
                        <div className="space-y-6">
                            {reduxPosts.map((post) => (
                                <PostCard key={post.id} post={post} isSavedInitial={true} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState title="Henüz kayıt yok" icon={Bookmark} />
                    )}
                </TabsContent>

                {/* ABOUT */}
                <TabsContent value="about">
                    <Card className="rounded-2xl border-border/50 shadow-sm">
                        <CardContent className="space-y-4 pt-6">

                            <div>
                                <h3 className="font-semibold mb-2">Biyografi</h3>
                                <p className="text-muted-foreground">{profile.bio || "-"}</p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">İletişim</h3>
                                <p className="text-muted-foreground">{profile.email || "-"}</p>
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    )
}
