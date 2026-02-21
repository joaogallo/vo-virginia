"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type FeedbackType = "sugestao" | "bug" | "elogio" | "outro"

const feedbackTypes: { value: FeedbackType; label: string }[] = [
  { value: "sugestao", label: "Sugestão" },
  { value: "bug", label: "Bug" },
  { value: "elogio", label: "Elogio" },
  { value: "outro", label: "Outro" },
]

export default function FeedbackPage() {
  const [type, setType] = useState<FeedbackType>("sugestao")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (message.trim().length < 10) {
      setError("A mensagem deve ter pelo menos 10 caracteres.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message: message.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Erro ao enviar feedback.")
        return
      }

      setSuccess(true)
      setMessage("")
      setType("sugestao")
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">
          Feedback
        </h1>
        <p className="text-gray-500 mb-6">
          Nos ajude a melhorar! Envie sua sugestão, reporte um bug ou deixe um elogio.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tipo de feedback */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de feedback
            </label>
            <div className="flex flex-wrap gap-2">
              {feedbackTypes.map((ft) => (
                <button
                  key={ft.value}
                  type="button"
                  onClick={() => setType(ft.value)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                    type === ft.value
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {ft.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mensagem */}
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
              Mensagem
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Conte-nos o que você pensa..."
              rows={5}
              maxLength={2000}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-lg focus:border-green-400 focus:outline-none transition-colors resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {message.length}/2000
            </p>
          </div>

          {/* Erro */}
          {error && (
            <p className="text-red-500 text-sm font-semibold">{error}</p>
          )}

          {/* Sucesso */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-semibold"
              >
                Feedback enviado com sucesso! Obrigado pela sua contribuição.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botão */}
          <button
            type="submit"
            disabled={loading || message.trim().length < 10}
            className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-display text-xl font-bold rounded-xl py-3 shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Enviando..." : "Enviar Feedback"}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
