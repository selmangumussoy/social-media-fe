import { BaseService, GET } from "@/lib/BaseService";

const SOCIAL_URL = "/api/social-responsibility";
const RECOMMENDATION_URL = "/api/recommendations";

/**
 * 📊 Genel Sosyal Sorumluluk Dashboard Verisi
 */
export async function getSocialDashboard() {
    try {
        const response = await BaseService({
            method: GET,
            url: `${SOCIAL_URL}/dashboard`
        });
        return response?.data?.data || response?.data;
    } catch (error) {
        console.error("Dashboard verisi çekilemedi:", error);
        throw error;
    }
}

/**
 * 👤 Kullanıcının Kendi Katkı İstatistikleri (Sayılar)
 */
export async function getMyContributions() {
    try {
        const response = await BaseService({
            method: GET,
            url: `${SOCIAL_URL}/my-contributions`
        });
        return response?.data?.data || response?.data;
    } catch (error) {
        console.error("Katkılarım çekilemedi:", error);
        throw error;
    }
}

/**
 * 📝 Kullanıcının Belirli Bir Türdeki Gönderileri (Liste)
 * @param {string} type - 'BLOG_POST' veya 'QUOTE_POST'
 */
export async function getMySocialPosts(type) {
    try {
        const response = await BaseService({
            method: GET,
            url: `${SOCIAL_URL}/my-posts?type=${type}`
        });
        return response?.data?.data || response?.data;
    } catch (error) {
        console.error("Liste çekilemedi:", error);
        return [];
    }
}

/**
 * 🚀 Dijital İçerik veya Öneri Gönder
 * Backend: RecommendationController -> create
 */
export async function submitSocialSuggestion(content) {
    try {
        const requestBody = {
            title: "Kullanıcı Önerisi / İçerik",
            description: content,
            link: ""
        };

        const response = await BaseService({
            method: "POST", // String olarak gönderiyoruz
            url: RECOMMENDATION_URL,
            data: requestBody
        });

        return response?.data;
    } catch (error) {
        console.error("Öneri gönderilemedi:", error);
        throw error;
    }
}

/**
 * 💡 Kullanıcının Geçmiş Önerilerini Getir
 */
export async function getMyRecommendations() {
    try {
        const response = await BaseService({
            method: "GET",
            url: `${RECOMMENDATION_URL}/my-recommendations`
        });
        return response?.data?.data || response?.data;
    } catch (error) {
        console.error("Önerilerim çekilemedi:", error);
        return [];
    }
}
/**
 * ✏️ Öneriyi Güncelle
 */
export async function updateSocialRecommendation(id, content) {
    try {
        const requestBody = {
            title: "Kullanıcı Önerisi / İçerik",
            description: content,
            link: ""
        };

        const response = await BaseService({
            method: "PUT",
            url: `${RECOMMENDATION_URL}/${id}`,
            data: requestBody
        });
        return response?.data;
    } catch (error) {
        console.error("Güncelleme hatası:", error);
        throw error;
    }
}

/**
 * 🗑️ Öneriyi Sil
 */
export async function deleteSocialRecommendation(id) {
    try {
        await BaseService({
            method: "DELETE",
            url: `${RECOMMENDATION_URL}/${id}`
        });
        return true;
    } catch (error) {
        console.error("Silme hatası:", error);
        throw error;
    }
}