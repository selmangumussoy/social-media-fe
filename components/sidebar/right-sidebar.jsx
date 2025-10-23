"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { dummyBooks, dummyFollowSuggestions } from "@/data/dummyBookData"
import Image from "next/image"
import { useState } from "react"
import toast from "react-hot-toast"

export function RightSidebar() {
  const [followingIds, setFollowingIds] = useState([])

  const handleFollow = (userId) => {
    if (followingIds.includes(userId)) {
      setFollowingIds(followingIds.filter((id) => id !== userId))
      toast.success("Takipten çıkıldı")
    } else {
      setFollowingIds([...followingIds, userId])
      toast.success("Takip edildi!")
    }
  }

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-80 flex-col gap-6 overflow-y-auto p-4 xl:flex">
      {/* Follow Suggestions */}
      <Card className="overflow-hidden rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Takip Önerileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0">
          {dummyFollowSuggestions.map((user) => (
            <div key={user.id} className="flex items-start gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-border/50">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <h4 className="truncate font-semibold text-sm">{user.name}</h4>
                <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">{user.bio}</p>
              </div>
              <Button
                size="sm"
                variant={followingIds.includes(user.id) ? "outline" : "default"}
                className="rounded-full px-4 text-xs"
                onClick={() => handleFollow(user.id)}
              >
                {followingIds.includes(user.id) ? "Takiptesin" : "Takip Et"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Book Reviews */}
      <Card className="overflow-hidden rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Kitap İncele</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0">
          {dummyBooks.map((book) => (
            <div
              key={book.id}
              className="group cursor-pointer rounded-xl border border-border/50 p-3 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex gap-3">
                <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg shadow-sm">
                  <Image
                    src={book.cover || "/placeholder.svg"}
                    alt={book.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="mb-1 line-clamp-2 text-sm font-semibold leading-tight">{book.title}</h4>
                  <p className="mb-2 text-xs text-muted-foreground">{book.author}</p>
                  <div className="mb-2 flex flex-wrap gap-1">
                    {book.genres.slice(0, 2).map((genre) => (
                      <Badge key={genre} variant="secondary" className="rounded-full px-2 py-0 text-[10px]">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{book.rating}</span>
                    <span>({book.reviewCount})</span>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">ISBN: {book.isbn}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </aside>
  )
}
