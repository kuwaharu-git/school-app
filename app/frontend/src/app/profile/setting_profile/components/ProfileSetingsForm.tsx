"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
// import { toast } from "sonner"
import { Loader2, Trash2, ExternalLink, Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { noRedirectCustomAxios } from "@/lib/customAxios"
import { AxiosResponse, AxiosError } from "axios"

interface LanguageInterface {
  id: number
  language_name: string
}
interface FrameworkInterface {
  id: number
  framework_name: string
}
interface SocialMediaInterface {
  id: number
  social_media_name: string
}
type UserLanguage = {
  language?: LanguageInterface,
  other_language_name?: string
}
type UserFramework = {
  framework?: FrameworkInterface,
  other_framework_name?: string
}
type UserSocialMedia = {
  social_media?: SocialMediaInterface,
  other_social_media_name?: string,
  url: string
}

export function ProfileSettingsForm() {
  const router = useRouter()

  // マスタデータの状態
  const [availableLanguages, setAvailableLanguages] = useState<LanguageInterface[]>([])
  const [availableFrameworks, setAvailableFrameworks] = useState<FrameworkInterface[]>([])
  const [availableSocialMedia, setAvailableSocialMedia] = useState<SocialMediaInterface[]>([])

  // ユーザー情報の状態
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [portfolioUrl, setPortfolioUrl] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [selectedLanguages, setSelectedLanguages] = useState<UserLanguage[]>([])
  const [selectedFrameworks, setSelectedFrameworks] = useState<UserFramework[]>([])
  const [socialMedias, setSocialMedias] = useState<UserSocialMedia[]>([])

  // UI状態
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [languageInput, setLanguageInput] = useState("")
  const [frameworkInput, setFrameworkInput] = useState("")
  const [socialPlatformInput, setSocialPlatformInput] = useState("")
  const [socialUrlInput, setSocialUrlInput] = useState("")
  const [customPlatformInput, setCustomPlatformInput] = useState("")

  // マスタデータの取得
  useEffect(() => {
    noRedirectCustomAxios.get("/api/users/test")
      .then((res: AxiosResponse) => {
        setUsername(res.data.username);
      })
      .catch((error: AxiosError) => {
        if (error.response?.status !== 401) {
          console.error("APIリクエスト失敗:", error);
          // console.error("APIリクエスト失敗:", error);
        }
      });
    noRedirectCustomAxios
      .get("/api/user_profile/languages")
      .then((res: AxiosResponse) => {
        setAvailableLanguages(res.data)
      })
      .catch((err: AxiosError) => {
        console.error("言語の取得に失敗:", err)
        // setError(err.message)
      })
    noRedirectCustomAxios
      .get("/api/user_profile/frameworks")
      .then((res: AxiosResponse) => {
        setAvailableFrameworks(res.data)
      })
      .catch((err: AxiosError) => {
        console.error("フレームワークの取得に失敗:", err)
        // setError(err.message)
      })
    noRedirectCustomAxios
      .get("/api/user_profile/social_medias")
      .then((res: AxiosResponse) => {
        setAvailableSocialMedia(res.data)
      })
      .catch((err: AxiosError) => {
        console.error("SNSプラットフォームの取得に失敗:", err)
        // setError(err.message)
      })
  }, [])

  // SNSリンクの追加
  // const addSocialLink = () => {
  const addSocialLink = () => {}
  //   if (!socialPlatformInput) return
  //   if (!socialUrlInput) return

  //   // URLのバリデーション
  //   if (!isValidUrl(socialUrlInput)) {
  //     toast.error("無効なURL", { description: "正しいURL形式で入力してください" })
  //     return
  //   }

  //   // プラットフォーム名の取得
  //   let platformName = socialPlatformInput
  //   if (socialPlatformInput === "other" && customPlatformInput) {
  //     platformName = customPlatformInput
  //   }

  //   // 既存のリンクをチェック
  //   const existingLink = socialMedias.find(
  //     (link) => link.platform === platformName || link.url.toLowerCase() === socialUrlInput.toLowerCase(),
  //   )

  //   if (existingLink) {
  //     toast.error("重複するリンク", { description: "同じプラットフォームまたはURLが既に追加されています" })
  //     return
  //   }

  //   // リンクを追加
  //   setSocialMedias([...socialMedias, { platform: platformName, url: socialUrlInput }])

  //   // 入力をリセット
  //   setSocialPlatformInput("")
  //   setSocialUrlInput("")
  //   setCustomPlatformInput("")
  // }

  // SNSリンクの削除
  // const removeSocialLink = (index: number) => {
  //   const newLinks = [...socialMedias]
  //   newLinks.splice(index, 1)
  //   setSocialMedias(newLinks)
  // }

  // 言語の追加
  // const addLanguage = () => {
  const addLanguage = () => {}
  //   if (!languageInput.trim()) return

  //   if (!selectedLanguages.includes(languageInput)) {
  //     setSelectedLanguages([...selectedLanguages, languageInput])
  //     setLanguageInput("")
  //   }
  // }

  // 言語の削除
  // const removeLanguage = (language: string) => {
  //   setSelectedLanguages(selectedLanguages.filter((l) => l !== language))
  // }

  // フレームワークの追加
  // const addFramework = () => {
  const addFramework = () => {}
  //   if (!frameworkInput.trim()) return

  //   if (!selectedFrameworks.includes(frameworkInput)) {
  //     setSelectedFrameworks([...selectedFrameworks, frameworkInput])
  //     setFrameworkInput("")
  //   }
  // }

  // フレームワークの削除
  // const removeFramework = (framework: string) => {
  //   setSelectedFrameworks(selectedFrameworks.filter((f) => f !== framework))
  // }

  // フォーム送信処理
  const handleSubmit = () => {}
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setError(null)
  //   setIsSubmitting(true)

  //   try {
  //     // URLのバリデーション
  //     const urlFields = [
  //       { name: "ポートフォリオURL", value: portfolioUrl },
  //       { name: "GitHub URL", value: githubUrl },
  //       ...socialMedias.map((link) => ({ name: `${link.platform} URL`, value: link.url })),
  //     ]

  //     for (const field of urlFields) {
  //       if (field.value && !isValidUrl(field.value)) {
  //         throw new Error(`${field.name}が正しい形式ではありません`)
  //       }
  //     }

  //     // API呼び出しをシミュレート
  //     await new Promise((resolve) => setTimeout(resolve, 1000))

  //     // 成功トースト表示
  //     toast.success("プロフィールを更新しました")

      // 実際のアプリケーションでは、ここでAPIを呼び出してプロフィールを更新します
      /*
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bio,
          portfolioUrl,
          githubUrl,
          socialLinks,
          languages: selectedLanguages,
          frameworks: selectedFrameworks,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "プロフィールの更新に失敗しました");
      }
      */

      // 成功後にダッシュボードにリダイレクト
  //     router.push("/dashboard")
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : "プロフィールの更新に失敗しました")
  //     toast.error("エラー", {
  //       description: err instanceof Error ? err.message : "プロフィールの更新に失敗しました",
  //     })
  //   } finally {
  //     setIsSubmitting(false)
  //   }
  // }

  // URLのバリデーション
  const isValidUrl = (url: string): boolean => {
    if (!url) return true // 空のURLは許可
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // SNSプラットフォーム名の取得
  // const getSocialPlatformName = (platformId: string): string => {
  //   const platform = socialPlatforms.find((p) => p.id === platformId)
  //   return platform ? platform.name : platformId
  // }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ユーザー名 */}
      <div className="space-y-2">
        <Label htmlFor="username">ユーザー名</Label>
        <div className="flex items-center gap-4">
          <Input id="username" value={username} disabled className="max-w-sm" />
          <Link href="/settings/username" className="text-sm text-primary flex items-center hover:underline">
            変更する
            <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">ユーザー名の変更は別ページで行えます</p>
      </div>

      {/* 自己紹介 */}
      <div className="space-y-2">
        <Label htmlFor="bio">自己紹介</Label>
        <Textarea
          id="bio"
          placeholder="あなたについて簡単に紹介してください"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
        />
      </div>

      {/* ポートフォリオURL */}
      <div className="space-y-2">
        <Label htmlFor="portfolio">ポートフォリオサイトURL</Label>
        <Input
          id="portfolio"
          type="url"
          placeholder="https://example.com"
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
        />
      </div>

      {/* GitHub URL */}
      <div className="space-y-2">
        <Label htmlFor="github">GitHub URL</Label>
        <Input
          id="github"
          type="url"
          placeholder="https://github.com/username"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
        />
      </div>

      {/* SNS URL */}
      <div className="space-y-4">
        <Label>SNS URL</Label>
        {/* <div className="flex flex-wrap gap-2 mb-2">
          {socialMedias.map((link, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              <Globe className="h-3 w-3 mr-1" />
              {link.platform}: {link.url.replace(/^https?:\/\//, "").split("/")[0]}
              <button
                type="button"
                onClick={() => removeSocialLink(index)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <Trash2 className="h-3 w-3" />
                <span className="sr-only">{link.platform}を削除</span>
              </button>
            </Badge>
          ))}
        </div> */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Select value={socialPlatformInput} onValueChange={setSocialPlatformInput}>
              <SelectTrigger>
                <SelectValue placeholder="プラットフォームを選択" />
              </SelectTrigger>
              <SelectContent>
                {availableSocialMedia.map((platform) => (
                  <SelectItem key={platform.id} value={platform.id.toString()}>
                    {platform.social_media_name}
                  </SelectItem>
                ))}
                <SelectItem value="other">その他</SelectItem>
              </SelectContent>
            </Select>
            {socialPlatformInput === "other" && (
              <Input
                className="mt-2"
                placeholder="プラットフォーム名を入力"
                value={customPlatformInput}
                onChange={(e) => setCustomPlatformInput(e.target.value)}
              />
            )}
          </div>
          <div className="flex-[2] flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com/username"
              value={socialUrlInput}
              onChange={(e) => setSocialUrlInput(e.target.value)}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={addSocialLink}
              disabled={
                !socialPlatformInput || !socialUrlInput || (socialPlatformInput === "other" && !customPlatformInput)
              }
            >
              追加
            </Button>
          </div>
        </div>
      </div>

      {/* 使用言語 */}
      <div className="space-y-4">
        <Label>使用言語</Label>
        {/* <div className="flex flex-wrap gap-2 mb-2">
          {selectedLanguages.map((language) => (
            <Badge key={language} variant="secondary" className="flex items-center gap-1">
              {language}
              <button
                type="button"
                onClick={() => removeLanguage(language)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <Trash2 className="h-3 w-3" />
                <span className="sr-only">{language}を削除</span>
              </button>
            </Badge>
          ))}
        </div> */}
        <div className="flex gap-2">
          <Select value={languageInput} onValueChange={setLanguageInput}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="言語を選択" />
            </SelectTrigger>
            <SelectContent>
              {availableLanguages
                // .filter((lang) => !selectedLanguages.includes(lang))
                .map((language) => (
                  <SelectItem key={language.id} value={language.id.toString()}>
                    {language.language_name}
                  </SelectItem>
                ))}
              <SelectItem value="other">その他</SelectItem>
            </SelectContent>
          </Select>
          {languageInput === "other" ? (
            <div className="flex gap-2 flex-1">
              <Input
                placeholder="言語名を入力"
                value={languageInput === "other" ? "" : languageInput}
                onChange={(e) => setLanguageInput(e.target.value)}
              />
              <Button type="button" variant="secondary" onClick={addLanguage}>
                追加
              </Button>
            </div>
          ) : (
            <Button type="button" variant="secondary" onClick={addLanguage} disabled={!languageInput}>
              追加
            </Button>
          )}
        </div>
      </div>

      {/* 使用フレームワーク */}
      <div className="space-y-4">
        <Label>使用フレームワーク</Label>
        {/* <div className="flex flex-wrap gap-2 mb-2">
          {selectedFrameworks.map((framework) => (
            <Badge key={framework} variant="secondary" className="flex items-center gap-1">
              {framework}
              <button
                type="button"
                onClick={() => removeFramework(framework)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <Trash2 className="h-3 w-3" />
                <span className="sr-only">{framework}を削除</span>
              </button>
            </Badge>
          ))}
        </div> */}
        <div className="flex gap-2">
          <Select value={frameworkInput} onValueChange={setFrameworkInput}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="フレームワークを選択" />
            </SelectTrigger>
            <SelectContent>
              {availableFrameworks
                // .filter((fw) => !selectedFrameworks.includes(fw))
                .map((framework) => (
                  <SelectItem key={framework.id} value={framework.id.toString()}>
                    {framework.framework_name}
                  </SelectItem>
                ))}
              <SelectItem value="other">その他</SelectItem>
            </SelectContent>
          </Select>
          {frameworkInput === "other" ? (
            <div className="flex gap-2 flex-1">
              <Input
                placeholder="フレームワーク名を入力"
                value={frameworkInput === "other" ? "" : frameworkInput}
                onChange={(e) => setFrameworkInput(e.target.value)}
              />
              <Button type="button" variant="secondary" onClick={addFramework}>
                追加
              </Button>
            </div>
          ) : (
            <Button type="button" variant="secondary" onClick={addFramework} disabled={!frameworkInput}>
              追加
            </Button>
          )}
        </div>
      </div>

      {/* 送信ボタン */}
      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
          キャンセル
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            "保存する"
          )}
        </Button>
      </div>
    </form>
  )
}
