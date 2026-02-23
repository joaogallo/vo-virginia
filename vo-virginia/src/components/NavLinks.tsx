"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { AnimatePresence, motion } from "framer-motion"
import NotificationBell from "@/components/notifications/NotificationBell"
import NotificationDropdown from "@/components/notifications/NotificationDropdown"
import { useNotificationPolling } from "@/hooks/useNotifications"
import { useNotificationStore } from "@/stores/notification-store"

export default function NavLinks() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { closeDropdown } = useNotificationStore()
  const { start, stop } = useNotificationPolling()
  const startedRef = useRef(false)

  const isAdult = session?.user?.role === "PARENT" || session?.user?.role === "TEACHER"
  const isAdmin = session?.user?.role === "ADMIN"

  // Start polling when authenticated
  useEffect(() => {
    if (session?.user && !startedRef.current) {
      startedRef.current = true
      start()
    }
    return () => {
      stop()
      startedRef.current = false
    }
  }, [session?.user, start, stop])

  const links: { href: string; label: string; accent?: boolean }[] = [
    { href: "/desafios", label: "Desafios" },
    { href: "/medalhas", label: "Medalhas" },
    { href: "/estatisticas", label: "Estatísticas" },
    ...(isAdult ? [{ href: "/painel", label: "Painel" }] : []),
    { href: "/feedback", label: "Feedback" },
    { href: "/perfil", label: "Perfil" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", accent: true }] : []),
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  const handleLinkClick = () => {
    setIsOpen(false)
    closeDropdown()
  }

  return (
    <>
      {/* Desktop */}
      <nav aria-label="Menu principal" className="hidden md:flex items-center gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-semibold ${
              link.accent
                ? "text-red-500 hover:text-red-700"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {link.label}
          </Link>
        ))}
        {session?.user && (
          <div className="relative">
            <NotificationBell />
            <NotificationDropdown />
          </div>
        )}
      </nav>

      {/* Mobile: bell + hamburger */}
      <div className="flex items-center gap-1 md:hidden">
        {session?.user && (
          <div className="relative">
            <NotificationBell />
            <NotificationDropdown />
          </div>
        )}
        <button
          className="p-2 -mr-2 text-gray-600 hover:text-gray-800 cursor-pointer"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {isOpen ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full bg-white border-b border-gray-200 shadow-lg md:hidden z-50"
            aria-label="Menu principal"
          >
            <div className="flex flex-col py-2 px-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className={`py-3 font-semibold border-b border-gray-100 last:border-b-0 ${
                    isActive(link.href)
                      ? "text-red-500"
                      : link.accent
                        ? "text-red-500"
                        : "text-gray-600 active:text-gray-800"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
