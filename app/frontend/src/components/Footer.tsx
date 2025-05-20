import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t py-6 md:py-0">
    <div className="container max-w-none flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row" style={{ paddingLeft: "5%", paddingRight: "5%" }}>
      <p className="text-sm text-muted-foreground">&copy; {currentYear} 学生ポータルシステム. All rights reserved.</p>
      <nav className="flex gap-4 text-sm text-muted-foreground">
        <Link href="/terms" className="hover:underline hover:text-foreground transition-colors">
        利用規約
        </Link>
        <Link href="/privacy" className="hover:underline hover:text-foreground transition-colors">
        プライバシーポリシー
        </Link>
        <Link href="/contact" className="hover:underline hover:text-foreground transition-colors">
        お問い合わせ
        </Link>
      </nav>
    </div>
    </footer>
  )
}
