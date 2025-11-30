import {BaseService, GET, POST} from "@/lib/BaseService";

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