"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { createPost } from "@/services/postService"
import { createBlogPost } from "@/services/blogPostService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"
import {
    X,
    Tag as TagIcon,
    Bold,
    Italic,
    Underline as UnderlineIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    ListOrdered,
    Quote,
    Code,
    Image as ImageIcon,
    Video,
    Table as TableIcon,
    Plus,
    Minus,
    Palette
} from "lucide-react"

// Tiptap Editör Paketleri
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Image } from '@tiptap/extension-image'
import { Youtube } from '@tiptap/extension-youtube'
import { TextAlign } from '@tiptap/extension-text-align'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'

export default function BlogPage() {
    const router = useRouter()
    const currentUser = useSelector((state) => state.user.currentUser)

    // --- State'ler ---
    const [title, setTitle] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [tags, setTags] = useState([])
    const [tagInput, setTagInput] = useState("")
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    // --- TIPTAP EDİTÖR AYARLARI ---
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Image,
            Youtube.configure({ controls: false }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            TextStyle,
            Color,
        ],
        content: '<p>Yazmaya başlayın...</p>',
        editorProps: {
            attributes: {
                class: 'prose prose-lg focus:outline-none min-h-[500px] p-6 text-gray-700 leading-relaxed max-w-none',
            },
        },
        immediatelyRender: false,
    })

    // --- Etiket Fonksiyonları ---
    const handleAddTag = () => {
        const trimmedTag = tagInput.trim().toLowerCase();
        if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
            setTags([...tags, trimmedTag]);
            setTagInput("");
        }
    }

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
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
        if (typeof window === "undefined") return "";
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    }

    // --- YAYINLA FONKSİYONU ---
    const handlePublish = async () => {
        if (!editor) return;

        const htmlContent = editor.getHTML(); // Tam içerik (HTML)
        const plainText = stripHtml(htmlContent); // Düz metin (Özet için)

        if (!title.trim() || !plainText.trim()) {
            return toast.error("Başlık ve içerik zorunludur");
        }

        if (!currentUser?.id) {
            return toast.error("Lütfen önce giriş yapın.");
        }

        try {
            setIsSubmitting(true);

            // 1. Ana Postu Oluştur (Özet)
            // İlk 200 karakteri özet olarak alıyoruz
            const summary = plainText.substring(0, 200) + (plainText.length > 200 ? "..." : "");

            const postPayload = {
                type: "BLOG_POST",
                userId: currentUser.id, // Redux'tan gelen gerçek ID
                title: title,
                content: summary, // Ana sayfada görünecek kısım
                likeCount: 0,
                commentCount: 0,
                // tags: tags (Eğer backend tags destekliyorsa buraya ekle)
            }

            // Ana postu kaydet ve ID'sini al
            const createdPost = await createPost(postPayload);

            // 2. Blog Detayını Kaydet (Tam HTML)
            await createBlogPost({
                postId: createdPost.id, // İlişkiyi kuruyoruz
                blogContent: htmlContent, // Biçimlendirilmiş, resimli tam içerik
                coverImage: null,
                title: title,
                tags: tags,
            });

            toast.success("Blog yazısı başarıyla yayınlandı! 🎉");
            router.push("/"); // Ana sayfaya yönlendir

        } catch (error) {
            console.error(error);
            toast.error("Yayınlanırken hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!editor) return null;

    // Araç Çubuğu Butonu Bileşeni
    const ToolbarBtn = ({ onClick, isActive, icon }) => (
        <button
            onClick={onClick}
            className={`p-2 rounded-full transition-colors border flex items-center justify-center h-10 w-10 ${
                isActive
                    ? 'bg-green-600 text-white border-green-600 shadow-sm'
                    : 'bg-white text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300'
            }`}
            title="Aracı kullan"
        >
            {icon}
        </button>
    )

    return (
        <div className="container mx-auto p-6 max-w-6xl min-h-screen bg-white">
            {/* Üst Bar */}
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

            <div className="space-y-8">
                {/* BAŞLIK ve ETİKETLER */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-2">
                        <label className="font-bold text-gray-800 text-lg">Konu Başlığı</label>
                        <Input
                            placeholder="Genel konu başlığı giriniz..."
                            className="h-14 text-lg border-gray-300 bg-gray-50 focus-visible:ring-green-600"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="font-bold text-gray-800 text-lg flex items-center gap-2">🏷️ Etiket Seç</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Etiket yazıp Enter'a basın..."
                                className="h-14 text-lg border-gray-300 bg-gray-50 focus-visible:ring-green-600"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                            />
                            <Button onClick={handleAddTag} variant="outline" className="h-14 px-6 border-gray-300 text-gray-700">Ekle</Button>
                        </div>

                        {/* Etiket Listesi */}
                        <div className="flex flex-wrap gap-2 min-h-[32px]">
                            {tags.map((tag, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                            #{tag}
                                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-600 transition-colors"><X size={14} /></button>
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

                <p className="text-sm text-gray-400 text-center">Yazınız otomatik olarak taslaklara kaydedilmez, lütfen yayınlamayı unutmayın.</p>
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