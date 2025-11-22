"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PostCard } from "@/components/feed/post-card";
import { FeedFilter } from "@/components/feed/feed-filter";
import { RightSidebar } from "@/components/sidebar/right-sidebar";
import { EmptyState } from "@/components/common/empty-state";
import { BookOpen, Image as ImageIcon, Paperclip, Smile, Loader2 } from "lucide-react";
import { getAllPosts, createPost } from "@/services/postService";
import { createThoughtPost } from "@/services/thoughtPostService";
import { createBlogPost } from "@/services/blogPostService";
import toast from "react-hot-toast";

const MAX_LEN = 280;

export default function HomePage() {
  const currentUser = useSelector((state) => state.user.currentUser);

  // --- STATE'LER ---
  const [activeFilter, setActiveFilter] = useState("all");
  const [content, setContent] = useState("");
  const [feeling, setFeeling] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Veritabanı verileri
  const [dbPosts, setDbPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- VERİ ÇEKME ---
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const items = await getAllPosts();
        setDbPosts(items || []);
      } catch (e) {
        console.error(e);
        toast.error("Akış yüklenemedi");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // --- FİLTRELEME MANTIĞI (Önemli Kısım) ---
  // combinedPosts yerine sadece dbPosts'u filtreliyoruz
  const displayPosts = dbPosts.filter((post) => {
    if (activeFilter === "all") return true;
    return post.type === activeFilter;
  });

  const userId = currentUser?.id || currentUser?.userId;

  // --- PAYLAŞIM FONKSİYONU ---
  const handlePublish = async () => {
    const trimmed = (content ?? "").trim();

    if (!userId) {
      toast.error("Oturum bulunamadı. Lütfen giriş yapın.");
      return;
    }
    if (!trimmed) {
      toast.error("Bir şeyler yazmalısın 🙂");
      return;
    }
    if (trimmed.length > MAX_LEN) {
      toast.error(`En fazla ${MAX_LEN} karakter yazabilirsin.`);
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Ana Postu Oluştur
      const post = await createPost({
        type: "THOUGHT_POST",
        content: trimmed.slice(0, 80),
        userId,
        likeCount: 0,
        commentCount: 0,
      });

      // 2. Detay (Thought) Oluştur
      await createThoughtPost({
        postId: post.id,
        content: trimmed,
        feeling: feeling || null
      });

      toast.success("Gönderi paylaşıldı ✅");
      setContent("");
      setFeeling("");

      // Listeyi güncelle
      const items = await getAllPosts();
      setDbPosts(items || []);

    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Gönderi paylaşılamadı ❌");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="flex gap-6">
        <div className="mx-auto w-full max-w-2xl p-4 pt-2">

          {/* --- COMPOSER (Yazı Alanı) --- */}
          <div className="mb-5 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-border/60">
                <img
                    src={currentUser?.picture || "/placeholder.svg"}
                    alt="me"
                    className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1">
              <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Neler oluyor?"
                  rows={3}
                  maxLength={MAX_LEN + 50}
                  className="w-full resize-none bg-transparent p-3 text-sm outline-none placeholder:text-muted-foreground/80 focus:outline-none focus:ring-0 border-0"
              />

                {feeling && (
                    <div className="px-3 text-sm text-primary font-medium flex items-center gap-2">
                      Hissedilen: <span className="text-lg">{feeling}</span>
                      <button onClick={() => setFeeling("")} className="text-xs text-red-500 hover:underline">Kaldır</button>
                    </div>
                )}

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <button className="p-2 hover:bg-accent rounded-full"><ImageIcon className="h-5 w-5" /></button>
                    <button className="p-2 hover:bg-accent rounded-full"><Paperclip className="h-5 w-5" /></button>

                    {/* Emoji Menüsü */}
                    <div className="relative group">
                      <button className={`rounded-full p-2 hover:bg-accent ${feeling ? 'text-yellow-500' : ''}`}>
                        <Smile className="h-5 w-5" />
                      </button>
                      <div className="absolute top-full left-0 mt-1 hidden group-hover:flex bg-white shadow-lg border rounded-lg p-2 gap-2 z-10">
                        <span className="cursor-pointer hover:scale-125" onClick={() => setFeeling("😊")}>😊</span>
                        <span className="cursor-pointer hover:scale-125" onClick={() => setFeeling("😎")}>😎</span>
                        <span className="cursor-pointer hover:scale-125" onClick={() => setFeeling("😢")}>😢</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{content.length}/{MAX_LEN}</span>
                    <button
                        onClick={handlePublish}
                        disabled={isSubmitting || !content.trim()}
                        className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                    >
                      {isSubmitting ? "Yükleniyor..." : "Paylaş"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- FİLTRE --- */}
          <div className="mb-6">
            <FeedFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          </div>

          {/* --- FEED (AKIŞ) --- */}
          <div className="space-y-6">
            {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
            ) : displayPosts.length > 0 ? (
                // 👇 BURADA ARTIK combinedPosts YOK, displayPosts VAR
                displayPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))
            ) : (
                <EmptyState
                    icon={BookOpen}
                    title="Henüz gönderi yok"
                    description="Bu kategoride paylaşım yapılmamış."
                />
            )}
          </div>
        </div>

        <RightSidebar />
      </div>
  );
}