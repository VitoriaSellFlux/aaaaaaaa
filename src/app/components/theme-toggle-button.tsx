"use client"
import { Moon, Sun } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggleButton() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme")
      if (saved) {
        return saved === "dark"
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches
    }
    return false
  })

  const [mounted, setMounted] = useState(false)

  // Aplicar tema no carregamento inicial
  useEffect(() => {
    setMounted(true)
    const root = document.documentElement

    if (isDark) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [])

  // Sincronizar mudanças de tema
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement

    if (isDark) {
      root.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      root.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [isDark, mounted])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  // Evitar hidration mismatch
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        aria-label="Toggle theme"
      >
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-transform duration-300" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-transform duration-300" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
