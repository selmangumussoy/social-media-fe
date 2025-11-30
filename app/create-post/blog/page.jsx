"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { createPost } from "@/services/postService"
import { createBlogPost } from "@/services/blogPostService"
import { searchTags, createTag } from "@/services/tagService" // Eksik importlar eklendi
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"
import {
    X, Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter,
    AlignRight, List, ListOrdered, Quote, Image as ImageIcon, Video, Table as TableIcon,
} from "lucide-react"

// Tiptap Editör Paketleri
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Underline } from "@tiptap/extension-underline"
import { Image } from "@tiptap/extension-image"
import { Youtube } from "@tiptap/extension-youtube"
import { TextAlign } from "@tiptap/extension-text-align"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import { Color } from "@tiptap/extension-color"
import { TextStyle } from "@tiptap/extension-text-style"

export default function BlogPage() {
    const router = useRouter()
    const currentUser = useSelector((state) => state.user.currentUser)

    const [title, setTitle] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [tags, setTags] = useState([])
    const [tagInput, setTagInput] = useState("")
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    const editor = useEditor({
        extensions: [
            StarterKit, Underline, Image, Youtube.configure({ controls: false }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Table.configure({ resizable: true }),
            TableRow, TableHeader, TableCell, TextStyle, Color,
        ],
        content: "<p>Yazmaya başlayın...</p>",
        editorProps: {
            attributes: {
                class: "prose prose-lg focus:outline-none min-h-[500px] p-6 text-gray-700 leading-relaxed max-w-none",
            },
        },
        immediatelyRender: false,
    })

    const handleAddTag = () => {
        const trimmedTag = tagInput.trim().toLowerCase()
        if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
            setTags([...tags, trimmedTag])
            setTagInput("")
        }
    }

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove))
    }

    // --- Resim/Video Ekleme ---
    const addImage = () => {
        const url = window.prompt('Resim URL\'si girin:')
        if (url && editor) editor.chain().focus().setImage({ src: url }).run()
    }
    const addVideo = () => {
        const url = window.prompt('YouTube Video URL\'si girin:')
        if (url && editor) editor.commands.setYoutubeVideo({ src: url })
    }

    // --- HTML'den Düz Metin Çıkarma (Özet İçin) ---
    const stripHtml = (html) => {
        if (typeof window === "undefined") return ""
        const doc = new DOMParser().parseFromString(html, "text/html")
        return doc.body.textContent || ""
    }

    const handlePublish = async () => {
        if (!editor) return

        const htmlContent = editor.getHTML()
        const plainText = stripHtml(htmlContent)

        if (!title.trim() || !plainText.trim()) {
            return toast.error("Başlık ve içerik zorunludur")
        }

        if (!currentUser?.id) {
            return toast.error("Lütfen önce giriş yapın.")
        }

        try {
            setIsSubmitting(true)

            // 1. ADIM: Tag'leri Backend ID'lerine çevir (Persistence Sorunu Çözümü)
            const tagIds = []
            for (const tagName of tags) {
                try {
                    // Önce var mı diye ara
                    const existing = await searchTags(tagName)
                    // Backend response yapısına göre uygun property'i bul (item.name vs)
                    const found = existing.find((t) => t.name.toLowerCase() === tagName.toLowerCase())

                    if (found) {
                        tagIds.push(found.id)
                    } else {
                        // Yoksa oluştur
                        const newTagResponse = await createTag({ name: tagName })
                        // Response yapısına göre ID al (data.id veya direkt id)
                        const newId = newTagResponse?.data?.id || newTagResponse?.id
                        if (newId) tagIds.push(newId)
                    }
                } catch (err) {
                    console.error(`Tag işlemi hatası (${tagName}):`, err)
                }
            }

            // Özet metni oluştur
            const baseSummary = plainText.substring(0, 200) + (plainText.length > 200 ? "..." : "")

            // İçeriğe hashtag olarak da ekleyelim (Opsiyonel ama SEO için iyi)
            const hashtagsText = tags.length > 0
                ? " " + tags.map((t) => `#${t}`).join(" ")
                : ""

            const summaryWithTags = (baseSummary + hashtagsText).trim()

            // 2. ADIM: Post Oluştur (tagIds listesini gönderiyoruz!)
            const postPayload = {
                type: "BLOG_POST",
                userId: currentUser.id,
                title,
                content: summaryWithTags,
                likeCount: 0,
                commentCount: 0,
                tagIds: tagIds // Backend bu listeyi bekliyor
            }

            const createdPost = await createPost(postPayload)
            // Backend'den dönen ID'yi al (response yapısına dikkat)
            const postId = createdPost?.data?.id || createdPost?.id

            if (!postId) throw new Error("Post ID alınamadı")

            // 3. ADIM: Blog Detayını Oluştur
            await createBlogPost({
                postId: postId,
                blogContent: htmlContent,
                coverImage: null,
                title,
                tags: tags, // Burası sadece display amaçlı tutuluyorsa kalabilir
            })

            toast.success("Blog yazısı başarıyla yayınlandı! 🎉")
            router.push("/")
        } catch (error) {
            console.error(error)
            toast.error("Yayınlanırken hata oluştu.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!editor) return null

    // Toolbar component helper...
    const ToolbarBtn = ({ onClick, isActive, icon }) => (
        <button
            onClick={onClick}
            className={`p-2 rounded-full transition-colors border flex items-center justify-center h-10 w-10 ${
                isActive
                    ? "bg-green-600 text-white border-green-600 shadow-sm"
                    : "bg-white text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300"
            }`}
        >
            {icon}
        </button>
    )

    // Render kısmı (değişmedi, sadece özet geçildi)
    return (
        <div className="container mx-auto p-6 max-w-6xl min-h-screen bg-white">
            <div className="flex justify-end gap-3 mb-8">
                <Button
                    variant="outline"
                    className="border-green-600 text-green-700 hover:bg-green-50"
                    onClick={() => setIsPreviewOpen(true)}
                >
                    Önizle
                </Button>
                <Button
                    onClick={handlePublish}
                    disabled={isSubmitting}
                    className="bg-green-700 text-white hover:bg-green-800 font-semibold px-6"
                >
                    {isSubmitting ? "Yayınlanıyor..." : "Yayınla"}
                </Button>
            </div>
            {/* ... Diğer UI kodları aynı ... */}
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-2">
                        <label className="font-bold text-gray-800 text-lg">Konu Başlığı</label>
                        <Input
                            placeholder="Genel konu başlığı giriniz..."
                            className="h-14 text-lg"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="font-bold text-gray-800 text-lg">🏷️ Etiket Seç</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Etiket yazıp Enter'a basın..."
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                            />
                            <Button variant="outline" onClick={handleAddTag}>Ekle</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                                    #{tag}
                                    <button onClick={() => handleRemoveTag(tag)}><X size={14} /></button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* EDİTÖR ALANI */}
                <div className="rounded-xl border border-gray-300 overflow-hidden shadow-sm">
                    {/* Araç Çubuğu */}
                    <div className="bg-[#EAEAE8] p-4 flex flex-wrap gap-2 items-center border-b border-gray-300">
                        <div className="flex items-center gap-1 pr-2 border-r border-gray-300 mr-2">
                            <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={<Bold size={18} />} />
                            <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={<Italic size={18} />} />
                            <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={<UnderlineIcon size={18} />} />
                        </div>

                        <div className="flex items-center gap-1 pr-2 border-r border-gray-300 mr-2">
                            <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={<AlignLeft size={18} />} />
                            <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={<AlignCenter size={18} />} />
                            <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} icon={<AlignRight size={18} />} />
                        </div>

                        <div className="flex items-center gap-1 pr-2 border-r border-gray-300 mr-2">
                            <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={<List size={18} />} />
                            <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={<ListOrdered size={18} />} />
                            <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={<Quote size={18} />} />
                        </div>

                        <div className="flex items-center gap-1">
                            <ToolbarBtn onClick={addImage} isActive={false} icon={<ImageIcon size={18} />} />
                            <ToolbarBtn onClick={addVideo} isActive={false} icon={<Video size={18} />} />
                            <ToolbarBtn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} isActive={false} icon={<TableIcon size={18} />} />
                        </div>
                    </div>

                    {/* Yazım Alanı */}
                    <div className="bg-white min-h-[600px]">
                        <EditorContent editor={editor} />
                    </div>
                </div>
            </div>

            {/* Önizleme Modalı */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                                <h2 className="text-2xl font-bold text-gray-800">📖 Blog Önizlemesi</h2>
                                <Button variant="ghost" onClick={() => setIsPreviewOpen(false)}><X size={24}/></Button>
                            </div>

                            <h1 className="text-4xl font-extrabold text-gray-900 mb-6">{title || "Başlık Yok"}</h1>

                            {/* HTML İçeriği Render Etme */}
                            <div
                                className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600"
                                dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
                            />

                            <div className="mt-8 pt-6 border-t flex gap-2">
                                {tags.map(tag => (
                                    <span key={tag} className="text-sm text-gray-500">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}