"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toggleLike, toggleSave } from "@/store/slices/postSlice"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, Smile, BookOpen, FileText, Edit, Trash2, X, Check, Sparkles, Languages } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import Link from "next/link"
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
import { Badge } from "@/components/ui/badge"

export function PostCard({ post }) {
  const dispatch = useDispatch()
  const router = useRouter()
  const currentUser = useSelector((state) => state.user.currentUser)
  const savedPosts = useSelector((state) => state.posts.savedPosts)

  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post?.content || "")
  const [isUpdating, setIsUpdating] = useState(false)

  if (!post) return null;

  const username = post.username || post.author?.username || "anonim";
  const fullName = post.fullName || post.author?.name || post.author?.fullName || "Bilinmeyen Kullanıcı";
  const avatarUrl = post.author?.avatar || "/placeholder.svg";
  const isMyPost = currentUser?.id === post.userId || currentUser?.userId === post.userId;

  let timeAgo = "";
  try {
    const dateString = post.created || post.timestamp;
    if (dateString) timeAgo = formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: tr });
  } catch (e) { timeAgo = ""; }

  const isLiked = (post.likes || []).includes(currentUser?.id ?? -1)
  const isSaved = savedPosts.includes(post?.id)

  // --- AKSİYONLAR ---
  const handleDelete = async () => {
    try { await deletePost(post.id); toast.success("Silindi 👋"); window.location.reload(); }
    catch (error) { toast.error("Hata oluştu"); }
  }

  const handleUpdate = async () => {
    if (!editContent.trim()) return toast.error("İçerik boş olamaz");
    try {
      setIsUpdating(true);
      await updatePost(post.id, { content: editContent, userId: post.userId, type: post.type, title: post.title });
      toast.success("Güncellendi ✅"); setIsEditing(false); window.location.reload();
    } catch (error) { toast.error("Hata oluştu"); } finally { setIsUpdating(false); }
  }

  // 👇 YENİ: Detay sayfasına gitme fonksiyonu (Artık sadece yorum butonuna bağlı)
  const goToDetail = (e) => {
    e.stopPropagation(); // Tıklamanın başka yerleri etkilemesini engelle
    router.push(`/post/${post?.id}`);
  }

  const handleLike = (e) => { e.preventDefault(); e.stopPropagation(); dispatch(toggleLike({ postId: post?.id, userId: currentUser?.id })); }
  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // 1. Backend'e istek at (Veritabanına kaydet)
      const isSavedBackend = await togglePostSave(post.id);

      // 2. Redux'ı güncelle (Ekranda ikonun rengi hemen değişsin diye)
      dispatch(toggleSave(post.id));

      // 3. Kullanıcıya bilgi ver
      if (isSavedBackend) {
        toast.success("Kaydedildi 📌");
      } else {
        toast.success("Kayıtlardan çıkarıldı");
      }
    } catch (error) {
      console.error(error);
      toast.error("İşlem yapılamadı");
    }
  }
  return (
      // 👇 DEĞİŞİKLİK: Kartın onClick olayını kaldırdık (cursor-pointer da kalktı)
      <Card className="overflow-hidden rounded-2xl border-border/30 bg-white shadow-sm hover:shadow-md transition-all mb-6">

        <CardHeader className="pb-2 pt-5 px-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/profile/${username}`} onClick={(e) => e.stopPropagation()}>
                <Avatar className="h-10 w-10 border border-gray-100">
                  <AvatarImage src={avatarUrl} alt={fullName} />
                  <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link href={`/profile/${username}`} className="font-bold text-gray-900 hover:underline text-sm" onClick={(e) => e.stopPropagation()}>
                  {fullName}
                </Link>
                <p className="text-xs text-gray-500">@{username} · {timeAgo}</p>
              </div>
            </div>

            {isMyPost && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4" /> Düzenle</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Sil</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-5 py-2 space-y-4">
          {isEditing ? (
              <div className="space-y-2">
                <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="min-h-[100px] bg-gray-50" />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>İptal</Button>
                  <Button size="sm" onClick={handleUpdate} disabled={isUpdating}>Kaydet</Button>
                </div>
              </div>
          ) : (
              <>
                {post.type === "BLOG_POST" ? (
                    <div className="space-y-3">
                      {post.title && <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{post.title}</h2>}
                      <p className="text-gray-700 leading-relaxed text-[15px] line-clamp-3">{post.content}</p>
                      <div className="flex gap-2 pt-2">
                        <Badge variant="outline" className="gap-1 font-normal text-xs py-1 px-2 text-gray-500 border-gray-200"><Sparkles className="h-3 w-3" /> AI Analizi</Badge>
                        <Badge variant="outline" className="gap-1 font-normal text-xs py-1 px-2 text-gray-500 border-gray-200"><Languages className="h-3 w-3" /> Çevir</Badge>
                      </div>
                    </div>
                ) : post.type === "THOUGHT_POST" ? (
                    <div className="py-4 px-2 text-center">
                      <p className="font-medium text-xl text-gray-800 italic leading-relaxed">"{post.content}"</p>
                    </div>
                ) : (
                    <p className="leading-relaxed text-gray-800 whitespace-pre-wrap">{post.content}</p>
                )}
              </>
          )}
        </CardContent>

        <CardFooter className="px-5 py-3 border-t border-gray-50 flex items-center justify-between text-gray-500">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 hover:text-red-500 transition" onClick={handleLike}>
              <Heart className={cn("h-5 w-5", isLiked && "fill-red-500 text-red-500")} />
              <span className="text-xs font-medium">{post.likeCount || 0}</span>
            </button>

            {/* 👇 DEĞİŞİKLİK: Yorum Butonuna Tıklayınca Detaya Git */}
            <button
                className="flex items-center gap-1.5 hover:text-blue-500 transition cursor-pointer"
                onClick={goToDetail}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs font-medium">{post.commentCount || 0}</span>
            </button>

            <button className="flex items-center gap-1.5 hover:text-green-500 transition" onClick={(e) => {e.stopPropagation(); toast.success("Link kopyalandı")}}>
              <Share2 className="h-5 w-5" />
            </button>
          </div>
          <button onClick={handleSave}>
            <Bookmark className={cn("h-5 w-5 hover:text-gray-800", isSaved && "fill-black text-black")} />
          </button>
        </CardFooter>
      </Card>
  )
}