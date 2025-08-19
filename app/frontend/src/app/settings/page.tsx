"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
// import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Trash2, User, Key } from "lucide-react"

import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle as DialogTitleComp, DialogDescription } from "@/components/ui/dialog"
import { noRedirectCustomAxios } from "@/lib/customAxios"
import { AxiosError, AxiosResponse } from "axios"

function getAxiosErrorDetail(err: unknown): string | null {
  try {
    const e = err as AxiosError
    const response = e?.response as unknown
    const data = (response as { data?: unknown } | null)?.data
    if (!data) return null
    if (typeof data === "string") return data
    if (Array.isArray(data) && data.length > 0) return String(data[0])
    if (typeof data === "object") {
      const d = data as { detail?: string; message?: string }
      return d.detail || d.message || JSON.stringify(d)
    }
    return null
  } catch {
    return null
  }
}

export default function SettingsPage() {
//   const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    noRedirectCustomAxios
      .get("/api/users/test")
      .then((res: AxiosResponse) => {
        setUsername(res.data.username ?? "")
        setEmail(res.data.email ?? "")
      })
      .catch((err: AxiosError) => {
        // 非ログイン時は401が返ることがあるため、401以外はコンソールに出す
        if (err.response?.status !== 401) console.error("設定情報取得エラー:", err)
        setError(getAxiosErrorDetail(err) || err.message)
      })
  }, [])

  // 開くボタン（モーダルを表示）
  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  // モーダルで確認後に実行する削除処理
  const deleteAccount = async () => {
    setIsDeleting(true)
    setError(null)
    try {
      await noRedirectCustomAxios.delete("/api/users/delete")
      toast.success("アカウントを削除しました")
      window.location.href = "/"
    } catch (err) {
      console.error("アカウント削除失敗:", err)
      const e = err as AxiosError
      setError(getAxiosErrorDetail(e) || "アカウント削除に失敗しました")
      toast.error("アカウント削除に失敗しました")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/80">
      <Header username={username} />
      <main className="flex-grow flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>エラー</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">ユーザー名</p>
                <p className="font-medium flex items-center gap-2"><User className="h-4 w-4" />{username || "-"}</p>
                <Link href="/change_user_name">
                  <Button variant="outline" className="mt-2">ユーザー名を変更</Button>
                </Link>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">メールアドレス</p>
                <p className="font-medium">{email || "-"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">パスワード</p>
                <Link href="/change_password">
                  <Button variant="secondary" className="mt-2 flex items-center gap-2"><Key className="h-4 w-4" /> パスワードを変更</Button>
                </Link>
              </div>

              <div className="pt-4">
                <p className="text-sm text-muted-foreground">重要な操作</p>
                <div className="flex gap-2 mt-2">
                  <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? "削除中..." : (<span className="flex items-center gap-2"><Trash2 className="h-4 w-4" /> アカウントを削除する</span>)}
                  </Button>

                  {/* 削除確認ダイアログ */}
                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitleComp>アカウントを削除しますか？</DialogTitleComp>
                        <DialogDescription>この操作は取り消せません。よろしいですか？</DialogDescription>
                      </DialogHeader>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>キャンセル</Button>
                        <Button variant="destructive" onClick={deleteAccount} disabled={isDeleting}>{isDeleting ? "削除中..." : "削除する"}</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
            <CardFooter />
          </Card>
        </div>
      </main>
    </div>
  )
}
