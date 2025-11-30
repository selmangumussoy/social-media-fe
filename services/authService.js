import { BaseService, POST, GET } from "@/lib/BaseService";
import { store } from "@/store/store";
import { setUser } from "@/store/slices/userSlice";

const AUTH_URL = "/auth";

const saveToken = (token) => {
    if (token) {
        localStorage.setItem("jwt_token", token);
        console.log("JWT kaydedildi.");
    }
};

export async function getMe() {
    try {
        const response = await BaseService({
            method: GET,
            url: `/users/me`
        });

        return response?.data?.data || null;
    } catch (e) {
        return null;
    }
}

export async function login(username, password) {
    const loginPayload = { username, password };

    try {
        // 1) Token al
        const response = await BaseService({
            method: POST,
            url: `${AUTH_URL}/login`,
            data: loginPayload,
        });

        const token = response?.data?.data?.token;
        if (!token) throw new Error("Token alınamadı!");

        saveToken(token);

        // 2) Token ile user'ı çek
        const user = await getMe();

        if (user) {
            localStorage.setItem("current_user", JSON.stringify(user));
            store.dispatch(setUser(user));
        }

        return { token, user };

    } catch (error) {
        throw error;
    }
}


export function logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('current_user');
    window.location.href = '/login';
}


export async function signUp(signupData) {
    try {
        const response = await BaseService({
            method: POST,
            url: `${AUTH_URL}/sign-up`,
            data: signupData,
        });

        const { token } = response.data;
        if (token) {
            saveToken(token);
        }
        return response.data;
    } catch (error) {
        throw error;
    }
}