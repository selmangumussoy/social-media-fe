"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { addPost } from "@/store/slices/postSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { BookOpen, FileText, ImageIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

export default function CreatePostPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const currentUser = useSelector((state) => state.user.currentUser)

  const [postType, setPostType] = useState("quote")
  const [formData, setFormData] = useState({
    title: "",
    bookTitle: "",
    bookAuthor: "",
    content: "",
    image: "",
    tags: "",
  })
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState([])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 5) {
      setTags([...tags, tagInput.trim().toLowerCase()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.title || !formData.content) {
      toast.error("Lütfen başlık ve içerik alanlarını doldurun")
      return
    }

    if (postType === "quote" && !formData.bookTitle) {
      toast.error("Lütfen kitap adını girin")
      return
    }

    const newPost = {
      id: Date.now(),
      type: postType,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
        avatar: currentUser.avatar,
      },
      title: formData.title,
      bookTitle: postType === "quote" ? formData.bookTitle : undefined,
      bookAuthor: postType === "quote" ? formData.bookAuthor : undefined,
      content: formData.content,
      image: formData.image || "/placeholder.svg?height=400&width=600",
      tags: tags,
      likes: [],
      comments: [],
      timestamp: new Date().toISOString(),
    }

    dispatch(addPost(newPost))
    toast.success("Gönderi başarıyla paylaşıldı!")
    router.push("/")
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">Yeni Gönderi Oluştur</h1>
        <p className="text-muted-foreground">Düşüncelerinizi ve okumalarınızı paylaşın</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gönderi Türü Seçin</CardTitle>
          <CardDescription>Paylaşmak istediğiniz içerik türünü belirleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Post Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPostType("quote")}
              className={cn(
                "flex flex-col items-center gap-3 rounded-lg border-2 p-6 transition-all hover:border-primary",
                postType === "quote" ? "border-primary bg-primary/5" : "border-border",
              )}
            >
              <BookOpen className={cn("h-8 w-8", postType === "quote" ? "text-primary" : "text-muted-foreground")} />
              <div className="text-center">
                <h3 className="font-semibold">Kitap Alıntısı</h3>
                <p className="text-xs text-muted-foreground">Sevdiğiniz bir alıntıyı paylaşın</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPostType("blog")}
              className={cn(
                "flex flex-col items-center gap-3 rounded-lg border-2 p-6 transition-all hover:border-primary",
                postType === "blog" ? "border-primary bg-primary/5" : "border-border",
              )}
            >
              <FileText className={cn("h-8 w-8", postType === "blog" ? "text-primary" : "text-muted-foreground")} />
              <div className="text-center">
                <h3 className="font-semibold">Blog Yazısı</h3>
                <p className="text-xs text-muted-foreground">Düşüncelerinizi yazıya dökün</p>
              </div>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                name="title"
                placeholder={postType === "quote" ? "Alıntı başlığı" : "Blog yazısı başlığı"}
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Book Info (only for quotes) */}
            {postType === "quote" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bookTitle">Kitap Adı *</Label>
                  <Input
                    id="bookTitle"
                    name="bookTitle"
                    placeholder="Örn: Suç ve Ceza"
                    value={formData.bookTitle}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bookAuthor">Yazar</Label>
                  <Input
                    id="bookAuthor"
                    name="bookAuthor"
                    placeholder="Örn: Dostoyevski"
                    value={formData.bookAuthor}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">İçerik *</Label>
              <Textarea
                id="content"
                name="content"
                placeholder={
                  postType === "quote"
                    ? "Alıntıyı buraya yazın..."
                    : "Düşüncelerinizi, analizlerinizi veya yorumlarınızı paylaşın..."
                }
                className="min-h-40 resize-none"
                value={formData.content}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground">{formData.content.length} karakter</p>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image">Görsel URL (Opsiyonel)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="image"
                    name="image"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    className="pl-10"
                    value={formData.image}
                    onChange={handleChange}
                  />
                </div>
              </div>
              {formData.image && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <img
                    src={formData.image || "/placeholder.svg"}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Etiketler (Maksimum 5)</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Etiket ekle (örn: felsefe)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  disabled={tags.length >= 5}
                />
                <Button type="button" variant="outline" onClick={handleAddTag} disabled={tags.length >= 5}>
                  Ekle
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Paylaş
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                İptal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview Card */}
      {(formData.title || formData.content) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Önizleme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={postType === "quote" ? "default" : "secondary"} className="gap-1">
                {postType === "quote" ? (
                  <>
                    <BookOpen className="h-3 w-3" />
                    Alıntı
                  </>
                ) : (
                  <>
                    <FileText className="h-3 w-3" />
                    Blog
                  </>
                )}
              </Badge>
            </div>
            {formData.title && <h3 className="text-xl font-bold">{formData.title}</h3>}
            {postType === "quote" && formData.bookTitle && (
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">{formData.bookTitle}</span>
                {formData.bookAuthor && <span> - {formData.bookAuthor}</span>}
              </p>
            )}
            {formData.content && (
              <p className={cn("leading-relaxed", postType === "quote" && "font-quote italic text-lg")}>
                {formData.content}
              </p>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
