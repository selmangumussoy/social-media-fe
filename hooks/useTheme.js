"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { toggleTheme } from "@/store/slices/userSlice"

export function useTheme() {
  const theme = useSelector((state) => state.user.theme)
  const dispatch = useDispatch()

  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [theme])

  const toggle = () => {
    dispatch(toggleTheme())
  }

  return { theme, toggleTheme: toggle }
}
