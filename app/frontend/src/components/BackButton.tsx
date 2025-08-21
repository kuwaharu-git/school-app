"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import React from "react"

type BackButtonProps = {
  href?: string // 明示的に遷移したいパス
  fallback?: string // 履歴が無い場合のフォールバック
  label?: string
  className?: string
  size?: "sm" | "default" | "lg" | "icon"
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
}

export function BackButton({
  href,
  fallback = "/home",
  label = "戻る",
  className = "",
  size = "sm",
  variant = "ghost",
}: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
      return
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push(fallback)
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  )
}
