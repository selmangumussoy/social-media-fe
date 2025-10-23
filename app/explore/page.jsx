"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Sparkles, Hash, BookOpen, UserPlus } from "lucide-react"
import { dummyAIRecommendations, trendingTags } from "@/data/dummyAIRecommendations"
import { dummyPosts } from "@/data/dummyPostData"
import { PostCard } from "@/components/feed/post-card"
import Link from "next/link"
import Image from "next/image"
import toast from "react-hot-toast"

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState("trending")

  const trendingPosts = dummyPosts.slice(0, 3)

  const handleFollow = (username) => {
    toast.success(`${username} takip edildi!`)
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">Keşfet</h1>
        <p className="text-muted-foreground">Yeni içerikler ve ilham verici fikirler keşfedin</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trending" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Trendler
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Önerileri
          </TabsTrigger>
          <TabsTrigger value="tags" className="gap-2">
            <Hash className="h-4 w-4" />
            Etiketler
          </TabsTrigger>
        </TabsList>

        {/* Trending Tab */}
        <TabsContent value="trending" className="space-y-6">
          <div className="space-y-6">
            {trendingPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>

        {/* AI Recommendations Tab */}
        <TabsContent value="ai" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {dummyAIRecommendations.map((recommendation) => (
              <Card key={recommendation.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                {recommendation.type === "book" && (
                  <>
                    <div className="relative aspect-[3/4] w-full">
                      <Image
                        src={recommendation.image || "/placeholder.svg"}
                        alt={recommendation.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{recommendation.title}</CardTitle>
                      <CardDescription>{recommendation.author}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
                      <div className="flex flex-wrap gap-2">
                        {recommendation.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      <Button className="w-full gap-2">
                        <BookOpen className="h-4 w-4" />
                        Detayları Gör
                      </Button>
                    </CardContent>
                  </>
                )}

                {recommendation.type === "user" && (
                  <>
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={recommendation.avatar || "/placeholder.svg"} alt={recommendation.name} />
                          <AvatarFallback>{recommendation.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{recommendation.name}</CardTitle>
                          <CardDescription>@{recommendation.username}</CardDescription>
                          <p className="mt-2 text-sm">{recommendation.followers} takipçi</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
                      <Button
                        className="w-full gap-2 bg-transparent"
                        variant="outline"
                        onClick={() => handleFollow(recommendation.username)}
                      >
                        <UserPlus className="h-4 w-4" />
                        Takip Et
                      </Button>
                    </CardContent>
                  </>
                )}

                {recommendation.type === "post" && (
                  <>
                    {recommendation.image && (
                      <div className="relative aspect-video w-full">
                        <Image
                          src={recommendation.image || "/placeholder.svg"}
                          alt={recommendation.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{recommendation.title}</CardTitle>
                      <CardDescription>{recommendation.author}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
                      <div className="flex flex-wrap gap-2">
                        {recommendation.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      <Button className="w-full bg-transparent" variant="outline">
                        Gönderiyi Gör
                      </Button>
                    </CardContent>
                  </>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trendingTags.map((item) => (
              <Link key={item.tag} href={`/explore?tag=${item.tag}`}>
                <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Hash className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">#{item.tag}</h3>
                        <p className="text-sm text-muted-foreground">{item.count} gönderi</p>
                      </div>
                    </div>
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
