"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import toast from "react-hot-toast"

import { toggleLike } from "@/store/slices/postSlice"
import { deletePost, updatePost } from "@/services/postService"
import { savePost, unsavePost, getSavedPostsByUser } from "@/services/savedPostService"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

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
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { cn } from "@/lib/utils"

export function PostCard({ post }) {
  const dispatch = useDispatch()
  const router = useRouter()
  const currentUser = useSelector((state) => state.user.currentUser)

  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post?.content || "")
  const [isUpdating, setIsUpdating] = useState(false)

  // --- KAYDETME STATE'LERİ ---
  const [isSaved, setIsSaved] = useState(false)
  const [savedPostId, setSavedPostId] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)

  if (!post) return null

  const username = post.username || post.author?.username || "anonim"
  const fullName =
      post.fullName || post.author?.name || post.author?.fullName || "Bilinmeyen Kullanıcı"
  const avatarUrl = post.author?.avatar || "/placeholder.svg"

  const isMyPost = currentUser?.id === post.userId || currentUser?.userId === post.userId

  let timeAgo = ""
  try {
    const dateString = post.created || post.timestamp
    if (dateString) {
      timeAgo = formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: tr,
      })
    }
  } catch {
    timeAgo = ""
  }

  const isLiked = (post.likes || []).includes(currentUser?.id ?? -1)

  // ✔️ GÖNDERİ DAHA ÖNCE KAYDEDİLMİŞ Mİ? (İLK YÜKLEME)
  useEffect(() => {
    let isMounted = true

    const checkStatus = async () => {
      if (!currentUser?.id || !post?.id) return

      try {
        const mySavedPosts = await getSavedPostsByUser(currentUser.id)

        if (!isMounted) return

        const found = mySavedPosts.find(
            (item) => String(item.postId) === String(post.id)
        )

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

    return () => {
      isMounted = false
    }
  }, [currentUser?.id, post?.id])

  // --- FONKSİYONLAR ---

  const handleDelete = async () => {
    try {
      await deletePost(post.id)
      toast.success("Silindi 👋")
      window.location.reload()
    } catch {
      toast.error("Hata oluştu")
    }
  }

  const handleUpdate = async () => {
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
      toast.success("Güncellendi")
      setIsEditing(false)
      window.location.reload()
    } catch {
      toast.error("Hata oluştu")
    } finally {
      setIsUpdating(false)
    }
  }

  const goToDetail = (e) => {
    e.stopPropagation()
    router.push(`/post/${post?.id}`)
  }

  const handleLike = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(toggleLike({ postId: post?.id, userId: currentUser?.id }))
  }

  // ✔️ KAYDET / KAYITTAN ÇIKAR (TOGGLE)
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

  return (
      <Card className="mb-6 overflow-hidden rounded-2xl border-border/30 bg-white shadow-sm transition-all hover:shadow-md">
        <CardHeader className="px-5 pb-2 pt-5">
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
                    className="text-sm font-bold text-gray-900 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                >
                  {fullName}
                </Link>
                <p className="text-xs text-gray-500">
                  @{username} · {timeAgo}
                </p>
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
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" /> Düzenle
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-5 py-2">
          {isEditing ? (
              <div className="space-y-2">
                <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[100px] bg-gray-50"
                />

                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    İptal
                  </Button>

                  <Button size="sm" onClick={handleUpdate} disabled={isUpdating}>
                    Kaydet
                  </Button>
                </div>
              </div>
          ) : (
              <>
                {post.type === "BLOG_POST" ? (
                    <div className="space-y-3">
                      {post.title && (
                          <h2 className="text-xl font-extrabold leading-tight text-gray-900">
                            {post.title}
                          </h2>
                      )}

                      <p className="text-[15px] leading-relaxed text-gray-700 line-clamp-3">
                        {post.content}
                      </p>

                      <div className="flex gap-2 pt-2">
                        <Badge variant="outline" className="gap-1 border-gray-200 py-1 px-2 text-xs font-normal text-gray-500">
                          <Sparkles className="h-3 w-3" /> AI Analizi
                        </Badge>

                        <Badge variant="outline" className="gap-1 border-gray-200 py-1 px-2 text-xs font-normal text-gray-500">
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
