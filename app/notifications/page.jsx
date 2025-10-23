"use client"

import { useSelector, useDispatch } from "react-redux"
import { markAsRead, markAllAsRead } from "@/store/slices/notificationSlice"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatDate } from "@/utils/formatDate"
import { Heart, MessageCircle, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function NotificationsPage() {
  const notifications = useSelector((state) => state.notifications.notifications)
  const dispatch = useDispatch()

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id))
  }

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead())
  }

  const getIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 fill-red-500 text-red-500" />
      case "comment":
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      case "follow":
        return <UserPlus className="h-5 w-5 text-green-500" />
      default:
        return null
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bildirimler</h1>
        {notifications.some((n) => !n.read) && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
            Tümünü Okundu İşaretle
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={cn(
              "cursor-pointer p-4 transition-colors hover:bg-muted/50",
              !notification.read && "border-l-4 border-l-primary bg-muted/30",
            )}
            onClick={() => handleMarkAsRead(notification.id)}
          >
            <div className="flex items-start gap-3">
              <Link href={`/profile/${notification.user.username}`}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={notification.user.avatar || "/placeholder.svg"} alt={notification.user.name} />
                  <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {getIcon(notification.type)}
                  <p className="text-sm">
                    <Link href={`/profile/${notification.user.username}`} className="font-semibold hover:underline">
                      {notification.user.name}
                    </Link>{" "}
                    <span className="text-muted-foreground">{notification.message}</span>
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(notification.timestamp)}</p>
              </div>

              {!notification.read && <div className="h-2 w-2 rounded-full bg-primary" />}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
