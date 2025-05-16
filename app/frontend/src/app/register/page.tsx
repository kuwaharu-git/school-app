import { RegisterForm } from "./component/RegisterForm"

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </main>
  )
}
