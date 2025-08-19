import { UsernameChangeForm } from "./components/UsernameChangeForm"
import { BackButton } from "@/components/BackButton"

export default function UsernameChangePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-md">
        <BackButton fallback="/profile/setting_profile" />
        <UsernameChangeForm />
      </div>
    </main>
  )
}
