"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation" // 👈 useParams eklendi
import { useDispatch, useSelector } from "react-redux"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Bookmark, Share2, ArrowLeft, Sparkles, Languages, UserPlus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import Link from "next/link"
import toast from "react-hot-toast"
import { getPostById } from "@/services/postService"
import { getBlogPostByPostId } from "@/services/blogPostService"
import { cn } from "@/lib/utils"

// 👇 Parametre prop'unu kaldırdık, hook ile alacağız
export default function PostDetailPage() {
  const router = useRouter()

  // 👇 ID'yi almak için en güvenli yöntem (Client Component için)
  const params = useParams()
  const postId = params.id

  const currentUser = useSelector((state) => state.user.currentUser)
  const savedPosts = useSelector((state) => state.posts.savedPosts)
  // Eğer ana sayfadan geliniyorsa Redux'taki veriyi de yedek olarak kullanabiliriz
  // const allPosts = useSelector((state) => state.posts.posts)

  const [post, setPost] = useState(null)
  const [blogDetail, setBlogDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState("")
  const [isFollowing, setIsFollowing] = useState(false)

  // Verileri Çekme
  useEffect(() => {
    async function fetchData() {
      // postId yoksa bekle
      if (!postId) return;

      try {
        setLoading(true);
        // 1. Ana Post Bilgisi
        const postData = await getPostById(postId);
        setPost(postData);

        // 2. Eğer Blog ise, Detaylı İçeriği Çek
        if (postData && postData.type === "BLOG_POST") {
          const detailData = await getBlogPostByPostId(postId);
          setBlogDetail(detailData);
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

  // Yükleniyor Durumu
  if (loading) return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E8E86]"></div>
      </div>
  );

  // Post Bulunamadı
  if (!post) return <div className="flex justify-center pt-20 text-muted-foreground">Gönderi bulunamadı.</div>;

  // Değişken Hazırlığı
  const username = post.username || post.author?.username || "anonim";
  const fullName = post.fullName || post.author?.name || "Bilinmeyen Kullanıcı";
  const avatarUrl = post.author?.avatar || "/placeholder.svg";
  const isLiked = (post.likes || []).includes(currentUser?.id);
  const isSaved = savedPosts.includes(post.id)

  // Tarih
  let timeAgo = "";
  try { timeAgo = formatDistanceToNow(new Date(post.created), { addSuffix: true, locale: tr }); } catch (e) {}

  // Aksiyonlar
  const handleFollow = () => { setIsFollowing(!isFollowing); toast.success(isFollowing ? "Takipten çıkıldı" : "Takip edildi!"); }
  const handleLike = () => { /* Dispatch toggleLike */ toast.success("Beğeni işlemi") }
  const handleSave = () => { /* Dispatch toggleSave */ toast.success("Kaydetme işlemi") }
  const handleShare = () => { navigator.clipboard.writeText(window.location.href); toast.success("Link kopyalandı!") }

  return (
      <div className="min-h-screen bg-[#F9F9F9] py-8 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Geri Dön Butonu */}
          <Button variant="ghost" size="sm" className="mb-4 gap-2 text-gray-500 hover:text-gray-900 pl-0" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> Geri Dön
          </Button>

          {/* ANA KART */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-8 md:p-10">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Link href={`/profile/${username}`}>
                  <Avatar className="h-12 w-12 border border-gray-100 cursor-pointer">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link href={`/profile/${username}`} className="font-bold text-gray-900 text-lg leading-tight hover:underline">
                    {fullName}
                  </Link>
                  <p className="text-gray-500 text-sm">@{username} · {timeAgo}</p>
                </div>
              </div>

              {currentUser?.id !== post.userId && (
                  <Button
                      variant={isFollowing ? "outline" : "default"}
                      className={`rounded-full px-6 font-semibold h-9 ${isFollowing ? "" : "bg-[#1E8E86] hover:bg-[#177a72] text-white"}`}
                      onClick={handleFollow}
                  >
                    {isFollowing ? "Takip Ediliyor" : "+ Takip Et"}
                  </Button>
              )}
            </div>

            {/* BAŞLIK */}
            {post.title && (
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
                  {post.title}
                </h1>
            )}

            {/* İÇERİK (HTML RENDER) */}
            <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed mb-8">
              {blogDetail?.blogContent ? (
                  <div dangerouslySetInnerHTML={{ __html: blogDetail.blogContent }} />
              ) : (
                  <p className="whitespace-pre-wrap text-xl italic text-center text-gray-600">{post.content}</p>
              )}
            </div>

            {/* BUTONLAR (Sadece Blog ise) */}
            {post.type === "BLOG_POST" && (
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <Button variant="outline" className="rounded-full gap-2 border-gray-200 text-gray-600 hover:bg-gray-50 h-9 text-sm">
                    <Sparkles size={16} /> AI Analizi
                  </Button>
                  <Button variant="outline" className="rounded-full gap-2 border-gray-200 text-gray-600 hover:bg-gray-50 h-9 text-sm">
                    <Languages size={16} /> Çevir
                  </Button>
                </div>
            )}

            {/* İSTATİSTİKLER */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-100 text-gray-500">
              <div className="flex gap-8">
                <button className="flex items-center gap-2 hover:text-red-500 transition" onClick={handleLike}>
                  <Heart className={cn("h-6 w-6", isLiked && "fill-red-500 text-red-500")} />
                  <span className="text-sm font-medium">{post.likeCount || 0}</span>
                </button>
                <button className="flex items-center gap-2 hover:text-blue-500 transition">
                  <MessageCircle className="h-6 w-6" /> <span className="text-sm font-medium">{post.commentCount || 0}</span>
                </button>
                <button className="flex items-center gap-2 hover:text-green-500 transition" onClick={handleShare}>
                  <Share2 className="h-6 w-6" />
                </button>
              </div>
              <button className="hover:text-gray-900 transition" onClick={handleSave}>
                <Bookmark className={cn("h-6 w-6", isSaved && "fill-current text-black")} />
              </button>
            </div>

          </div>

          {/* YORUMLAR (Statik Kısım) */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="font-bold text-gray-900 mb-6 text-lg">Yorumlar</h3>
            <div className="flex gap-4">
              <Avatar className="h-10 w-10 mt-1">
                <AvatarImage src={currentUser?.picture} />
                <AvatarFallback>{currentUser?.fullName?.charAt(0) || "B"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                    placeholder="Yorumunuzu yazın..."
                    className="bg-gray-50 border-gray-200 min-h-[100px] resize-none rounded-xl focus:ring-2 focus:ring-[#1E8E86] focus:border-transparent mb-3 p-4"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button className="bg-[#7ebcb1] hover:bg-[#6aa89d] text-white rounded-full font-bold px-6">
                    Yorum Yap
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
  )
}