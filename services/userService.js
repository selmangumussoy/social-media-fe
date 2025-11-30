import {BaseService, GET} from "@/lib/BaseService";

const USER_URL = "/users"


export async function getMe() {
    try {
        const response = await BaseService({
            method: GET,
            url: `${USER_URL}/me`,
        })
        return response?.data?.data || null
    } catch (error) {
        console.error("User detayını getirme hatası:", error)
        return null
    }
}

export async function getMeProfile() {
    try {
        const response = await BaseService({
            method: GET,
            url: `${USER_URL}/profile-me`,
        })
        return response?.data?.data || null
    } catch (error) {
        console.error("Profile detayını getirme hatası:", error)
        return null
    }
}

export async function getAllUser() {
    try {
        const response = await BaseService({
            method: GET,
            url: `${USER_URL}`,
        })
        return response?.data?.data || null
    } catch (error) {
        console.error("Profile detayını getirme hatası:", error)
        return null
    }
}

export async function searchUsers(query) {
    try {
        const response = await BaseService({
            method: GET, // veya 'GET'
            url: `${USER_URL}/search?q=${query}`,
        });

        // 💡 Düzeltilmiş kısım: content dizisini hedefliyoruz.
        // Eğer API'ınızın yapısı response.data.data.content ise:
        return response?.data?.data?.items?.content || [];

        // NOT: Eğer API yapınız sadece response.data.content ise, bir `data` seviyesi kaldırılabilir:
        // return response?.data?.content || [];

    } catch (error) {
        console.error("Kullanıcı arama hatası:", error);
        return [];
    }
}
export async function getUserById(id) {
    try {
        const response = await BaseService({
            method: GET,
            url: `${USER_URL}/${id}`,
        })
        return response?.data?.data || null
    } catch (error) {
        console.error("Belirtilen kullanıcıyı getirme hatası:", error)
        return null
    }
}




