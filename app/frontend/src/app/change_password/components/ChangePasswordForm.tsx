"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import customAxios from "../../plugins/customAxios";
import { AxiosResponse, AxiosError } from "axios"

export function ChangePasswordForm() {
  
  const [username, setUsername] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    // ログイン状態の確認とユーザ名の取得
    customAxios
      .get("/api/users/test")
      .then((response: AxiosResponse) => {
        setUsername(response.data.username)
      })
      .catch((error: AxiosError) => {
        console.error("Error fetching user data:", error)
      })
  }, [])

  const validatePassword = (password: string): boolean => {
    // パスワードの最小長は8文字
    return password.length >= 8
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // エラー状態をリセット
    setFormError(null)
    setFieldErrors({})

    // バリデーション
    const errors: {
      currentPassword?: string
      newPassword?: string
      confirmPassword?: string
    } = {}

    if (!currentPassword) {
      errors.currentPassword = "現在のパスワードを入力してください"
    }

    if (!validatePassword(newPassword)) {
      errors.newPassword = "パスワードは8文字以上で入力してください"
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = "新しいパスワードと確認用パスワードが一致しません"
    }

    if (currentPassword === newPassword && currentPassword !== "") {
      errors.newPassword = "新しいパスワードは現在のパスワードと異なるものにしてください"
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)
    
    customAxios
      .post("/api/users/change_password", {
        "current-password": currentPassword,
        "new-password": newPassword,
      })
      .then(() => {
        // 成功状態を設定
        setIsSuccess(true)

        // 成功トースト表示（Sonnerを使用）
        toast.success("パスワード変更完了", {
          description: "パスワードが正常に変更されました",
        })
      })
      .catch((error: AxiosError) => {
        // エラーメッセージを設定
        const data = error.response?.data
        let message = "パスワード変更に失敗しました"
        if (Array.isArray(data) && data.length > 0) {
          message = data[0]
        } else if (typeof data === "object" && data !== null && "message" in data) {
          message = (data as { message: string }).message
        }
        setFormError(message)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  // 成功時の表示
  if (isSuccess) {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">パスワード変更完了</CardTitle>
          <CardDescription className="text-center">パスワードが正常に変更されました</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">変更完了</AlertTitle>
            <AlertDescription className="text-green-700">
              パスワードが正常に変更されました。新しいパスワードでログインできます。
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/">
            <Button variant="outline">ホームページへ戻る</Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">パスワード変更</CardTitle>
        <CardDescription className="text-sm text-muted-foreground text-center">
          {username}さん、パスワードを変更します
        </CardDescription>
        <CardDescription className="text-center">新しいパスワードを設定してください</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {/* 現在のパスワード */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">現在のパスワード</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="現在のパスワードを入力"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className={fieldErrors.currentPassword ? "border-red-500 pr-10" : "pr-10"}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showCurrentPassword ? "パスワードを隠す" : "パスワードを表示"}</span>
              </Button>
            </div>
            {fieldErrors.currentPassword && <p className="text-sm text-red-500 mt-1">{fieldErrors.currentPassword}</p>}
          </div>

          {/* 新しいパスワード */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">新しいパスワード</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="新しいパスワードを入力"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className={fieldErrors.newPassword ? "border-red-500 pr-10" : "pr-10"}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showNewPassword ? "パスワードを隠す" : "パスワードを表示"}</span>
              </Button>
            </div>
            {fieldErrors.newPassword && <p className="text-sm text-red-500 mt-1">{fieldErrors.newPassword}</p>}
            <p className="text-xs text-muted-foreground">パスワードは8文字以上で入力してください</p>
          </div>

          {/* 確認用パスワード */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="新しいパスワードを再入力"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={fieldErrors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showConfirmPassword ? "パスワードを隠す" : "パスワードを表示"}</span>
              </Button>
            </div>
            {fieldErrors.confirmPassword && <p className="text-sm text-red-500 mt-1">{fieldErrors.confirmPassword}</p>}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 mt-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                処理中...
              </>
            ) : (
              "パスワードを変更する"
            )}
          </Button>
          <div className="text-center text-sm">
            <Link href="/" className="text-primary font-medium hover:underline">
              キャンセルしてホームに戻る
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
