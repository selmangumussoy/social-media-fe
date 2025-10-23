"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/utils/formatDate"
import { useSelector } from "react-redux"
import Link from "next/link"

export function CommentSection({ post, onAddComment }) {
  const [commentText, setCommentText] = useState("")
  const currentUser = useSelector((state) => state.user.currentUser)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (commentText.trim()) {
      onAddComment(commentText)
      setCommentText("")
    }
  }

  return (
    <div className="w-full space-y-4 border-t pt-4">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} alt={currentUser?.name} />
          <AvatarFallback>{currentUser?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Yorumunuzu yazın..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="min-h-20 resize-none"
          />
          <Button type="submit" size="sm" disabled={!commentText.trim()}>
            Yorum Yap
          </Button>
        </div>
      </form>

      {/* Comments List */}
      {post.comments.length > 0 && (
        <div className="space-y-3">
          {post.comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Link href={`/profile/${comment.username}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.avatar || "/placeholder.svg"} alt={comment.username} />
                  <AvatarFallback>{comment.username.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${comment.username}`} className="text-sm font-semibold hover:underline">
                    {comment.username}
                  </Link>
                  <span className="text-xs text-muted-foreground">{formatDate(comment.timestamp)}</span>
                </div>
                <p className="text-sm leading-relaxed">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
