"use client"

import { useState } from "react" // State yönetimi eklendi
import { useDispatch, useSelector } from "react-redux"
import { toggleLike, toggleSave } from "@/store/slices/postSlice"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, Smile, BookOpen, FileText, Edit, Trash2, X, Check } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { deletePost, updatePost } from "@/services/postService"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"

export function PostCard({ post }) {
  const dispatch = useDispatch()
  const router = useRouter()
  const currentUser = useSelector((state) => state.user.currentUser)
  const savedPosts = useSelector((state) => state.posts.savedPosts)

  // --- YENİ STATE'LER ---
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post?.content || "")
  const [isUpdating, setIsUpdating] = useState(false)

  // 1. Veri Güvenliği
  if (!post) return null;

  // 2. Yazar Bilgileri
  const username = post.username || post.author?.username || "anonim";
  const fullName = post.fullName || post.author?.name || post.author?.fullName || "Bilinmeyen Kullanıcı";
  const avatarUrl = post.author?.avatar || "/placeholder.svg";

  // --- YETKİ KONTROLÜ ---
  const isMyPost = currentUser?.id === post.userId || currentUser?.userId === post.userId;

  // 3. Tarih Formatlama
  let timeAgo = "";
  try {
    const dateString = post.created || post.timestamp;
    if (dateString) {
      timeAgo = formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: tr });
    }
  } catch (e) {
    timeAgo = "bir süre önce";
  }

  const isLiked = (post.likes || []).includes(currentUser?.id ?? -1)
  const isSaved = savedPosts.includes(post?.id)

  // --- YENİ FONKSİYONLAR ---

  // Silme İşlemi
  const handleDelete = async () => {
    try {
      // Backend'e silme isteği at
      await deletePost(post.id);

      toast.success("Gönderi silindi 👋");

      // Listeyi güncellemek için sayfayı yenile
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Silinemedi ❌");
    }
  }

  // Güncelleme İşlemi
  const handleUpdate = async () => {
    if (!editContent.trim()) return toast.error("İçerik boş olamaz");

    try {
      setIsUpdating(true);
      // Backend'e güncel veriyi gönderiyoruz
      await updatePost(post.id, {
        content: editContent,
        userId: post.userId,
        type: post.type,
        title: post.title // Varsa başlığı da koru
      });

      toast.success("Gönderi güncellendi ✅");
      setIsEditing(false);
      window.location.reload(); // Değişikliği görmek için yenile
    } catch (error) {
      toast.error("Güncellenemedi ❌");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  }

  // Kart Tıklama (Düzenleme modundaysak detaya gitme)
  const handleCardClick = (e) => {
    if (isEditing || e.target.closest("button") || e.target.closest("a")) {
      return
    }
    router.push(`/post/${post?.id}`)
  }

  const handleLike = (e) => { e.preventDefault(); e.stopPropagation(); dispatch(toggleLike({ postId: post?.id, userId: currentUser?.id })); toast.success(isLiked ? "Beğeni kaldırıldı" : "Beğenildi!") }
  const handleSave = (e) => { e.preventDefault(); e.stopPropagation(); dispatch(toggleSave(post?.id)); toast.success(isSaved ? "Kayıtlardan çıkarıldı" : "Kaydedildi!") }
  const handleShare = (e) => { e.preventDefault(); e.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`); toast.success("Link kopyalandı!") }

  return (
      <Card
          className="overflow-hidden rounded-2xl border-border/30 bg-white shadow-soft hover-shadow-lift cursor-pointer mb-4"
          onClick={handleCardClick}
      >
        {/* HEADER */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/profile/${username}`} onClick={(e) => e.stopPropagation()}>
                <Avatar className="h-11 w-11 ring-2 ring-border/20">
                  <AvatarImage src={avatarUrl} alt={fullName} />
                  <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>

              <div>
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${username}`} className="font-semibold text-foreground hover:underline" onClick={(e) => e.stopPropagation()}>
                    {fullName}
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground">@{username} · {timeAgo}</p>
              </div>
            </div>

            {/*  MENÜ BUTONU: SADECE BENİM POSTUMSA GÖSTER */}
            {isMyPost ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>
                      <Edit className="mr-2 h-4 w-4" /> Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="text-red-600 focus:text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                // Başkasının postuysa sadece buton (işlevsiz veya şikayet eklenebilir)
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
            )}
          </div>
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="space-y-4 pb-3">

          {/*  DÜZENLEME MODU KONTROLÜ */}
          {isEditing ? (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[100px] bg-white"
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-1"/> İptal
                  </Button>
                  <Button size="sm" onClick={handleUpdate} disabled={isUpdating}>
                    <Check className="h-4 w-4 mr-1"/> {isUpdating ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </div>
              </div>
          ) : (
              // NORMAL GÖRÜNÜM
              <>
                {post.title && <h3 className="text-xl font-bold leading-tight">{post.title}</h3>}

                {post.type === "THOUGHT_POST" ? (
                    <div className="py-6 px-4 text-center">
                      <p className="font-medium text-xl text-foreground/90 italic leading-relaxed">"{post.content}"</p>
                    </div>
                ) : (
                    <p className="leading-relaxed text-foreground/80 whitespace-pre-wrap">{post.content}</p>
                )}
              </>
          )}

          {/* Kitap Detayı (Varsa) */}
          {(post.type === "QUOTE_POST" || post.type === "quote") && post.bookInfo && (
              <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-white p-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{post.bookInfo.title}</h4>
                  <p className="text-xs text-muted-foreground">{post.bookInfo.author}</p>
                </div>
              </div>
          )}

          {/* Etiketler */}
          {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                    <span key={tag} className="text-sm text-muted-foreground hover:text-primary cursor-pointer">#{tag}</span>
                ))}
              </div>
          )}
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="flex items-center justify-between border-t border-border/30 pt-3 pb-3">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className={cn("gap-1.5 rounded-full hover:bg-red-50", isLiked && "text-red-500")} onClick={handleLike}>
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
          <Button variant="ghost" size="sm" className={cn("rounded-full hover:bg-purple-50", isSaved && "text-primary")} onClick={handleSave}>
            <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
          </Button>
        </CardFooter>
      </Card>
  )
}