import { UsersList } from "./componets/UsersList"

export default function UsersPage() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ユーザー一覧</h1>
        <p className="text-muted-foreground">ユーザのプロフィールを確認できます</p>
      </div>
      <UsersList />
    </div>
  )
}
