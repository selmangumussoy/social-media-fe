"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { toggleLike, toggleSave } from "@/store/slices/postSlice"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
    Heart, MessageCircle, Bookmark, Share2, ArrowLeft,
    Quote, ExternalLink, Send
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import Link from "next/link"
import toast from "react-hot-toast"
import { getPostById } from "@/services/postService"
import { getQuotePostById } from "@/services/quotePostService"
import { getBlogPostById } from "@/services/blogPostService"
import { cn } from "@/lib/utils"
import { getCommentsByPostId, createComment, updateComment, deleteComment } from "@/services/commentService";
import PostHeader from '@/components/PostHeader';
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PostDetailPage() {
    const router = useRouter()
    const dispatch = useDispatch()
    const params = useParams()
    const postId = params.id

    const currentUser = useSelector((state) => state.user.currentUser)
    const savedPosts = useSelector((state) => state.posts.savedPosts)

    const [post, setPost] = useState(null)
    const [detail, setDetail] = useState(null)
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [isFollowing, setIsFollowing] = useState(false)

    // Yorum State'leri
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Veri Çekme
    useEffect(() => {
        async function fetchData() {
            if (!postId) return;
            try {
                setLoading(true);
                const postData = await getPostById(postId);
                setPost(postData);

                if (postData) {
                    if (postData.type === "QUOTE_POST") {
                        const quoteData = await getQuotePostById(postId);
                        setDetail(quoteData);
                    } else if (postData.type === "BLOG_POST") {
                        const blogData = await getBlogPostById(postId);
                        setDetail(blogData);
                    }
                    // Yorumları Çek
                    const fetchedComments = await getCommentsByPostId(postId);
                    setComments(fetchedComments);
                }
            } catch (error) {
                console.error(error);
                toast.error("İçerik yüklenemedi");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [postId]);

    // Yorum Gönderme
    const handleSubmitComment = async () => {
        if (!newComment.trim() || !currentUser?.id) {
            toast.error("Lütfen bir yorum yazın veya giriş yapın.");
            return;
        }

        try {
            setIsSubmitting(true);
            const commentData = {
                postId: postId,
                content: newComment,
            };

            const createdCommentResponse = await createComment(commentData);
            toast.success("Yorum başarıyla eklendi!");

            setComments(prev => [
                {
                    ...createdCommentResponse,
                    userFullName: currentUser.fullName || currentUser.username,
                    userPicture: currentUser.avatar,
                    createdAt: new Date().toISOString()
                },
                ...(Array.isArray(prev) ? prev : [])
            ]);

            setNewComment("");
            setPost(prevPost => ({...prevPost, commentCount: (prevPost.commentCount || 0) + 1}));

        } catch (error) {
            console.error("Yorum gönderme başarısız:", error);
            toast.error("Yorum gönderme başarısız.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 🔥 YENİ: Yorum Silme İşlevi
    const handleDeleteComment = async (commentId) => {
        if (!confirm("Bu yorumu silmek istediğine emin misin?")) return;

        const success = await deleteComment(commentId);
        if (success) {
            toast.success("Yorum silindi.");

            // 1. UI'dan yorumu kaldır
            setComments((prev) => prev.filter((c) => c.id !== commentId));

            // 2. Yorum sayısını azalt (Güvenli Hesaplama)
            setPost((prev) => ({
                ...prev,
                // 👇 EĞER prev.commentCount null ise 0 kabul et, sonra 1 çıkar.
                commentCount: Math.max(0, (prev.commentCount || 0) - 1)
            }));
        } else {
            toast.error("Yorum silinemedi.");
        }
    };

    // 🔥 YENİ: Yorum Güncelleme İşlevi
    const handleUpdateComment = async (commentId, newContent) => {
        try {
            await updateComment(commentId, newContent);
            toast.success("Yorum güncellendi.");

            // UI'da anlık güncelle
            setComments((prev) => prev.map((c) =>
                c.id === commentId ? { ...c, content: newContent } : c
            ));
            return true; // Başarılı olduğunu bildir
        } catch (error) {
            toast.error("Yorum güncellenemedi.");
            return false;
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
    if (!post) return <div className="flex justify-center pt-20 text-muted-foreground">Gönderi bulunamadı.</div>;

    // Değişkenler
    const username = post.username || post.author?.username || "Kullanıcı";
    const fullName = post.fullName || post.author?.name || "İsimsiz";
    const avatarUrl = post.author?.avatar;
    const isLiked = (post.likes || []).includes(currentUser?.id);
    const isSaved = savedPosts.includes(post.id);

    let timeAgo = "";
    try { timeAgo = formatDistanceToNow(new Date(post.created), { addSuffix: true, locale: tr }); } catch (e) {}

    const handleLike = () => dispatch(toggleLike({ postId: post.id, userId: currentUser?.id }));
    const handleSave = () => dispatch(toggleSave(post.id));
    const handleFollow = () => { setIsFollowing(!isFollowing); toast.success(isFollowing ? "Takipten çıkıldı" : "Takip edildi!"); }

    const bookName = detail?.bookName || post.bookTitle;
    const authorName = detail?.author || post.bookAuthor;
    const coverImage = detail?.image || post.image;
    const quoteContent = detail?.thought || post.content;
    const pageNo = detail?.quotePage || detail?.quotePost?.quotePage;
    const videoUrl = detail?.video || post.video || post.videoUrl || post.media;

    // --- RENDER ---

    // SENARYO 1: QUOTE POST
    if (post.type === "QUOTE_POST") {
        return (
            <div className="min-h-screen bg-[#F9F9F9] py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <Button variant="ghost" size="sm" className="mb-4 text-gray-500 hover:text-gray-900 pl-0" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Geri Dön
                    </Button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="p-6 sm:p-8 border border-gray-100 shadow-sm rounded-2xl bg-white">
                                <PostHeader username={username} fullName={fullName} avatarUrl={avatarUrl} timeAgo={timeAgo} isFollowing={isFollowing} handleFollow={handleFollow} currentUserId={currentUser?.id} postUserId={post.userId} />
                                <div className="bg-[#FAFAFA] rounded-2xl p-8 md:p-10 relative mb-6 border border-gray-100">
                                    <Quote className="h-10 w-10 text-gray-300 mb-4 transform -scale-x-100 opacity-50" />
                                    <p className="font-serif text-2xl md:text-3xl text-gray-800 leading-relaxed mb-6">"{quoteContent}"</p>
                                    {pageNo && <div className="text-right"><span className="text-sm text-gray-500 font-medium">— Sayfa {pageNo}</span></div>}
                                </div>
                                <PostActions isLiked={isLiked} isSaved={isSaved} likeCount={post.likeCount} handleLike={handleLike} handleSave={handleSave} />
                            </Card>

                            <div className="mt-8">
                                <h3 className="font-bold text-lg text-gray-900 mb-4">Yanıtlar ({post.commentCount})</h3>
                                {/* 👇 PROPLAR BURAYA EKLENDİ */}
                                <CommentSectionDynamic
                                    comments={comments}
                                    newComment={newComment}
                                    setNewComment={setNewComment}
                                    handleSubmitComment={handleSubmitComment}
                                    isSubmitting={isSubmitting}
                                    currentUser={currentUser}
                                    onDelete={handleDeleteComment}
                                    onUpdate={handleUpdateComment}
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-1 space-y-6">
                            <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl bg-white sticky top-24">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-32 h-48 mb-5 shadow-lg rounded-md overflow-hidden relative border border-gray-100 group">
                                        {coverImage ? <img src={coverImage} alt={bookName} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-orange-50 flex items-center justify-center text-xs font-bold text-orange-800">{bookName || "Kitap"}</div>}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1 leading-tight">{bookName}</h2>
                                    <p className="text-gray-500 text-sm mb-4 font-medium">{authorName}</p>
                                    <Button className="w-full bg-black hover:bg-gray-800 text-white gap-2 rounded-lg text-sm h-10"><ExternalLink size={14} /> Kitabı İncele</Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // SENARYO 2: COMPLEX BLOG POST
    const hasImage = detail?.image || (detail?.blogContent && detail.blogContent.includes("<img")) || (post.content && post.content.includes("http"));
    const isLongContent = (post.content?.length > 500) || (detail?.blogContent?.length > 800);
    const useSplitLayout = post.type === "BLOG_POST" && (hasImage || isLongContent || videoUrl);

    if (useSplitLayout) {
        return (
            <div className="min-h-screen bg-[#F9F9F9] py-8 px-4">
                <div className="max-w-[1400px] mx-auto">
                    <Button variant="ghost" size="sm" className="mb-4 text-gray-500 hover:text-gray-900 pl-0" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Geri Dön
                    </Button>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-8">
                            <Card className="border border-gray-200 shadow-sm rounded-2xl bg-white overflow-hidden p-8 sm:p-10">
                                <PostHeader username={username} fullName={fullName} avatarUrl={avatarUrl} timeAgo={timeAgo} isFollowing={isFollowing} handleFollow={handleFollow} currentUserId={currentUser?.id} postUserId={post.userId} />
                                <div className="prose prose-lg max-w-none text-gray-800 leading-loose mb-8">
                                    {detail?.blogContent ? <div dangerouslySetInnerHTML={{ __html: detail.blogContent }} /> : <p className="whitespace-pre-wrap">{post.content}</p>}
                                </div>
                                {videoUrl && (
                                    <div className="mb-8 rounded-xl overflow-hidden bg-black shadow-sm">
                                        <video controls className="w-full max-h-[500px] mx-auto">
                                            <source src={videoUrl} type="video/mp4" />
                                            Tarayıcınız video etiketini desteklemiyor.
                                        </video>
                                    </div>
                                )}
                                {post.tags && <div className="flex flex-wrap gap-2 mb-8">{post.tags.map((tag, i) => <Badge key={i} variant="secondary" className="px-3 py-1 bg-gray-100 text-gray-600">#{tag}</Badge>)}</div>}
                                <PostActions isLiked={isLiked} isSaved={isSaved} likeCount={post.likeCount} handleLike={handleLike} handleSave={handleSave} />
                            </Card>
                        </div>

                        <div className="lg:col-span-4 relative">
                            <div className="sticky top-6">
                                <Card className="flex flex-col border border-gray-200 shadow-sm rounded-2xl bg-white overflow-hidden max-h-[calc(100vh-80px)]">
                                    <div className="p-4 border-b border-gray-100 bg-white z-10 shrink-0"><h3 className="font-bold text-gray-900">Yanıtlar ({post.commentCount})</h3></div>
                                    <div className="overflow-y-auto p-4 space-y-5 bg-[#fafafa]">
                                        {/* 👇 SENARYO 2 İÇİN MANUEL PROPLARI COMMENTITEM'A İLETİYORUZ */}
                                        {comments.length > 0 ? comments.map((comment) => (
                                            <CommentItem
                                                key={comment.id}
                                                comment={comment}
                                                currentUser={currentUser} // 👈 Eklendi
                                                onDelete={handleDeleteComment} // 👈 Eklendi
                                                onUpdate={handleUpdateComment} // 👈 Eklendi
                                            />
                                        )) : <div className="flex flex-col items-center justify-center py-8 text-gray-400 text-sm"><MessageCircle className="h-8 w-8 mb-2 opacity-20" />Henüz yorum yok.</div>}
                                    </div>
                                    <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                                        <CommentInput
                                            avatar={currentUser?.avatar}
                                            name={currentUser?.fullName || currentUser?.username}
                                            newComment={newComment}
                                            setNewComment={setNewComment}
                                            handleSubmitComment={handleSubmitComment}
                                            isSubmitting={isSubmitting}
                                        />
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // SENARYO 3: THOUGHT POST & KISA BLOG
    return (
        <div className="min-h-screen bg-[#F9F9F9] py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <Button variant="ghost" size="sm" className="mb-4 text-gray-500 hover:text-gray-900 pl-0" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Geri Dön
                </Button>

                <Card className="border border-gray-200 shadow-sm rounded-2xl bg-white overflow-hidden p-8 mb-8">
                    <PostHeader username={username} fullName={fullName} avatarUrl={avatarUrl} timeAgo={timeAgo} isFollowing={isFollowing} handleFollow={handleFollow} currentUserId={currentUser?.id} postUserId={post.userId} />
                    <div className="text-xl sm:text-2xl text-gray-800 leading-relaxed mb-6 font-medium whitespace-pre-wrap">{post.content}</div>
                    {videoUrl && (
                        <div className="mb-6 mt-4 rounded-xl overflow-hidden bg-black shadow-sm border border-gray-100">
                            <video controls className="w-full max-h-[500px] mx-auto" key={videoUrl}>
                                <source src={videoUrl} type="video/mp4" />
                                Tarayıcınız video etiketini desteklemiyor.
                            </video>
                        </div>
                    )}
                    <PostActions isLiked={isLiked} isSaved={isSaved} likeCount={post.likeCount} handleLike={handleLike} handleSave={handleSave} />
                </Card>

                <div className="mb-4"><h3 className="font-bold text-lg text-gray-900">Yanıtlar ({post.commentCount})</h3></div>
                {/* 👇 PROPLAR BURAYA EKLENDİ */}
                <CommentSectionDynamic
                    comments={comments}
                    newComment={newComment}
                    setNewComment={setNewComment}
                    handleSubmitComment={handleSubmitComment}
                    isSubmitting={isSubmitting}
                    currentUser={currentUser}
                    onDelete={handleDeleteComment}
                    onUpdate={handleUpdateComment}
                />
            </div>
        </div>
    );
}

// --- YARDIMCI BİLEŞENLER ---

function PostActions({ isLiked, isSaved, likeCount, handleLike, handleSave }) {
    return (
        <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-4">
            <div className="flex gap-6">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 transition group ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                >
                    <Heart className={`h-6 w-6 group-hover:scale-110 transition-transform ${isLiked ? "fill-red-500" : ""}`} />
                    <span className="font-medium">{likeCount || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition group">
                    <Share2 className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </button>
            </div>
            <button onClick={handleSave} className={`transition ${isSaved ? 'text-black' : 'text-gray-500 hover:text-black'}`}>
                <Bookmark className={`h-6 w-6 ${isSaved ? "fill-black" : ""}`} />
            </button>
        </div>
    )
}

function CommentSectionDynamic({ comments, newComment, setNewComment, handleSubmitComment, isSubmitting, currentUser, onDelete, onUpdate }) {
    return (
        <div className="space-y-6">
            <Card className="p-4 border border-gray-200 shadow-sm rounded-2xl bg-white">
                <Textarea
                    placeholder="Düşüncelerini paylaş..."
                    className="border-none resize-none focus-visible:ring-0 min-h-[60px] text-base bg-transparent p-1"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex justify-end mt-2 pt-2 border-t border-gray-100">
                    <Button
                        className="bg-[#343a40] hover:bg-black text-white h-8 text-xs px-5 rounded-md font-medium"
                        onClick={handleSubmitComment}
                        disabled={isSubmitting || !newComment?.trim()}
                    >
                        {isSubmitting ? 'Gönderiliyor...' : 'Yanıtla'}
                    </Button>
                </div>
            </Card>

            <div className="space-y-4">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            currentUser={currentUser} // 🔐 PROP GEÇİRİLDİ
                            onDelete={onDelete}       // 🗑️ PROP GEÇİRİLDİ
                            onUpdate={onUpdate}       // ✏️ PROP GEÇİRİLDİ
                        />
                    ))
                ) : (
                    <div className="text-center py-6">
                        <p className="text-gray-400 text-sm">İlk yorumu sen yap.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

// 🔥🔥 3 NOKTA MENÜLÜ GÜNCELLENMİŞ COMMENTITEM 🔥🔥
function CommentItem({ comment, currentUser, onDelete, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content);

    const userFullName = comment.userFullName || comment.username || "Anonim";
    const avatar = comment.userPicture;

    // 🔐 GÜVENLİ KIYASLAMA
    const isOwner = currentUser?.id && (String(currentUser.id) === String(comment.userId));

    const handleSave = async () => {
        if (!editText.trim() || editText === comment.content) {
            setIsEditing(false);
            return;
        }
        const success = await onUpdate(comment.id, editText);
        if (success) setIsEditing(false);
    };

    let timeAgo = "";
    try {
        timeAgo = formatDistanceToNow(new Date(comment.created || comment.createdAt), { addSuffix: true, locale: tr });
    } catch (e) { timeAgo = ""; }

    return (
        <div className="flex gap-3 items-start group w-full">
            <Link href={`/profile/${comment.username}`}>
                <Avatar className="h-9 w-9 mt-1 border border-white shadow-sm cursor-pointer">
                    <AvatarImage src={avatar} />
                    <AvatarFallback>{userFullName.charAt(0)}</AvatarFallback>
                </Avatar>
            </Link>

            <div className="flex-1">
                {/* Header Alanı: İsim + Tarih + Menü */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col w-full">
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold text-sm text-gray-900">{userFullName}</span>
                            <span className="text-[10px] text-gray-400">{timeAgo}</span>
                        </div>

                        {isEditing ? (
                            <div className="mt-2 w-full">
                                <Textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="min-h-[60px] text-sm mb-2 bg-white w-full"
                                />
                                <div className="flex gap-2 justify-end">
                                    <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setEditText(comment.content); }} className="h-7 text-xs">İptal</Button>
                                    <Button size="sm" onClick={handleSave} className="h-7 text-xs bg-black hover:bg-gray-800">Kaydet</Button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-700 leading-relaxed mt-1 whitespace-pre-wrap break-words">{comment.content}</p>
                        )}
                    </div>

                    {/* 🔥 3 NOKTA MENÜSÜ (Sadece Sahibi ve Edit Modunda Değilse) */}
                    {isOwner && !isEditing && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors focus:outline-none">
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32 bg-white shadow-md border-gray-100">
                                <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer text-gray-700 hover:bg-gray-50 text-xs">
                                    <Pencil className="mr-2 h-3 w-3" />
                                    Düzenle
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDelete(comment.id)} className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 text-xs focus:bg-red-50 focus:text-red-700">
                                    <Trash2 className="mr-2 h-3 w-3" />
                                    Sil
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Alt Aksiyon Butonları (Beğen/Yanıtla) - Edit Modunda Gizlenir */}
                {!isEditing && (
                    <div className="flex gap-4 mt-2 items-center">
                        <button className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
                            <Heart className="w-3 h-3" /> Beğen
                        </button>
                        <button className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
                            Yanıtla
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

function CommentInput({ avatar, name, newComment, setNewComment, handleSubmitComment, isSubmitting }) {
    // İsim varsa baş harfini al, yoksa 'U' (User) göster
    const initial = name ? name.charAt(0).toUpperCase() : "U";

    return (
        <div className="flex gap-2 items-end bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:ring-1 focus-within:ring-gray-300 transition-all">
            <Avatar className="h-8 w-8 mb-1 ml-1">
                <AvatarImage src={avatar} />
                {/* 👇 Burası artık dinamik */}
                <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <Textarea
                placeholder="Bir yanıt yaz..."
                className="flex-1 min-h-[40px] max-h-[120px] bg-transparent border-none resize-none focus-visible:ring-0 p-2 text-sm placeholder:text-gray-400"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
            />
            <Button
                size="icon"
                className="h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-700 mb-1 mr-1 shrink-0"
                onClick={handleSubmitComment}
                disabled={isSubmitting || !newComment?.trim()}
            >
                <Send className="h-4 w-4 text-white" />
            </Button>
        </div>
    )
}
