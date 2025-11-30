"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ImageIcon, X } from "lucide-react"
import { toast } from "react-hot-toast"

import { createQuotePost } from "@/services/quotePostService"
import { createPost } from "@/services/postService"
import { createTag, searchTags } from "@/services/tagService"

export default function QuotePostPage() {
    const router = useRouter()
    const previewRef = useRef(null)
    const currentUser = useSelector((state) => state.user.currentUser)

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
    const [showPreview, setShowPreview] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

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

    const togglePreview = () => {
        if (!showPreview) {
            if (!formData.bookName.trim()) {
                toast.error("Kitap adı zorunludur")
                return
            }
            if (!formData.thought.trim()) {
                toast.error("Alıntı zorunludur")
                return
            }
        }
        setShowPreview(!showPreview)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!currentUser?.id) {
            toast.error("Giriş yapmalısınız")
            return
        }

        if (!formData.bookName || !formData.thought) {
            toast.error("Kitap adı ve alıntı zorunludur")
            return
        }

        try {
            setLoading(true)

            // 1. Tag ID'lerini Çözümleme
            const tagIds = []
            for (const tagName of tags) {
                try {
                    const existing = await searchTags(tagName)
                    // Backend response yapısına göre data içinde array olabilir, kontrol et
                    const items = Array.isArray(existing) ? existing : (existing?.data || [])
                    const found = items.find((t) => t.name.toLowerCase() === tagName.toLowerCase())

                    if (found) {
                        tagIds.push(found.id)
                    } else {
                        const newTag = await createTag({ name: tagName })
                        const newId = newTag?.data?.id || newTag?.id
                        if(newId) tagIds.push(newId)
                    }
                } catch (err) {
                    console.error("Tag hatası:", err)
                }
            }

            // 2. Ana Post Payload'ı (BURASI HATALIYDI, DÜZELTİLDİ)
            const postPayload = {
                type: "QUOTE_POST",
                parentId: null,
                userId: currentUser.id,
                content: formData.thought,
                // Eski yapı için tekil ID (gerekirse kalsın)
                tagId: tagIds.length > 0 ? tagIds[0] : null,
                // 🔥 KRİTİK DÜZELTME: Backend List<String> tagIds bekliyor!
                tagIds: tagIds,
                title: formData.title || formData.bookName,
                likeCount: 0,
                commentCount: 0,
            }

            // 3. Post Oluşturma
            const createdPostResponse = await createPost(postPayload)
            const createdPostId = createdPostResponse?.id || createdPostResponse?.data?.id

            if (!createdPostId) throw new Error("Post oluşturulamadı ID dönmedi")

            // 4. Quote Detayını Oluşturma
            const quotePayload = {
                postId: createdPostId,
                title: formData.title,
                bookName: formData.bookName,
                author: formData.author,
                publisher: formData.publisher,
                quotePage: Number(formData.quotePage) || null,
                totalPages: Number(formData.totalPages) || null,
                thought: formData.thought,
                image: formData.image || null,
                tagIds, // Burası Quote tablosuna kaydediyorsa kalsın, ama asıl işi yukarıdaki postPayload yapar
            }

            await createQuotePost(quotePayload)

            toast.success("Alıntı başarıyla paylaşıldı!")
            router.push("/")
        } catch (error) {
            console.error(error)
            toast.error("Bir hata oluştu: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    // ... Render kısmı (return) aynı kalacak ...
    return (
        <div className="mx-auto max-w-2xl p-6">
            <Card className="shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                        <BookOpen className="h-6 w-6" /> Kitap Alıntısı Paylaş
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Başlık */}
                        <div className="space-y-2">
                            <Label>Başlık</Label>
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Alıntı başlığı (opsiyonel)"
                            />
                        </div>

                        {/* Kitap */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Kitap Adı *</Label>
                                <Input
                                    name="bookName"
                                    value={formData.bookName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Yazar</Label>
                                <Input name="author" value={formData.author} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Sayfa Bilgileri */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Alıntı Sayfası</Label>
                                <Input
                                    name="quotePage"
                                    type="number"
                                    value={formData.quotePage}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Toplam Sayfa</Label>
                                <Input
                                    name="totalPages"
                                    type="number"
                                    value={formData.totalPages}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Alıntı */}
                        <div className="space-y-2">
                            <Label>Alıntı *</Label>
                            <Textarea
                                name="thought"
                                value={formData.thought}
                                onChange={handleChange}
                                className="min-h-[120px]"
                                required
                            />
                        </div>

                        {/* Görsel */}
                        <div className="space-y-2">
                            <Label>Görsel URL</Label>
                            <div className="relative">
                                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                                <Input
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Etiketler */}
                        <div className="space-y-2">
                            <Label>Etiketler</Label>

                            <div className="flex gap-2">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                                    placeholder="Etiket ekle..."
                                />
                                <Button type="button" variant="outline" onClick={handleAddTag}>
                                    Ekle
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="outline"
                                        className="flex items-center gap-1 px-2 py-1"
                                    >
                                        #{tag}
                                        <button
                                            type="button"
                                            className="text-red-500 ml-1"
                                            onClick={() => handleRemoveTag(tag)}
                                        >
                                            <X size={12} />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="secondary" onClick={togglePreview}>
                                {showPreview ? "Önizlemeyi Kapat" : "Önizlemeyi Göster"}
                            </Button>

                            <Button type="submit" disabled={loading} className="flex-1">
                                {loading ? "Paylaşılıyor..." : "Paylaş"}
                            </Button>

                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                İptal
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Önizleme */}
            {showPreview && (
                <Card ref={previewRef} className="mt-6 shadow">
                    <CardHeader>
                        <CardTitle>Önizleme</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <Badge variant="default" className="gap-1">
                            <BookOpen className="w-3 h-3" /> Alıntı
                        </Badge>

                        {formData.title && <h3 className="text-xl font-bold">{formData.title}</h3>}

                        {formData.bookName && (
                            <p className="text-gray-700 text-lg font-semibold">
                                {formData.bookName}
                                {formData.author && <span className="text-gray-500"> — {formData.author}</span>}
                            </p>
                        )}

                        <blockquote className="border-l-4 pl-3 italic text-gray-800">
                            {formData.thought}
                        </blockquote>

                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <Badge key={tag} variant="outline">
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {formData.image && (
                            <div className="rounded overflow-hidden border mt-3">
                                <img src={formData.image} className="w-full object-cover" alt="Preview" />
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}