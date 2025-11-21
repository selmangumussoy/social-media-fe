import { BaseService, POST, GET } from '@/lib/BaseService';

const AUTH_URL = '/auth';
const USER_URL = '/users'; // Backend'deki User Controller yolu

const saveToken = (token) => {
    if (token) {
        localStorage.setItem('jwt_token', token);
    }
};

export async function login(username, password) {
    const loginPayload = {
        username,
        password,
    };

    try {
        const response = await BaseService({
            method: POST,
            url: `${AUTH_URL}/login`,
            data: loginPayload,
        });
        const token = response?.data?.data?.token;

        if (token) {
            saveToken(token);

            try {
                const userResponse = await BaseService({
                    method: GET,
                    url: `${USER_URL}/me`, // Token header'da otomatik gidecek
                });

                const realUser = userResponse?.data?.data;

                return {
                    token,
                    user: realUser,
                };
            } catch (userError) {
                console.error("User fetch error inside login:", userError);
                // User çekilemese bile token döndür (UI'da handle edilebilir)
                return { token, user: null };
            }
        }

        return {
            token: null,
            user: null,
        };

    } catch (error) {
        console.error("Login service error:", error);
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