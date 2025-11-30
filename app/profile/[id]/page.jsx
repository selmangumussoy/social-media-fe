"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Loader2, UserPlus, Check } from "lucide-react";

import { PostCard } from "@/components/feed/post-card";
import { EmptyState } from "@/components/common/empty-state";

import toast from "react-hot-toast";

import { followUser, unfollowUser } from "@/store/slices/followSlice";

// Services
import { getProfileById } from "@/services/profileService";
import { getPostsByUser } from "@/services/postService";
import { getUserById } from "@/services/userService";
import { createFollow, deleteFollow } from "@/services/followService";
import { getUserStatsByUserId } from "@/services/userStatsService";

export default function SearchProfilePage() {
    const { id } = useParams(); // URL'deki gerçek USER ID
    const dispatch = useDispatch();

    const currentUser = useSelector((state) => state.user.currentUser);
    const followingList = useSelector((state) => state.follow.following);
    const followMap = useSelector((state) => state.follow.followMap);

    const [profile, setProfile] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userPosts, setUserPosts] = useState([]);

    const [stats, setStats] = useState({
        followerCount: 0,
        followedCount: 0,
        postCount: 0
    });

    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);

    const isMyProfile = currentUser?.id && String(currentUser.id) === String(id);

    // doğru takip durumu kontrolü → USER ID
    const isFollowing = userData ? followingList.includes(userData.id) : false;

    // ---------------------- LOAD DATA ----------------------
    useEffect(() => {
        async function loadAll() {
            if (!id) return;

            try {
                setLoading(true);

                // USER
                const uData = await getUserById(id);
                setUserData(uData);

                if (!uData || !uData.profileId) {
                    setProfile(null);
                    return;
                }

                // PROFILE
                const pData = await getProfileById(uData.profileId);
                setProfile(pData);

                // POSTS
                const posts = await getPostsByUser(uData.id);
                setUserPosts(posts || []);

                // STATS
                const userStats = await getUserStatsByUserId(uData.id);
                setStats({
                    followerCount: userStats?.followerCount || 0,
                    followedCount: userStats?.followedCount || 0,
                    postCount: userStats?.postCount || 0
                });

            } catch (err) {
                console.error("Profil yükleme hatası:", err);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        }

        loadAll();
    }, [id]);

    // ---------------------- FOLLOW - UNFOLLOW ----------------------
    const handleFollow = async () => {
        if (!currentUser?.id) {
            toast.error("Giriş yapmanız gerekiyor.");
            return;
        }

        if (!userData?.id) return;

        try {
            setFollowLoading(true);

            // ------------------ FOLLOW ------------------
            if (!isFollowing) {
                const response = await createFollow({
                    followerId: currentUser.id,
                    followedId: userData.id
                });

                const followId = response?.data?.id || response?.id;

                dispatch(
                    followUser({
                        userId: userData.id,
                        followId
                    })
                );

                setStats(prev => ({
                    ...prev,
                    followerCount: prev.followerCount + 1
                }));

                toast.success(`${profile.name} takip edildi.`);
            }

            // ------------------ UNFOLLOW ------------------
            else {
                const followId = followMap[userData.id];

                const success = await deleteFollow(followId);

                if (success) {
                    dispatch(unfollowUser(userData.id));

                    setStats(prev => ({
                        ...prev,
                        followerCount: Math.max(prev.followerCount - 1, 0)
                    }));

                    toast.success("Takipten çıkıldı.");
                }
            }
        } catch (e) {
            console.error("Takip işlemi hatası:", e);
            toast.error("Takip işlemi başarısız.");
        } finally {
            setFollowLoading(false);
        }
    };

    // ---------------------- SHARE ----------------------
    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Profil linki kopyalandı!");
    };

    // ---------------------- LOADING ----------------------
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    if (!profile || !userData) {
        return <div className="text-center p-10">Kullanıcı bulunamadı.</div>;
    }

    // ---------------------- PAGE ----------------------
    return (
        <div className="mx-auto max-w-4xl p-4">
            <Card className="mb-6 overflow-hidden rounded-2xl shadow-sm border-border/50">
                <div className="h-32 sm:h-48 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20" />

                <CardContent className="relative px-6 pb-6">
                    {/* Avatar + Buttons */}
                    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                        <Avatar className="-mt-16 sm:-mt-20 h-32 w-32 border-4 border-card ring-2 ring-border/30">
                            <AvatarImage src={profile.picture || "/placeholder.svg"} />
                            <AvatarFallback className="text-3xl">
                                {profile.name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex gap-2">
                            {!isMyProfile && currentUser?.id && (
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

                    {/* Stats */}
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

                    {/* Profile Info */}
                    <div className="space-y-3 mt-6">
                        <h1 className="text-2xl font-bold">{profile.name}</h1>
                        <p className="text-muted-foreground">@{profile.username}</p>
                        {profile.bio && <p className="leading-relaxed">{profile.bio}</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="posts" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 rounded-xl">
                    <TabsTrigger value="posts">Gönderiler</TabsTrigger>
                    <TabsTrigger value="about">Hakkında</TabsTrigger>
                </TabsList>

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

                <TabsContent value="about">
                    <Card className="rounded-2xl shadow-sm border-border/50">
                        <CardContent className="space-y-4 pt-6">
                            <div>
                                <h3 className="font-semibold mb-2">Biyografi</h3>
                                <p className="text-muted-foreground">{profile.bio || "-"}</p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">E-posta</h3>
                                <p className="text-muted-foreground">{profile.email || "-"}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
