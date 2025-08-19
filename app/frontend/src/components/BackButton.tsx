"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function BackButton({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter()
  const handle = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push(fallback)
    }
  }

  return (
    <Button variant="ghost" onClick={handle} className="mb-4 inline-flex items-center gap-2">
      <ArrowLeft className="h-4 w-4" />
      戻る
    </Button>
  )
}
