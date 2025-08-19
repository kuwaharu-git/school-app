"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { customAxios, noRedirectCustomAxios } from "@/lib/customAxios"
import { AxiosResponse, AxiosError } from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { toast, Toaster } from "sonner"
import { Loader2 } from "lucide-react"

export default function CreateProject() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [repositoryUrl, setRepositoryUrl] = useState("")
  const [liveUrl, setLiveUrl] = useState("")
  const [ogpImageUrl, setOgpImageUrl] = useState("")
  const [isPublic, setIsPublic] = useState(true)

  useEffect(() => {
    noRedirectCustomAxios.get("/api/users/test")
      .then((res: AxiosResponse) => setUsername(res.data.username))
      .catch(() => setUsername(""))
  }, [])

  useEffect(() => {
    // check auth without redirect
    noRedirectCustomAxios
      .get("/api/user_profile/")
      .then(() => setIsAuthenticated(true))
      .catch(() => {
        setIsAuthenticated(false)
        router.push("/login")
      })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("タイトルは必須です")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        repository_url: repositoryUrl.trim() || null,
        live_url: liveUrl.trim() || null,
        ogp_image_url: ogpImageUrl.trim() || null,
        is_public: isPublic,
      }

      await customAxios.post("/api/review/projects/", payload)
      toast.success("プロジェクトを作成しました")
      router.push("/reviews")
    } catch (err: unknown) {
      if ((err as AxiosError).isAxiosError) {
        const errorData = (err as AxiosError).response?.data
        if (errorData && typeof errorData === 'object') {
          // フィールド別のエラーメッセージを表示
          Object.entries(errorData).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              toast.error(`${field}: ${messages.join(", ")}`)
            }
          })
        } else {
          toast.error("プロジェクトの作成に失敗しました")
        }
      } else if (err instanceof Error) {
        toast.error(err.message)
      } else {
        toast.error("不明なエラー")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 認証チェック中
  if (isAuthenticated === null) {
    return <div className="container mx-auto p-4">認証確認中...</div>
  }

  // 未認証の場合はログインページに移動
  if (isAuthenticated === false) {
    return <div className="container mx-auto p-4">ログインページに移動中...</div>
  }

  return (
    <>
      <Header username={username} />
      <main className="container max-w-none flex flex-col items-center min-h-screen mt-8">
        <div className="w-full px-4 max-w-2xl">
          <Toaster />
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">新しいプロジェクトを作成</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    プロジェクトタイトル <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="プロジェクトのタイトルを入力"
                    maxLength={255}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    プロジェクトの説明
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="プロジェクトの詳細な説明を入力（任意）"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    GitHubリポジトリURL
                  </label>
                  <Input
                    type="url"
                    value={repositoryUrl}
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                    placeholder="https://github.com/username/repository"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    ライブデモURL
                  </label>
                  <Input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    プレビュー画像URL
                  </label>
                  <Input
                    type="url"
                    value={ogpImageUrl}
                    onChange={(e) => setOgpImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    プロジェクトのスクリーンショットやロゴ画像のURL
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="isPublic" className="text-sm">
                    プロジェクトを公開する
                  </label>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !title.trim()}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : null}
                    プロジェクトを作成
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/reviews")}
                  >
                    キャンセル
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
