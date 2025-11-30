import {BaseService, GET, PUT} from "@/lib/BaseService";

const PROFILE_URL = "/profiles"


export async function updateProfile(id, profileData) {
    try {
        const response = await BaseService({
            method: PUT,
            url: `${PROFILE_URL}/${id}`,
            data: profileData,
        })
        return response?.data?.data || response?.data
    } catch (error) {
        console.error("Profile güncelleme hatası:", error)
        throw error
    }
}



export async function getProfileById(id) {
    try {
        const response = await BaseService({
            method: GET,
            url: `${PROFILE_URL}/${id}`,
        })
        return response?.data?.data || null
    } catch (error) {
        console.error("Belirtilen kullanıcıyı getirme hatası:", error)
        return null
    }
}