"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { customAxios, noRedirectCustomAxios } from "@/lib/customAxios"
import { AxiosResponse, AxiosError } from "axios"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { toast, Toaster } from "sonner"
import { Loader2, ExternalLink } from "lucide-react"

type Project = {
  id: number
  title: string
  description: string
  repository_url?: string
  live_url?: string
  ogp_image_url?: string
  is_public: boolean
  cached_average_rating: string
  cached_reviewer_count: number
  created_at: string
  author: {
    id: number
    username: string
    display_name: string
  }
}

type Review = {
  id: number
  reviewer_name_snapshot: string
  rating: number
  comment: string
  created_at: string
  reviewer?: {
    id: number
    username: string
    display_name: string
  }
}

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState("")

  // review form state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [rating, setRating] = useState<number>(5)
  const [comment, setComment] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      .catch(() => setIsAuthenticated(false))
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: AxiosResponse<Project> = await customAxios.get(`/api/review/projects/${id}/`)
        setProject(res.data)
        // fetch reviews
        const revRes: AxiosResponse<Review[]> = await customAxios.get(`/api/review/reviews/?project=${id}`)
        setReviews(revRes.data)
      } catch (err: unknown) {
        if ((err as AxiosError).isAxiosError) {
          setError(((err as AxiosError).message) || "APIエラー")
        } else if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("不明なエラー")
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return
    setIsSubmitting(true)
    try {
      const payload = { project: project.id, rating, comment }
      const res: AxiosResponse = await customAxios.post("/api/review/reviews/", payload)
      // add or replace existing review by same reviewer
      const created: Review = res.data
      // if reviewer already had a review, replace by id, otherwise prepend
      setReviews((prev) => {
        const idx = prev.findIndex((r) => r.id === created.id)
        if (idx !== -1) {
          const copy = [...prev]
          copy[idx] = created
          return copy
        }
        return [created, ...prev]
      })
      toast.success("レビューを投稿しました")
      setComment("")
    } catch (err: unknown) {
      if ((err as AxiosError).isAxiosError) {
        const message = ((err as AxiosError).response?.data && JSON.stringify((err as AxiosError).response?.data)) || (err as AxiosError).message
        toast.error("投稿に失敗しました: " + message)
      } else if (err instanceof Error) {
        toast.error(err.message)
      } else {
        toast.error("不明なエラー")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="container mx-auto p-4">読み込み中...</div>
  if (error) return <div className="container mx-auto p-4">エラー: {error}</div>
  if (!project) return null

  return (
    <>
      <Header username={username} />
      <main className="container max-w-none flex flex-col items-center min-h-screen mt-8">
        <div className="w-full px-4 max-w-4xl">
          <Toaster />
          
          {/* Project Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">{project.title}</CardTitle>
              <CardDescription className="space-y-1">
                <div>作者: {project.author.display_name || project.author.username}</div>
                <div className="text-xs">作成日: {new Date(project.created_at).toLocaleDateString('ja-JP')}</div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.ogp_image_url && (
                  <div className="relative w-full max-w-2xl h-80 rounded-lg overflow-hidden border">
                    <Image
                      src={project.ogp_image_url}
                      alt={`${project.title}のプレビュー画像`}
                      fill
                      className="object-contain"
                      onError={(e) => {
                        e.currentTarget.parentElement?.classList.add('hidden')
                      }}
                    />
                  </div>
                )}
                
                {project.description && (
                  <div>
                    <h4 className="font-semibold mb-2">説明</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{project.description}</p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm">
                  {project.repository_url && (
                    <a
                      href={project.repository_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline px-3 py-1 border rounded-md"
                    >
                      <ExternalLink className="h-4 w-4" />
                      GitHubリポジトリ
                    </a>
                  )}
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline px-3 py-1 border rounded-md"
                    >
                      <ExternalLink className="h-4 w-4" />
                      ライブデモ
                    </a>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>評価: {project.cached_average_rating}</span>
                  <span>レビュー数: {project.cached_reviewer_count}</span>
                  {!project.is_public && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">非公開</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

      {/* review form for authenticated users */}
      {isAuthenticated ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>レビューを投稿</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitReview}>
              <div className="flex items-center gap-4 mb-3">
                <label className="text-sm font-medium">評価</label>
                <select
                  value={String(rating)}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="border-input rounded-md px-2 py-1"
                >
                  <option value={5}>5</option>
                  <option value={4}>4</option>
                  <option value={3}>3</option>
                  <option value={2}>2</option>
                  <option value={1}>1</option>
                </select>
              </div>

              <div className="mb-3">
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="レビューの本文（任意）" />
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : null}
                  投稿
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : isAuthenticated === false ? (
        <Card className="mb-6">
          <CardContent>
            <p className="text-sm">レビューを投稿するにはログインしてください。</p>
          </CardContent>
        </Card>
      ) : null}

      {/* Reviews Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>レビュー ({reviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium">
                    {r.reviewer_name_snapshot}
                    <span className="ml-2 text-yellow-500">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                    <span className="ml-1 text-muted-foreground">({r.rating}/5)</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString('ja-JP')}
                  </div>
                </div>
                {r.comment && (
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">{r.comment}</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
