import { ProfileSettingsForm } from "./components/ProfileSetingsForm";

export default function ProfileSettingsPage() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">プロフィール設定</h1>
        <p className="text-muted-foreground">あなたのプロフィール情報を設定してください</p>
      </div>
      <ProfileSettingsForm />
    </div>
  )
}
