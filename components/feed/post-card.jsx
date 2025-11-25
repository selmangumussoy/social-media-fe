"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toggleLike, toggleSave } from "@/store/slices/postSlice"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, Quote, Edit, Trash2, Check, X, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import Link from "next/link"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { deletePost, updatePost } from "@/services/postService"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

const QuoteIcon = ({ className }) => (
    <svg fill="currentColor" viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
    </svg>
)

export function PostCard({ post }) {
    const dispatch = useDispatch()
    const router = useRouter()
    const currentUser = useSelector((state) => state.user.currentUser)
    const savedPosts = useSelector((state) => state.posts.savedPosts)

    // --- STATE'LER ---
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(post?.content || "")
    const [isUpdating, setIsUpdating] = useState(false)

    if (!post) return null;

    const username = post.username || post.author?.username || "anonim";
    const fullName = post.fullName || post.author?.name || post.author?.fullName || "Kullanıcı";
    const avatarUrl = post.author?.avatar || "/placeholder.svg";
    const isMyPost = currentUser?.id === post.userId || currentUser?.userId === post.userId;

    // --- VERİ AYIKLAMA ---
    const qp = post.quotePost || {};

    // Başlık
    const displayTitle = post.title || qp.title || null;

    // Kitap Bilgileri
    const bookName = qp.bookName || post.bookName || post.bookTitle || "Bilinmeyen Kitap";
    const authorName = qp.author || post.author || post.authorName || "Yazar Bilinmiyor";
    const quotePage = qp.quotePage || post.quotePage || qp.page || null;
    const quoteContent = qp.thought || post.thought || post.content || "";
    const publisher = qp.publisher || post.publisher || null;
    const postImage = qp.image || post.image || null;
    const postTags = post.tags || [];

    let timeAgo = "";
    try {
        const dateString = post.created || post.timestamp;
        if (dateString) timeAgo = formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: tr });
    } catch (e) { timeAgo = ""; }

    const isLiked = (post.likes || []).includes(currentUser?.id ?? -1)
    const isSaved = savedPosts.includes(post?.id)

    // --- SİLME ---
    const handleDelete = async () => {
        if(!confirm("Bu gönderiyi silmek istediğine emin misin?")) return;
        try { await deletePost(post.id); toast.success("Gönderi silindi 👋"); window.location.reload(); }
        catch (error) { toast.error("Hata oluştu"); }
    }

    // --- DÜZENLEME YÖNLENDİRMESİ ---
    const handleEditClick = () => {
        if (post.type === "QUOTE_POST") {
            router.push(`/create-post/quote/edit/${post.id}`);
        } else if (post.type === "BLOG_POST") {
            router.push(`/create-post/blog/edit/${post.id}`);
        } else {
            setIsEditing(true);
        }
    }

    // --- INLINE GÜNCELLEME (Düşünce Postları) ---
    const handleInlineUpdate = async () => {
        if (!editContent.trim()) return toast.error("İçerik boş olamaz");
        try {
            setIsUpdating(true);
            await updatePost(post.id, {
                content: editContent,
                title: post.title,
                type: post.type
            });
            toast.success("Güncellendi ✅");
            setIsEditing(false);
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error("Güncellenemedi");
        } finally {
            setIsUpdating(false);
        }
    }

    const handleLike = (e) => { e.preventDefault(); e.stopPropagation(); dispatch(toggleLike({ postId: post?.id, userId: currentUser?.id })); }
    const handleSave = (e) => { e.preventDefault(); e.stopPropagation(); dispatch(toggleSave(post.id)); }
    const goToDetail = (e) => { e.stopPropagation(); router.push(`/post/${post?.id}`); }

    return (
        <Card className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all mb-6">
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

                    {isMyPost && !isEditing && (
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

            <CardContent className="px-5 py-2 space-y-4">


                {post.type === "BLOG_POST" && (
                    <div className="flex flex-col w-full">
                        {/* Başlık Alanı: İkon + Başlık + Alt Çizgi */}
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
                            <span className="text-2xl">📖</span>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                                {displayTitle || "Başlık Yok"}
                            </h2>
                        </div>

                        {/* İçerik Alanı */}
                        <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap mb-4 font-normal">
                            {post.content}
                        </div>

                        {/* Etiketler (Çizginin altında) */}
                        {postTags.length > 0 && (
                            <div className="border-t border-gray-100 pt-3 flex flex-wrap gap-2">
                                {postTags.map((tag, i) => (
                                    <span key={i} className="text-sm text-gray-500 font-medium">#{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ========================================================= */}
                {/* 2. QUOTE POST (KİTAP ALINTISI) - AYNI KALDI (DOKUNULMADI) */}
                {/* ========================================================= */}
                {post.type === "QUOTE_POST" && (
                    <div className="mt-1">
                        {displayTitle && <h3 className="text-lg font-bold text-gray-900 mb-2 px-1">{displayTitle}</h3>}
                        <div className="relative bg-[#EFEFEF] rounded-xl flex min-h-[120px]">
                            <div className="py-6 pl-6 pr-0 shrink-0"><div className="w-1.5 h-full bg-black rounded-full"></div></div>
                            <div className="flex-1 py-6 pr-6 pl-4 relative flex flex-col justify-center">
                                <Quote className="absolute top-4 left-2 h-8 w-8 text-gray-300 fill-gray-300 transform -scale-x-100 opacity-60 z-0" />
                                <p className="relative z-10 font-serif text-xl text-gray-800 leading-relaxed">"{quoteContent}"</p>
                                <div className="mt-3 text-right w-full"><span className="text-sm text-gray-500 font-medium">— Sayfa {quotePage || "?"}</span></div>
                            </div>
                        </div>
                        <div className="mt-4 bg-[#F8F9FA] rounded-xl p-3 flex gap-4 items-center border border-gray-100">
                            <div className="shrink-0 shadow-sm">
                                {post.image ? <img src={post.image} alt="Kitap" className="h-24 w-16 object-cover rounded" /> :
                                    <div className="h-24 w-16 bg-gradient-to-br from-orange-100 to-orange-200 border border-orange-200 rounded flex flex-col items-center justify-center p-1 text-center"><span className="font-bold text-[9px] text-orange-800 leading-tight line-clamp-2">{bookName || "Bilinmeyen Kitap"}</span></div>}
                            </div>
                            <div className="flex flex-col gap-1.5 flex-1">
                                <div><h4 className="font-bold text-gray-900 text-base leading-tight">{bookName || "Bilinmeyen Kitap"}</h4><span className="text-sm text-gray-500 font-medium block mt-0.5">{authorName || "Yazar Bilgisi Yok"}</span></div>
                                <div className="flex gap-2"><Badge variant="secondary" className="text-[10px] bg-white text-gray-600 border border-gray-200 font-normal px-2">Distopya</Badge></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================= */}
                {/* 3. DİĞER POST TİPLERİ (NORMAL DÜŞÜNCE) - AYNI KALDI       */}
                {/* ========================================================= */}
                {post.type !== "QUOTE_POST" && post.type !== "BLOG_POST" && (
                    <>
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
                            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg">
                                {post.content}
                            </p>
                        )}

                        {!isEditing && postTags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {postTags.map((tag, i) => (
                                    <Badge key={i} variant="secondary" className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium text-xs border-transparent">#{tag}</Badge>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </CardContent>

            {!isEditing && (
                <CardFooter className="px-5 py-4 border-t border-gray-50 flex items-center justify-between text-gray-500">
                    <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 hover:text-red-500 transition" onClick={handleLike}>
                            <Heart className={cn("h-5 w-5", isLiked && "fill-red-500 text-red-500")} /> <span className="text-sm font-medium">{post.likeCount || 0}</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-blue-500 transition" onClick={goToDetail}>
                            <MessageCircle className="h-5 w-5" /> <span className="text-sm font-medium">{post.commentCount || 0}</span>
                        </button>
                        <Share2 className="h-5 w-5" />
                    </div>
                    <button onClick={handleSave}><Bookmark className={cn("h-5 w-5", isSaved && "fill-black text-black")} /></button>
                </CardFooter>
            )}
        </Card>
    )
}