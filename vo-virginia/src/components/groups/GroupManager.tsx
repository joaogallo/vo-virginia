"use client"

import { useCallback, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Child {
  id: string
  name: string
}

interface GroupMember {
  child: { id: string; name: string; image: string | null }
}

interface Group {
  id: string
  name: string
  members: GroupMember[]
  _count: { members: number }
}

interface GroupManagerProps {
  children: Child[]
}

export default function GroupManager({ children }: GroupManagerProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null)
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [saving, setSaving] = useState(false)
  const [addingMembersGroupId, setAddingMembersGroupId] = useState<string | null>(null)
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([])
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  const fetchGroups = useCallback(() => {
    fetch("/api/grupos")
      .then((r) => r.json())
      .then((d) => setGroups(d.groups || []))
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return
    setSaving(true)
    await fetch("/api/grupos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGroupName.trim() }),
    })
    setSaving(false)
    setNewGroupName("")
    setCreatingGroup(false)
    fetchGroups()
  }

  const handleDeleteGroup = async (groupId: string) => {
    await fetch(`/api/grupos/${groupId}`, { method: "DELETE" })
    setExpandedGroupId(null)
    fetchGroups()
  }

  const handleRenameGroup = async (groupId: string) => {
    if (!editName.trim()) return
    await fetch(`/api/grupos/${groupId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    })
    setEditingGroupId(null)
    fetchGroups()
  }

  const handleAddMembers = async (groupId: string) => {
    if (selectedChildIds.length === 0) return
    setSaving(true)
    await fetch(`/api/grupos/${groupId}/membros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childIds: selectedChildIds }),
    })
    setSaving(false)
    setAddingMembersGroupId(null)
    setSelectedChildIds([])
    fetchGroups()
  }

  const handleRemoveMember = async (groupId: string, childId: string) => {
    await fetch(`/api/grupos/${groupId}/membros`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId }),
    })
    fetchGroups()
  }

  const toggleChildSelection = (childId: string) => {
    setSelectedChildIds((prev) =>
      prev.includes(childId) ? prev.filter((id) => id !== childId) : [...prev, childId]
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-gray-800">Grupos</h2>
        {!creatingGroup && (
          <button
            onClick={() => setCreatingGroup(true)}
            className="text-sm font-semibold text-green-600 hover:underline cursor-pointer"
          >
            + Criar grupo
          </button>
        )}
      </div>

      {/* Form para criar grupo */}
      <AnimatePresence>
        {creatingGroup && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nome do grupo"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-colors text-sm"
                  autoFocus
                />
                <button
                  onClick={handleCreateGroup}
                  disabled={saving || !newGroupName.trim()}
                  className="px-4 py-2.5 bg-green-500 text-white font-bold rounded-xl text-sm disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "..." : "Criar"}
                </button>
                <button
                  onClick={() => { setCreatingGroup(false); setNewGroupName("") }}
                  className="px-3 py-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {groups.length === 0 && !creatingGroup && (
        <p className="text-gray-400 text-sm">
          Nenhum grupo criado. Crie grupos para organizar suas crianças.
        </p>
      )}

      {/* Lista de grupos */}
      <div className="flex flex-col gap-3">
        {groups.map((group) => {
          const isExpanded = expandedGroupId === group.id
          const memberIds = new Set(group.members.map((m) => m.child.id))
          const availableChildren = children.filter((c) => !memberIds.has(c.id))
          const isAddingMembers = addingMembersGroupId === group.id
          const isEditing = editingGroupId === group.id

          return (
            <div key={group.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header do grupo */}
              <button
                onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-lg">
                    📁
                  </div>
                  <div>
                    {isEditing ? (
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleRenameGroup(group.id)}
                          className="px-2 py-1 rounded border-2 border-green-400 text-sm font-bold focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleRenameGroup(group.id)}
                          className="text-green-600 text-sm font-bold cursor-pointer"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => setEditingGroupId(null)}
                          className="text-gray-400 text-sm cursor-pointer"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <h3 className="font-display text-lg font-bold text-gray-800">{group.name}</h3>
                    )}
                    <p className="text-xs text-gray-500">
                      {group._count.members} {group._count.members === 1 ? "criança" : "crianças"}
                    </p>
                  </div>
                </div>
                <span
                  className="text-gray-400 text-lg transition-transform duration-200"
                  style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                >
                  &rsaquo;
                </span>
              </button>

              {/* Conteúdo expandido */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                      {/* Membros */}
                      {group.members.length > 0 ? (
                        <div className="flex flex-col gap-2 mb-3">
                          {group.members.map((m) => (
                            <div key={m.child.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">👧</span>
                                <span className="text-sm font-semibold text-gray-700">{m.child.name}</span>
                              </div>
                              <button
                                onClick={() => handleRemoveMember(group.id, m.child.id)}
                                className="text-gray-400 hover:text-red-500 text-sm cursor-pointer"
                                title="Remover do grupo"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm mb-3">Nenhuma criança neste grupo.</p>
                      )}

                      {/* Adicionar membros */}
                      {isAddingMembers ? (
                        <div className="border-t border-gray-100 pt-3">
                          {availableChildren.length === 0 ? (
                            <p className="text-gray-400 text-sm mb-3">
                              Todas as crianças já estão neste grupo.
                            </p>
                          ) : (
                            <div className="flex flex-col gap-2 mb-3">
                              {availableChildren.map((c) => (
                                <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedChildIds.includes(c.id)}
                                    onChange={() => toggleChildSelection(c.id)}
                                    className="accent-green-500"
                                  />
                                  <span className="text-sm text-gray-700">{c.name}</span>
                                </label>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2">
                            {availableChildren.length > 0 && (
                              <button
                                onClick={() => handleAddMembers(group.id)}
                                disabled={saving || selectedChildIds.length === 0}
                                className="px-4 py-2 bg-green-500 text-white font-bold rounded-xl text-sm disabled:opacity-50 cursor-pointer"
                              >
                                {saving ? "..." : "Confirmar"}
                              </button>
                            )}
                            <button
                              onClick={() => { setAddingMembersGroupId(null); setSelectedChildIds([]) }}
                              className="px-4 py-2 text-gray-500 text-sm cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3 border-t border-gray-100 pt-3">
                          <button
                            onClick={() => { setAddingMembersGroupId(group.id); setSelectedChildIds([]) }}
                            className="text-sm text-green-600 font-semibold hover:underline cursor-pointer"
                          >
                            + Adicionar crianças
                          </button>
                          <button
                            onClick={() => { setEditingGroupId(group.id); setEditName(group.name) }}
                            className="text-sm text-gray-500 hover:underline cursor-pointer"
                          >
                            Renomear
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Excluir grupo "${group.name}"?`)) {
                                handleDeleteGroup(group.id)
                              }
                            }}
                            className="text-sm text-red-500 hover:underline cursor-pointer"
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
