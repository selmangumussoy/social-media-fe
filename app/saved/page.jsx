"use client"

import { useSelector } from "react-redux"
import { PostCard } from "@/components/feed/post-card"
import { EmptyState } from "@/components/common/empty-state"
import { Bookmark } from "lucide-react"

export default function SavedPage() {
  const posts = useSelector((state) => state.posts.posts)
  const savedPostIds = useSelector((state) => state.posts.savedPosts)

  const savedPosts = posts.filter((post) => savedPostIds.includes(post.id))

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">Kaydedilenler</h1>
        <p className="text-muted-foreground">Daha sonra okumak için kaydettiğiniz gönderiler</p>
      </div>

      <div className="space-y-6">
        {savedPosts.length > 0 ? (
          savedPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <EmptyState
            icon={Bookmark}
            title="Henüz kayıtlı gönderi yok"
            description="Beğendiğiniz gönderileri kaydedin ve buradan kolayca erişin"
          />
        )}
      </div>
    </div>
  )
}
