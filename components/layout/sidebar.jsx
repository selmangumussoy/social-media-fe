"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Home,
    Compass,
    MessageCircle,
    User,
    Settings,
    Bookmark,
    LogOut,
    Plus,
    X,
    Smile,
    Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logout as authLogout } from "@/services/authService";
import { logout as reduxLogout } from "@/store/slices/userSlice";
import toast from "react-hot-toast";
import { createPost } from "@/services/postService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const menuItems = [
    { icon: Home, label: "Ana Sayfa", href: "/" },
    { icon: Compass, label: "Keşfet", href: "/explore" },
    { icon: MessageCircle, label: "Mesajlar", href: "/chat" },
    { icon: Bookmark, label: "Kaydedilenler", href: "/saved" },
    { icon: User, label: "Profil", href: "/profile" },
    { icon: Settings, label: "Ayarlar", href: "/settings" },
    { icon: Heart, label: "Sosyal Sorumluluk", href: "/social-responsibility" },
];

// Kısa bir duygu seti; istersen çoğaltabilirsin
const FEELINGS = ["😊", "🥳", "😎", "😇", "🤔", "😴", "😢", "😡", "😍", "🤗", "🤩", "🤤"];

export function Sidebar() {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const router = useRouter();
    const currentUser = useSelector((state) => state.user.currentUser);

    const [openTypeModal, setOpenTypeModal] = useState(false);
    const [openComposer, setOpenComposer] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const MAX = 280;
    const [text, setText] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [file, setFile] = useState(null);

    const textRef = useRef(null);

    const remaining = MAX - text.length;

    const isAuthPage = pathname === "/login" || pathname === "/register";
    if (isAuthPage) return null;

    const handleLogout = () => {
        // 1) Redux'tan kullanıcıyı sil
        dispatch(reduxLogout());
        // 2) localStorage'daki token ve current_user'ı sil
        authLogout();
        // 3) Bildirim
        toast.success("Çıkış yapıldı");
        router.push("/login");
    };


    const handleChooseThought = () => {
        setOpenTypeModal(false);
        setTimeout(() => setOpenComposer(true), 30);
    };

    const onPickImage = (e) => setImageFile(e.target.files?.[0] ?? null);
    const onPickFile = (e) => setFile(e.target.files?.[0] ?? null);

    const resetComposer = () => {
        setText("");
        setImageFile(null);
        setFile(null);
    };

    const insertAtCaret = (char) => {
        const el = textRef.current;
        if (!el) {
            setText((prev) => (prev + char).slice(0, MAX));
            return;
        }
        const start = el.selectionStart ?? text.length;
        const end = el.selectionEnd ?? text.length;
        const before = text.slice(0, start);
        const after = text.slice(end);
        const next = (before + char + after).slice(0, MAX);
        setText(next);
        requestAnimationFrame(() => {
            const pos = Math.min(start + char.length, next.length);
            el.focus();
            el.setSelectionRange(pos, pos);
        });
    };

    const handlePublish = async () => {
        const trimmedText = (text ?? "").trim();
        console.log("Publishing thought...", { trimmedText, currentUser });

        if (!trimmedText) return toast.error("Bir şeyler yazmalısın.");
        if (trimmedText.length > 280) return toast.error("En fazla 280 karakter.");

        const userId = currentUser?.id ?? currentUser?.userId;
        if (!userId) {
            console.error("User ID missing!", currentUser);
            return toast.error("Kullanıcı oturumu bulunamadı.");
        }

        try {
            setIsSubmitting(true);

            // 1) Ana Post
            const post = await createPost({
                type: "THOUGHT_POST",
                content: trimmedText.slice(0, 80),
                userId: userId,
                likeCount: 0,
                commentCount: 0,
                // tagId: selectedTagId ?? null,
            });

            // 2) ThoughtPost detay
            await createThoughtPost({
                postId: post.id,
                content: trimmedText,
                // feeling: "...", // İsterseniz buraya duygu ekleyebilirsiniz
            });

            toast.success("Düşünce paylaşıldı ✅");
            resetComposer();
            setOpenComposer(false);

            // feed’i tazelemek istiyorsan burada tekrar fetch et
            // const items = await getAllPosts(); setDbPosts(items);
        } catch (e) {
            console.error(e);
            toast.error("Gönderilemedi ❌");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 flex-col border-r border-border/50 bg-sidebar p-4 lg:flex">
            <nav className="flex flex-1 flex-col gap-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-3 rounded-xl text-base transition-all hover:scale-[1.02]",
                                    isActive && "bg-gradient-to-r from-primary/10 to-secondary/10 font-semibold shadow-sm",
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </Button>
                        </Link>
                    );
                })}

                <Button
                    variant="default"
                    className="w-full justify-start gap-3 rounded-xl text-base font-semibold transition-all hover:scale-[1.02]"
                    onClick={() => setOpenTypeModal(true)}
                >
                    <Plus className="h-5 w-5" />
                    Oluştur
                </Button>
            </nav>

            <Button
                variant="ghost"
                className="w-full justify-start gap-3 rounded-xl text-base text-destructive transition-all hover:scale-[1.02]"
                onClick={handleLogout}
            >
                <LogOut className="h-5 w-5" />
                Çıkış Yap
            </Button>

            {/* Tür Seçim */}
            <Dialog open={openTypeModal} onOpenChange={setOpenTypeModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Yeni Gönderi Türü Seç</DialogTitle>
                    </DialogHeader>

                    <div className="mt-2 grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <Link href="/create-post/quote" className="w-full" onClick={() => setOpenTypeModal(false)}>
                            <div className="border rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition hover:shadow-md hover:border-primary">
                                <span className="text-4xl">📚</span>
                                <h3 className="font-semibold text-lg">Kitap Alıntısı</h3>
                                <p className="text-sm text-muted-foreground text-center">Sevdiğiniz bir alıntıyı paylaşın</p>
                            </div>
                        </Link>

                        <Link href="/create-post/blog" className="w-full" onClick={() => setOpenTypeModal(false)}>
                            <div className="border rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition hover:shadow-md hover:border-primary">
                                <span className="text-4xl">📝</span>
                                <h3 className="font-semibold text-lg">Blog Yazısı</h3>
                                <p className="text-sm text-muted-foreground text-center">Düşüncelerinizi yazıya dökün</p>
                            </div>
                        </Link>

                        <button
                            onClick={handleChooseThought}
                            className="border rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition hover:shadow-md hover:border-primary"
                        >
                            <span className="text-4xl">💭</span>
                            <h3 className="font-semibold text-lg">Düşünce Paylaş</h3>
                            <p className="text-sm text-muted-foreground text-center">Hızlıca düşüncelerinizi yazın</p>
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Düşünce Composer */}
            <Dialog open={openComposer} onOpenChange={(v) => { setOpenComposer(v); if (!v) resetComposer(); }}>
                <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle>Düşünce Paylaş</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        <Textarea
                            ref={textRef}
                            placeholder="Neler oluyor?"
                            value={text}
                            onChange={(e) => setText(e.target.value.slice(0, MAX))}
                            className="min-h-[120px] resize-none"
                        />

                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <label className="inline-flex cursor-pointer items-center rounded-md border px-2 py-1 text-sm hover:bg-muted">
                                    <input type="file" accept="image/*" className="hidden" onChange={onPickImage} />
                                    Görsel
                                </label>

                                <label className="inline-flex cursor-pointer items-center rounded-md border px-2 py-1 text-sm hover:bg-muted">
                                    <input type="file" className="hidden" onChange={onPickFile} />
                                    Dosya
                                </label>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8 gap-1">
                                            <Smile className="h-4 w-4" />
                                            Duygu
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align="start" className="w-[260px]">
                                        <div className="grid grid-cols-6 gap-2">
                                            {FEELINGS.map((em) => (
                                                <button
                                                    key={em}
                                                    type="button"
                                                    className="border-0 bg-transparent p-1 text-2xl shadow-none
             hover:scale-110 transition-transform
             focus:outline-none focus:ring-0"
                                                    onClick={() => insertAtCaret(em)}
                                                >
                                                    {em}
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <span className={cn("text-sm", remaining < 0 ? "text-red-500" : "text-muted-foreground")}>
                                {Math.max(0, remaining)}/{MAX}
                            </span>
                        </div>

                        <div className="space-y-1 text-xs text-muted-foreground">
                            {imageFile && <div>📷 Görsel: {imageFile.name}</div>}
                            {file && <div>📎 Dosya: {file.name}</div>}
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={handlePublish} disabled={!text.trim()}>
                                Gönderi yayınla
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </aside>
    );
}
