import { ChangePasswordForm } from "./components/ChangePasswordForm"

export default function ChangePasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-md">
        <ChangePasswordForm />
      </div>
    </main>
  )
}
