"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PostCard } from "@/components/feed/post-card";
import { EmptyState } from "@/components/common/empty-state";
import { Bookmark } from "lucide-react";

import { getSavedPostsByUser } from "@/services/savedPostService";
import { getPostById } from "@/services/postService";  // bu varsa

export default function SavedPage() {
    const currentUser = useSelector((state) => state.user.currentUser);

    const [savedPosts, setSavedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        const userId = currentUser?.id || currentUser?.userId;
        if (!userId) return;

        async function loadSaved() {
            try {
                // 1) saved_post tablosundaki kayıtları getir
                const saved = await getSavedPostsByUser(userId);
                // saved: [{ id, postId, userId, created }, ...]

                // 2) her postId için post datasını çek
                const posts = [];
                for (const item of saved) {
                    const post = await getPostById(item.postId);
                    if (post) posts.push(post);
                }

                setSavedPosts(posts);
            } catch (err) {
                console.error("Kaydedilenleri yükleme hatası:", err);
            } finally {
                setLoading(false);
            }
        }

        loadSaved();
    }, [currentUser]);

    if (loading) {
        return (
            <div className="mx-auto max-w-2xl p-4">
                <p>Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl p-4">
            <div className="mb-6">
                <h1 className="mb-2 text-3xl font-bold">Kaydedilenler</h1>
                <p className="text-muted-foreground">
                    Daha sonra okumak için kaydettiğiniz gönderiler
                </p>
            </div>

            <div className="space-y-6">
                {savedPosts.length > 0 ? (
                    savedPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))
                ) : (
                    <EmptyState
                        icon={Bookmark}
                        title="Henüz kayıtlı gönderi yok"
                        description="Beğendiğiniz gönderileri kaydedin ve buradan kolayca erişin"
                    />
                )}
            </div>
        </div>
    );
}
