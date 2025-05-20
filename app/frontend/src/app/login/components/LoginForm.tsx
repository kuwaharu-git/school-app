"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AxiosResponse, AxiosError } from "axios";
import { customAxios } from "../../plugins/customAxios";

type FormData = {
    student_id: string;
    password: string;
};
export function LoginForm() {
  const router = useRouter()
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data: FormData = {
    student_id: userId,
    password: password,
    };
    customAxios
      .post("api/users/login", data)
      .then((response: AxiosResponse) => {
        // ログイン成功時の処理
        console.log("ログイン成功:", response.data)
        // ここでリダイレクトやトークンの保存などを行う
        if (response.data.is_initial_password === true) {
          // 初回ログイン時の処理
          router.push("/change_password?is_initial_password=true");
        } else {
          router.push("/");
        }
        // それ以外の処理
      })
      .catch((error: AxiosError) => {
        // ログイン失敗時の処理
        console.error("ログイン失敗:", error);
        setError("ユーザIDまたはパスワードが正しくありません。");
      });
    console.log("ログイン試行:", { userId, password })
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">ログイン</CardTitle>
        <CardDescription className="text-center">アカウント情報を入力してください</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">ユーザID</Label>
            <Input
              id="userId"
              placeholder="ユーザIDを入力"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showPassword ? "パスワードを隠す" : "パスワードを表示"}</span>
              </Button>
            </div>
          </div>
        </CardContent>
        {error && (
          <div className="text-red-500 text-center mt-1">
            {error}
          </div>
        )}
        <CardFooter className="flex flex-col space-y-4 mt-4">
          <Button type="submit" className="w-full">
            ログイン
          </Button>
          <div className="text-center text-sm">
            アカウントをお持ちでない方は
            <Link href="/register_request" className="text-primary font-medium hover:underline ml-1">
              新規ユーザ作成
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
