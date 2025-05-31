"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Globe, Code2, ExternalLink } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { customAxios } from "@/lib/customAxios";

// ユーザーデータの型定義
interface UserData {
  id: number;
  username: string;
  student_id: string;
}

interface Language {
  id: number;
  language_name: string;
}

interface Framework {
  id: number;
  framework_name: string;
}

interface SocialMedia {
  id: number;
  social_media_name: string;
}

interface UserInfo {
    id: number;
    student_id: string;
    username: string;
}

interface UserProfile {
    self_introduction?: string;
    portfolio_url?: string;
    github_url?: string;
}

interface UserLanguage {
  language: Language | null;
  other_language_name: string;
}

interface UserFramework {
  framework: Framework | null;
  other_framework_name: string;
}

interface UserSocialMedia {
  social_media: SocialMedia | null;
  other_social_media_name: string;
  url: string;
}

interface UserProfileData extends UserData {
  user_info: UserInfo;
  user_profile: UserProfile;
  user_social_medias?: UserSocialMedia[];
  user_languages?: UserLanguage[];
  user_frameworks?: UserFramework[];
}


export function UsersList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(
    null
  );
  const [users, setUsers] = useState<UserData[]>([]);

  const filteredAndSortedUsers = useMemo(() => {
    const sortedUsers = [...users].sort((a, b) =>
      a.username.localeCompare(b.username)
    );
    return sortedUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.student_id.includes(searchTerm)
    );
  }, [searchTerm, users]);

  useEffect(() => {
    // ユーザリストの初期化
    customAxios
      .get("/api/user_profile/user_list")
      .then((response) => {
        // レスポンスからユーザーデータを取得
        const users: UserData[] = response.data.users;
        setUsers(users);
      })
      .catch((error) => {
        console.error("ユーザーデータの取得に失敗しました:", error);
        // エラーハンドリング（例: モックデータを使用するなど）
      });
  }, []);

  const handleUserClick = (user: UserData) => {
    // ユーザーの詳細情報を取得
    customAxios
      .get(`/api/user_profile/${user.id}`)
      .then((response) => {
        const userProfile: UserProfileData = response.data;
        setSelectedUser(userProfile);
      })
      .catch((error) => {
        console.error("ユーザープロフィールの取得に失敗しました:", error);
        // エラーハンドリング（例: モックデータを使用するなど）
      });
  };

  const closeDialog = () => {
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      {/* 検索バー */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="ユーザー名、氏名で検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* ユーザー一覧 */}
      <div className="bg-card rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold">
            ユーザー一覧 ({filteredAndSortedUsers.length}名)
          </h3>
        </div>
        <div className="divide-y">
          {filteredAndSortedUsers.map((user) => (
            <div
              key={user.id}
              className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => handleUserClick(user)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">@{user.username}</span>
                  <span className="text-muted-foreground ml-2">
                    ({user.student_id})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredAndSortedUsers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            該当するユーザーが見つかりませんでした。
          </p>
        </div>
      )}

      {/* プロフィール詳細ポップアップ */}
      <Dialog open={!!selectedUser} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                <div>
                  <div className="flex items-center gap-2">
                    <span>@{selectedUser?.user_info.username}</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-normal">
                    {selectedUser?.user_info.student_id}
                  </p>
                </div>
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* 自己紹介 */}
            {selectedUser?.user_profile?.self_introduction ? (
              <div>
                <h4 className="font-semibold mb-2">自己紹介</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedUser.user_profile.self_introduction}
                </p>
              </div>
            ) : (
              <div>
                <h4 className="font-semibold mb-2">自己紹介</h4>
                <p className="text-sm text-muted-foreground italic">
                  自己紹介が登録されていません
                </p>
              </div>
            )}

            <Separator />

            {/* ポートフォリオサイト */}
            <div>
              <h4 className="font-semibold mb-3">ポートフォリオサイト</h4>
              <div className="space-y-2">
                {selectedUser?.user_profile?.portfolio_url ? (
                  <a
                    href={selectedUser.user_profile.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    {selectedUser.user_profile.portfolio_url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    ポートフォリオサイトが登録されていません
                  </p>
                )}
              </div>
            </div>

            {/* {GitHubURL} */}
            <div>
              <h4 className="font-semibold mb-3">GitHub</h4>
              <div className="space-y-2">
                {selectedUser?.user_profile?.github_url ? (
                  <a
                    href={selectedUser.user_profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Code2 className="h-4 w-4" />
                    {selectedUser.user_profile.github_url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    GitHubが登録されていません
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* 使用言語 */}
            <div>
              <h4 className="font-semibold mb-3">使用言語</h4>
              <div className="flex flex-wrap gap-2">
                {selectedUser?.user_languages &&
                selectedUser.user_languages.length > 0 ? (
                  selectedUser.user_languages.map((lang, index) => (
                    <Badge
                      key={index}
                      className="bg-secondary text-secondary-foreground"
                    >
                      {lang.language
                        ? lang.language.language_name
                        : lang.other_language_name || "不明"}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    使用言語が登録されていません
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* 使用フレームワーク */}
            <div>
              <h4 className="font-semibold mb-3">使用フレームワーク</h4>
              <div className="flex flex-wrap gap-2">
                {selectedUser?.user_frameworks &&
                selectedUser.user_frameworks.length > 0 ? (
                  selectedUser.user_frameworks.map((framework, index) => (
                    <Badge
                      key={index}
                      className="bg-secondary text-secondary-foreground"
                    >
                      {framework.framework
                        ? framework.framework.framework_name
                        : framework.other_framework_name || "不明"}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    使用フレームワークが登録されていません
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* SNSリンク */}
            <div>
              <h4 className="font-semibold mb-3">SNSリンク</h4>
              <div className="space-y-2">
                {selectedUser?.user_social_medias &&
                selectedUser.user_social_medias.length > 0 ? (
                  selectedUser.user_social_medias.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      {social.social_media ? (
                        <>
                          <span>{social.social_media.social_media_name}</span>
                          <ExternalLink className="h-3 w-3" />
                        </>
                      ) : (
                        <span>{social.other_social_media_name || "不明"}</span>
                      )}
                    </a>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    SNSリンクが登録されていません
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
