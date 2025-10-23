"use client"

import { useState, useMemo } from "react"
import { useSelector } from "react-redux"
import { PostCard } from "@/components/feed/post-card"
import { FeedFilter } from "@/components/feed/feed-filter"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { EmptyState } from "@/components/common/empty-state"
import { BookOpen } from "lucide-react"

export default function HomePage() {
  const posts = useSelector((state) => state.posts.posts)
  const [activeFilter, setActiveFilter] = useState("all")

  const filteredPosts = useMemo(() => {
    if (activeFilter === "all") return posts
    return posts.filter((post) => post.type === activeFilter)
  }, [posts, activeFilter])

  return (
    <div className="flex gap-6">
      <div className="mx-auto w-full max-w-2xl p-4">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold">Ana Sayfa</h1>
          <p className="text-muted-foreground">Takip ettiğiniz kişilerden güncellemeler</p>
        </div>

        <div className="mb-6">
          <FeedFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        <div className="space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <EmptyState
              icon={BookOpen}
              title="Henüz gönderi yok"
              description="Takip ettiğiniz kişilerin gönderileri burada görünecek"
            />
          )}
        </div>
      </div>

      <RightSidebar />
    </div>
  )
}
