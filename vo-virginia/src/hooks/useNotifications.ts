"use client"

import { useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import { useNotificationStore } from "@/stores/notification-store"

export function useNotificationPolling(intervalMs = 60_000) {
  const { data: session } = useSession()
  const { setUnreadCount } = useNotificationStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedRef = useRef(false)

  const fetchCount = useCallback(async () => {
    if (!session?.user) return
    try {
      const res = await fetch("/api/notificacoes?unreadCount=true")
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.unreadCount)
      }
    } catch {
      // silent
    }
  }, [session?.user, setUnreadCount])

  const start = useCallback(() => {
    if (startedRef.current) return
    startedRef.current = true
    fetchCount()
    intervalRef.current = setInterval(fetchCount, intervalMs)
  }, [fetchCount, intervalMs])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    startedRef.current = false
  }, [])

  return { start, stop, refetch: fetchCount }
}

export function useNotificationList() {
  const { setNotifications } = useNotificationStore()

  const fetchNotifications = useCallback(async () => {
    const res = await fetch("/api/notificacoes")
    if (res.ok) {
      const data = await res.json()
      setNotifications(data.notifications)
    }
  }, [setNotifications])

  return { fetchNotifications }
}
