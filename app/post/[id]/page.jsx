"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addComment, toggleLike, toggleSave } from "@/store/slices/postSlice"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Bookmark, Share2, Languages, Sparkles, UserPlus, ArrowLeft } from "lucide-react"
import { formatDate } from "@/utils/formatDate"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

import React from "react"

export default function PostDetailPage({ params }) {
  const router = useRouter()
  const dispatch = useDispatch()
  const currentUser = useSelector((state) => state.user.currentUser)
  const savedPosts = useSelector((state) => state.posts.savedPosts)
  const allPosts = useSelector((state) => state.posts.posts)

  const resolvedParams = React.use(Promise.resolve(params))

  const post = allPosts.find((p) => p.id === Number.parseInt(resolvedParams.id))

  const [commentText, setCommentText] = useState("")
  const [isFollowing, setIsFollowing] = useState(false)

  if (!post) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Gönderi bulunamadı</p>
        </div>
    )
  }

  const isLiked = post.likes.includes(currentUser?.id)
  const isSaved = savedPosts.includes(post.id)

  const handleLike = () => {
    dispatch(toggleLike({ postId: post.id, userId: currentUser?.id }))
    toast.success(isLiked ? "Beğeni kaldırıldı" : "Beğenildi!")
  }

  const handleSave = () => {
    dispatch(toggleSave(post.id))
    toast.success(isSaved ? "Kayıtlardan çıkarıldı" : "Kaydedildi!")
  }

  const handleShare = () => {
    toast.success("Link kopyalandı!")
  }

  const handleRepost = () => {
    toast.success("Gönderi yeniden paylaşıldı!")
  }

  const handleAddComment = () => {
    if (!commentText.trim()) return

    const newComment = {
      id: Date.now(),
      userId: currentUser?.id,
      username: currentUser?.username,
      avatar: currentUser?.avatar,
      text: commentText,
      timestamp: new Date().toISOString(),
    }
    dispatch(addComment({ postId: post.id, comment: newComment }))
    setCommentText("")
    toast.success("Yorum eklendi!")
  }

  const handleTranslate = () => {
    toast.success("Gönderi çevriliyor...")
  }

  const handleAIAnalysis = () => {
    toast.success("AI analizi başlatılıyor...")
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    toast.success(isFollowing ? "Takipten çıkıldı" : "Takip edildi!")
  }

  return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-6 p-6">
            {/* Left side - Post content */}
            <div className="flex-1 max-w-3xl">
              {/* Back button */}
              <Button variant="ghost" size="sm" className="mb-4 gap-2 rounded-full" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                Geri
              </Button>

              <div className="bg-white rounded-2xl shadow-soft border border-border/30 p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Link href={`/profile/${post.author.username}`}>
                      <Avatar className="h-12 w-12 ring-2 ring-border/20">
                        <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                        <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div>
                      <Link
                          href={`/profile/${post.author.username}`}
                          className="font-semibold text-foreground hover:underline"
                      >
                        {post.author.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        @{post.author.username} · {formatDate(post.timestamp)}
                      </p>
                    </div>
                  </div>
                  <Button
                      variant={isFollowing ? "outline" : "default"}
                      size="sm"
                      className="rounded-full gap-2"
                      onClick={handleFollow}
                  >
                    <UserPlus className="h-4 w-4" />
                    {isFollowing ? "Takip Ediliyor" : "Takip Et"}
                  </Button>
                </div>

                {/* Quote content */}
                {post.type === "quote" && (
                    <div className="relative rounded-2xl bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-8 mb-6">
                      <div className="absolute left-6 top-4 quote-mark text-primary/20">"</div>
                      <p className="relative z-10 font-serif text-2xl leading-relaxed text-foreground/90">{post.content}</p>
                      {post.pageNumber && (
                          <p className="mt-4 text-right text-base text-muted-foreground">— Sayfa {post.pageNumber}</p>
                      )}
                    </div>
                )}

                {/* Blog content */}
                {post.type === "blog" && (
                    <div className="mb-6">
                      <h2 className="mb-4 text-2xl font-bold leading-tight">{post.title}</h2>
                      <p className="text-lg leading-relaxed text-foreground/80">{post.content}</p>
                    </div>
                )}

                {/* AI Analysis and Translate buttons */}
                <div className="flex gap-2 mb-6">
                  <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full gap-2 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 bg-transparent"
                      onClick={handleAIAnalysis}
                  >
                    <Sparkles className="h-4 w-4" />
                    AI Analizi
                  </Button>
                  <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 bg-transparent"
                      onClick={handleTranslate}
                  >
                    <Languages className="h-4 w-4" />
                    Çevir
                  </Button>
                </div>

                {/* Hashtags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {post.tags.map((tag) => (
                          <Link key={tag} href={`/explore?tag=${tag}`}>
                            <span className="text-sm text-muted-foreground hover:text-primary transition-colors">#{tag}</span>
                          </Link>
                      ))}
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-between border-y border-border/30 py-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn("gap-2 rounded-full hover:bg-red-50", isLiked && "text-red-500")}
                        onClick={handleLike}
                    >
                      <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
                      <span>{post.likes.length}</span>
                    </Button>

                    <Button variant="ghost" size="sm" className="gap-2 rounded-full hover:bg-blue-50">
                      <MessageCircle className="h-5 w-5" />
                      <span>{post.comments.length}</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 rounded-full hover:bg-green-50"
                        onClick={handleShare}
                    >
                      <Share2 className="h-5 w-5" />
                      <span>{post.shares || 234}</span>
                    </Button>
                  </div>

                  <Button
                      variant="ghost"
                      size="sm"
                      className={cn("rounded-full hover:bg-purple-50", isSaved && "text-primary")}
                      onClick={handleSave}
                  >
                    <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
                    <span className="ml-2">{post.saves || 456}</span>
                  </Button>
                </div>

                {/* Comments section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Yorumlar</h3>

                  {/* Add comment */}
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{currentUser?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                          placeholder="Yorumunuzu yazın..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="min-h-[80px] rounded-xl resize-none"
                      />
                      <Button
                          onClick={handleAddComment}
                          disabled={!commentText.trim()}
                          className="rounded-full"
                          size="sm"
                      >
                        Yorum Yap
                      </Button>
                    </div>
                  </div>

                  {/* Comments list */}
                  <div className="space-y-4 mt-6">
                    {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{comment.username.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-muted/50 rounded-2xl p-3">
                              <p className="font-semibold text-sm">{comment.username}</p>
                              <p className="text-sm text-foreground/80 mt-1">{comment.text}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 ml-3">{formatDate(comment.timestamp)}</p>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Book details */}
            {post.type === "quote" && post.bookInfo && (
                <div className="w-96 sticky top-6 h-fit">
                  <div className="bg-white rounded-2xl shadow-soft border border-border/30 p-6">
                    <div className="space-y-6">
                      {/* Book cover */}
                      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl shadow-medium">
                        <Image
                            src={post.bookInfo.cover || "/placeholder.svg"}
                            alt={post.bookInfo.title}
                            fill
                            className="object-cover"
                        />
                      </div>

                      {/* Book info */}
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-2xl font-bold text-foreground mb-2">{post.bookInfo.title}</h2>
                          <p className="text-lg text-muted-foreground">{post.bookInfo.author}</p>
                        </div>

                        {/* Genre tags */}
                        <div className="flex flex-wrap gap-2">
                          {post.bookInfo.genres?.map((genre) => (
                              <Badge key={genre} variant="secondary" className="rounded-full px-3 py-1">
                                {genre}
                              </Badge>
                          ))}
                        </div>

                        {/* Book description */}
                        {post.bookInfo.description && (
                            <p className="text-sm leading-relaxed text-foreground/70">{post.bookInfo.description}</p>
                        )}

                        {/* ISBN */}
                        {post.bookInfo.isbn && (
                            <div className="pt-4 border-t border-border/30">
                              <p className="text-xs text-muted-foreground">ISBN: {post.bookInfo.isbn}</p>
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  )
}