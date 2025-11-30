"use client"

import { useState, useEffect } from "react"
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

    // --- STATE ---
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(post?.content || "")
    const [isUpdating, setIsUpdating] = useState(false)

    // Kaydetme State'leri
    const [isSaved, setIsSaved] = useState(false)
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

                                <p className="text-gray-600 text-base leading-relaxed line-clamp-3 mb-2 font-normal">
                                    {summaryText}
                                </p>

                                {isLongContent && (
                                    <div className="flex items-center gap-1 text-sm font-medium text-teal-600 mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                        Devamını oku <ArrowRight size={14} />
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2 mt-2 flex-wrap">
                                    {postTags.length > 0 && postTags.map((tag, i) => (
                                        <Badge key={i} variant="secondary" className="bg-gray-100 text-gray-600 font-normal hover:bg-gray-200 px-2 py-0.5 text-xs border border-gray-200">
                                            #{tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 2. QUOTE POST */}
                        {post.type === "QUOTE_POST" && (
                            <div className="mt-1" onClick={goToDetail}>
                                {displayTitle && <h3 className="text-lg font-bold text-gray-900 mb-2 px-1">{displayTitle}</h3>}
                                <div className="relative bg-[#EFEFEF] rounded-xl flex min-h-[120px] cursor-pointer hover:opacity-95 transition-opacity">
                                    <div className="py-6 pl-6 pr-0 shrink-0"><div className="w-1.5 h-full bg-black rounded-full"></div></div>
                                    <div className="flex-1 py-6 pr-6 pl-4 relative flex flex-col justify-center">
                                        <Quote className="absolute top-4 left-2 h-8 w-8 text-gray-300 fill-gray-300 transform -scale-x-100 opacity-60 z-0" />
                                        <p className="relative z-10 font-serif text-xl text-gray-800 leading-relaxed">"{quoteContent}"</p>
                                        <div className="mt-3 text-right w-full"><span className="text-sm text-gray-500 font-medium">— Sayfa {quotePage || "?"}</span></div>
                                    </div>
                                </div>
                                <div className="mt-4 bg-[#F8F9FA] rounded-xl p-3 flex gap-4 items-center border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className="shrink-0 shadow-sm">
                                        {post.image ? <img src={post.image} alt="Kitap" className="h-24 w-16 object-cover rounded" /> :
                                            <div className="h-24 w-16 bg-gradient-to-br from-orange-100 to-orange-200 border border-orange-200 rounded flex flex-col items-center justify-center p-1 text-center"><span className="font-bold text-[9px] text-orange-800 leading-tight line-clamp-2">{bookName || "Bilinmeyen Kitap"}</span></div>}
                                    </div>
                                    <div className="flex flex-col gap-1.5 flex-1">
                                        <div><h4 className="font-bold text-gray-900 text-base leading-tight">{bookName || "Bilinmeyen Kitap"}</h4><span className="text-sm text-gray-500 font-medium block mt-0.5">{authorName || "Yazar Bilgisi Yok"}</span></div>
                                        <div className="flex gap-2"><Badge variant="secondary" className="text-[10px] bg-white text-gray-600 border border-gray-200 font-normal px-2">Alıntı</Badge></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. DİĞER (THOUGHT) POST */}
                        {post.type !== "QUOTE_POST" && post.type !== "BLOG_POST" && (
                            <>
                                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg">
                                    {renderContentWithHashtags(post.content)}
                                </p>
                                {postTags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {postTags.map((tag, i) => (
                                            <Badge key={i} variant="secondary" className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium text-xs border-transparent">#{tag}</Badge>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </CardContent>

            {/* --- FOOTER --- */}
            {!isEditing && (
                <CardFooter className="px-5 py-4 border-t border-gray-50 flex items-center justify-between text-gray-500 bg-gray-50/30">
                    <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 hover:text-red-500 transition" onClick={handleLike}>
                            <Heart className={cn("h-5 w-5", isLiked && "fill-red-500 text-red-500")} /> <span className="text-sm font-medium">{post.likeCount || 0}</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-blue-500 transition" onClick={goToDetail}>
                            <MessageCircle className="h-5 w-5" /> <span className="text-sm font-medium">{post.commentCount || 0}</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-green-500 transition" onClick={(e) => { e.stopPropagation(); toast.success("Link kopyalandı"); }}>
                            <Share2 className="h-5 w-5" />
                        </button>
                    </div>
                    <button onClick={handleSave}>
                        <Bookmark className={cn("h-5 w-5", isSaved && "fill-orange-500 text-orange-500")} />
                    </button>
                </CardFooter>
            )}
        </Card>
    )
}