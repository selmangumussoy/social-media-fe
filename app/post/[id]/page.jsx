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
  Quote, ExternalLink
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import Link from "next/link"
import toast from "react-hot-toast"
import { getPostById } from "@/services/postService"
import { getQuotePostById } from "@/services/quotePostService"
import { getBlogPostById } from "@/services/blogPostService"
import { cn } from "@/lib/utils"

export default function PostDetailPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const params = useParams()
  const postId = params.id

  const currentUser = useSelector((state) => state.user.currentUser)
  const savedPosts = useSelector((state) => state.posts.savedPosts)

  const [post, setPost] = useState(null)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)

  // Verileri Çekme
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

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E8E86]"></div></div>;
  if (!post) return <div className="flex justify-center pt-20 text-muted-foreground">Gönderi bulunamadı.</div>;

  // --- Değişkenler ---
  const username = post.username || post.author?.username || "anonim";
  const fullName = post.fullName || post.author?.name || "Bilinmeyen Kullanıcı";
  const avatarUrl = post.author?.avatar || "/placeholder.svg";
  const isLiked = (post.likes || []).includes(currentUser?.id);
  const isSaved = savedPosts.includes(post.id);

  let timeAgo = "";
  try { timeAgo = formatDistanceToNow(new Date(post.created), { addSuffix: true, locale: tr }); } catch (e) {}

  // Detay Verileri
  const quoteContent = detail?.thought || post.content;
  const bookName = detail?.bookName || post.bookTitle || "Bilinmeyen Kitap";
  const authorName = detail?.author || post.bookAuthor || "Yazar Yok";
  const pageNo = detail?.quotePage || detail?.quotePost?.quotePage;
  const coverImage = detail?.image || post.image;

  const handleLike = () => dispatch(toggleLike({ postId: post.id, userId: currentUser?.id }));
  const handleSave = () => dispatch(toggleSave(post.id));
  const handleFollow = () => { setIsFollowing(!isFollowing); toast.success(isFollowing ? "Takipten çıkıldı" : "Takip edildi!"); }

  return (
      <div className="min-h-screen bg-[#F9F9F9] py-8 px-4">
        <div className="max-w-6xl mx-auto">

          <Button variant="ghost" size="sm" className="mb-4 text-gray-500 hover:text-gray-900 pl-0" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Geri Dön
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ==========================================
              🟢 SOL KOLON: POST İÇERİĞİ
             ========================================== */}
            <div className="lg:col-span-2 space-y-6">

              <Card className="p-6 sm:p-8 border border-gray-100 shadow-sm rounded-2xl bg-white">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Link href={`/profile/${username}`}>
                      <Avatar className="h-12 w-12 border border-gray-100 cursor-pointer">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div>
                      <h4 className="font-bold text-gray-900 leading-tight hover:underline cursor-pointer">{fullName}</h4>
                      <p className="text-sm text-gray-500">@{username} · {timeAgo}</p>
                    </div>
                  </div>

                  {/* Takip Et Butonu (Sadece başkasıysa) */}
                  {currentUser?.id !== post.userId && (
                      <Button
                          size="sm"
                          className={`rounded-lg px-5 font-semibold h-9 text-xs ${isFollowing ? "bg-gray-100 text-black border border-gray-200 hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"}`}
                          onClick={handleFollow}
                      >
                        {isFollowing ? "Takip Ediliyor" : "Takip Et"}
                      </Button>
                  )}
                </div>

                {/* İÇERİK ALANI */}
                {post.type === "QUOTE_POST" ? (
                    // Gri Alıntı Kutusu
                    <div className="bg-[#FAFAFA] rounded-2xl p-8 md:p-10 relative mb-6 border border-gray-100">
                      <Quote className="h-10 w-10 text-gray-300 mb-4 transform -scale-x-100 opacity-50" />
                      <p className="font-serif text-2xl md:text-3xl text-gray-800 leading-relaxed mb-6">
                        "{quoteContent}"
                      </p>
                      {pageNo && (
                          <div className="text-right">
                            <span className="text-sm text-gray-500 font-medium">— Sayfa {pageNo}</span>
                          </div>
                      )}
                    </div>
                ) : (
                    // Blog İçeriği
                    <div className="prose prose-lg max-w-none mb-6 text-gray-800 leading-relaxed">
                      {detail?.blogContent ? (
                          <div dangerouslySetInnerHTML={{ __html: detail.blogContent }} />
                      ) : (
                          <p className="whitespace-pre-wrap">{post.content}</p>
                      )}
                    </div>
                )}

                {/* Etiketler */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {post.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium border-transparent rounded-md text-xs">
                            #{tag}
                          </Badge>
                      ))}
                    </div>
                )}

                {/* İstatistik Barı */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex gap-6">
                    <button onClick={handleLike} className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition group">
                      <Heart className={cn("h-5 w-5 group-hover:scale-110 transition-transform", isLiked && "fill-red-500 text-red-500")} />
                      <span className="text-sm font-medium">{post.likeCount}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition group">
                      <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">{post.commentCount}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition group">
                      <Share2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">234</span>
                    </button>
                  </div>
                  <button onClick={handleSave} className="text-gray-500 hover:text-black transition">
                    <Bookmark className={cn("h-5 w-5", isSaved && "fill-black text-black")} />
                  </button>
                </div>
              </Card>

              {/* Yorum Alanı */}
              <div className="mt-8">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Yanıtlar (2)</h3>

                {/* Yorum Yap */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
                  <Textarea
                      placeholder="Düşüncelerini paylaş..."
                      className="border-none resize-none focus-visible:ring-0 min-h-[80px] text-base bg-transparent placeholder:text-gray-400"
                  />
                  <div className="flex justify-end mt-2 pt-2 border-t border-gray-100">
                    <Button className="bg-gray-700 hover:bg-gray-900 text-white h-8 text-xs px-4 rounded-md font-medium">
                      Yanıtla
                    </Button>
                  </div>
                </div>

                {/* Örnek Yorum */}
                <div className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <Avatar className="h-9 w-9 mt-1 border border-gray-200"><AvatarImage src="/placeholder-user.jpg"/><AvatarFallback>AJ</AvatarFallback></Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-gray-900">Alex Johnson</span>
                        <span className="text-gray-400 text-xs">@alexj · 16 Oca</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">Bu kitap ve özellikle bu bölüm benim için dönüm noktasıydı. Raskolnikov'un iç çatışması çok gerçekçi.</p>
                      <div className="flex items-center gap-4 mt-2">
                        <button className="flex items-center gap-1 text-gray-400 hover:text-red-500 text-xs"><Heart className="h-3 w-3" /> 12</button>
                        <button className="flex items-center gap-1 text-gray-400 hover:text-blue-500 text-xs"><MessageCircle className="h-3 w-3" /> Yanıtla</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ==========================================
              🟠 SAĞ KOLON: KİTAP BİLGİSİ & DİĞER ALINTILAR
             ========================================== */}
            <div className="lg:col-span-1 space-y-6">

              {post.type === "QUOTE_POST" && (
                  <>
                    {/* 1. KİTAP KARTI */}
                    <Card className="p-6 border border-gray-100 shadow-sm rounded-2xl bg-white sticky top-24">
                      <div className="flex flex-col items-center text-center">

                        {/* Kitap Kapağı */}
                        <div className="w-32 h-48 mb-5 shadow-lg rounded-md overflow-hidden relative border border-gray-100 group">
                          {coverImage ? (
                              <img src={coverImage} alt={bookName} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          ) : (
                              <div className="w-full h-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center text-orange-800 font-bold p-2 text-xs text-center">
                                {bookName}
                              </div>
                          )}
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mb-1 leading-tight">{bookName}</h2>
                        <p className="text-gray-500 text-sm mb-4 font-medium">{authorName}</p>

                        {/* Türler (Statik) */}
                        <div className="flex flex-wrap justify-center gap-2 mb-5">
                          <Badge variant="secondary" className="text-[10px] font-normal bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-0.5">Klasik</Badge>
                          <Badge variant="secondary" className="text-[10px] font-normal bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-0.5">Psikolojik</Badge>
                        </div>

                        {/* Açıklama */}
                        <p className="text-xs text-gray-500 text-left leading-relaxed mb-5 line-clamp-4 border-t border-b border-gray-50 py-3">
                          Raskolnikov adlı genç bir adamın işlediği cinayet ve bunun ardından yaşadığı psikolojik çöküşü anlatan dev eser.
                        </p>

                        {/* Meta */}
                        <div className="w-full text-left text-[11px] text-gray-400 mb-5 space-y-1.5">
                          <p><span className="font-medium text-gray-500">Yayın Yılı:</span> 1866</p>
                          <p><span className="font-medium text-gray-500">ISBN:</span> 978-0-14-044913-0</p>
                        </div>

                        <Button className="w-full bg-black hover:bg-gray-800 text-white gap-2 rounded-lg text-sm h-10 transition-colors">
                          <ExternalLink size={14} /> Kitabı İncele
                        </Button>
                      </div>
                    </Card>

                    {/* 2. DİĞER ALINTILAR KARTI */}
                    <Card className="p-5 border border-gray-100 shadow-sm rounded-2xl bg-white">
                      <h3 className="font-bold text-gray-900 mb-4 text-sm">Bu Kitaptan Diğer Alıntılar</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition group">
                          <p className="text-xs text-gray-700 italic mb-2 line-clamp-3 group-hover:text-gray-900">
                            "Gerçek özgürlük, hiçbir şeyden korkmamaktır."
                          </p>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-4 w-4"><AvatarFallback className="text-[8px]">A</AvatarFallback></Avatar>
                            <span className="text-[10px] text-gray-500">Ahmet Yıldız</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </>
              )}
            </div>

          </div>
        </div>
      </div>
  )
}