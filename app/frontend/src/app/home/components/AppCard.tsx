import Link from "next/link"
import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AppCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
}

export function AppCard({ title, description, icon: Icon, href }: AppCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Link href={href} className="w-full">
          <Button className="w-full">アクセス</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
