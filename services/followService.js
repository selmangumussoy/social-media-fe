import {BaseService, DELETE, GET, POST} from "@/lib/BaseService";

const FOLLOW_URL = "/api/follows"

export async function createFollow(followData) {
    try {
        const response = await BaseService({
            method: POST,
            url: FOLLOW_URL,
            data: followData,
        })
        return response?.data?.data || response?.data
    } catch (error) {
        console.error("Follow oluşturma hatası:", error)
        throw error
    }
}

export async function deleteFollow(id) {
    try {
        await BaseService({
            method: DELETE,
            url: `${FOLLOW_URL}/${id}`,
        })
        return true
    } catch (error) {
        console.error("Follow silme hatası:", error)
        return false
    }
}