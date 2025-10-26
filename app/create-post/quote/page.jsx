"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ImageIcon, X } from "lucide-react"
import toast from "react-hot-toast"

// 🟢 Servisler
import { createQuotePost } from "@/services/quotePostService"
import { createTag, searchTags } from "@/services/tagService"
import { createPost } from "@/services/postService"

export default function QuotePostPage() {
    const router = useRouter()

    const [formData, setFormData] = useState({
        title: "",
        bookName: "",
        author: "",
        publisher: "",
        quotePage: "",
        totalPages: "",
        thought: "",
        image: "",
    })

    const [tagInput, setTagInput] = useState("")
    const [tags, setTags] = useState([])
    const [loading, setLoading] = useState(false)

    // 🟡 Input değişimi
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    // 🟢 Etiket ekleme
    const handleAddTag = () => {
        if (tagInput.trim() && tags.length < 5) {
            const tagName = tagInput.trim().toLowerCase()
            if (!tags.includes(tagName)) setTags([...tags, tagName])
            setTagInput("")
        }
    }

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.bookName || !formData.thought) {
            toast.error("Kitap adı ve alıntı metni zorunludur.")
            return
        }

        setLoading(true)
        try {
            const tagIds = []

            // 1️⃣ Etiketleri kontrol et (varsa al, yoksa oluştur)
            for (const tagName of tags) {
                try {
                    const existingTags = await searchTags(tagName)
                    const found = existingTags.find(
                        (t) => t.name?.toLowerCase() === tagName.toLowerCase()
                    )

                    if (found) {
                        tagIds.push(found.id)
                    } else {
                        const newTag = await createTag({ name: tagName })
                        const newId = newTag?.data?.id || newTag?.id
                        if (newId) tagIds.push(newId)
                    }
                } catch (err) {
                    console.warn(`Etiket '${tagName}' kaydedilemedi:`, err)
                }
            }

            // 2️⃣ QuotePost kaydı oluştur
            const quotePayload = {
                title: formData.title,
                bookName: formData.bookName,
                author: formData.author,
                publisher: formData.publisher,
                quotePage: Number(formData.quotePage) || null,
                totalPages: Number(formData.totalPages) || null,
                thought: formData.thought,
                image: formData.image || null,
                tagIds: tagIds,
                userId: "12345", // 🔹 oturum açmış kullanıcı ID’si (örnek)
            }

            const createdQuote = await createQuotePost(quotePayload)

            // 3️⃣ Quote başarılıysa POST tablosuna da kayıt at
            if (createdQuote?.id) {
                const postPayload = {
                    type: "QUOTE_POST",
                    parentId: null,
                    userId: quotePayload.userId,
                    content: formData.thought,
                    tagId: tagIds.length > 0 ? tagIds[0] : null, // 🔹 ilk etiketi al
                    likeCount: 0,
                    commentCount: 0,
                }

                await createPost(postPayload)
                console.log("Post kaydı da oluşturuldu ✅")
            }

            toast.success("Kitap alıntısı başarıyla paylaşıldı!")
            router.push("/")
        } catch (error) {
            console.error("Alıntı oluşturma hatası:", error)
            toast.error("Bir hata oluştu. Lütfen tekrar deneyin.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto max-w-2xl p-4 sm:p-6">
            <Card className="shadow-lg border-border">
                <CardHeader className="pb-2 text-center">
                    <CardTitle className="flex justify-center items-center gap-2 text-xl sm:text-2xl font-semibold">
                        <BookOpen className="h-6 w-6 text-primary" />
                        Kitap Alıntısı Paylaş
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Başlık */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Başlık</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="Alıntıya kısa bir başlık verin (opsiyonel)"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Kitap Bilgileri */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="bookName">Kitap Adı *</Label>
                                <Input
                                    id="bookName"
                                    name="bookName"
                                    placeholder="Örn: Suç ve Ceza"
                                    value={formData.bookName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="author">Yazar</Label>
                                <Input
                                    id="author"
                                    name="author"
                                    placeholder="Örn: Dostoyevski"
                                    value={formData.author}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Yayın Bilgileri */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="publisher">Yayınevi</Label>
                                <Input
                                    id="publisher"
                                    name="publisher"
                                    placeholder="Örn: Yapı Kredi Yayınları"
                                    value={formData.publisher}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="quotePage">Alıntı Sayfası</Label>
                                    <Input
                                        id="quotePage"
                                        name="quotePage"
                                        type="number"
                                        placeholder="Örn: 123"
                                        value={formData.quotePage}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="totalPages">Toplam Sayfa</Label>
                                    <Input
                                        id="totalPages"
                                        name="totalPages"
                                        type="number"
                                        placeholder="Örn: 480"
                                        value={formData.totalPages}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Alıntı */}
                        <div className="space-y-2">
                            <Label htmlFor="thought">Alıntı *</Label>
                            <Textarea
                                id="thought"
                                name="thought"
                                placeholder="Alıntıyı buraya yazın..."
                                className="min-h-40 resize-none"
                                value={formData.thought}
                                onChange={handleChange}
                                required
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {formData.thought.length} karakter
                            </p>
                        </div>

                        {/* Görsel URL */}
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

                        {/* Etiketler */}
                        <div className="space-y-2">
                            <Label htmlFor="tags">Etiketler (Maks. 5)</Label>
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
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleAddTag}
                                    disabled={tags.length >= 5}
                                >
                                    Ekle
                                </Button>
                            </div>
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="gap-1 text-sm px-3 py-1"
                                        >
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

                        {/* Butonlar */}
                        <div className="flex gap-3 pt-4">
                            <Button type="submit" className="flex-1" disabled={loading}>
                                {loading ? "Paylaşılıyor..." : "Paylaş"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                İptal
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
