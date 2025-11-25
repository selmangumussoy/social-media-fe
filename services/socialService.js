import { BaseService, GET } from "@/lib/BaseService"

// Backend Controller: @RequestMapping("/api/social-responsibility")
const SOCIAL_URL = "/api/social-responsibility"

/**
 * 📊 Sosyal Sorumluluk Dashboard verilerini getir
 * (Tema bilgisi ve 4'lü katkı sayaçları)
 */
export async function getSocialDashboard() {
    try {
        const response = await BaseService({
            method: GET,
            url: `${SOCIAL_URL}/dashboard`,
        })
        // Backend response yapısı: { data: { data: { ... } } } veya { data: { ... } }
        return response?.data?.data || response?.data || null
    } catch (error) {
        console.error("Sosyal sorumluluk verisi getirme hatası:", error)
        return null
    }
}