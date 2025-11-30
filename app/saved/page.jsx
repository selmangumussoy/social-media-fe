"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux"; // useDispatch Eklendi
import { PostCard } from "@/components/feed/post-card";
import { EmptyState } from "@/components/common/empty-state";
import { Bookmark, Loader2 } from "lucide-react";

import { getSavedPostsByUser } from "@/services/savedPostService";
import { getPostById } from "@/services/postService";
import { setPosts } from "@/store/slices/postSlice"; // Action Eklendi

export default function SavedPage() {
    const dispatch = useDispatch();
    // 🔥 Veriyi artık Redux'tan okuyoruz
    const reduxPosts = useSelector((state) => state.posts.posts);
    const currentUser = useSelector((state) => state.user.currentUser);

    const [loading, setLoading] = useState(true);
    // Kaydetme ikonlarının dolu gelmesi için ID listesi
    const [savedPostIds, setSavedPostIds] = useState([]);

    useEffect(() => {
        if (!currentUser) return;

        const userId = currentUser?.id || currentUser?.userId;
        if (!userId) return;

        async function loadSaved() {
            try {
                setLoading(true);

                const savedRelations = await getSavedPostsByUser(userId);

                const ids = savedRelations.map(rel => rel.postId);
                setSavedPostIds(ids);

                const postsPromises = savedRelations.map(rel => getPostById(rel.postId));
                const fetchedPosts = await Promise.all(postsPromises);

                const validPosts = fetchedPosts.filter(p => p !== null);

                dispatch(setPosts(validPosts));

            } catch (err) {
                console.error("Kaydedilenleri yükleme hatası:", err);
            } finally {
                setLoading(false);
            }
        }

        loadSaved();
    }, [currentUser, dispatch]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
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
                {/* 🔥 dbPosts yerine reduxPosts kullanıyoruz */}
                {reduxPosts && reduxPosts.length > 0 ? (
                    reduxPosts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            isSavedInitial={true}
                        />
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