
import { BaseService, POST } from '@/lib/BaseService';

const AUTH_URL = '/auth';


const saveToken = (token) => {
    if (token) {
        localStorage.setItem('jwt_token', token);
        console.log("JWT başarıyla kaydedildi.");
    }
};


export async function login(username, password) {
    const loginPayload = {
        username: username,
        password: password,
    };

    try {
        const response = await BaseService({
            method: POST,
            url: `${AUTH_URL}/login`, // Örn: /auth/login
            data: loginPayload,
        });

        const { token } = response.data;

        if (token) {
            saveToken(token);
        } else {
            console.warn("Giriş başarılı ancak token yanıt içinde bulunamadı.");
        }

        return response.data;

    } catch (error) {
        throw error;
    }
}

export function logout() {
    localStorage.removeItem('jwt_token');
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