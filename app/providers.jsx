"use client";

import { Provider, useDispatch } from "react-redux";
import { store } from "@/store/store";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { getMe } from "@/services/userService";
import { setUser } from "@/store/slices/userSlice";

// --------------------
// INIT USER COMPONENT
// --------------------
function InitUser() {
    const dispatch = useDispatch();

    useEffect(() => {
        const token = localStorage.getItem("jwt_token");

        console.log("🔍 InitUser çalıştı — token:", token);

        if (!token) return;

        getMe().then((me) => {
            console.log("📌 getMe sonucu:", me);
            if (me) dispatch(setUser(me));
        });
    }, []);

    return null;
}

// ----------------------
// PROVIDERS EXPORT
// ----------------------
export function Providers({ children }) {
    return (
        <Provider store={store}>
            <InitUser /> {/* 🔥 En önemli satır */}
            {children}

            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: "rgb(var(--color-card))",
                        color: "rgb(var(--color-card-foreground))",
                        border: "1px solid rgb(var(--color-border))",
                    },
                }}
            />
        </Provider>
    );
}
