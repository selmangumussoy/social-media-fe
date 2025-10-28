"use client"

import { useDispatch, useSelector } from "react-redux"
import { toggleLike, toggleSave } from "@/store/slices/postSlice"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal } from "lucide-react"
import { formatDate } from "@/utils/formatDate"
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

  // Güvenli kontrol
  const isLiked = (post.likes || []).includes(currentUser?.id ?? -1)
  const isSaved = savedPosts.includes(post?.id)

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

  const handleLike = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(toggleLike({ postId: post?.id, userId: currentUser?.id }))
    toast.success(isLiked ? "Beğeni kaldırıldı" : "Beğenildi!")
  }

  const handleSave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(toggleSave(post?.id))
    toast.success(isSaved ? "Kayıtlardan çıkarıldı" : "Kaydedildi!")
  }

  const handleShare = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toast.success("Link kopyalandı!")
  }

  const handleRepost = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toast.success("Gönderi yeniden paylaşıldı!")
  }

  return (
      <Card
          className="overflow-hidden rounded-2xl border-border/30 bg-white shadow-soft hover-shadow-lift cursor-pointer"
          onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar ve isim */}
              <Link
                  href={`/profile/${post.author?.username ?? "unknown"}`}
                  onClick={(e) => e.stopPropagation()}
              >
                <Avatar className="h-11 w-11 ring-2 ring-border/20">
                  <AvatarImage
                      src={post.author?.avatar || "/placeholder.svg"}
                      alt={post.author?.name ?? "Unknown"}
                  />
                  <AvatarFallback>{post.author?.name?.charAt(0) ?? "?"}</AvatarFallback>
                </Avatar>
              </Link>

              <div>
                <Link
                    href={`/profile/${post.author?.username ?? "unknown"}`}
                    className="font-semibold text-foreground hover:underline"
                    onClick={(e) => e.stopPropagation()}
                >
                  {post.author?.name ?? "Bilinmeyen"}
                </Link>
                <p className="text-xs text-muted-foreground">
                  @{post.author?.username ?? "unknown"} · {formatDate(post?.timestamp)}
                </p>
              </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-3">
          {post?.type === "quote" && (
              <div className="relative rounded-xl bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-6">
                <div className="absolute left-4 top-2 quote-mark text-primary/20">"</div>
                <p className="relative z-10 font-serif text-lg leading-relaxed text-foreground/90">
                  {post?.content}
                </p>
                {post?.pageNumber && (
                    <p className="mt-3 text-right text-sm text-muted-foreground">— Sayfa {post.pageNumber}</p>
                )}
              </div>
          )}

          {post?.type === "blog" && (
              <div>
                <h3 className="mb-2 text-xl font-bold leading-tight">{post?.title}</h3>
                <p className="leading-relaxed text-foreground/80">{post?.content}</p>
              </div>
          )}

          {post?.type === "quote" && post?.bookInfo && (
              <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-white p-3">
                <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg shadow-sm">
                  <Image
                      src={post.bookInfo?.cover || "/placeholder.svg"}
                      alt={post.bookInfo?.title ?? "Kitap"}
                      fill
                      className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground truncate">
                    {post.bookInfo?.title ?? "Bilinmeyen Kitap"}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {post.bookInfo?.author ?? "Bilinmeyen Yazar"}
                  </p>
                  <div className="mt-1 flex gap-1.5">
                    {post.bookInfo?.genres?.slice(0, 2).map((genre) => (
                        <Badge key={genre} variant="secondary" className="rounded-full px-2 py-0 text-xs">
                          {genre}
                        </Badge>
                    ))}
                  </div>
                </div>
              </div>
          )}

          {post?.tags && post?.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                    <Link key={tag} href={`/explore?tag=${tag}`} onClick={(e) => e.stopPropagation()}>
                <span className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  #{tag}
                </span>
                    </Link>
                ))}
              </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-border/30 pt-3 pb-3">
          <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    "gap-1.5 rounded-full transition-all hover:bg-red-50",
                    isLiked && "text-red-500 hover:text-red-600"
                )}
                onClick={handleLike}
            >
              <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
              <span className="text-sm">{post.likes?.length ?? 0}</span>
            </Button>

            <Button variant="ghost" size="sm" className="gap-1.5 rounded-full transition-all hover:bg-blue-50">
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm">{post.comments?.length ?? 0}</span>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 rounded-full transition-all hover:bg-green-50 hover:text-green-600"
                onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
              <span className="text-sm">{post.shares ?? 0}</span>
            </Button>
          </div>

          <Button
              variant="ghost"
              size="sm"
              className={cn("rounded-full transition-all hover:bg-purple-50", isSaved && "text-primary")}
              onClick={handleSave}
          >
            <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
            <span className="ml-1.5 text-sm">{post.saves ?? 0}</span>
          </Button>
        </CardFooter>
      </Card>
  )
}
