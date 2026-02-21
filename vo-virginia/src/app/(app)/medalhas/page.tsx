"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MEDAL_DEFINITIONS,
  MEDAL_CATEGORIES,
  LEVEL_LABELS,
  LEVEL_COLORS,
  type MedalDefinition,
  type MedalLevel,
} from "@/lib/medals"

interface EarnedMedal {
  medalId: string
  level: MedalLevel | null
  unlockedAt: string
}

function LevelBadge({ level }: { level: MedalLevel }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r ${LEVEL_COLORS[level]}`}
    >
      {LEVEL_LABELS[level]}
    </span>
  )
}

function MedalDetailSheet({
  medal,
  earnedLevels,
  onClose,
}: {
  medal: MedalDefinition
  earnedLevels: Set<string>
  onClose: () => void
}) {
  const isEarned = medal.hasLevels
    ? earnedLevels.size > 0
    : earnedLevels.has("SINGLE")

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose]
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="medal-detail-title"
        aria-modal="true"
        className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
      >
        <div className="flex flex-col items-center gap-3 mb-4">
          <span className={`text-5xl ${!isEarned ? "grayscale opacity-40" : ""}`}>
            {medal.icon}
          </span>
          <h2 id="medal-detail-title" className="font-display text-2xl font-bold text-gray-800">
            {medal.name}
          </h2>
          <p className="text-gray-500 text-center">{medal.description}</p>
        </div>

        {medal.hasLevels && medal.thresholds && (
          <div className="flex flex-col gap-2">
            {medal.thresholds.map((t) => {
              const isUnlocked = earnedLevels.has(t.level)
              return (
                <div
                  key={t.level}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    isUnlocked ? "bg-green-50" : "bg-gray-50"
                  }`}
                >
                  <span className="text-lg">
                    {isUnlocked ? "✅" : "🔒"}
                  </span>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-700">
                      {LEVEL_LABELS[t.level]}
                    </span>
                    <p className="text-xs text-gray-500">{t.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!medal.hasLevels && (
          <div
            className={`flex items-center gap-3 p-3 rounded-xl ${
              isEarned ? "bg-green-50" : "bg-gray-50"
            }`}
          >
            <span className="text-lg">{isEarned ? "✅" : "🔒"}</span>
            <div className="flex-1">
              <span className="font-semibold text-gray-700">
                {isEarned ? "Conquistada!" : "Não conquistada"}
              </span>
              <p className="text-xs text-gray-500">{medal.description}</p>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          aria-label="Fechar"
          className="w-full mt-4 py-3 bg-gray-100 rounded-2xl font-display font-bold text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors"
        >
          Fechar
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function MedalhasPage() {
  const [earned, setEarned] = useState<EarnedMedal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMedal, setSelectedMedal] = useState<MedalDefinition | null>(
    null
  )

  useEffect(() => {
    fetch("/api/medalhas")
      .then((r) => r.json())
      .then((data) => setEarned(data.medals || []))
      .finally(() => setLoading(false))
  }, [])

  const earnedMap = new Map<string, Set<string>>()
  for (const m of earned) {
    const set = earnedMap.get(m.medalId) || new Set()
    set.add(m.level ?? "SINGLE")
    earnedMap.set(m.medalId, set)
  }

  const getHighestLevel = (
    medal: MedalDefinition
  ): MedalLevel | "SINGLE" | null => {
    const set = earnedMap.get(medal.id)
    if (!set) return null
    if (!medal.hasLevels) return "SINGLE"
    if (set.has("GOLD")) return "GOLD"
    if (set.has("SILVER")) return "SILVER"
    if (set.has("BRONZE")) return "BRONZE"
    return null
  }

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  const totalEarned = new Set(earned.map((m) => m.medalId)).size
  const totalMedals = MEDAL_DEFINITIONS.length

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold text-gray-800 text-center mb-1">
          Medalhas
        </h1>
        <p className="text-center text-gray-500 mb-6">
          {totalEarned} de {totalMedals} medalhas conquistadas
        </p>
      </motion.div>

      {MEDAL_CATEGORIES.map((cat) => {
        const catMedals = MEDAL_DEFINITIONS.filter(
          (m) => m.category === cat.id
        )
        if (catMedals.length === 0) return null

        return (
          <div key={cat.id} className="mb-8">
            <h2 className="font-display text-lg font-bold text-gray-700 mb-3">
              {cat.label}
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {catMedals.map((medal, i) => {
                const highest = getHighestLevel(medal)
                const isEarned = highest !== null

                return (
                  <motion.button
                    key={medal.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedMedal(medal)}
                    className={`bg-white rounded-2xl p-3 shadow-lg flex flex-col items-center gap-1 cursor-pointer transition-all hover:shadow-xl ${
                      !isEarned ? "opacity-20 grayscale" : ""
                    }`}
                  >
                    <span className="text-3xl">{medal.icon}</span>
                    <span className="text-xs font-semibold text-gray-700 text-center leading-tight">
                      {medal.name}
                    </span>
                    {isEarned && highest !== "SINGLE" && (
                      <LevelBadge level={highest as MedalLevel} />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        )
      })}

      <AnimatePresence>
        {selectedMedal && (
          <MedalDetailSheet
            medal={selectedMedal}
            earnedLevels={earnedMap.get(selectedMedal.id) || new Set()}
            onClose={() => setSelectedMedal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
