"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link" // 👈 1. EKLEME: Link import edildi
import {
    BookOpen,
    Lightbulb,
    MessageCircle,
    Heart,
    Calendar,
    ArrowLeft,
    Loader2,
    Gift
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSocialDashboard } from "@/services/socialService"
import toast from "react-hot-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function SocialResponsibilityPage() {
    const router = useRouter()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isContributeOpen, setIsContributeOpen] = useState(false)

    useEffect(() => {
        async function fetchData() {
            try {
                const dashboardData = await getSocialDashboard()
                setData(dashboardData)
            } catch (error) {
                console.error(error)
                toast.error("Veriler yüklenemedi")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
        )
    }

    // Backend'den veri gelmezse varsayılan boş state (Null check)
    const theme = data || {
        title: "Yükleniyor...",
        description: "...",
        weekLabel: "Hafta --",
        startDate: "",
        endDate: "",
        tags: [],
        blogCount: 0,
        quoteCount: 0,
        thoughtPostCount: 0,
        suggestionCount: 0
    }

    // İstatistik Kartı Bileşeni
    const StatCard = ({ icon: Icon, count, label, colorClass, bgClass }) => (
        <Card className="p-6 border-gray-100 shadow-sm flex flex-col items-start justify-between hover:shadow-md transition-all bg-white">
            <div className={`p-3 rounded-xl mb-4 ${bgClass}`}>
                <Icon className={`w-6 h-6 ${colorClass}`} />
            </div>
            <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{count}</h3>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
            </div>
        </Card>
    )

    return (
        <div className="min-h-screen bg-[#F9FAFB] pb-20">
            <div className="max-w-5xl mx-auto p-6">

                {/* --- HEADER --- */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        className="text-gray-500 hover:text-gray-900 pl-0 gap-2 mb-4 hover:bg-transparent"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4" /> Ayarlara Dön
                    </Button>

                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-teal-500 rounded-xl shadow-sm">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Sosyal Sorumluluk</h1>
                            <p className="text-gray-500 text-sm">Toplumsal bilinç ve katkılarınız</p>
                        </div>
                    </div>
                </div>

                {/* --- YEŞİL TEMA KARTI --- */}
                <div className="bg-[#ECFDF5] border border-emerald-100 rounded-3xl p-8 mb-8 relative overflow-hidden shadow-sm">
                    {/* Dekoratif Arkaplan */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-3 text-sm">
                                    <Calendar className="w-4 h-4" />
                                    <span>{theme.weekLabel || "Bu Haftanın Teması"}</span>
                                </div>

                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                    {theme.title}
                                </h2>

                                <p className="text-gray-700 text-lg leading-relaxed mb-6 max-w-3xl">
                                    {theme.description}
                                </p>

                                {/* Etiketler */}
                                {theme.tags && theme.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {theme.tags.map((tag, index) => (
                                            <span key={index} className="text-emerald-700 font-medium text-sm bg-emerald-100/50 px-2 py-1 rounded-md">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="text-sm text-gray-500 font-medium">
                                    {theme.startDate} - {theme.endDate}
                                </div>
                            </div>

                            <Button
                                onClick={() => setIsContributeOpen(true)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-6 rounded-xl shadow-lg shadow-emerald-200 transition-transform hover:scale-105 active:scale-95"
                            >
                                Katkı Sağla
                            </Button>
                        </div>
                    </div>
                </div>

                {/* --- TABLAR ve KARTLAR --- */}
                <Tabs defaultValue="overview" className="space-y-8">
                    <TabsList className="bg-transparent border-b border-gray-200 w-full justify-start h-auto p-0 rounded-none gap-6">
                        <TabsTrigger
                            value="overview"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-700 rounded-none px-1 py-3 text-gray-500 font-medium hover:text-gray-700"
                        >
                            Genel Bakış
                        </TabsTrigger>
                        <TabsTrigger
                            value="contributions"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-700 rounded-none px-1 py-3 text-gray-500 font-medium hover:text-gray-700"
                        >
                            Katkılarım
                        </TabsTrigger>
                        <TabsTrigger
                            value="impact"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-700 rounded-none px-1 py-3 text-gray-500 font-medium hover:text-gray-700"
                        >
                            Etkim
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 focus:outline-none animate-in fade-in-50 duration-500">

                        {/* 4'lü KART YAPISI */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                            {/* 1. Blog Yazısı */}
                            <StatCard
                                icon={BookOpen}
                                count={theme.blogCount}
                                label="Blog Yazısı"
                                colorClass="text-blue-600"
                                bgClass="bg-blue-50"
                            />

                            {/* 2. Alıntı */}
                            <StatCard
                                icon={Lightbulb}
                                count={theme.quoteCount}
                                label="Alıntı"
                                colorClass="text-purple-600"
                                bgClass="bg-purple-50"
                            />

                            {/* 3. Tartışma */}
                            <StatCard
                                icon={MessageCircle}
                                count={theme.thoughtPostCount}
                                label="Tartışma"
                                colorClass="text-emerald-600"
                                bgClass="bg-emerald-50"
                            />

                            {/* 4. Bağış (Öneri yerine Bağış olarak güncellendi) */}
                            <StatCard
                                icon={Gift}
                                count={theme.suggestionCount} // Backend'den gelen sayı (suggestionCount) burada kullanılıyor
                                label="Bağış"
                                colorClass="text-pink-600"
                                bgClass="bg-pink-50"
                            />
                        </div>

                    </TabsContent>

                    <TabsContent value="contributions">
                        <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
                            <p>Detaylı katkı geçmişi yakında burada olacak.</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="impact">
                        <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
                            <p>Etki analizleri yakında burada olacak.</p>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* 👇 2. EKLEME: KATKI SAĞLAMA MODALI (Sadece Öneri ve Bağış) */}
                <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-center">Destek Ol</DialogTitle>
                            <DialogDescription className="text-center">
                                Topluluğumuzu geliştirmek için öneride bulunabilir veya bağış yaparak destek olabilirsin.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-2 gap-4 mt-4">

                            {/* 1. Öneri Seçeneği */}
                            <Link href="/suggestion" className="w-full" onClick={() => setIsContributeOpen(false)}>
                                <div className="h-full border rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:border-purple-500 hover:bg-purple-50 hover:shadow-md group text-center">
                                    <div className="p-4 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                                        <Heart className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Öneri Yap</h3>
                                        <p className="text-xs text-gray-500 mt-1">Fikirlerini paylaş</p>
                                    </div>
                                </div>
                            </Link>

                            {/* 2. Bağış Seçeneği */}
                            <Link href="/donate" className="w-full" onClick={() => setIsContributeOpen(false)}>
                                <div className="h-full border rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:border-pink-500 hover:bg-pink-50 hover:shadow-md group text-center">
                                    <div className="p-4 bg-pink-100 rounded-full group-hover:bg-pink-200 transition-colors">
                                        <Gift className="w-8 h-8 text-pink-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Bağış Yap</h3>
                                        <p className="text-xs text-gray-500 mt-1">Projeye destek ol</p>
                                    </div>
                                </div>
                            </Link>

                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    )
}