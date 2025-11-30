"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { updatePost } from "@/services/postService" // Ana post güncelleme
import { getBlogPostById, updateBlogPost } from "@/services/blogPostService" // Blog detay işlemleri
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"
import {
    X, Bold, Italic, Underline as UnderlineIcon,
    AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Quote,
    Image as ImageIcon, Video, Table as TableIcon, Save
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

export default function EditBlogPage() {
    const router = useRouter()
    const params = useParams()
    const urlPostId = params.id // URL'den gelen POST ID (168ba...)

    // --- State'ler ---
    const [title, setTitle] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [tags, setTags] = useState([])
    const [tagInput, setTagInput] = useState("")

    // 👇 ÖNEMLİ: Veritabanındaki Gerçek Blog ID'sini (41ec...) burada saklayacağız
    const [realBlogId, setRealBlogId] = useState(null)

    // --- TIPTAP EDİTÖR KURULUMU ---
    const editor = useEditor({
        extensions: [
            StarterKit, Underline, Image, Youtube.configure({ controls: false }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Table.configure({ resizable: true }), TableRow, TableHeader, TableCell,
            TextStyle, Color,
        ],
        content: '', // İlk başta boş, veri gelince dolacak
        editorProps: {
            attributes: {
                class: 'prose prose-lg focus:outline-none min-h-[500px] p-6 text-gray-700 leading-relaxed max-w-none',
            },
        },
        immediatelyRender: false
    })

    // --- VERİLERİ ÇEKME VE DOLDURMA ---
    useEffect(() => {
        const fetchData = async () => {
            if (!urlPostId) return;

            try {
                // 1. Backend'den veriyi Post ID ile çekiyoruz
                const data = await getBlogPostById(urlPostId);

                if (data) {
                    // Veri bazen dizi, bazen obje gelebilir
                    const blogData = Array.isArray(data) ? data[0] : data;

                    // 2. State'leri dolduruyoruz
                    setTitle(blogData.title || "");
                    setTags(blogData.tags || []);
                    setRealBlogId(blogData.id); // Kritik nokta: Güncelleme için gerçek ID'yi alıyoruz

                    // 3. Editör içeriğini dolduruyoruz
                    if (editor && blogData.blogContent) {
                        // Mevcut içeriği temizleyip yenisini ekliyoruz
                        editor.commands.setContent(blogData.blogContent);
                    }
                } else {
                    toast.error("Blog verisi bulunamadı.");
                }
            } catch (error) {
                console.error("Veri yükleme hatası:", error);
                toast.error("Veriler yüklenirken hata oluştu.");
            } finally {
                setLoading(false);
            }
        }

        // Editör hazır olduğunda veriyi çek
        if (editor) {
            fetchData();
        }
    }, [urlPostId, editor]);

    // --- YARDIMCI FONKSİYONLAR ---
    const handleAddTag = () => {
        const trimmedTag = tagInput.trim().toLowerCase();
        if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
            setTags([...tags, trimmedTag]);
            setTagInput("");
        }
    }
    const handleRemoveTag = (tagToRemove) => setTags(tags.filter(tag => tag !== tagToRemove));

    // HTML'den düz metin çıkarma (Özet için)
    const stripHtml = (html) => {
        if (typeof window === "undefined") return "";
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    }

    // Editör Buton Fonksiyonları
    const addImage = () => {
        const url = window.prompt('Resim URL\'si girin:')
        if (url && editor) editor.chain().focus().setImage({ src: url }).run()
    }
    const addVideo = () => {
        const url = window.prompt('YouTube Video URL\'si girin:')
        if (url && editor) editor.commands.setYoutubeVideo({ src: url })
    }

    // --- GÜNCELLEME İŞLEMİ ---
    const handleUpdate = async () => {
        if (!editor) return;

        const htmlContent = editor.getHTML();
        const plainText = stripHtml(htmlContent);

        if (!title.trim() || !plainText.trim()) {
            return toast.error("Başlık ve içerik zorunludur");
        }
        if (!realBlogId) {
            return toast.error("ID yüklenemedi, lütfen sayfayı yenileyin.");
        }

        try {
            setIsSubmitting(true);

            // İlk 200 karakteri özet yap
            const summary = plainText.substring(0, 200) + (plainText.length > 200 ? "..." : "");

            // 1. Ana Postu Güncelle (Başlık, Özet vb.) - URL'deki Post ID ile
            await updatePost(urlPostId, {
                title: title,
                content: summary,
                type: "BLOG_POST"
            });

            // 2. Blog Detayını Güncelle (HTML İçerik) - Gerçek Blog ID ile
            await updateBlogPost(realBlogId, {
                title: title,
                blogContent: htmlContent,
                tags: tags
                // coverImage varsa buraya eklenebilir
            });

            toast.success("Blog yazısı güncellendi! ✅");
            router.push("/feed"); // Veya profil sayfasına

        } catch (error) {
            console.error(error);
            toast.error("Güncellenirken hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (loading) return <div className="flex justify-center items-center h-screen">Yükleniyor...</div>;
    if (!editor) return null;

    const ToolbarBtn = ({ onClick, isActive, icon }) => (
        <button onClick={onClick} className={`p-2 rounded-full transition-colors border flex items-center justify-center h-10 w-10 ${isActive ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-green-700 border-green-200 hover:bg-green-50'}`}>{icon}</button>
    )

    return (
        <div className="container mx-auto p-6 max-w-6xl min-h-screen bg-white">
            {/* Üst Bar */}
            <div className="flex justify-end gap-3 mb-8">
                <Button variant="outline" onClick={() => router.back()}>İptal</Button>
                <Button onClick={handleUpdate} disabled={isSubmitting} className="bg-green-700 text-white hover:bg-green-800 font-semibold px-6">
                    {isSubmitting ? "Güncelleniyor..." : <><Save className="w-4 h-4 mr-2"/> Güncelle</>}
                </Button>
            </div>

            <div className="space-y-8">
                {/* BAŞLIK ve ETİKETLER */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-2">
                        <label className="font-bold text-gray-800 text-lg">Konu Başlığı</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-14 text-lg border-gray-300 bg-gray-50 focus-visible:ring-green-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="font-bold text-gray-800 text-lg">🏷️ Etiketler</label>
                        <div className="flex gap-2">
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                placeholder="Etiket ekle..."
                                disabled={tags.length >= 5}
                            />
                            <Button onClick={handleAddTag} variant="outline" disabled={tags.length >= 5}>Ekle</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[32px]">
                            {tags.map((tag, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                                    #{tag} <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-600"><X size={14} /></button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* EDİTÖR ARAÇ ÇUBUĞU VE ALANI */}
                <div className="rounded-xl border border-gray-300 overflow-hidden shadow-sm">
                    <div className="bg-[#EAEAE8] p-4 flex flex-wrap gap-2 items-center border-b border-gray-300">
                        {/* Araç Çubuğu Butonları */}
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

                    {/* İçerik Alanı */}
                    <div className="bg-white min-h-[600px]">
                        <EditorContent editor={editor} />
                    </div>
                </div>
            </div>
        </div>
    )
}