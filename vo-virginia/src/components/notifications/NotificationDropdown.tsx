"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useNotificationStore, type NotificationItem } from "@/stores/notification-store"
import { useNotificationList } from "@/hooks/useNotifications"

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "agora"
  if (mins < 60) return `${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

function NotificationCard({ item }: { item: NotificationItem }) {
  const { optimisticRemove, decrementUnread } = useNotificationStore()
  const { fetchNotifications } = useNotificationList()
  const [resolving, setResolving] = useState<string | null>(null)
  const data = item.data as Record<string, string>

  const handleResolve = async (action: "APPROVED" | "REJECTED") => {
    setResolving(action)
    try {
      const res = await fetch(`/api/notificacoes/${item.id}/resolver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        optimisticRemove(item.id)
        decrementUnread()
        // Refresh to get updated list
        fetchNotifications()
      }
    } catch {
      // silent
    } finally {
      setResolving(null)
    }
  }

  if (item.type === "PROFILE_CHANGE_REQUEST") {
    return (
      <div className="p-3 border-b border-gray-100 last:border-b-0">
        <p className="text-sm text-gray-700">
          <span className="font-bold">{data.childCurrentName || item.sender.name}</span>
          {" "}quer mudar o nome para{" "}
          <span className="font-bold text-blue-600">{data.requestedName}</span>
        </p>
        <span className="text-xs text-gray-400">{formatTime(item.createdAt)}</span>
        {item.status === "PENDING" && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleResolve("APPROVED")}
              disabled={resolving !== null}
              className="flex-1 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 disabled:opacity-50 cursor-pointer"
            >
              {resolving === "APPROVED" ? "..." : "Aprovar"}
            </button>
            <button
              onClick={() => handleResolve("REJECTED")}
              disabled={resolving !== null}
              className="flex-1 px-3 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-lg hover:bg-red-200 disabled:opacity-50 cursor-pointer"
            >
              {resolving === "REJECTED" ? "..." : "Recusar"}
            </button>
          </div>
        )}
        {item.status !== "PENDING" && (
          <span className={`text-xs font-semibold mt-1 inline-block ${
            item.status === "APPROVED" ? "text-green-600" : "text-red-500"
          }`}>
            {item.status === "APPROVED" ? "Aprovado" : "Recusado"}
          </span>
        )}
      </div>
    )
  }

  if (item.type === "NAME_CHANGE_APPROVED") {
    return (
      <div className="p-3 border-b border-gray-100 last:border-b-0">
        <p className="text-sm text-gray-700">
          Seu nome foi alterado para{" "}
          <span className="font-bold text-green-600">{data.newName}</span>
        </p>
        <span className="text-xs text-gray-400">{formatTime(item.createdAt)}</span>
      </div>
    )
  }

  if (item.type === "NAME_CHANGE_REJECTED") {
    return (
      <div className="p-3 border-b border-gray-100 last:border-b-0">
        <p className="text-sm text-gray-700">
          A alteração de nome para{" "}
          <span className="font-bold">{data.requestedName}</span> não foi aprovada
        </p>
        <span className="text-xs text-gray-400">{formatTime(item.createdAt)}</span>
      </div>
    )
  }

  if (item.type === "FRIENDSHIP_CREATED") {
    return (
      <div className="p-3 border-b border-gray-100 last:border-b-0">
        <p className="text-sm text-gray-700">
          <span className="font-bold">{data.friendName || item.sender.name}</span>
          {" "}agora é seu amigo!
        </p>
        <span className="text-xs text-gray-400">{formatTime(item.createdAt)}</span>
      </div>
    )
  }

  if (item.type === "SESSION_COMPLETED") {
    return (
      <div className="p-3 border-b border-gray-100 last:border-b-0">
        <p className="text-sm text-gray-700">
          <span className="font-bold">{data.childName || item.sender.name}</span>
          {" "}completou uma sessão!{" "}
          <span className="font-semibold">{data.correctAnswers}/{data.totalQuestions}</span>
          {" "}({data.accuracy}%)
        </p>
        <span className="text-xs text-gray-400">{formatTime(item.createdAt)}</span>
      </div>
    )
  }

  if (item.type === "FRIEND_MEDAL_EARNED") {
    return (
      <div className="p-3 border-b border-gray-100 last:border-b-0">
        <p className="text-sm text-gray-700">
          <span className="font-bold">{data.friendName || item.sender.name}</span>
          {" "}conquistou a medalha{" "}
          <span className="font-bold text-yellow-600">{data.medalName}</span>
          {data.medalLevel ? ` (${data.medalLevel})` : ""}!
        </p>
        <span className="text-xs text-gray-400">{formatTime(item.createdAt)}</span>
      </div>
    )
  }

  if (item.type === "FRIEND_CHALLENGE_INVITE") {
    return <ChallengeInviteCard item={item} data={data} />
  }

  if (item.type === "FRIEND_CHALLENGE_RESULT") {
    return (
      <div className="p-3 border-b border-gray-100 last:border-b-0">
        <p className="text-sm text-gray-700">
          Desafio com <span className="font-bold">{data.challengerName || data.challengedName || item.sender.name}</span>:{" "}
          <span className="font-semibold">{data.yourScore}</span> vs{" "}
          <span className="font-semibold">{data.opponentScore}</span>
        </p>
        <span className="text-xs text-gray-400">{formatTime(item.createdAt)}</span>
      </div>
    )
  }

  return null
}

function ChallengeInviteCard({ item, data }: { item: NotificationItem; data: Record<string, string> }) {
  const { optimisticRemove, decrementUnread, closeDropdown } = useNotificationStore()
  const { fetchNotifications } = useNotificationList()
  const router = useRouter()
  const [responding, setResponding] = useState<string | null>(null)

  const handleRespond = async (action: "ACCEPT" | "DECLINE") => {
    setResponding(action)
    try {
      const res = await fetch(`/api/desafios-amigo/${data.challengeId}/responder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        optimisticRemove(item.id)
        decrementUnread()
        fetchNotifications()
        if (action === "ACCEPT") {
          closeDropdown()
          router.push(`/amigos/desafio/${data.challengeId}`)
        }
      }
    } catch {
      // silent
    } finally {
      setResponding(null)
    }
  }

  return (
    <div className="p-3 border-b border-gray-100 last:border-b-0">
      <p className="text-sm text-gray-700">
        <span className="font-bold">{data.challengerName || item.sender.name}</span>
        {" "}te desafiou!
      </p>
      <span className="text-xs text-gray-400">{formatTime(item.createdAt)}</span>
      {item.status === "PENDING" && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => handleRespond("ACCEPT")}
            disabled={responding !== null}
            className="flex-1 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 disabled:opacity-50 cursor-pointer"
          >
            {responding === "ACCEPT" ? "..." : "Aceitar"}
          </button>
          <button
            onClick={() => handleRespond("DECLINE")}
            disabled={responding !== null}
            className="flex-1 px-3 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-lg hover:bg-red-200 disabled:opacity-50 cursor-pointer"
          >
            {responding === "DECLINE" ? "..." : "Recusar"}
          </button>
        </div>
      )}
    </div>
  )
}

export default function NotificationDropdown() {
  const { isDropdownOpen, notifications, closeDropdown } = useNotificationStore()
  const ref = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!isDropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeDropdown()
      }
    }
    // Delay to avoid closing immediately from the bell click
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClick)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("click", handleClick)
    }
  }, [isDropdownOpen, closeDropdown])

  return (
    <AnimatePresence>
      {isDropdownOpen && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-display font-bold text-gray-800 text-sm">Notificações</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((item) => (
                <NotificationCard key={item.id} item={item} />
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
