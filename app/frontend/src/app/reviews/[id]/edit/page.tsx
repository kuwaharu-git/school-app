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
import { Loader2, Trash2, AlertTriangle } from "lucide-react"
import { BackButton } from "@/components/BackButton"

type Project = {
  id: number
  title: string
  description: string
  repository_url?: string
  live_url?: string
  is_public: boolean
  author: {
    id: number
    username: string
    display_name: string
  }
}

export default function EditProject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [repositoryUrl, setRepositoryUrl] = useState("")
  const [liveUrl, setLiveUrl] = useState("")
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

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res: AxiosResponse<Project> = await customAxios.get(`/api/review/projects/${id}/`)
        const projectData = res.data
        setProject(projectData)
        
        // フォームに現在の値を設定
        setTitle(projectData.title)
        setDescription(projectData.description || "")
        setRepositoryUrl(projectData.repository_url || "")
        setLiveUrl(projectData.live_url || "")
        setIsPublic(projectData.is_public)
      } catch (err: unknown) {
        if ((err as AxiosError).response?.status === 404) {
          toast.error("プロジェクトが見つかりません")
          router.push("/reviews")
        } else if ((err as AxiosError).response?.status === 403) {
          toast.error("このプロジェクトを編集する権限がありません")
          router.push("/reviews")
        } else {
          toast.error("プロジェクトの取得に失敗しました")
        }
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchProject()
    }
  }, [id, isAuthenticated, router])

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
        is_public: isPublic,
      }

      await customAxios.put(`/api/review/projects/${id}/`, payload)
      toast.success("プロジェクトを更新しました")
      router.push(`/reviews/${id}`)
    } catch (err: unknown) {
      if ((err as AxiosError).isAxiosError) {
        const errorData = (err as AxiosError).response?.data
        if (errorData && typeof errorData === 'object') {
          Object.entries(errorData).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              toast.error(`${field}: ${messages.join(", ")}`)
            }
          })
        } else {
          toast.error("プロジェクトの更新に失敗しました")
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

  const handleDelete = async () => {
    if (!project) return
    try {
      await customAxios.delete(`/api/review/projects/${id}/`)
      toast.success("プロジェクトを削除しました")
      setShowDeleteModal(false)
      router.push("/reviews")
    } catch (err: unknown) {
      if ((err as AxiosError).response?.status === 403) {
        toast.error("このプロジェクトを削除する権限がありません")
      } else {
        toast.error("プロジェクトの削除に失敗しました")
      }
    }
  }

  // 認証チェック中またはデータ読み込み中
  if (isAuthenticated === null || loading) {
    return <div className="container mx-auto p-4">読み込み中...</div>
  }

  // 未認証の場合はログインページに移動
  if (isAuthenticated === false) {
    return <div className="container mx-auto p-4">ログインページに移動中...</div>
  }

  if (!project) {
    return <div className="container mx-auto p-4">プロジェクトが見つかりません</div>
  }

  return (
    <>
      <Header username={username} />
      <main className="container max-w-none flex flex-col items-center min-h-screen mt-8">
        <div className="w-full px-4 max-w-2xl">
          <div className="mb-2">
            <BackButton href={`/reviews/${id}`} />
          </div>
          <Toaster />
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">プロジェクトを編集</CardTitle>
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

                <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full">
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:flex-1">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !title.trim()}
                      className="flex items-center gap-2 w-full sm:w-auto"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : null}
                      更新する
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push(`/reviews/${id}`)}
                      className="w-full sm:w-auto"
                    >
                      キャンセル
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                    削除
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg border">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold">プロジェクトを削除</h3>
            </div>
            <p className="text-gray-600 mb-6">
              このプロジェクトを削除してもよろしいですか？この操作は取り消すことができません。
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                キャンセル
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                削除する
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  )
}
