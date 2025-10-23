import { BookOpen } from "lucide-react"

export function EmptyState({ icon: Icon = BookOpen, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Icon className="mb-4 h-16 w-16 text-muted-foreground" />
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}
