// src/components/layout/SearchProfilePage.jsx

"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {useDispatch, useSelector} from "react-redux"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Link as LinkIcon, Loader2, UserPlus, Check } from "lucide-react"
import { PostCard } from "@/components/feed/post-card"
import { EmptyState } from "@/components/common/empty-state"
import toast from "react-hot-toast"
import { followUser, unfollowUser } from "@/store/slices/followSlice";

// Servisler
import { getProfileById } from "@/services/profileService"
import { getPostsByUser } from "@/services/postService"
import { getUserById } from "@/services/userService"
import { createFollow } from "@/services/followService"

export default function SearchProfilePage() {

    const { id } = useParams()                      // URL'deki kullanıcı ID'si (string)
    const currentUser = useSelector(state => state.user.currentUser)

    const [profile, setProfile] = useState(null)
    const [userPosts, setUserPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [followLoading, setFollowLoading] = useState(false)
    const isMyProfile = currentUser?.id && String(currentUser.id) === String(id)
    const followingList = useSelector(state => state.follow.following);
    const isFollowing = followingList.includes(profile?.id);


    useEffect(() => {
        async function loadData() {
            if (!id) return;

            try {
                setLoading(true)

                // 1) Kullanıcı bilgisi
                const userData = await getUserById(id)
                if (!userData || !userData.profileId) {
                    setProfile(null)
                    return
                }

                // 2) Profil bilgisi
                const profileData = await getProfileById(userData.profileId)
                setProfile(profileData)

                // 3) Kullanıcı postları
                const posts = await getPostsByUser(userData.id)
                setUserPosts(posts || [])

            } catch (err) {
                console.error("Profil yükleme hatası:", err)
                setProfile(null)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [id])


    const dispatch = useDispatch();

    const handleFollow = async () => {
        if (!currentUser?.id) {
            toast.error("Giriş yapmanız gerekiyor.");
            return;
        }

        try {
            setFollowLoading(true);

            if (!isFollowing) {
                await createFollow({
                    followerId: currentUser.id,
                    followedId: profile.id
                });

                dispatch(followUser(profile.id));  // 🔥 GLOBAL STATE GÜNCELLENDİ
                toast.success(`${profile.name} takip edildi.`);
            } else {
                dispatch(unfollowUser(profile.id));
                toast.success("Takipten çıkıldı.");
            }

        } catch (error) {
            console.error("Takip hatası:", error);
            toast.error("Takip işlemi başarısız.");
        } finally {
            setFollowLoading(false);
        }
    };

    const handleShare = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href)
            toast.success("Profil linki kopyalandı!")
        }
    }


    // ------------ UI RENDER -----------------

    if (loading)
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="animate-spin" />
            </div>
        )

    if (!profile)
        return <div className="text-center p-10">Kullanıcı bulunamadı.</div>


    return (
        <div className="mx-auto max-w-4xl p-4">

            {/* PROFİL HEADER */}
            <Card className="mb-6 overflow-hidden rounded-2xl border-border/50 shadow-sm">
                <div className="h-32 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 sm:h-48" />

                <CardContent className="relative px-6 pb-6">
                    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                        {/* Avatar */}
                        <Avatar className="-mt-16 h-32 w-32 border-4 border-card ring-2 ring-border/30 sm:-mt-20">
                            <AvatarImage src={profile.picture || "/placeholder.svg"} />
                            <AvatarFallback className="text-3xl">
                                {profile.name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>

                        {/* BUTONLAR */}
                        <div className="flex gap-2">

                            {/* 🎯 TAKİP BUTONU — Artık doğru şekilde görünüyor */}
                            {currentUser?.id && !isMyProfile && (
                                <Button
                                    variant={isFollowing ? "outline" : "default"}
                                    size="sm"
                                    className="gap-2 rounded-full"
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                >
                                    {followLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : isFollowing ? (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Takip Ediliyor
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="h-4 w-4" />
                                            Takip Et
                                        </>
                                    )}
                                </Button>
                            )}

                            {/* Paylaş */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full bg-transparent"
                                onClick={handleShare}
                            >
                                <LinkIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Profil Bilgileri */}
                    <div className="space-y-3">
                        <div>
                            <h1 className="text-2xl font-bold">{profile.name}</h1>
                            <p className="text-muted-foreground">@{profile.username}</p>
                        </div>

                        {profile.bio && (
                            <p className="leading-relaxed">{profile.bio}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* TABS */}
            <Tabs defaultValue="posts" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 rounded-xl">
                    <TabsTrigger value="posts">Gönderiler</TabsTrigger>
                    <TabsTrigger value="about">Hakkında</TabsTrigger>
                </TabsList>

                {/* POSTLAR */}
                <TabsContent value="posts">
                    {userPosts.length > 0 ? (
                        <div className="space-y-6">
                            {userPosts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState title="Henüz gönderi yok" />
                    )}
                </TabsContent>

                {/* HAKKINDA */}
                <TabsContent value="about">
                    <Card className="rounded-2xl border-border/50 shadow-sm">
                        <CardContent className="space-y-4 pt-6">
                            <div>
                                <h3 className="mb-2 font-semibold">Biyografi</h3>
                                <p className="text-muted-foreground">{profile.bio || "-"}</p>
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold">E-posta</h3>
                                <p className="text-muted-foreground">{profile.email || "-"}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    )
}
