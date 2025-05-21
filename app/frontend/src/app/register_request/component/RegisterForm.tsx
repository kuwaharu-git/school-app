"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { customAxios } from "@/lib/customAxios"
import { AxiosError } from "axios"

export function RegisterForm() {
  const [studentId, setStudentId] = useState("")
  const [username, setUsername] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreedToTerms) {
      alert("利用規約に同意してください")
      return
    }
    // 新規ユーザ作成処理をここに実装
    console.log("新規ユーザ作成申請:", { studentId, username, agreedToTerms })
    setIsSubmitting(true)
    setError("")
    customAxios
      .post("/api/users/request_user", {
        student_id: studentId,
        username: username,
        agreed_to_terms: agreedToTerms,
      })
      .then(() => {
        setIsSuccess(true)
        setError("")
      })
      .catch((error: AxiosError) => {
        setIsSuccess(false)
        const data = error.response?.data
        let message = "ユーザ作成に失敗しました"
        if (Array.isArray(data) && data.length > 0) {
          message = data[0]
        } else if (typeof data === "object" && data !== null && "message" in data) {
          message = (data as { message: string }).message
        }
        setError(message)
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
          <CardTitle className="text-2xl font-bold text-center">新規ユーザ作成申請完了</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              ユーザ作成申請が完了しました。
              <br />
              承認されるまでお待ちください。
              <br />
              承認後、学校メールアドレスに通知が届きます。
              <br />
              <Link href="/login" className="text-primary hover:underline ml-1">
                ログインページへ
              </Link>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">新規ユーザ作成</CardTitle>
        <CardDescription className="text-center">必要情報を入力して申請してください</CardDescription>
      </CardHeader>
      {error && (
        <div className="text-red-500 text-center text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentId">学籍番号</Label>
            <Input
              id="studentId"
              placeholder="学籍番号を入力"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">ユーザ名</Label>
            <Input
              id="username"
              placeholder="ユーザ名を入力"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              required
            />
            <Label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              <span>利用規約に同意する</span>
              <Link href="/terms" className="text-primary hover:underline ml-1">
                （規約を読む）
              </Link>
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 mt-4">
          <Button type="submit" className="w-full" disabled={!agreedToTerms || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                処理中...
              </>
            ) : (
              "申請する"
            )}
          </Button>
          <div className="text-center text-sm">
            すでにアカウントをお持ちの方は
            <Link href="/login" className="text-primary font-medium hover:underline ml-1">
              ログイン
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
