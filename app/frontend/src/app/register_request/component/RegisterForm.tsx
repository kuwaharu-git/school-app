"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import axios from "../../plugins/axios"

export function RegisterForm() {
  const [studentId, setStudentId] = useState("")
  const [username, setUsername] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
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
    axios
      .post("/api/users/request_user", {
        student_id: studentId,
        username: username,
        agreed_to_terms: agreedToTerms,
      })
      .then((response) => {
        setIsSuccess(true)
        setError("")
      })
      .catch((error) => {
        setIsSuccess(false)
        setError(error.response?.data?.[0] || "ユーザ作成に失敗しました")
      })
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
      {isSuccess && (
        <div className="text-green-500 text-center text-sm">
          ユーザ作成申請が完了しました。<br />
          申請が承認されるまでお待ちください。
          <br />
          承認後、学校メールアドレスに通知が届きます。
          <br />
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
          <Button type="submit" className="w-full" disabled={!agreedToTerms}>
            申請する
          </Button>
          <div className="text-center text-sm">
            すでにアカウントをお持ちの方は
            <Link href="/" className="text-primary font-medium hover:underline ml-1">
              ログイン
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
