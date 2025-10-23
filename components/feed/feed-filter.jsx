"use client"

import { Button } from "@/components/ui/button"
import { BookOpen, FileText, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export function FeedFilter({ activeFilter, onFilterChange }) {
  const filters = [
    { id: "all", label: "Tümü", icon: TrendingUp },
    { id: "quote", label: "Alıntılar", icon: BookOpen },
    { id: "blog", label: "Blog Yazıları", icon: FileText },
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => {
        const Icon = filter.icon
        return (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? "default" : "outline"}
            size="sm"
            className={cn("gap-2 whitespace-nowrap", activeFilter === filter.id && "shadow-md")}
            onClick={() => onFilterChange(filter.id)}
          >
            <Icon className="h-4 w-4" />
            {filter.label}
          </Button>
        )
      })}
    </div>
  )
}
