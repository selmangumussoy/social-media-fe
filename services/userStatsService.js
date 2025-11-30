import {BaseService, GET} from "@/lib/BaseService";

const USER_STATS =  "/user-stats"

export async function getUserStatsByUserId(userId) {
    try {
        const response = await BaseService({
            method: GET,
            url: `${USER_STATS}/user/${userId}`,
        })
        return response?.data?.data || null
    } catch (error) {
        console.error("Belirtilen kullanıcıyı getirme hatası:", error)
        return null
    }
}