"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2, Loader2, User, Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { customAxios } from "@/lib/customAxios"
import { AxiosResponse, AxiosError } from "axios"

export function UsernameChangeForm() {
  const router = useRouter()

  const [currentUsername, setCurrentUsername] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [confirmUsername, setConfirmUsername] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    newUsername?: string
    confirmUsername?: string
  }>({})
  const [isSuccess, setIsSuccess] = useState(false)
  const [usernameAvailability, setUsernameAvailability] = useState<{
    isAvailable: boolean | null
    isChecked: boolean
  }>({ isAvailable: null, isChecked: false })

  // ユーザー名の形式バリデーション（制限なし）
  const validateUsernameFormat = (username: string): string | null => {
    if (username.length === 0) {
      return "ユーザー名を入力してください"
    }
    // 特に制限なし
    return null
  }

  // 現在のユーザー名を取得
  useEffect(() => {
    const fetchCurrentUsername = () => {
      customAxios.get("/api/users/test")
        .then((response: AxiosResponse) => {
          setCurrentUsername(response.data.username)
        })
        .catch((error: AxiosError) => {
          console.error("Current username fetch failed:", error)
          setFormError("現在のユーザー名の取得に失敗しました")
        })
    }
    
    fetchCurrentUsername()
  }, [])

  // ユーザー名の可用性チェック
  const checkUsernameAvailability = (username: string) => {
    if (!username || validateUsernameFormat(username)) {
      setUsernameAvailability({ isAvailable: null, isChecked: false })
      return
    }

    setIsCheckingAvailability(true)
    setUsernameAvailability({ isAvailable: null, isChecked: false })

    customAxios.get(`/api/users/check_username/?username=${encodeURIComponent(username)}`)
      .then((response: AxiosResponse) => {
        const isAvailable = !response.data.exists
        
        setUsernameAvailability({
          isAvailable,
          isChecked: true,
        })
      })
      .catch((error: AxiosError) => {
        console.error("Username availability check failed:", error)
        setUsernameAvailability({ isAvailable: null, isChecked: false })
      })
      .finally(() => {
        setIsCheckingAvailability(false)
      })
  }

  // ユーザー名入力時の処理
  const handleUsernameChange = (value: string) => {
    setNewUsername(value)
    setUsernameAvailability({ isAvailable: null, isChecked: false })

    // デバウンス処理（実際のアプリでは useDebounce フックを使用することを推奨）
    const timeoutId = setTimeout(() => {
      if (value && value !== currentUsername) {
        checkUsernameAvailability(value)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  // フォーム送信処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // エラー状態をリセット
    setFormError(null)
    setFieldErrors({})

    // バリデーション
    const errors: {
      newUsername?: string
      confirmUsername?: string
    } = {}

    const formatError = validateUsernameFormat(newUsername)
    if (formatError) {
      errors.newUsername = formatError
    }

    if (newUsername === currentUsername) {
      errors.newUsername = "新しいユーザー名は現在のユーザー名と異なるものにしてください"
    }

    if (newUsername !== confirmUsername) {
      errors.confirmUsername = "新しいユーザー名と確認用ユーザー名が一致しません"
    }

    if (!usernameAvailability.isChecked || !usernameAvailability.isAvailable) {
      errors.newUsername = "ユーザー名の可用性を確認してください"
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)

    customAxios.post("/api/users/change_username/", {
      "new-username": newUsername,
    })
      .then(() => {
        // 成功状態を設定
        setIsSuccess(true)

        // 3秒後にプロフィール設定ページにリダイレクト
        setTimeout(() => {
          router.push("/profile/setting_profile")
        }, 3000)
      })
      .catch((error: AxiosError) => {
        // エラーメッセージを設定
        const errorMessage = "ユーザー名変更に失敗しました"
        console.error("Username change failed:", error)
        setFormError(errorMessage)
        setNewUsername("")
        setConfirmUsername("")
        setFieldErrors({})
        setUsernameAvailability({ isAvailable: null, isChecked: false })
        setIsSuccess(false)
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
          <CardTitle className="text-2xl font-bold text-center">ユーザー名変更完了</CardTitle>
          <CardDescription className="text-center">ユーザー名が正常に変更されました</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">変更完了</AlertTitle>
            <AlertDescription className="text-green-700">
              ユーザー名が「{newUsername}」に変更されました。新しいユーザー名でログインできます。
            </AlertDescription>
          </Alert>
          <p className="text-center text-sm text-muted-foreground">
            プロフィール設定ページに自動的にリダイレクトします...
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/profile/setting_profile">
            <Button variant="outline">プロフィール設定に戻る</Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">ユーザー名変更</CardTitle>
        <CardDescription className="text-center">新しいユーザー名を設定してください</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>もう一度お試しください</AlertDescription>
            </Alert>
          )}

          {/* 現在のユーザー名 */}
          <div className="space-y-2">
            <Label htmlFor="currentUsername">現在のユーザー名</Label>
            <div className="relative">
              <Input id="currentUsername" value={currentUsername} disabled className="pr-10" />
              <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* 新しいユーザー名 */}
          <div className="space-y-2">
            <Label htmlFor="newUsername">新しいユーザー名</Label>
            <div className="relative">
              <Input
                id="newUsername"
                placeholder="新しいユーザー名を入力"
                value={newUsername}
                onChange={(e) => handleUsernameChange(e.target.value)}
                required
                className={fieldErrors.newUsername ? "border-red-500 pr-10" : "pr-10"}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isCheckingAvailability ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : usernameAvailability.isChecked ? (
                  usernameAvailability.isAvailable ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )
                ) : null}
              </div>
            </div>
            {fieldErrors.newUsername && <p className="text-sm text-red-500 mt-1">{fieldErrors.newUsername}</p>}
            
            {/* ユーザー名可用性チェック結果エリア - 固定高さでレイアウト崩れを防ぐ */}
            <div className="min-h-[20px] mt-1">
              {isCheckingAvailability ? (
                <p className="text-sm text-blue-600 flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ユーザー名をチェック中...
                </p>
              ) : usernameAvailability.isChecked ? (
                <p className={`text-sm ${usernameAvailability.isAvailable ? "text-green-600" : "text-red-500"}`}>
                  {usernameAvailability.isAvailable
                    ? "このユーザー名は利用可能です"
                    : "このユーザー名は既に使用されています"}
                </p>
              ) : null}
            </div>
          </div>

          {/* 確認用ユーザー名 */}
          <div className="space-y-2">
            <Label htmlFor="confirmUsername">新しいユーザー名（確認）</Label>
            <Input
              id="confirmUsername"
              placeholder="新しいユーザー名を再入力"
              value={confirmUsername}
              onChange={(e) => setConfirmUsername(e.target.value)}
              required
              className={fieldErrors.confirmUsername ? "border-red-500" : ""}
            />
            {fieldErrors.confirmUsername && <p className="text-sm text-red-500 mt-1">{fieldErrors.confirmUsername}</p>}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 mt-6">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !usernameAvailability.isAvailable || isCheckingAvailability}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                変更中...
              </>
            ) : (
              "ユーザー名を変更する"
            )}
          </Button>
          <div className="text-center text-sm">
            <Link href="/profile/setting_profile" className="text-primary font-medium hover:underline">
              キャンセルしてプロフィール設定に戻る
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
