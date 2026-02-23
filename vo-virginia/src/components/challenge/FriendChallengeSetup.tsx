"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { OPERATIONS, AVAILABLE_NUMBERS } from "@/constants/operations"
import type { Operation } from "@/types/game"

const OPERATION_MAP: Record<Operation, string> = {
  addition: "ADDITION",
  subtraction: "SUBTRACTION",
  multiplication: "MULTIPLICATION",
  division: "DIVISION",
}

interface Friend {
  id: string
  name: string
  friendshipId: string
  status: string
}

export default function FriendChallengeSetup() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [loadingFriends, setLoadingFriends] = useState(true)
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null)
  const [selectedOperations, setSelectedOperations] = useState<Operation[]>([])
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [totalQuestions, setTotalQuestions] = useState(10)
  const [creating, setCreating] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState("")

  const fetchFriends = useCallback(async () => {
    try {
      const res = await fetch("/api/amizades")
      const data = await res.json()
      setFriends((data.friends || []).filter((f: Friend) => f.status === "ACTIVE"))
    } catch {
      // silent
    } finally {
      setLoadingFriends(false)
    }
  }, [])

  useEffect(() => {
    fetchFriends()
  }, [fetchFriends])

  const toggleOperation = (op: Operation) => {
    setSelectedOperations((prev) =>
      prev.includes(op) ? prev.filter((o) => o !== op) : [...prev, op]
    )
  }

  const toggleNumber = (num: number) => {
    setSelectedNumbers((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    )
  }

  const canCreate =
    selectedFriendId &&
    selectedOperations.length > 0 &&
    selectedNumbers.length > 0 &&
    totalQuestions >= 5

  const handleCreate = async () => {
    if (!canCreate) return
    setCreating(true)
    setError("")
    setSuccessMessage("")

    try {
      const res = await fetch("/api/desafios-amigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          friendId: selectedFriendId,
          operations: selectedOperations.map((op) => OPERATION_MAP[op]),
          numbers: selectedNumbers,
          totalQuestions,
        }),
      })

      if (res.ok) {
        const friendName = friends.find((f) => f.id === selectedFriendId)?.name || "amigo"
        setSuccessMessage(`Desafio enviado! Aguardando resposta de ${friendName}`)
        setSelectedFriendId(null)
        setSelectedOperations([])
        setSelectedNumbers([])
        setTotalQuestions(10)
      } else {
        const data = await res.json()
        setError(data.error || "Erro ao criar desafio")
      }
    } catch {
      setError("Erro de conexão")
    } finally {
      setCreating(false)
    }
  }

  if (loadingFriends) {
    return <p className="text-gray-400 text-sm animate-pulse text-center">Carregando amigos...</p>
  }

  if (friends.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl p-4 text-center">
        <p className="text-gray-500 text-sm">
          Adicione amigos para poder desafiá-los!
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <h3 className="font-display text-base font-bold text-gray-700">
        Novo desafio
      </h3>

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 text-green-700 rounded-xl p-3 text-sm font-semibold text-center"
        >
          {successMessage}
        </motion.div>
      )}

      {error && (
        <p role="alert" className="text-red-500 text-sm text-center">{error}</p>
      )}

      {/* Select friend */}
      <div role="group" aria-label="Selecionar amigo">
        <h4 className="font-display text-sm font-bold text-gray-600 mb-2">Escolha um amigo</h4>
        <div className="flex flex-wrap gap-2">
          {friends.map((friend) => {
            const isSelected = selectedFriendId === friend.id
            return (
              <motion.button
                key={friend.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedFriendId(isSelected ? null : friend.id)}
                aria-pressed={isSelected}
                className={`
                  rounded-xl px-3 py-2 flex items-center gap-2
                  font-display text-sm font-bold transition-all duration-200
                  cursor-pointer select-none
                  ${isSelected
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:shadow-md"
                  }
                `}
              >
                <span className="text-lg">👧</span>
                {friend.name}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Operations */}
      {selectedFriendId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="group" aria-label="Selecionar operações">
          <h4 className="font-display text-sm font-bold text-gray-600 mb-2">Operações</h4>
          <div className="grid grid-cols-2 gap-2">
            {OPERATIONS.map((op) => {
              const isSelected = selectedOperations.includes(op.value)
              return (
                <motion.button
                  key={op.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleOperation(op.value)}
                  aria-pressed={isSelected}
                  className={`
                    rounded-2xl border-3 p-3 flex flex-col items-center gap-0.5
                    font-display text-lg font-bold transition-all duration-200
                    cursor-pointer select-none
                    ${isSelected
                      ? `${op.color} text-white border-transparent shadow-lg scale-105`
                      : `bg-white ${op.borderColor} text-gray-700 border-2 shadow-sm hover:shadow-md`
                    }
                  `}
                >
                  <span className="text-2xl">{op.symbol}</span>
                  <span className="text-xs">{op.label}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Numbers */}
      {selectedFriendId && selectedOperations.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="group" aria-label="Selecionar números">
          <h4 className="font-display text-sm font-bold text-gray-600 mb-2">Números</h4>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {AVAILABLE_NUMBERS.map((num) => {
              const isSelected = selectedNumbers.includes(num)
              return (
                <motion.button
                  key={num}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleNumber(num)}
                  aria-pressed={isSelected}
                  aria-label={`Número ${num}`}
                  className={`
                    rounded-xl w-12 h-12 flex items-center justify-center
                    font-display text-lg font-bold transition-all duration-200
                    cursor-pointer select-none
                    ${isSelected
                      ? "bg-yellow-400 text-white shadow-lg border-2 border-yellow-500"
                      : "bg-white text-gray-700 border-2 border-gray-200 shadow-sm hover:shadow-md"
                    }
                  `}
                >
                  {num}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Total questions slider */}
      {selectedFriendId && selectedOperations.length > 0 && selectedNumbers.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h4 className="font-display text-sm font-bold text-gray-600 mb-2">Questões</h4>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={5}
              max={50}
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(parseInt(e.target.value, 10))}
              aria-label="Quantidade de questões"
              aria-valuetext={`${totalQuestions} questões`}
              className="flex-1 accent-blue-500"
            />
            <span className="font-display text-xl font-bold text-gray-700 min-w-[3ch] text-right">
              {totalQuestions}
            </span>
          </div>
        </motion.div>
      )}

      {/* Create button */}
      <motion.button
        whileTap={canCreate ? { scale: 0.95 } : {}}
        whileHover={canCreate ? { scale: 1.05 } : {}}
        onClick={canCreate ? handleCreate : undefined}
        disabled={!canCreate || creating}
        className={`
          w-full max-w-xs mx-auto rounded-2xl py-3 px-8
          font-display text-xl font-bold
          transition-all duration-200 shadow-lg
          ${canCreate && !creating
            ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:shadow-xl cursor-pointer"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        {creating ? "Enviando..." : "Desafiar!"}
      </motion.button>
    </div>
  )
}
