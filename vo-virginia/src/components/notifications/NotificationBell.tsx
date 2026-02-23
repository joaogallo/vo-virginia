"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useNotificationStore } from "@/stores/notification-store"
import { useNotificationList } from "@/hooks/useNotifications"

export default function NotificationBell() {
  const { unreadCount, toggleDropdown } = useNotificationStore()
  const { fetchNotifications } = useNotificationList()

  const handleClick = () => {
    fetchNotifications()
    toggleDropdown()
  }

  return (
    <button
      onClick={handleClick}
      className="relative p-2 text-gray-600 hover:text-gray-800 cursor-pointer"
      aria-label={
        unreadCount > 0
          ? `${unreadCount} notificações não lidas`
          : "Notificações"
      }
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>

      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
