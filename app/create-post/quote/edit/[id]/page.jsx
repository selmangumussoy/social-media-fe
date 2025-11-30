"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ImageIcon, X, Save } from "lucide-react"
import { Toaster, toast } from "react-hot-toast"

// Servis importlarını kendi yoluna göre kontrol et
import { getQuotePostById, updateQuotePost } from "@/services/quotePostService"

export default function EditQuotePostPage() {
    const router = useRouter()
    const params = useParams()
    const urlPostId = params.id // URL'deki Post ID (168...)

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [tagInput, setTagInput] = useState("")

    // 👇 YENİ: Gerçek QuotePost ID'sini saklamak için state
    const [realQuoteId, setRealQuoteId] = useState(null)

    const [formData, setFormData] = useState({
        title: "",
        bookName: "",
        author: "",
        publisher: "",
        quotePage: "",
        totalPages: "",
        thought: "",
        image: "",
        tags: []
    })

    useEffect(() => {
        const fetchPostData = async () => {
            if (!urlPostId) return;

            try {
                // Backend'den veriyi Post ID ile çekiyoruz
                const data = await getQuotePostById(urlPostId)

                if (data) {
                    const postData = Array.isArray(data) ? data[0] : data;

                    // 👇 ÖNEMLİ: Backend'den gelen asıl ID'yi (41ec...) yakalıyoruz
                    setRealQuoteId(postData.id);

                    setFormData({
                        title: postData.title || "",
                        bookName: postData.bookName || postData.quotePost?.bookName || "",
                        author: postData.author || postData.quotePost?.author || "",
                        publisher: postData.publisher || postData.quotePost?.publisher || "",
                        quotePage: postData.quotePage || postData.quotePost?.quotePage || "",
                        totalPages: postData.totalPages || postData.quotePost?.totalPages || "",
                        thought: postData.content || postData.quotePost?.thought || postData.thought || "",
                        image: postData.image || "",
                        tags: postData.tags || []
                    });
                } else {
                    toast.error("Gönderi verisi bulunamadı.");
                }
            } catch (error) {
                console.error("Veri hatası:", error);
                toast.error("Veriler yüklenirken hata oluştu.");
            } finally {
                setLoading(false);
            }
        }

        fetchPostData();
    }, [urlPostId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleAddTag = () => {
        if (tagInput.trim() && formData.tags.length < 5) {
            const tagName = tagInput.trim().toLowerCase()
            if (!formData.tags.includes(tagName)) {
                setFormData({ ...formData, tags: [...formData.tags, tagName] })
            }
            setTagInput("")
        }
    }

    const handleRemoveTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter((tag) => tag !== tagToRemove)
        })
    }

    // --- GÜNCELLEME İŞLEMİ ---
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.bookName || !formData.thought) {
            toast.error("Kitap adı ve alıntı metni zorunludur.")
            return
        }

        // Eğer ID henüz yüklenmediyse işlemi durdur
        if (!realQuoteId) {
            toast.error("ID yüklenemedi, lütfen sayfayı yenileyin.");
            return;
        }

        setSubmitting(true)
        try {
            // 👇 KRİTİK NOKTA: Güncellerken URL'deki ID'yi değil,
            // veritabanından gelen Gerçek ID'yi (realQuoteId) kullanıyoruz.
            await updateQuotePost(realQuoteId, {
                title: formData.title,
                bookName: formData.bookName,
                author: formData.author,
                publisher: formData.publisher,
                quotePage: Number(formData.quotePage),
                totalPages: Number(formData.totalPages),
                thought: formData.thought,
                image: formData.image,
                tags: formData.tags
            })

            toast.success("Gönderi başarıyla güncellendi! ✅")

            setTimeout(() => {
                router.push("/feed")
            }, 1000)

        } catch (error) {
            console.error("Güncelleme hatası:", error)
            toast.error("Güncellenirken bir hata oluştu.")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Yükleniyor...</div>
    }

    return (
        <div className="mx-auto max-w-2xl p-4 sm:p-6">
            <Toaster position="top-center" />
            <Card className="shadow-lg border-border">
                <CardHeader className="pb-2 text-center">
                    <CardTitle className="flex justify-center items-center gap-2 text-xl sm:text-2xl font-semibold text-teal-800">
                        <BookOpen className="h-6 w-6" />
                        Kitap Alıntısını Düzenle
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* --- FORM ALANLARI (AYNI KALDI) --- */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Başlık</Label>
                            <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Başlık (opsiyonel)" />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="bookName">Kitap Adı *</Label>
                                <Input id="bookName" name="bookName" value={formData.bookName} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="author">Yazar</Label>
                                <Input id="author" name="author" value={formData.author} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="publisher">Yayınevi</Label>
                                <Input id="publisher" name="publisher" value={formData.publisher} onChange={handleChange} />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="quotePage">Alıntı Sayfası</Label>
                                    <Input id="quotePage" name="quotePage" type="number" value={formData.quotePage} onChange={handleChange} />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="totalPages">Toplam Sayfa</Label>
                                    <Input id="totalPages" name="totalPages" type="number" value={formData.totalPages} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="thought">Alıntı *</Label>
                            <Textarea id="thought" name="thought" value={formData.thought} onChange={handleChange} className="min-h-40 resize-none font-serif text-lg" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags">Etiketler</Label>
                            <div className="flex gap-2">
                                <Input id="tags" value={tagInput} onChange={(e) => setTagInput(e.target.value)} disabled={formData.tags.length >= 5} />
                                <Button type="button" variant="outline" onClick={handleAddTag} disabled={formData.tags.length >= 5}>Ekle</Button>
                            </div>
                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="gap-1 text-sm px-3 py-1">
                                            #{tag}
                                            <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => handleRemoveTag(tag)} />
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end">
                            <Button type="button" variant="outline" onClick={() => router.back()}>İptal</Button>
                            <Button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white min-w-[150px]" disabled={submitting}>
                                {submitting ? "Güncelleniyor..." : <><Save className="h-4 w-4 mr-2"/> Güncelle</>}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}