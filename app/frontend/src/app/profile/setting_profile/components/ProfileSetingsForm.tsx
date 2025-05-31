"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast, Toaster } from "sonner"
import { Loader2, Trash2, ExternalLink, Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { customAxios } from "@/lib/customAxios"
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
  language: LanguageInterface | null,
  other_language_name: string
}
type UserFramework = {
  framework: FrameworkInterface | null,
  other_framework_name: string
}
type UserSocialMedia = {
  social_media: SocialMediaInterface | null,
  other_social_media_name: string,
  url: string
}

type AvailableData = {
  [id: string]: string
}

export function ProfileSettingsForm() {
  const router = useRouter()

  // 利用かのうな選択肢のデータ
  const [availableLanguages, setAvailableLanguages] = useState<AvailableData>({})
  const [availableFrameworks, setAvailableFrameworks] = useState<AvailableData>({})
  const [availableSocialMedias, setAvailableSocialMedias] = useState<AvailableData>({})

  // ユーザー情報の状態
  const [username, setUsername] = useState("")
  const [selfIntroduction, setSelfIntroduction] = useState("")
  const [portfolioUrl, setPortfolioUrl] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [selectedLanguages, setSelectedLanguages] = useState<UserLanguage[]>([])
  const [selectedFrameworks, setSelectedFrameworks] = useState<UserFramework[]>([])
  const [selectedSocialMedias, setSelectedSocialMedias] = useState<UserSocialMedia[]>([])

  // UI状態
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [languageInput, setLanguageInput] = useState("")
  const [frameworkInput, setFrameworkInput] = useState("")
  const [socialMediaInput, setSocialPlatformInput] = useState<string>("")
  const [socialMediaUrlInput, setSocialUrlInput] = useState<string>("")
  const [customPlatformInput, setCustomPlatformInput] = useState<string>("")
  const [customLanguageInput, setCustomLanguageInput] = useState<string>("")
  const [customFrameworkInput, setCustomFrameworkInput] = useState<string>("")

  // マスタデータの取得
  useEffect(() => {
    customAxios
      .get("/api/user_profile/")
      .then((res: AxiosResponse) => {
        const response_data = res.data
        const userInfo = response_data.user_info
        const user_profile = response_data.user_profile
        const userLanguages = response_data.user_languages || []
        const userFrameworks = response_data.user_frameworks || []
        const userSocialMedias = response_data.user_social_medias || []

        // ユーザー情報の設定
        setUsername(userInfo.username || "")
        setSelfIntroduction(user_profile.self_introduction || "")
        setPortfolioUrl(user_profile.portfolio_url || "")
        setGithubUrl(user_profile.github_url || "")
        setSelectedLanguages(userLanguages)
        setSelectedFrameworks(userFrameworks)
        setSelectedSocialMedias(userSocialMedias)
      })
    // 言語、フレームワーク、SNSプラットフォームのデータを取得
    customAxios
      .get("/api/user_profile/languages")
      .then((res: AxiosResponse) => {
        setAvailableLanguages(res.data)
      })
      .catch((err: AxiosError) => {
        console.error("言語の取得に失敗:", err)
        // setError(err.message)
      })
    customAxios
      .get("/api/user_profile/frameworks")
      .then((res: AxiosResponse) => {
        setAvailableFrameworks(res.data)
      })
      .catch((err: AxiosError) => {
        console.error("フレームワークの取得に失敗:", err)
        // setError(err.message)
      })
    customAxios
      .get("/api/user_profile/social_medias")
      .then((res: AxiosResponse) => {
        setAvailableSocialMedias(res.data)
        console.log("取得したSNSプラットフォーム:", res.data)
      })
      .catch((err: AxiosError) => {
        console.error("SNSプラットフォームの取得に失敗:", err)
        // setError(err.message)
      })
  }, [])

  // SNSリンクの追加
  const addSocialMedia = () => {
    if (!socialMediaInput) return
    if (!socialMediaUrlInput) return

    // URLのバリデーション
    if (!isValidUrl(socialMediaUrlInput)) {
      toast.error("無効なURL", { description: "正しいURL形式で入力してください" })
      return
    }
    
    // プラットフォーム名の取得
    let platformName = ""
    if (socialMediaInput !== "other") {
      platformName = availableSocialMedias[socialMediaInput] || ""
    } else {
      platformName = customPlatformInput.trim()
      if (!platformName) {
        toast.error("プラットフォーム名が必要", { description: "プラットフォーム名を入力してください" })
        return
      }
    }

    // 重複をチェック
    const existingSocialMedia = selectedSocialMedias.find(
      (socialMedia) =>
        (socialMedia.social_media && socialMedia.social_media.social_media_name === platformName) ||
        socialMedia.other_social_media_name === platformName ||
        socialMedia.url === socialMediaUrlInput
    )

    if (existingSocialMedia) {
      toast.error("重複", { description: "同じプラットフォームまたはURLが既に追加されています" })
      return
    }
    
    let newSocialMedia: UserSocialMedia 
    if (socialMediaInput !== "other") {
      newSocialMedia = {
        social_media: {
          id: Number(socialMediaInput),
          social_media_name: availableSocialMedias[socialMediaInput]
        },
        url: socialMediaUrlInput,
        other_social_media_name: "",
      }
    } else {
      newSocialMedia = {
        social_media: null,
        url: socialMediaUrlInput,
        other_social_media_name: platformName,
      }
    }


    // リンクを追加
    setSelectedSocialMedias([...selectedSocialMedias, newSocialMedia])

    // 入力をリセット
    setSocialPlatformInput("")
    setSocialUrlInput("")
    setCustomPlatformInput("")
  }

  // SNSリンクの削除
  const removeSocialLink = (index: number) => {
    setSelectedSocialMedias(selectedSocialMedias.filter((_, i) => i !== index))
  }

  // 言語の追加
  const addLanguage = () => {
    if (!languageInput.trim()) return

    let languageName = ""
    if (languageInput !== "other") {
      languageName = availableLanguages[languageInput] || ""
    } else {
      languageName = customLanguageInput.trim()
      if (!languageName) {
        toast.error("言語名が必要", { description: "言語名を入力してください" })
        return
      }
    }
        // 重複チェック
    const existingLanguage = selectedLanguages.find((lang) => (
      (lang.language && lang.language.language_name === languageName) ||
      lang.other_language_name === languageName ||
      (lang.language && lang.language.id === Number(languageInput)) ||
      (lang.language === null && lang.other_language_name === languageName)
    ))
    if (existingLanguage) {
      toast.error("重複", { description: "同じ言語が既に追加されています" })
      return
    }
    // 新しい言語オブジェクトの作成
    let newLanguage: UserLanguage
    if (languageInput !== "other") {
      newLanguage = {
        language: {
          id: Number(languageInput),
          language_name: languageName,
        },
        other_language_name: "",
      }
    } else {
      newLanguage = {
        language: null,
        other_language_name: languageName,
      }
    }

    setSelectedLanguages([...selectedLanguages, newLanguage])
    setLanguageInput("")
    setCustomLanguageInput("")
  }

  // 言語の削除
  const removeLanguage = (index: number) => {
    setSelectedLanguages(selectedLanguages.filter((_, i) => i !== index))
  }

  // フレームワークの追加
  const addFramework = () => {
    if (!frameworkInput.trim()) return

    let frameworkName = ""
    if (frameworkInput !== "other") {
      frameworkName = availableFrameworks[frameworkInput] || ""
    }
    else {
      frameworkName = customFrameworkInput.trim()
      if (!frameworkName) {
        toast.error("フレームワーク名が必要", { description: "フレームワーク名を入力してください" })
        return
      }
    }
    // 重複チェック
    const existingFramework = selectedFrameworks.find((fw) => (
      (fw.framework && fw.framework.framework_name === frameworkName) ||
      fw.other_framework_name === frameworkName ||
      (fw.framework && fw.framework.id === Number(frameworkInput)) ||
      (fw.framework === null && fw.other_framework_name === frameworkName)
    ))
    if (existingFramework) {
      toast.error("重複", { description: "同じフレームワークが既に追加されています" })
      return
    }
    // 新しいフレームワークオブジェクトの作成
    let newFramework: UserFramework
    if (frameworkInput !== "other") {
      newFramework = {
        framework: {
          id: Number(frameworkInput),
          framework_name: frameworkName,
        },
        other_framework_name: "",
      }
    }
    else {
      newFramework = {
        framework: null,
        other_framework_name: frameworkName,
      }
    }
    setSelectedFrameworks([...selectedFrameworks, newFramework])
    setFrameworkInput("")
  }

  // フレームワークの削除
  const removeFramework = (index: number) => {
    setSelectedFrameworks(selectedFrameworks.filter((_, i) => i !== index))
  }

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    customAxios.post("/api/user_profile/", {
      user_profile: {
        self_introduction: selfIntroduction,
        portfolio_url: portfolioUrl,
        github_url: githubUrl,
      },
      user_languages: selectedLanguages,
      user_frameworks: selectedFrameworks,
      user_social_medias: selectedSocialMedias,
    })
    .then((res: AxiosResponse) => {
      console.log("プロフィール更新成功:", res.data)
      // 成功トースト表示
      toast.success("プロフィールを更新しました")
    })
    .catch((err: AxiosError) => {
      console.error("プロフィール更新失敗:", err)
      setError(err.message)
      toast.error("エラー", {
        description: err.message || "プロフィールの更新に失敗しました",
      })
    })
    .finally(() => {
      setIsSubmitting(false)
    })
  }


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
    <>
      <Toaster position="top-right" />
      <form onSubmit={handleSubmit} className="space-y-8">

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
            value={selfIntroduction}
            onChange={(e) => setSelfIntroduction(e.target.value)}
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
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedSocialMedias.map((socialMedia, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                <Globe className="h-3 w-3 mr-1" />
                {socialMedia.social_media?.social_media_name || socialMedia.other_social_media_name}: {socialMedia.url.replace(/^https?:\/\//, "").split("/")[0]}
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <Trash2 className="h-3 w-3" />
                  <span className="sr-only">{socialMedia.social_media?.social_media_name || socialMedia.other_social_media_name}を削除</span>
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Select value={socialMediaInput} onValueChange={setSocialPlatformInput}>
                <SelectTrigger>
                  <SelectValue placeholder="プラットフォームを選択" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(availableSocialMedias).map(([id, name]) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
              {socialMediaInput === "other" && (
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
                value={socialMediaUrlInput}
                onChange={(e) => setSocialUrlInput(e.target.value)}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addSocialMedia}
                disabled={
                  !socialMediaInput || !socialMediaUrlInput || (socialMediaInput === "other" && !customPlatformInput)
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
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedLanguages.map((language, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {language.language?.language_name || language.other_language_name}
                <button
                  type="button"
                  onClick={() => removeLanguage(index)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <Trash2 className="h-3 w-3" />
                  <span className="sr-only">{language.language?.language_name || language.other_language_name}を削除</span>
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Select value={languageInput} onValueChange={setLanguageInput}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="言語を選択" />
              </SelectTrigger>
              <SelectContent>
                  {Object.entries(availableLanguages).map(([id, name]) => (
                    // すでにある言語は除外が必要
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                  ))}
                <SelectItem value="other">その他</SelectItem>
              </SelectContent>
            </Select>
            {languageInput === "other" ? (
              <div className="flex gap-2 flex-1">
                <Input
                  placeholder="言語名を入力"
                  value={customLanguageInput === "other" ? "" : customLanguageInput}
                  onChange={(e) => setCustomLanguageInput(e.target.value)}
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
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedFrameworks.map((framework, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {framework.framework?.framework_name || framework.other_framework_name}
                <button
                  type="button"
                  onClick={() => removeFramework(index)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <Trash2 className="h-3 w-3" />
                  <span className="sr-only">{framework.framework?.framework_name || framework.other_framework_name }を削除</span>
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Select value={frameworkInput} onValueChange={setFrameworkInput}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="フレームワークを選択" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(availableFrameworks).map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
                <SelectItem value="other">その他</SelectItem>
              </SelectContent>
            </Select>
            {frameworkInput === "other" ? (
              <div className="flex gap-2 flex-1">
                <Input
                  placeholder="フレームワーク名を入力"
                  value={customFrameworkInput === "other" ? "" : customFrameworkInput}
                  onChange={(e) => setCustomFrameworkInput(e.target.value)}
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
    </>
  )
}
