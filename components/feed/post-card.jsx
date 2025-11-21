"use client"

import { useDispatch, useSelector } from "react-redux"
import { toggleLike, toggleSave } from "@/store/slices/postSlice"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, Smile, BookOpen, FileText } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export function PostCard({ post }) {
  const dispatch = useDispatch()
  const router = useRouter()
  const currentUser = useSelector((state) => state.user.currentUser)
  const savedPosts = useSelector((state) => state.posts.savedPosts)

  // 1. Veri Güvenliği: post undefined ise hata verme
  if (!post) return null;

  // 2. Yazar Bilgilerini Çözümle (Backend veya Redux'tan gelebilir)
  const username = post.username || post.author?.username || "anonim";
  const fullName = post.fullName || post.author?.name || post.author?.fullName || "Bilinmeyen Kullanıcı";
  const avatarUrl = post.author?.avatar || "/placeholder.svg";

  // 3. Tarih Formatlama
  let timeAgo = "";
  try {
    // Backend'den 'created' veya 'timestamp' gelebilir
    const dateString = post.created || post.timestamp;
    if (dateString) {
      timeAgo = formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: tr });
    }
  } catch (e) {
    timeAgo = "bir süre önce";
  }

  // 4. Beğeni/Kaydetme Durumu (Güvenli kontrol)
  const isLiked = (post.likes || []).includes(currentUser?.id ?? -1)
  const isSaved = savedPosts.includes(post?.id)

  // 5. Kart Tıklama
  const handleCardClick = (e) => {
    if (
        e.target.closest("button") ||
        e.target.closest("a") ||
        e.target.tagName === "A" ||
        e.target.tagName === "BUTTON"
    ) {
      return
    }
    router.push(`/post/${post?.id}`)
  }

  // Aksiyon Fonksiyonları
  const handleLike = (e) => {
    e.preventDefault(); e.stopPropagation();
    dispatch(toggleLike({ postId: post?.id, userId: currentUser?.id }))
    toast.success(isLiked ? "Beğeni kaldırıldı" : "Beğenildi!")
  }

  const handleSave = (e) => {
    e.preventDefault(); e.stopPropagation();
    dispatch(toggleSave(post?.id))
    toast.success(isSaved ? "Kayıtlardan çıkarıldı" : "Kaydedildi!")
  }

  const handleShare = (e) => {
    e.preventDefault(); e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast.success("Link kopyalandı!")
  }

  // 6. Post Tipine Göre İkon
  const getPostTypeIcon = (type) => {
    // Backend enum'ları: THOUGHT_POST, BLOG_POST, QUOTE_POST
    // Frontend enum'ları: quote, blog
    if (type === "THOUGHT_POST") return <Smile className="h-4 w-4 text-yellow-600" />;
    if (type === "QUOTE_POST" || type === "quote") return <BookOpen className="h-4 w-4 text-blue-600" />;
    if (type === "BLOG_POST" || type === "blog") return <FileText className="h-4 w-4 text-green-600" />;
    return <FileText className="h-4 w-4 text-gray-500" />;
  }

  return (
      <Card
          className="overflow-hidden rounded-2xl border-border/30 bg-white shadow-soft hover-shadow-lift cursor-pointer mb-4"
          onClick={handleCardClick}
      >
        {/* HEADER */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <Link href={`/profile/${username}`} onClick={(e) => e.stopPropagation()}>
                <Avatar className="h-11 w-11 ring-2 ring-border/20">
                  <AvatarImage src={avatarUrl} alt={fullName} />
                  <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>

              <div>
                <div className="flex items-center gap-2">
                  <Link
                      href={`/profile/${username}`}
                      className="font-semibold text-foreground hover:underline"
                      onClick={(e) => e.stopPropagation()}
                  >
                    {fullName}
                  </Link>
                  {/* Post Tipi İkonu */}

                </div>

                <p className="text-xs text-muted-foreground">
                  @{username} · {timeAgo}
                </p>
              </div>
            </div>

            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="space-y-4 pb-3">

          {/* Başlık (Varsa göster) */}
          {post.title && (
              <h3 className="text-xl font-bold leading-tight">{post.title}</h3>
          )}

          {/* DÜŞÜNCE (THOUGHT) TİPİ */}
          {post.type === "THOUGHT_POST" ? (
              // 👇 DEĞİŞİKLİK: Border, shadow ve bg-white kaldırıldı. Sadece padding ve ortalama kaldı.
              <div className="py-6 px-4 text-center">
                <p className="font-medium text-xl text-foreground/90 italic leading-relaxed">
                  "{post.content}"
                </p>
              </div>
          ) : (
              // DİĞER TİPLER (BLOG, QUOTE vb.)
              <p className="leading-relaxed text-foreground/80 whitespace-pre-wrap">
                {post.content}
              </p>
          )}

          {/* KİTAP DETAYI (Quote için) */}
          {(post.type === "QUOTE_POST" || post.type === "quote") && post.bookInfo && (
              <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-white p-3">
                {/* ... Kitap resmi ve detayları buraya eklenebilir ... */}
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{post.bookInfo.title}</h4>
                  <p className="text-xs text-muted-foreground">{post.bookInfo.author}</p>
                </div>
              </div>
          )}

          {/* ETİKETLER */}
          {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                    <span key={tag} className="text-sm text-muted-foreground hover:text-primary cursor-pointer">
                      #{tag}
                    </span>
                ))}
              </div>
          )}
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="flex items-center justify-between border-t border-border/30 pt-3 pb-3">
          <div className="flex items-center gap-1">
            <Button
                variant="ghost" size="sm"
                className={cn("gap-1.5 rounded-full hover:bg-red-50", isLiked && "text-red-500")}
                onClick={handleLike}
            >
              <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
              <span className="text-sm">{post.likeCount || post.likes?.length || 0}</span>
            </Button>

            <Button variant="ghost" size="sm" className="gap-1.5 rounded-full hover:bg-blue-50">
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm">{post.commentCount || post.comments?.length || 0}</span>
            </Button>

            <Button variant="ghost" size="sm" className="gap-1.5 rounded-full hover:bg-green-50" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <Button
              variant="ghost" size="sm"
              className={cn("rounded-full hover:bg-purple-50", isSaved && "text-primary")}
              onClick={handleSave}
          >
            <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
          </Button>
        </CardFooter>
      </Card>
  )
}