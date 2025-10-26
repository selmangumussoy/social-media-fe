"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import { searchTags, createTag } from "@/services/tagService"

// ✨ Tiptap editor
const TiptapEditor = dynamic(() => import("./tiptap-editor"), { ssr: false })

export default function BlogPage() {
    const [savedContent, setSavedContent] = useState("")
    const [tags, setTags] = useState<string[]>([])
    const [search, setSearch] = useState("")
    const [filtered, setFiltered] = useState<string[]>([])

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newTag, setNewTag] = useState({ name: "", description: "" })

    // Arama
    useEffect(() => {
        const fetchTags = async () => {
            if (search.length > 1) {
                const result = await searchTags(search)
                setFiltered(result.filter((t: string) => !tags.includes(t)))
            } else {
                setFiltered([])
            }
        }
        fetchTags()
    }, [search, tags])

    const addTag = (tag: string) => {
        setTags([...tags, tag])
        setSearch("")
        setFiltered([])
    }

    const removeTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag))
    }

    const handleCreateTag = async () => {
        if (!newTag.name.trim()) return
        try {
            await createTag(newTag)
            addTag(newTag.name)
            setNewTag({ name: "", description: "" })
            setIsDialogOpen(false)
        } catch (e) {
            console.error("Etiket oluşturulamadı", e)
        }
    }

    return (
        <div className="w-full min-h-screen bg-white p-6 space-y-6">
            {/* Etiket Alanı */}
            <div>
                <h2 className="text-lg font-semibold mb-2">🏷️ Etiket Seç</h2>

                {/* Seçilen Etiketler */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full cursor-pointer hover:bg-green-200"
                            onClick={() => removeTag(tag)}
                        >
              {tag} ✕
            </span>
                    ))}
                </div>

                {/* Arama ve Yeni Etiket Butonu Yan Yana */}
                <div className="flex gap-2 mb-2">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Etiket ara..."
                        className="border px-3 py-2 rounded w-full"
                    />
                    <button
                        onClick={() => setIsDialogOpen(true)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        + Yeni
                    </button>
                </div>

                {/* Arama Sonuçları */}
                {search && (
                    <div className="border rounded p-2 bg-gray-50">
                        {filtered.length > 0 ? (
                            filtered.map((tag) => (
                                <div
                                    key={tag}
                                    onClick={() => addTag(tag)}
                                    className="px-2 py-1 cursor-pointer hover:bg-green-100 rounded"
                                >
                                    {tag}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">Sonuç bulunamadı</p>
                        )}
                    </div>
                )}
            </div>

            {/* Editör */}
            <TiptapEditor onSave={setSavedContent} />

            {/* Kaydedilen İçerik */}
            {savedContent && (
                <div className="mt-6 p-4 border rounded bg-gray-50">
                    <h2 className="font-semibold mb-2">📌 Kaydedilen İçerik:</h2>
                    <div dangerouslySetInnerHTML={{ __html: savedContent }} />
                    <p className="mt-3 text-sm text-gray-600">
                        Etiketler: {tags.join(", ")}
                    </p>
                </div>
            )}

            {/* Yeni Etiket Dialog */}
            {isDialogOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-[400px]">
                        <h3 className="text-lg font-semibold mb-4">+ Yeni Etiket</h3>

                        <input
                            type="text"
                            placeholder="Etiket adı"
                            value={newTag.name}
                            onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                            className="border w-full px-3 py-2 rounded mb-3"
                        />
                        <textarea
                            placeholder="Etiket açıklaması"
                            value={newTag.description}
                            onChange={(e) =>
                                setNewTag({ ...newTag, description: e.target.value })
                            }
                            className="border w-full px-3 py-2 rounded mb-3"
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsDialogOpen(false)}
                                className="px-4 py-2 rounded border"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleCreateTag}
                                className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
