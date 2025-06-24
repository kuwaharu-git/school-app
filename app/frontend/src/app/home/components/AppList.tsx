"use client"

import { useState } from "react"
import { AppCard } from "./AppCard"
import { BookOpen, Calendar, FileText, MessageSquare, Settings, Users } from "lucide-react"

export function AppList() {

  // サービス一覧
  const services = [
    {
      id: "profile",
      title: "ユーザプロフィール一覧",
      description: "ユーザのプロフィールを確認できます",
      icon: Users,
      href: "/profile",
    }
  ]

  return (
    <div className="flex flex-col min-h-screen">

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-muted-foreground">利用したいサービスを選択してください</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <AppCard
              key={service.id}
              title={service.title}
              description={service.description}
              icon={service.icon}
              href={service.href}
            />
          ))}
        </div>
      </main>

    </div>
  )
}
