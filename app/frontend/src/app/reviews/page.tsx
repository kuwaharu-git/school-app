"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { customAxios, noRedirectCustomAxios } from "@/lib/customAxios"
import { AxiosResponse, AxiosError } from "axios"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { BackButton } from "@/components/BackButton"

type Project = {
  id: number
  title: string
  description?: string
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

export default function ReviewsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [showOnlyMyProjects, setShowOnlyMyProjects] = useState(false)

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
    const fetchProjects = async () => {
      try {
        if (username) {
          console.log("認証済み")
          const res: AxiosResponse<Project[]> = await customAxios.get("/api/review/projects/")
          setAllProjects(res.data)
          setProjects(res.data)
        } else {
          console.log("未認証")
          const res: AxiosResponse<Project[]> = await customAxios.get("/api/review/public-projects/")
          setAllProjects(res.data)
          setProjects(res.data)
        }
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
    fetchProjects()
  }, [username])

  // フィルタリング機能
  useEffect(() => {
    if (!isAuthenticated || !showOnlyMyProjects) {
      setProjects(allProjects)
    } else {
      // 自分のプロジェクトのみをフィルタ
      const myProjects = allProjects.filter(project => 
        project.author.username === username
      )
      setProjects(myProjects)
    }
  }, [showOnlyMyProjects, allProjects, isAuthenticated, username])

  if (loading) return <div className="container mx-auto p-4">読み込み中...</div>
  if (error) return <div className="container mx-auto p-4">エラー: {error}</div>

  return (
    <>
      <Header username={username} />
      <main className="container max-w-none flex flex-col items-center min-h-screen mt-8">
        <div className="w-full px-4">
          <div className="mb-2 flex">
            <BackButton href="/home" label="ホームに戻る" />
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-2xl font-semibold">制作物レビュー</h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {isAuthenticated && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showOnlyMyProjects"
                    checked={showOnlyMyProjects}
                    onChange={(e) => setShowOnlyMyProjects(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="showOnlyMyProjects" className="text-sm">
                    自分のプロジェクトのみ表示
                  </label>
                </div>
              )}
              {isAuthenticated && (
                <Link href="/reviews/create">
                  <Button className="flex items-center gap-2 text-sm px-4 py-2">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">プロジェクトを作成</span>
                    <span className="sm:hidden">作成</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <Link key={p.id} href={`/reviews/${p.id}`} className="block">
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{p.title}</CardTitle>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString('ja-JP')}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <CardDescription className="overflow-hidden" style={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical' as const
                    }}>
                      {p.description ? p.description : <span className="text-sm text-muted-foreground italic">説明は詳細ページで確認してください</span>}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="flex-col items-start gap-2">
                    <div className="flex justify-between items-center w-full">
                      <div className="text-sm text-muted-foreground">
                        評価: {p.cached_average_rating} ({p.cached_reviewer_count})
                      </div>
                      {!p.is_public && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">非公開</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      作者: {p.author.display_name || p.author.username}
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
