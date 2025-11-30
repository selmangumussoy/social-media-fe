"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

import { getTrendingDaily, getTrendingWeekly } from "@/services/tagService"

export function RightSidebar() {
  const [dailyTrends, setDailyTrends] = useState([])
  const [weeklyTrends, setWeeklyTrends] = useState([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState("daily") // daily | weekly

  useEffect(() => {
    const loadTrends = async () => {
      setLoading(true)

      try {
        const daily = await getTrendingDaily()
        const weekly = await getTrendingWeekly()

        setDailyTrends(daily)
        setWeeklyTrends(weekly)
      } catch (err) {
        console.error("Trend yüklenemedi:", err)
      } finally {
        setLoading(false)
      }
    }

    loadTrends()
  }, [])

  const currentList = mode === "daily" ? dailyTrends : weeklyTrends

  return (
      <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-80 flex-col gap-6 overflow-y-auto p-4 xl:flex">

        {/* --- GÜNDEM (TREND TOPICS) --- */}
        <Card className="overflow-hidden rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="pb-3 flex flex-col gap-2">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <TrendingUp className="h-5 w-5 text-primary" />
              Gündem
            </CardTitle>

            <div className="flex gap-2 text-sm">
              <button
                  onClick={() => setMode("daily")}
                  className={`px-3 py-1 rounded-full ${
                      mode === "daily" ? "bg-primary text-white" : "bg-muted"
                  }`}
              >
                Günlük
              </button>

              <button
                  onClick={() => setMode("weekly")}
                  className={`px-3 py-1 rounded-full ${
                      mode === "weekly" ? "bg-primary text-white" : "bg-muted"
                  }`}
              >
                Haftalık
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 p-4 pt-0">

            {loading ? (
                <p className="text-sm text-muted-foreground">Yükleniyor...</p>
            ) : currentList.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Henüz gündem oluşmadı.
                </p>
            ) : (
                currentList.map((tag, index) => (
                    <div
                        key={tag.id || index}
                        className="flex items-center justify-between rounded-lg p-2 hover:bg-accent transition"
                    >
                      <div className="flex flex-col">
                        <h4 className="font-semibold text-sm">#{tag.name}</h4>
                        {tag.description && (
                            <p className="text-xs text-muted-foreground">
                              {tag.description}
                            </p>
                        )}
                      </div>

                      <Badge variant="secondary" className="text-xs">
                        {index + 1}. Sırada
                      </Badge>
                    </div>
                ))
            )}
          </CardContent>
        </Card>
      </aside>
  )
}
