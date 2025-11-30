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