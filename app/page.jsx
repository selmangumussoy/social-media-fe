"use client";

import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { PostCard } from "@/components/feed/post-card";
import { FeedFilter } from "@/components/feed/feed-filter";
import { RightSidebar } from "@/components/sidebar/right-sidebar";
import { EmptyState } from "@/components/common/empty-state";
import { BookOpen, Image as ImageIcon, Paperclip, Smile } from "lucide-react";
import { getAllPosts } from "@/services/postService";
import { createThought } from "@/services/thoughtPostService";
import toast from "react-hot-toast";

const MAX_LEN = 280;

export default function HomePage() {
  const reduxPosts = useSelector((state) => state.posts.posts);
  const currentUser = useSelector((state) => state.user.currentUser);

  const [activeFilter, setActiveFilter] = useState("all");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbPosts, setDbPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const items = await getAllPosts();
        setDbPosts(items ?? []);
      } catch (e) {
        console.error(e);
        toast.error("Gönderiler alınamadı");
      }
    };
    fetchPosts();
  }, []);

  const combinedPosts = useMemo(() => {
    const merged = [...(reduxPosts ?? []), ...(dbPosts ?? [])];
    if (activeFilter === "all") return merged;
    return merged.filter((post) => post.type === activeFilter);
  }, [reduxPosts, dbPosts, activeFilter]);

  const userId =
      currentUser?.id ??
      currentUser?.userId ??
      null;

  const handlePublish = async () => {
    const trimmed = (content ?? "").trim();

    if (!userId) {
      // Kullanıcı yoksa uyarı ver ve geri dön
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

      await createThought({
        text: trimmed,                  // ✅ doğru parametre adı
        userId,          // ✅ userId geçiliyor
        visibility: "PUBLIC",
      });

      toast.success("Gönderi paylaşıldı ✅");
      setContent("");

      // yeni gönderi sonrası tekrar fetch
      const items = await getAllPosts();
      setDbPosts(items ?? []);
    } catch (e) {
      console.error(e);
      toast.error(
          e?.message || "Gönderi paylaşılamadı ❌"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const overLimit = content.length > MAX_LEN;

  return (
      <div className="flex gap-6">
        <div className="mx-auto w-full max-w-2xl p-4 pt-2">
          {/* COMPOSER */}
          <div className="mb-5 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm">
            <div className="flex gap-3">
              {/* Avatar */}
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-border/60">
                <img
                    src={currentUser?.picture || "/placeholder.svg"}
                    alt="me"
                    className="h-full w-full object-cover"
                />
              </div>

              {/* Metin alanı */}
              <div className="flex-1">
              <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Neler oluyor?"
                  rows={3}
                  maxLength={MAX_LEN + 50} // kullanıcı deneyimi için biraz tolerans ama biz yine de guard koyduk
                  className="w-full resize-none bg-transparent p-3 text-sm outline-none placeholder:text-muted-foreground/80
                           focus:outline-none focus:ring-0 border-0"
              />
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <button type="button" className="rounded-full p-2 hover:bg-accent" title="Medya ekle">
                      <ImageIcon className="h-5 w-5" />
                    </button>
                    <button type="button" className="rounded-full p-2 hover:bg-accent" title="Dosya ekle">
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <button type="button" className="rounded-full p-2 hover:bg-accent" title="Duygu">
                      <Smile className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                  <span className={`text-xs ${overLimit ? "text-red-500" : "text-muted-foreground"}`}>
                    {content.length}/{MAX_LEN}
                  </span>
                    <button
                        type="button"
                        onClick={handlePublish}
                        disabled={isSubmitting || !content.trim() || overLimit}
                        className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                    >
                      {isSubmitting ? "Yükleniyor..." : "Gönderi yayınla"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtre */}
          <div className="mb-6">
            <FeedFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          </div>

          {/* Feed */}
          <div className="space-y-6">
            {combinedPosts?.length > 0 ? (
                combinedPosts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
                <EmptyState
                    icon={BookOpen}
                    title="Henüz gönderi yok"
                    description="Takip ettiğiniz kişilerin gönderileri burada görünecek"
                />
            )}
          </div>
        </div>

        <RightSidebar />
      </div>
  );
}
