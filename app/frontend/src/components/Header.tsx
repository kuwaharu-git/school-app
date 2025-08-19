"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, User, UserPlus, LogOut, Settings, HelpCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { noRedirectCustomAxios } from "@/lib/customAxios"

interface HeaderProps {
  username: string
}

export function Header({ username }: HeaderProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    noRedirectCustomAxios
      .post("/api/users/logout")
      .then(() => {
        toast.success("ログアウトしました")
        router.push("/login")
      })
    }


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col items-center" style={{ paddingLeft: "5%", paddingRight: "5%" }}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <span className="font-medium">{username ? username : "ゲスト"}</span>
        </div>

        {/* モバイル用ハンバーガーメニュー */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="メニュー">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px] sm:w-[300px]">
            <SheetHeader>
              <SheetTitle>メニュー</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-4">
              <SheetClose asChild>
                <Link href="/home" className="flex items-center gap-2 px-2 py-1 hover:underline">
                  <span>ホーム</span>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/settings" className="flex items-center gap-2 px-2 py-1 hover:underline">
                  <Settings className="h-4 w-4" />
                  <span>設定</span>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/help" className="flex items-center gap-2 px-2 py-1 hover:underline">
                  <HelpCircle className="h-4 w-4" />
                  <span>ヘルプ</span>
                </Link>
              </SheetClose>
            {username ? (
                <>
                    <SheetClose asChild>
                        <Link href="/profile/setting_profile" className="flex items-center gap-2 px-2 py-1 hover:underline">
                            <User className="h-4 w-4" />
                            <span>プロフィール</span>
                        </Link>
                    </SheetClose>
                    <SheetClose asChild>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-2 py-1 text-left text-red-500 hover:underline"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>ログアウト</span>
                        </button>
                    </SheetClose>
                </>
            ) : (
                <>
                    <SheetClose asChild>
                        <Link href="/login" className="flex items-center gap-2 px-2 py-1 text-left hover:underline">
                            <User className="h-4 w-4" />
                            <span>ログイン</span>
                        </Link>
                    </SheetClose>
                    <SheetClose asChild>
                        <Link href="/register" className="flex items-center gap-2 px-2 py-1 hover:underline">
                            <UserPlus className="h-4 w-4" />
                            <span>新規ユーザ申請</span>
                        </Link>
                    </SheetClose>
                </>
            )}
            </div>
          </SheetContent>
        </Sheet>

        {/* デスクトップ用ドロップダウンメニュー */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="hidden md:flex">
            <Button variant="ghost" size="icon" aria-label="メニュー">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/home">ホーム</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>設定</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/help">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>ヘルプ</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {username ? (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/profile/setting_profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>プロフィール</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>ログアウト</span>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/login">
                    <User className="mr-2 h-4 w-4" />
                    <span>ログイン</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/register_request">
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>新規ユーザ申請</span>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
