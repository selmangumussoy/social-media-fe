"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
    BookOpen,
    Lightbulb,
    MessageCircle,
    Heart,
    Calendar,
    ArrowLeft,
    Loader2,
    Sprout,
    PenTool,
    ArrowUpRight,
    Sparkles,
    Trash2,     // Silme ikonu
    Edit,       // Düzenleme ikonu
    X,          // Kapatma ikonu
    Save        // Kaydet ikonu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// Yeni eklediğimiz servisleri import et
import {
    getSocialDashboard,
    getMyContributions,
    getMySocialPosts,
    getMyRecommendations,
    submitSocialSuggestion,
    updateSocialRecommendation, // <-- Yeni
    deleteSocialRecommendation  // <-- Yeni
} from "@/services/socialService"
import toast from "react-hot-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter // <-- Yeni
} from "@/components/ui/dialog"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

export default function SocialResponsibilityPage() {
    const router = useRouter()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    // --- KATKILARIM SEKME STATE'LERİ ---
    const [contributionStats, setContributionStats] = useState(null)
    const [selectedType, setSelectedType] = useState(null)
    const [detailList, setDetailList] = useState([])
    const [detailLoading, setDetailLoading] = useState(false)


    // Modallar
    const [isContributeOpen, setIsContributeOpen] = useState(false)
    const [isSuggestionOpen, setIsSuggestionOpen] = useState(false)

    const [suggestionText, setSuggestionText] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // --- 👇 YENİ: DETAY MODAL STATE'LERİ ---
    const [selectedRec, setSelectedRec] = useState(null) // Tıklanan öneri verisi
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false) // Detay modalı açık mı?
    const [isEditing, setIsEditing] = useState(false) // Düzenleme modunda mı?
    const [editText, setEditText] = useState("") // Düzenlenen metin
    const [isModalReadOnly, setIsModalReadOnly] = useState(false)
    // Sayfa Yüklendiğinde Genel Dashboard'u Çek
    useEffect(() => {
        async function fetchData() {
            try {
                const dashboardData = await getSocialDashboard().catch(() => null)
                setData(dashboardData)
            } catch (error) {
                console.error("Dashboard verisi alınamadı", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleTabChange = async (value) => {
        if (value === "contributions" && !contributionStats) {
            try {
                const stats = await getMyContributions();
                setContributionStats(stats);
            } catch (e) {
                console.error("Katkılarım çekilemedi", e);
            }
        }
    }

    const handleCardClick = async (type) => {
        setSelectedType(type);
        setDetailLoading(true);
        setDetailList([]);

        try {
            let listData = [];
            if (type === 'RECOMMENDATION') {
                const recs = await getMyRecommendations();
                listData = (Array.isArray(recs) ? recs : (recs?.items || []))
                    .map(item => ({
                        ...item,
                        type: 'RECOMMENDATION',
                        timeAgo: item.created
                    }));
            } else {
                const posts = await getMySocialPosts(type);
                listData = Array.isArray(posts) ? posts : (posts?.items || posts?.data || []);
            }
            setDetailList(listData);
        } catch (e) {
            console.error(e);
            toast.error("Liste yüklenemedi");
        } finally {
            setDetailLoading(false);
        }
    }

    const handleBackToCards = () => {
        setSelectedType(null);
        setDetailList([]);
    }

    const handleTemaDonation = () => window.open("https://www.tema.org.tr/bagis-ve-destek", "_blank")

    const handleSuggestionClick = () => {
        setIsContributeOpen(false)
        setIsSuggestionOpen(true)
    }

    const handleSendSuggestion = async () => {
        if (!suggestionText.trim()) {
            toast.error("Lütfen bir içerik veya öneri yazın.")
            return
        }
        setIsSubmitting(true)
        try {
            await submitSocialSuggestion(suggestionText)
            toast.success("Öneriniz başarıyla gönderildi!")

            // Verileri tazele
            const dashboardData = await getSocialDashboard().catch(() => null)
            setData(dashboardData)
            const stats = await getMyContributions().catch(() => null)
            setContributionStats(stats)

            setSuggestionText("")
            setIsSuggestionOpen(false)
        } catch (error) {
            console.error(error)
            toast.error("Gönderim sırasında bir hata oluştu.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // --- 👇 YENİ: SİLME VE GÜNCELLEME İŞLEMLERİ ---

    // Bir öneriye tıklandığında çalışır
    const handleRecClick = (rec, readOnly = false) => { // <-- readOnly parametresi eklendi
        setSelectedRec(rec)
        setEditText(rec.description || rec.title)
        setIsEditing(false)
        setIsModalReadOnly(readOnly) // <-- State güncelleniyor
        setIsDetailModalOpen(true)
    }

    const handleDeleteRec = async () => {
        if (!confirm("Bu öneriyi silmek istediğinize emin misiniz?")) return;

        try {
            await deleteSocialRecommendation(selectedRec.id)
            toast.success("Öneri silindi")
            setIsDetailModalOpen(false)

            setDetailList(prev => prev.filter(item => item.id !== selectedRec.id))

            setData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    latestActivities: (prev.latestActivities || []).filter(activity => activity.id !== selectedRec.id)
                }
            })

            const stats = await getMyContributions().catch(() => null)
            setContributionStats(stats)

        } catch (error) {
            console.error(error)
            toast.error("Silme başarısız")
        }
    }

    const handleUpdateRec = async () => {
        if (!editText.trim()) return;

        try {
            await updateSocialRecommendation(selectedRec.id, editText)
            toast.success("Öneri güncellendi")
            setIsEditing(false)

            setDetailList(prev => prev.map(item =>
                item.id === selectedRec.id
                    ? { ...item, description: editText, title: "Kullanıcı Önerisi / İçerik" }
                    : item
            ))
            setData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    latestActivities: (prev.latestActivities || []).map(activity =>
                        activity.id === selectedRec.id
                            ? { ...activity, description: editText, title: "Kullanıcı Önerisi / İçerik" }
                            : activity
                    )
                }
            })
            setSelectedRec(prev => ({ ...prev, description: editText }))

        } catch (error) {
            console.error(error)
            toast.error("Güncelleme başarısız")
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
        )
    }

    const theme = data || {
        title: "Yükleniyor...", description: "...", weekLabel: "Hafta --",
        startDate: "", endDate: "", tags: [], blogCount: 0, quoteCount: 0,
        thoughtPostCount: 0, suggestionCount: 0, donationCount: 0, latestActivities: []
    }

    // --- BİLEŞENLER ---

    const StatCard = ({ icon: Icon, count, label, colorClass, bgClass }) => (
        <Card className="p-6 border-gray-100 shadow-sm flex flex-col items-start justify-between hover:shadow-md transition-all bg-white">
            <div className={`p-3 rounded-xl mb-4 ${bgClass}`}><Icon className={`w-6 h-6 ${colorClass}`} /></div>
            <div><h3 className="text-3xl font-bold text-gray-900 mb-1">{count || 0}</h3><p className="text-sm text-gray-500 font-medium">{label}</p></div>
        </Card>
    )

    const ActivityItem = ({ activity, readOnly = false }) => {
        let Icon = MessageCircle;
        let iconBg = "bg-gray-100";
        let iconColor = "text-gray-600";
        let actionText = "Bir içerik paylaştı";
        let isRec = false;

        if (activity.type === "BLOG_POST") {
            Icon = BookOpen; iconBg = "bg-blue-50"; iconColor = "text-blue-600"; actionText = "Blog yazısı paylaştınız";
        } else if (activity.type === "QUOTE_POST") {
            Icon = Lightbulb; iconBg = "bg-purple-50"; iconColor = "text-purple-600"; actionText = "Alıntı paylaştınız";
        } else if (activity.type === "RECOMMENDATION") {
            Icon = PenTool; iconBg = "bg-red-50"; iconColor = "text-red-600"; actionText = "Öneri veya içerik paylaştınız";
            isRec = true;
        }

        let timeAgo = "";
        try {
            if (activity.timeAgo || activity.created) {
                timeAgo = formatDistanceToNow(new Date(activity.timeAgo || activity.created), { addSuffix: true, locale: tr });
            }
        } catch (e) { timeAgo = ""; }

        return (
            <div
                // 👇 EĞER ÖNERİYSE handleRecClick ÇAĞIR, DEĞİLSE ROUTER.PUSH
                onClick={() => isRec ? handleRecClick(activity, readOnly) : router.push(`/post/${activity.id}`)}                className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-100 last:border-0 cursor-pointer group"
            >
                <div className={`p-3 rounded-xl shrink-0 ${iconBg} group-hover:scale-105 transition-transform`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {activity.type === 'RECOMMENDATION' ? (activity.description || activity.title) : activity.title}
                    </h4>
                    <p className="text-sm text-gray-500 mb-2">{actionText}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                        <span>{timeAgo}</span>
                        {!isRec && (
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1 hover:text-red-500"><Heart className="w-3.5 h-3.5" /> {activity.likeCount || 0}</span>
                                <span className="flex items-center gap-1 hover:text-blue-500"><MessageCircle className="w-3.5 h-3.5" /> {activity.commentCount || 0}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB] pb-20">
            <div className="max-w-5xl mx-auto p-6">

                {/* HEADER */}
                <div className="mb-6">
                    <Button variant="ghost" className="text-gray-500 hover:text-gray-900 pl-0 gap-2 mb-4 hover:bg-transparent" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" /> Geri Dön
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-teal-500 rounded-xl shadow-sm"><Heart className="w-6 h-6 text-white" /></div>
                        <div><h1 className="text-2xl font-bold text-gray-900">Sosyal Sorumluluk</h1><p className="text-gray-500 text-sm">Toplumsal bilinç ve katkılarınız</p></div>
                    </div>
                </div>

                {/* YEŞİL TEMA KARTI */}
                <div className="bg-[#ECFDF5] border border-emerald-100 rounded-3xl p-8 mb-8 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-3 text-sm">
                                    <Calendar className="w-4 h-4" /> <span>{theme.weekLabel || "Bu Haftanın Teması"}</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{theme.title}</h2>
                                <p className="text-gray-700 text-lg leading-relaxed mb-6 max-w-3xl">{theme.description}</p>
                                {theme.tags && theme.tags.length > 0 && (<div className="flex flex-wrap gap-2 mb-4">{theme.tags.map((tag, i) => (<span key={i} className="text-emerald-700 font-medium text-sm bg-emerald-100/50 px-2 py-1 rounded-md">#{tag}</span>))}</div>)}
                                <div className="text-sm text-gray-500 font-medium">{theme.startDate} - {theme.endDate}</div>
                            </div>
                            <Button onClick={() => setIsContributeOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-6 rounded-xl shadow-lg shadow-emerald-200 transition-transform hover:scale-105 active:scale-95">Katkı Sağla</Button>
                        </div>
                    </div>
                </div>

                {/* --- TABLAR --- */}
                <Tabs defaultValue="overview" className="space-y-8" onValueChange={handleTabChange}>
                    <TabsList className="bg-transparent border-b border-gray-200 w-full justify-start h-auto p-0 rounded-none gap-6">
                        <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-700 rounded-none px-1 py-3 text-gray-500 font-medium hover:text-gray-700">Genel Bakış</TabsTrigger>
                        <TabsTrigger value="contributions" className="data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-700 rounded-none px-1 py-3 text-gray-500 font-medium hover:text-gray-700">Katkılarım</TabsTrigger>
                    </TabsList>

                    {/* 1. GENEL BAKIŞ */}
                    <TabsContent value="overview" className="space-y-8 focus:outline-none animate-in fade-in-50 duration-500">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            <StatCard icon={BookOpen} count={theme.blogCount} label="Blog Yazısı" colorClass="text-blue-600" bgClass="bg-blue-50" />
                            <StatCard icon={Lightbulb} count={theme.quoteCount} label="Alıntı" colorClass="text-purple-600" bgClass="bg-purple-50" />
                            <StatCard icon={Sprout} count={<ArrowUpRight className="w-8 h-8" />} label="Fidan Bağışı" colorClass="text-green-600" bgClass="bg-green-50" />
                            <StatCard icon={PenTool} count={theme.suggestionCount} label="Dijital İçerik & Öneri" colorClass="text-red-600" bgClass="bg-red-50" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Son Aktiviteler</h3>
                            <Card className="border border-gray-100 shadow-sm bg-white overflow-hidden">
                                {theme.latestActivities && theme.latestActivities.length > 0 ? (
                                    <div className="divide-y divide-gray-50">
                                        {theme.latestActivities.map((activity) => (<ActivityItem key={activity.id} activity={activity} readOnly={true} />))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center flex flex-col items-center">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3"><MessageCircle className="w-6 h-6 text-gray-300" /></div>
                                        <p className="text-gray-500 font-medium">Henüz bir aktivite yok.</p>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </TabsContent>

                    {/* 2. KATKILARIM */}
                    <TabsContent value="contributions" className="space-y-6 focus:outline-none">
                        {!selectedType ? (
                            <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Katkı Türleri</h3>
                                <div onClick={() => handleCardClick('BLOG_POST')} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-teal-50 text-teal-600 rounded-xl group-hover:bg-teal-100 transition-colors"><BookOpen className="w-6 h-6" /></div>
                                        <div><h4 className="font-bold text-gray-900 text-lg">Blog Yazıları</h4><p className="text-sm text-gray-500">Haftalık temalar hakkında derinlemesine düşünceleriniz</p></div>
                                    </div>
                                    <span className="text-3xl font-bold text-teal-600">{contributionStats?.myBlogCount || 0}</span>
                                </div>
                                <div onClick={() => handleCardClick('QUOTE_POST')} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-100 transition-colors"><Lightbulb className="w-6 h-6" /></div>
                                        <div><h4 className="font-bold text-gray-900 text-lg">Alıntılar</h4><p className="text-sm text-gray-500">İlham verici sözler ve alıntılar</p></div>
                                    </div>
                                    <span className="text-3xl font-bold text-purple-600">{contributionStats?.myQuoteCount || 0}</span>
                                </div>
                                <div onClick={() => handleCardClick('RECOMMENDATION')} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-100 transition-colors"><PenTool className="w-6 h-6" /></div>
                                        <div><h4 className="font-bold text-gray-900 text-lg">Öneriler</h4><p className="text-sm text-gray-500">Gönderdiğiniz dijital içerik ve öneriler</p></div>
                                    </div>
                                    <span className="text-3xl font-bold text-red-600">{contributionStats?.mySuggestionCount || 0}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <Button variant="ghost" onClick={handleBackToCards} className="mb-4 pl-0 text-gray-500 hover:text-gray-900">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Katkı Türlerine Dön
                                </Button>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    {selectedType === 'BLOG_POST' ? 'Sosyal Sorumluluk Bloglarım' : selectedType === 'QUOTE_POST' ? 'Sosyal Sorumluluk Alıntılarım' : 'Sosyal Sorumluluk Önerilerim'}
                                </h3>
                                <Card className="border border-gray-100 shadow-sm bg-white overflow-hidden">
                                    {detailLoading ? (
                                        <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-600"/></div>
                                    ) : detailList.length > 0 ? (
                                        <div className="divide-y divide-gray-50">
                                            {detailList.map((item) => (<ActivityItem key={item.id} activity={item} readOnly={false} />))}
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center text-gray-500">Bu kategoride henüz #sosyalsorumluluk etiketli bir katkınız yok.</div>
                                    )}
                                </Card>
                            </div>
                        )}
                    </TabsContent>

                    {/* 3. ETKİM */}
                    <TabsContent value="impact"><div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">Etki analizleri burada olacak.</div></TabsContent>
                </Tabs>

                {/* MODALLAR */}
                <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Katkı Sağla</DialogTitle>

                            {/* DÜZELTME BAŞLANGICI */}
                            <DialogDescription asChild>
                                {/* Tek bir kapsayıcı div açıyoruz ve style veriyoruz */}
                                <div className="text-muted-foreground text-sm">
                                    <p>
                                        Platformu zenginleştirmek veya doğaya katkıda bulunmak için bir
                                        seçenek belirleyin.
                                    </p>
                                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex gap-2 items-start">
                                        <span className="text-lg">⚠️</span>
                                        <span>
              Katkılarınızın sisteme yansıması için blog ve alıntı yazılarınıza{" "}
                                            <span className="font-bold mx-1">#sosyalsorumluluk</span>{" "}
                                            etiketini eklemeyi unutmayınız.
            </span>
                                    </div>
                                </div>
                            </DialogDescription>
                            {/* DÜZELTME BİTİŞİ */}

                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div
                                onClick={() => router.push("/create-post/blog")}
                                className="border p-4 rounded-xl cursor-pointer hover:shadow-md transition-all flex flex-col gap-3 group bg-white hover:border-blue-500 hover:bg-blue-50"
                            >
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-blue-700">
                                        Blog Yazısı
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">Konu hakkında blog yaz.</p>
                                </div>
                            </div>
                            <div
                                onClick={() => router.push("/create-post/quote")}
                                className="border p-4 rounded-xl cursor-pointer hover:shadow-md transition-all flex flex-col gap-3 group bg-white hover:border-purple-500 hover:bg-purple-50"
                            >
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600">
                                    <Lightbulb className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-purple-700">
                                        Alıntılar
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        İlham verici alıntı ekle.
                                    </p>
                                </div>
                            </div>
                            <div
                                onClick={handleTemaDonation}
                                className="border p-4 rounded-xl cursor-pointer hover:shadow-md transition-all flex flex-col gap-3 group bg-white hover:border-green-500 hover:bg-green-50"
                            >
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100 text-green-600">
                                    <Sprout className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-green-700">
                                        Fidan Bağışı
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        TEMA Vakfı ile bağış yap.
                                    </p>
                                </div>
                            </div>
                            <div
                                onClick={handleSuggestionClick}
                                className="border p-4 rounded-xl cursor-pointer hover:shadow-md transition-all flex flex-col gap-3 group bg-white hover:border-red-500 hover:bg-red-50"
                            >
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-100 text-red-600">
                                    <PenTool className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-red-700">
                                        Dijital İçerik & Öneri
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">Öneride bulun.</p>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* YENİ İÇERİK OLUŞTURMA MODALI */}
                <Dialog open={isSuggestionOpen} onOpenChange={setIsSuggestionOpen}>
                    <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-0 rounded-2xl gap-0">
                        <div className="p-6 border-b border-gray-100 flex items-start gap-4">
                            <div className="p-3 bg-pink-500 rounded-xl shadow-md shadow-pink-200"><Sparkles className="w-6 h-6 text-white" /></div>
                            <div><DialogTitle className="text-xl font-bold text-gray-900">Dijital İçerik & Öneri</DialogTitle><DialogDescription className="text-gray-500 mt-1">Projeye katkı olarak dijital içerik veya öneri paylaşımında bulunun</DialogDescription></div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="relative">
                                <textarea value={suggestionText} onChange={(e) => { if (e.target.value.length <= 5000) setSuggestionText(e.target.value) }} placeholder="İçerik veya önerinizi açıkça anlatın..." className="w-full min-h-[200px] p-4 rounded-xl border-2 border-blue-100 bg-pink-50/30 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all resize-none text-base" />
                                <div className="text-right mt-2 text-xs font-medium text-gray-400">{suggestionText.length} / 5000</div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl text-pink-900 text-sm font-medium"><Sparkles className="w-5 h-5 text-pink-500 shrink-0" /><p>Kaliteli ve orijinal içerik paylaşımınız topluluğa değer katacaktır</p></div>
                        </div>
                        <div className="p-6 bg-gray-50 flex items-center justify-between gap-4 border-t border-gray-100">
                            <Button variant="secondary" onClick={() => setIsSuggestionOpen(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-6 rounded-xl border-0">Geri Dön</Button>
                            <Button onClick={handleSendSuggestion} disabled={isSubmitting || !suggestionText.trim()} className="flex-1 bg-pink-400 hover:bg-pink-500 text-white font-semibold py-6 rounded-xl shadow-lg shadow-pink-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Gönderiliyor</> : <>Gönder <ArrowUpRight className="ml-2 w-5 h-5" /></>}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* 👇 YENİ: ÖNERİ DETAY / DÜZENLEME MODALI */}
                <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                    <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-0 rounded-2xl gap-0">
                        {selectedRec && (
                            <>
                                {/* Header */}
                                <div
                                    className="p-6 border-b border-gray-100 flex items-center bg-red-50/50"> {/* justify-between kaldırdım */}
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                            <PenTool className="w-5 h-5"/>
                                        </div>
                                        <div>
                                            <DialogTitle className="text-lg font-bold text-gray-900">
                                                {isEditing ? "Öneriyi Düzenle" : "Öneri Detayı"}
                                            </DialogTitle>
                                            <p className="text-sm text-gray-500">
                                                {selectedRec?.created && !isNaN(new Date(selectedRec.created).getTime())
                                                    ? formatDistanceToNow(new Date(selectedRec.created), {
                                                        addSuffix: true,
                                                        locale: tr
                                                    })
                                                    : (selectedRec?.timeAgo && !isNaN(new Date(selectedRec.timeAgo).getTime())
                                                        ? formatDistanceToNow(new Date(selectedRec.timeAgo), {
                                                            addSuffix: true,
                                                            locale: tr
                                                        })
                                                        : "Tarih bilgisi yok")
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    {/* Buton buradan silindi */}
                                </div>

                                {/* Body */}
                                <div className="p-6">
                                    {isEditing ? (
                                        <div className="relative">
                                            <textarea
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                className="w-full min-h-[200px] p-4 rounded-xl border-2 border-red-100 bg-white text-gray-800 focus:outline-none focus:border-red-300 focus:ring-4 focus:ring-red-50 transition-all resize-none text-base leading-relaxed"
                                                placeholder="İçeriğinizi buraya yazın..."
                                            />
                                            <div className="text-right mt-2 text-xs text-gray-400">{editText.length} karakter</div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                                            {selectedRec.description || selectedRec.title}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                {!isModalReadOnly && (
                                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                                        {isEditing ? (
                                            <>
                                                <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-gray-600 hover:bg-gray-200">
                                                    İptal
                                                </Button>
                                                <Button onClick={handleUpdateRec} className="bg-red-600 hover:bg-red-700 text-white gap-2">
                                                    <Save className="w-4 h-4" /> Kaydet
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button variant="outline" onClick={handleDeleteRec} className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2">
                                                    <Trash2 className="w-4 h-4" /> Sil
                                                </Button>
                                                <Button onClick={() => setIsEditing(true)} className="bg-gray-900 hover:bg-black text-white gap-2">
                                                    <Edit className="w-4 h-4" /> Düzenle
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                )}

                            </>
                        )}

                    </DialogContent>
                </Dialog>

            </div>
        </div>
    )
}
