"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import StatsDisplay, { type Stats } from "@/components/stats/StatsDisplay"

export default function ChildDetailPage() {
  const params = useParams()
  const childId = params.childId as string
  const [stats, setStats] = useState<Stats | null>(null)
  const [childName, setChildName] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/estatisticas/${childId}`).then((r) => r.json()),
      fetch("/api/filhos").then((r) => r.json()),
    ]).then(([statsData, filhosData]) => {
      setStats(statsData)
      const child = filhosData.children?.find((c: { id: string }) => c.id === childId)
      if (child) setChildName(child.name)
      setLoading(false)
    })
  }, [childId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="flex items-center gap-3 mb-6">
          <Link href="/painel" className="text-2xl text-gray-400 hover:text-gray-600">
            &larr;
          </Link>
          <h1 className="font-display text-3xl font-bold text-gray-800">
            {childName || "Estatísticas"}
          </h1>
        </div>

        <StatsDisplay stats={stats} />
      </motion.div>
    </div>
  )
}
