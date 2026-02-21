"use client"

import { motion, AnimatePresence } from "framer-motion"
import { LEVEL_LABELS, LEVEL_COLORS } from "@/lib/medals"
import type { NewMedal } from "@/lib/medal-checker"

interface MedalNotificationProps {
  medals: NewMedal[]
}

export default function MedalNotification({ medals }: MedalNotificationProps) {
  if (medals.length === 0) return null

  return (
    <div className="w-full mt-6">
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="font-display text-xl font-bold text-gray-700 text-center mb-4"
      >
        {medals.length > 1 ? "Novas Medalhas!" : "Nova Medalha!"}
      </motion.h2>
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {medals.map((medal, i) => (
            <motion.div
              key={`${medal.medalId}-${medal.level}`}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 1.4 + i * 0.2,
              }}
              className="bg-white rounded-2xl p-4 shadow-lg flex items-center gap-4"
            >
              <span className="text-4xl">{medal.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg font-bold text-gray-800">
                  {medal.name}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {medal.description}
                </p>
              </div>
              {medal.level && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${LEVEL_COLORS[medal.level]} shrink-0`}
                >
                  {LEVEL_LABELS[medal.level]}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
