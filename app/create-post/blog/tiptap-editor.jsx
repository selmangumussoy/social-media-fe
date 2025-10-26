"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Image from "@tiptap/extension-image"
import Youtube from "@tiptap/extension-youtube"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import {
    Bold, Italic, Underline as UnderlineIcon,
    AlignLeft, AlignCenter, AlignRight,
    List, ListOrdered, Quote, Code,
    Image as ImageIcon, Video, Table as TableIcon,
    Plus, Minus
} from "lucide-react"

import { useRef } from "react"

export default function BlogEditor() {
    const fileInputRef = useRef(null)

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Image,
            Youtube,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: "<p>Yazmaya başlayın...</p>",
        immediatelyRender: false,
    })

    if (!editor) return null

    // Fotoğraf yükleme
    const handleImageUpload = (event) => {
        const file = event.target.files?.[0]
        if (file) {
            const imageUrl = URL.createObjectURL(file) // geçici URL
            editor.chain().focus().setImage({ src: imageUrl }).run()
        }
    }

    return (
        <div className="w-full h-screen flex flex-col bg-white">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 p-3 border-b border-border bg-muted">
                {/* Bold */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive("bold")}
                    icon={<Bold size={18} />}
                />

                {/* Italic */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive("italic")}
                    icon={<Italic size={18} />}
                />

                {/* Underline */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive("underline")}
                    icon={<UnderlineIcon size={18} />}
                />

                {/* Align */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    isActive={editor.isActive({ textAlign: "left" })}
                    icon={<AlignLeft size={18} />}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    isActive={editor.isActive({ textAlign: "center" })}
                    icon={<AlignCenter size={18} />}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    isActive={editor.isActive({ textAlign: "right" })}
                    icon={<AlignRight size={18} />}
                />

                {/* Lists */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive("bulletList")}
                    icon={<List size={18} />}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive("orderedList")}
                    icon={<ListOrdered size={18} />}
                />

                {/* Blockquote */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive("blockquote")}
                    icon={<Quote size={18} />}
                />

                {/* Code */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive("codeBlock")}
                    icon={<Code size={18} />}
                />

                {/* Image upload */}
                <ToolbarButton
                    onClick={() => fileInputRef.current?.click()}
                    icon={<ImageIcon size={18} />}
                />
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                />

                {/* Youtube */}
                <ToolbarButton
                    onClick={() => {
                        const url = window.prompt("YouTube URL'si:")
                        if (url) editor.commands.setYoutubeVideo({ src: url })
                    }}
                    icon={<Video size={18} />}
                />

                {/* Table */}
                <ToolbarButton
                    onClick={() =>
                        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                    }
                    icon={<TableIcon size={18} />}
                />
                {/* Tabloya satır/kolon ekle/sil */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                    icon={<Plus size={18} />}
                />
                <ToolbarButton
                    onClick={() => editor.chain().focus().deleteColumn().run()}
                    icon={<Minus size={18} />}
                />
            </div>

            {/* Editor */}
            <EditorContent
                editor={editor}
                className="prose prose-lg w-full flex-1 p-8 focus:outline-none"
            />
        </div>
    )
}

/* Toolbar button component */
function ToolbarButton({ onClick, isActive, icon }) {
    return (
        <button
            onClick={onClick}
            className={`p-2 border border-green-500 rounded-full transition-all ${
                isActive ? "bg-green-500 text-white" : "text-green-600 hover:bg-green-100"
            }`}
        >
            {icon}
        </button>
    )
}
