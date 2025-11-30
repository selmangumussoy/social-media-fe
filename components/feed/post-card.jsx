"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import toast from "react-hot-toast"

// Icons
import {
    Heart,
    MessageCircle,
    Bookmark,
    Share2,
    MoreHorizontal,
    Edit,
    Trash2,
    Sparkles,
    Languages,
    BookOpen,
    ArrowRight,
    Quote,
    Check,
    X
} from "lucide-react"

// UI Components
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Services & Store
import { toggleLike, toggleSave } from "@/store/slices/postSlice"
import { deletePost, updatePost } from "@/services/postService"
import { savePost, unsavePost, getSavedPostsByUser } from "@/services/savedPostService"
import { cn } from "@/lib/utils"

// Helper: Hashtag renklendirme
const renderContentWithHashtags = (text) => {
    if (!text) return null
    const parts = text.split(/(#\w+)/g)
    return parts.map((part, index) => {
        if (/^#\w+$/.test(part)) {
            return (
                <span key={index} className="font-medium text-blue-600">
          {part}
        </span>
            )
        }
        return <span key={index}>{part}</span>
    })
}

export function PostCard({ post }) {
    const dispatch = useDispatch()
    const router = useRouter()
    const pathname = usePathname()

    const currentUser = useSelector((state) => state.user.currentUser)
// 🔥 `isSavedInitial` prop'unu ekledik
export function PostCard({ post, isSavedInitial = false }) {
  const dispatch = useDispatch()
  const router = useRouter()
  const currentUser = useSelector((state) => state.user.currentUser)

    // --- STATE ---
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(post?.content || "")
    const [isUpdating, setIsUpdating] = useState(false)

    // Kaydetme State'leri
    const [isSaved, setIsSaved] = useState(false)
    const [savedPostId, setSavedPostId] = useState(null)
    const [saveLoading, setSaveLoading] = useState(false)
  // --- KAYDETME STATE'LERİ ---
  // Başlangıç değeri olarak parent'tan gelen veriyi kullanıyoruz.
  const [isSaved, setIsSaved] = useState(isSavedInitial)
  const [savedPostId, setSavedPostId] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)

    if (!post) return null

    // --- DEĞİŞKENLER ---
    const username = post.username || post.author?.username || "anonim"
    const fullName = post.fullName || post.author?.name || post.author?.fullName || "Bilinmeyen Kullanıcı"
    const avatarUrl = post.author?.avatar || "/placeholder.svg"

    const isMyPost = currentUser?.id === post.userId || currentUser?.userId === post.userId
    const showMenu = isMyPost && !isEditing;

    // Zaman Formatı
    let timeAgo = ""
    try {
        const dateString = post.created || post.timestamp
        if (dateString) {
            timeAgo = formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: tr })
        }
    } catch { timeAgo = "" }

    // Detay Verileri
    const qp = post.quotePost || {};
    const bookName = qp.bookName || post.bookName || post.bookTitle || "Bilinmeyen Kitap";
    const authorName = qp.author || post.author || post.authorName || "Yazar Bilinmiyor";
    const quotePage = qp.quotePage || post.quotePage || qp.page || null;
    const quoteContent = qp.thought || post.thought || post.content || "";
    const displayTitle = post.title || qp.title || null;
    const postTags = post.tags || [];

    const isLiked = (post.likes || []).includes(currentUser?.id ?? -1)

    // İçerik Uzunluk Kontrolü (Blog için)
    const STRIP_HTML_REGEX = /<[^>]*>?/gm;
    const MAX_LENGTH = 180;
    const rawContent = post.content ? post.content.replace(STRIP_HTML_REGEX, "") : "";
    const isLongContent = rawContent.length > MAX_LENGTH;
    const summaryText = isLongContent ? rawContent.substring(0, MAX_LENGTH) + "..." : rawContent;

    // --- EFFECT: Kaydedilme Durumu Kontrolü ---
    useEffect(() => {
        let isMounted = true
        const checkStatus = async () => {
            if (!currentUser?.id || !post?.id) return
            try {
                const mySavedPosts = await getSavedPostsByUser(currentUser.id)
                if (!isMounted) return
                const found = mySavedPosts.find((item) => String(item.postId) === String(post.id))

                if (found) {
                    setIsSaved(true)
                    setSavedPostId(found.id)
                } else {
                    setIsSaved(false)
                    setSavedPostId(null)
                }
            } catch (e) {
                console.error("Kaydedilen kontrol hatası:", e)
            }
        }
        checkStatus()
        return () => { isMounted = false }
    }, [currentUser?.id, post?.id])

    // --- ACTIONS ---

    const handleDelete = async () => {
        if(!confirm("Bu gönderiyi silmek istediğine emin misin?")) return;
        try {
            await deletePost(post.id);
            toast.success("Gönderi silindi 👋");
            window.location.reload();
        } catch (error) {
            toast.error("Hata oluştu");
        }
    }

    const handleEditClick = () => {
        if (post.type === "QUOTE_POST") {
            router.push(`/create-post/quote/edit/${post.id}`);
        } else if (post.type === "BLOG_POST") {
            router.push(`/create-post/blog/edit/${post.id}`);
        } else {
            setIsEditing(true);
        }
    }

    const handleInlineUpdate = async () => {
        if (!editContent.trim()) {
            toast.error("İçerik boş olamaz")
            return
        }
        try {
            setIsUpdating(true)
            await updatePost(post.id, {
                content: editContent,
                userId: post.userId,
                type: post.type,
                title: post.title,
            })
            toast.success("Güncellendi ✅")
            setIsEditing(false)
            window.location.reload()
        } catch {
            toast.error("Güncellenemedi")
        } finally {
            setIsUpdating(false)
        }
    }

    const handleLike = (e) => {
        e.preventDefault()
        e.stopPropagation()
        dispatch(toggleLike({ postId: post?.id, userId: currentUser?.id }))
    }

    const handleSave = async (e) => {
        e.preventDefault()
        e.stopPropagation()
  const handleSave = async (e) => {
    e.preventDefault()
    e.stopPropagation()

        if (!currentUser?.id) {
            toast.error("Lütfen giriş yapın.")
            return
        }
        if (saveLoading) return

        const previousState = isSaved
        setIsSaved(!previousState)
        setSaveLoading(true)

        try {
            if (!previousState) {
                const result = await savePost({ userId: currentUser.id, postId: post.id })
                if (result?.id) setSavedPostId(result.id)
                toast.success("Kaydedildi")
            } else {
                let idToDelete = savedPostId
                if (!idToDelete) {
                    const mySaved = await getSavedPostsByUser(currentUser.id)
                    const found = mySaved.find((item) => String(item.postId) === String(post.id))
                    if (found) idToDelete = found.id
                }
                if (idToDelete) {
                    await unsavePost(idToDelete)
                    setSavedPostId(null)
                    toast.success("Kayıt kaldırıldı")
                }
            }
        } catch (error) {
            console.error(error)
            setIsSaved(previousState)
            toast.error("İşlem başarısız")
        } finally {
            setSaveLoading(false)
        }
    }
    try {
      if (!previousState) {
        // ✔️ KAYDET
        const result = await savePost({
          userId: currentUser.id,
          postId: post.id,
        })

        if (result?.id) {
          setSavedPostId(result.id)
        }

        toast.success("Kaydedildi")
      } else {
        // ✔️ KAYITTAN ÇIKAR
        let idToDelete = savedPostId

        // Eğer ID henüz elimizde yoksa (ilk render'da parent'tan sadece boolean geldiği için),
        // silmeden hemen önce sorgulayıp ID'yi buluyoruz. Bu "Lazy Load" yöntemidir.
        if (!idToDelete) {
          const mySaved = await getSavedPostsByUser(currentUser.id)
          const found = mySaved.find(
              (item) => String(item.postId) === String(post.id)
          )
          if (found) idToDelete = found.id
        }

        if (idToDelete) {
          await unsavePost(idToDelete)
          setSavedPostId(null)
          toast.success("Kayıt kaldırıldı")
        }
      }
    } catch (error) {
      console.error(error)
      setIsSaved(previousState)
      toast.error("İşlem başarısız")
    } finally {
      setSaveLoading(false)
    }
  }

    const goToDetail = (e) => {
        e.stopPropagation()
        router.push(`/post/${post?.id}`)
    }

    return (
        <Card className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 mb-6 group">

            {/* --- HEADER --- */}
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
                            <Link
                                href={`/profile/${username}`}
                                className="font-bold text-gray-900 hover:underline text-sm"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {fullName}
                            </Link>
                            <p className="text-xs text-gray-500">
                                @{username} · {timeAgo}
                            </p>
                        </div>
                    </div>

                    {showMenu && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleEditClick} className="cursor-pointer">
                                    <Edit className="mr-2 h-4 w-4" /> Düzenle
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDelete} className="text-red-600 cursor-pointer">
                                    <Trash2 className="mr-2 h-4 w-4" /> Sil
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>

            {/* --- CONTENT --- */}
            <CardContent className="px-5 py-2 space-y-4">

                {/* EDIT MODU */}
                {isEditing ? (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                        <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[100px] text-lg bg-gray-50 border-2 border-teal-500/20 focus:border-teal-500 transition-all"
                        />
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} disabled={isUpdating}>
                                <X className="h-4 w-4 mr-1" /> İptal
                            </Button>
                            <Button size="sm" onClick={handleInlineUpdate} disabled={isUpdating} className="bg-teal-700 hover:bg-teal-800 text-white">
                                {isUpdating ? "..." : <><Check className="h-4 w-4 mr-1" /> Kaydet</>}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* 1. BLOG POST */}
                        {post.type === "BLOG_POST" && (
                            <div
                                className="flex flex-col w-full cursor-pointer relative pl-4 border-l-4 border-teal-500/20 hover:border-teal-500 transition-colors duration-300 py-1"
                                onClick={goToDetail}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-8 w-8 flex items-center justify-center bg-teal-50 rounded-lg text-teal-700 shrink-0">
                                        <BookOpen size={18} />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-teal-700 transition-colors">
                                        {displayTitle || "Başlıksız Yazı"}
                                    </h2>
                                </div>

                      <p className="text-[15px] leading-relaxed text-gray-700 line-clamp-3">
                        {renderContentWithHashtags(post.content)}
                      </p>

                      <div className="flex gap-2 pt-2">
                        <Badge
                            variant="outline"
                            className="gap-1 border-gray-200 py-1 px-2 text-xs font-normal text-gray-500"
                        >
                          <Sparkles className="h-3 w-3" /> AI Analizi
                        </Badge>

                        <Badge
                            variant="outline"
                            className="gap-1 border-gray-200 py-1 px-2 text-xs font-normal text-gray-500"
                        >
                          <Languages className="h-3 w-3" /> Çevir
                        </Badge>
                      </div>
                    </div>
                ) : post.type === "THOUGHT_POST" ? (
                    <div className="px-2 py-4 text-center">
                      <p className="text-xl font-medium italic leading-relaxed text-gray-800">
                        "{post.content}"
                      </p>
                    </div>
                ) : (
                    <p className="whitespace-pre-wrap leading-relaxed text-gray-800">
                      {post.content}
                    </p>
                )}

                {hasTags && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                          <Badge
                              key={tag}
                              variant="outline"
                              className="border-blue-200 bg-blue-50 text-xs font-medium text-blue-700"
                          >
                            #{tag}
                          </Badge>
                      ))}
                    </div>
                )}
              </>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-gray-50 px-5 py-3 text-gray-500">
          <div className="flex items-center gap-4">
            <button
                className="flex items-center gap-1.5 transition hover:text-red-500"
                onClick={handleLike}
            >
              <Heart className={cn("h-5 w-5", isLiked && "fill-red-500 text-red-500")} />
              <span className="text-xs font-medium">{post.likeCount || 0}</span>
            </button>

            <button
                className="flex cursor-pointer items-center gap-1.5 transition hover:text-blue-500"
                onClick={goToDetail}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs font-medium">{post.commentCount || 0}</span>
            </button>

            <button
                className="flex items-center gap-1.5 transition hover:text-green-500"
                onClick={(e) => {
                  e.stopPropagation()
                  toast.success("Link kopyalandı")
                }}
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          <button
              onClick={handleSave}
              disabled={saveLoading}
              className="p-1 transition-colors hover:text-orange-500"
          >
            <Bookmark
                className={cn(
                    "h-5 w-5",
                    isSaved ? "fill-orange-500 text-orange-500" : "text-gray-500"
                )}
            />
          </button>
        </CardFooter>
      </Card>
  )
}
