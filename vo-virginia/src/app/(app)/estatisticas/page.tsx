"use client"

import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import StatsDisplay, { type Stats } from "@/components/stats/StatsDisplay"

interface Child {
  id: string
  name: string
  email: string
  lastSessionAt: string | null
  totalSessions: number
}

interface GroupWithMembers {
  id: string
  name: string
  members: { child: { id: string } }[]
}

export default function EstatisticasPage() {
  const { data: session } = useSession()
  const [ownStats, setOwnStats] = useState<Stats | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [groups, setGroups] = useState<GroupWithMembers[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedGroup, setSelectedGroup] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null)
  const [childStatsCache, setChildStatsCache] = useState<Record<string, Stats>>({})
  const [loadingChildId, setLoadingChildId] = useState<string | null>(null)

  const isAdult = session?.user?.role === "PARENT" || session?.user?.role === "TEACHER"

  useEffect(() => {
    const fetches: Promise<unknown>[] = [
      fetch("/api/estatisticas").then((r) => r.json()).then(setOwnStats),
    ]

    if (isAdult) {
      fetches.push(
        fetch("/api/filhos").then((r) => r.json()).then((d) => setChildren(d.children || [])),
        fetch("/api/grupos").then((r) => r.json()).then((d) => setGroups(d.groups || [])),
      )
    }

    Promise.all(fetches).then(() => setLoading(false))
  }, [isAdult])

  const fetchChildStats = useCallback(async (childId: string) => {
    if (childStatsCache[childId]) return
    setLoadingChildId(childId)
    const res = await fetch(`/api/estatisticas/${childId}`)
    const data = await res.json()
    setChildStatsCache((prev) => ({ ...prev, [childId]: data }))
    setLoadingChildId(null)
  }, [childStatsCache])

  const handleToggleChild = (childId: string) => {
    if (expandedChildId === childId) {
      setExpandedChildId(null)
    } else {
      setExpandedChildId(childId)
      fetchChildStats(childId)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  const filteredChildren = children.filter((child) => {
    const matchesSearch = child.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGroup =
      selectedGroup === "all" ||
      groups.find((g) => g.id === selectedGroup)?.members.some((m) => m.child.id === child.id)
    return matchesSearch && matchesGroup
  })

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        {/* Estatísticas próprias */}
        <h1 className="font-display text-3xl font-bold text-gray-800 text-center mb-6">
          {isAdult ? "Estatísticas" : "Minhas Estatísticas"}
        </h1>

        {ownStats && !isAdult && <StatsDisplay stats={ownStats} />}

        {/* Seção de crianças para adultos */}
        {isAdult && (
          <>
            {children.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
                <div className="text-5xl mb-4">📊</div>
                <p className="text-gray-500 text-lg">
                  Nenhuma criança vinculada.
                  <br />
                  Vincule crianças pelo Painel para ver estatísticas.
                </p>
              </div>
            ) : (
              <>
                {/* Filtros */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <input
                    type="text"
                    placeholder="Buscar por nome..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-colors text-sm"
                  />
                  {groups.length > 0 && (
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-colors text-sm bg-white"
                    >
                      <option value="all">Todos</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Lista de crianças */}
                <div className="flex flex-col gap-3">
                  {filteredChildren.map((child, i) => {
                    const isExpanded = expandedChildId === child.id
                    const cachedStats = childStatsCache[child.id]
                    const isLoadingThis = loadingChildId === child.id

                    return (
                      <motion.div
                        key={child.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <button
                          onClick={() => handleToggleChild(child.id)}
                          className="w-full bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl shrink-0">
                              👧
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-display text-lg font-bold text-gray-800 truncate">
                                {child.name}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {child.totalSessions} sessões
                                {child.lastSessionAt && (
                                  <> &middot; Última: {new Date(child.lastSessionAt).toLocaleDateString("pt-BR")}</>
                                )}
                              </p>
                            </div>
                            <span className="text-gray-400 text-lg transition-transform duration-200" style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>
                              &rsaquo;
                            </span>
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-3 px-2">
                                {isLoadingThis ? (
                                  <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin w-6 h-6 border-3 border-green-400 border-t-transparent rounded-full" />
                                  </div>
                                ) : cachedStats ? (
                                  <StatsDisplay stats={cachedStats} compact />
                                ) : null}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}

                  {filteredChildren.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">
                      Nenhuma criança encontrada.
                    </p>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}
