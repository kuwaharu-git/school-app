import { LoginForm } from "./components/LoginForm"
import { BackButton } from "@/components/BackButton"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-md">
        <BackButton fallback="/" />
        <LoginForm />
      </div>
    </main>
  )
}
