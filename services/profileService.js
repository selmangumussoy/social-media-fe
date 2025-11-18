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