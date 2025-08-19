'use client';
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { noRedirectCustomAxios } from "@/lib/customAxios";
import { AxiosResponse, AxiosError } from "axios";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Home, UserPlus, LogIn } from "lucide-react";

export default function Page() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    noRedirectCustomAxios.get("/api/users/test")
      .then((res: AxiosResponse) => {
        setUsername(res.data.username);
      })
      .catch((error: AxiosError) => {
        if (error.response?.status !== 401) {
          console.error("APIリクエスト失敗:", error);
        }
      });
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/80">
      <Header username={username} />

      <main className="flex-grow flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-lg p-10">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">Welcome to the Student Portal System</h1>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-300">学習とメンバー情報をシンプルに管理。必要な操作へすぐにアクセスできます。</p>
            </div>

            <hr className="my-6 border-t border-gray-100 dark:border-slate-800" />

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button asChild variant="default" className="w-full">
                <Link href="/home" className="px-4 py-2 block text-center inline-flex items-center justify-center gap-2">
                  <Home className="h-4 w-4" />
                  <span>ホーム</span>
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/register_request" className="px-4 py-2 block text-center inline-flex items-center justify-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>新規申請</span>
                </Link>
              </Button>

              <Button asChild variant="ghost" className="w-full">
                <Link href="/login" className="px-4 py-2 block text-center inline-flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>ログイン</span>
                </Link>
              </Button>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">学内向けシステムです。アカウントがない場合は新規申請から登録してください。</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}