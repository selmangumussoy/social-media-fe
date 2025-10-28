"use client"

import { useSelector } from "react-redux"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()

    // Login ve Register sayfaları guard dışında kalmalı
    if (pathname === "/login" || pathname === "/register" || pathname === "/post") {
        return <>{children}</>
    }

    // Redux'tan token al, yoksa localStorage'dan oku
    const token = useSelector((state: any) => state.user?.token) ||
        (typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null)

    useEffect(() => {
        // Ana sayfa haricinde token yoksa login'e yönlendir
        if (!token && pathname !== "/") {
            router.replace("/login")
        }
    }, [token, pathname, router])

    return <>{children}</>
}
