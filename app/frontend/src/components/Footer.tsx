import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t py-6 md:py-0 flex flex-col items-center">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row" style={{ paddingLeft: "5%", paddingRight: "5%" }}>
        <p className="text-xs sm:text-sm text-muted-foreground text-center">
          &copy; {currentYear} 学生ポータルシステム. All rights reserved.
        </p>
        <nav className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground items-center">
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
