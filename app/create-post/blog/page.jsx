"use client";

import { useState, useEffect } from "react";
import { searchTags, createTag } from "@/services/tagService";
import { createPost } from "@/services/postService";
import { createBlogPost } from "@/services/blogPostService";

// ✨ Tiptap editor
import BlogEditor from "./tiptap-editor";

export default function BlogPage() {
    const [title, setTitle] = useState("");
    const [savedContent, setSavedContent] = useState("")
    const [savedText, setSavedText] = useState("")
    const [tags, setTags] = useState([]);
    const [search, setSearch] = useState("");
    const [filtered, setFiltered] = useState([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // 🔍 Etiket Arama
    useEffect(() => {
        const fetchTags = async () => {
            if (search.length > 1) {
                try {
                    const result = await searchTags(search);
                    setFiltered(result.filter((t) => !tags.some((sel) => sel.id === t.id)));
                } catch (e) {
                    console.error("Tag search error:", e);
                    setFiltered([]);
                }
            } else {
                setFiltered([]);
            }
        };
        fetchTags();
    }, [search, tags]);

    const addTag = (tag) => {
        setTags((prev) => [...prev, tag]);
        setSearch("");
        setFiltered([]);
    };

    const removeTag = (tag) => {
        setTags((prev) => prev.filter((t) => t.id !== tag.id));
    };

    // 📝 Yayınla
    const handlePublish = async () => {
        if (!title.trim() ) {
            alert("Lütfen başlık ve içerik giriniz!");
            return;
        }

        setLoading(true);
        try {
            // 1️⃣ Post oluştur
            const postPayload = {
                type: "BLOG_POST",
                userId: "current-user-id", // TODO: auth bağla
                content: title,
                tagId: tags.length > 0 ? tags[0].id : null,
                likeCount: 0,
                commentCount: 0,
            };

            const postResponse = await createPost(postPayload);

            // 2️⃣ BlogPost kaydet
            const blogPayload = {
                blogContent: savedContent,
                postId: postResponse.id,
            };

            await createBlogPost(blogPayload);

            alert("Blog başarıyla yayınlandı!");
            resetForm();
        } catch (error) {
            console.error(error);
            alert("Blog yayınlanamadı!");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setSavedContent("");
        setTags([]);
    };

    return (
        <div className="w-full min-h-screen bg-background p-6 space-y-6">
            {/* Üst Butonlar */}
            <div className="flex justify-end gap-2">
                <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
                >
                    Önizle
                </button>
                <button
                    onClick={handlePublish}
                    disabled={loading}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-50"
                >
                    {loading ? "Yükleniyor..." : "Yayınla"}
                </button>
            </div>

            {/* Başlık + Etiket */}
            <div className="flex gap-4 items-start">
                <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Konu Başlığı</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Genel konu başlığı giriniz..."
                        className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">🏷️ Etiket Seç</label>
                    <div className="flex gap-2">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Etiket ara..."
                            className="border px-3 py-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Seçilen Etiketler */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag) => (
                            <span
                                key={tag.id}
                                className="px-3 py-1 bg-accent text-accent-foreground rounded-full cursor-pointer hover:bg-accent/80"
                                onClick={() => removeTag(tag)}
                            >
                                {tag.name} ✕
                            </span>
                        ))}
                    </div>

                    {/* Arama Sonuçları */}
                    {search && (
                        <div className="border rounded p-2 bg-muted mt-2">
                            {filtered.length > 0 ? (
                                filtered.map((tag) => (
                                    <div
                                        key={tag.id}
                                        onClick={() => addTag(tag)}
                                        className="px-2 py-1 cursor-pointer hover:bg-accent rounded"
                                    >
                                        {tag.name}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">Sonuç bulunamadı</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Editör */}
            <BlogEditor onChange={(html, text) => {
                setSavedContent(html)
                setSavedText(text)
            }} />

            {/* Önizleme Modal */}
            {isPreviewOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-background p-6 rounded shadow-lg w-[600px] max-h-[80vh] overflow-auto">
                        <h3 className="text-lg font-semibold mb-4">📖 Önizleme</h3>
                        <h4 className="font-bold text-lg mb-2">{title}</h4>
                        <div dangerouslySetInnerHTML={{ __html: savedContent }} />
                        <p className="mt-3 text-sm">
                            Etiketler: {tags.map((t) => t.name).join(", ")}
                        </p>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setIsPreviewOpen(false)}
                                className="px-4 py-2 rounded border"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
