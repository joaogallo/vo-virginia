import { prisma } from "./prisma"
import { MEDAL_DEFINITIONS, type MedalLevel } from "./medals"
import type { Answer, GameSession, UserMedal } from "@prisma/client"

export interface NewMedal {
  medalId: string
  level: MedalLevel | null
  name: string
  description: string
  icon: string
}

type AwardFn = (medalId: string, level: MedalLevel | null) => void

export async function checkMedals(userId: string): Promise<NewMedal[]> {
  const [existingMedals, sessions, answers] = await Promise.all([
    prisma.userMedal.findMany({ where: { userId } }),
    prisma.gameSession.findMany({
      where: { userId, completed: true },
      orderBy: { startedAt: "asc" },
    }),
    prisma.answer.findMany({
      where: { session: { userId } },
      orderBy: { answeredAt: "asc" },
    }),
  ])

  const earnedSet = new Set(
    existingMedals.map((m) => `${m.medalId}:${m.level ?? "null"}`)
  )

  const newMedals: NewMedal[] = []

  const award: AwardFn = (medalId, level) => {
    const key = `${medalId}:${level ?? "null"}`
    if (earnedSet.has(key)) return
    const def = MEDAL_DEFINITIONS.find((m) => m.id === medalId)
    if (!def) return
    const threshold = level && def.thresholds
      ? def.thresholds.find((t) => t.level === level)
      : null
    newMedals.push({
      medalId,
      level,
      name: def.name,
      description: threshold?.description ?? def.description,
      icon: def.icon,
    })
    earnedSet.add(key)
  }

  checkAtiradorCerteiro(answers, award)
  checkSessaoPerfeita(sessions, award)
  checkMestrePrecisao(answers, award)
  checkMaratonista(answers, award)
  checkFrequentador(sessions, award)
  checkChamaAcesa(sessions, award)
  checkMestreOperacao(answers, award)
  checkGenioCompleto(existingMedals, newMedals, award)
  checkRaio(answers, award)
  checkSessaoVeloz(sessions, answers, award)
  checkPersistente(answers, award)
  checkPrimeiraVez(sessions, award)
  checkExplorador(sessions, award)
  checkTimeOfDay(sessions, award)

  return newMedals
}

function checkAtiradorCerteiro(answers: Answer[], award: AwardFn) {
  let maxStreak = 0
  let current = 0
  for (const a of answers) {
    if (a.isCorrect) {
      current++
      maxStreak = Math.max(maxStreak, current)
    } else {
      current = 0
    }
  }
  if (maxStreak >= 5) award("atirador-certeiro", "BRONZE")
  if (maxStreak >= 15) award("atirador-certeiro", "SILVER")
  if (maxStreak >= 30) award("atirador-certeiro", "GOLD")
}

function checkSessaoPerfeita(sessions: GameSession[], award: AwardFn) {
  const perfectCount = sessions.filter(
    (s) => s.wrongAnswers === 0 && s.correctAnswers > 0
  ).length
  if (perfectCount >= 1) award("sessao-perfeita", "BRONZE")
  if (perfectCount >= 5) award("sessao-perfeita", "SILVER")
  if (perfectCount >= 15) award("sessao-perfeita", "GOLD")
}

function checkMestrePrecisao(answers: Answer[], award: AwardFn) {
  if (answers.length < 50) return
  const correct = answers.filter((a) => a.isCorrect).length
  const accuracy = (correct / answers.length) * 100
  if (accuracy >= 70) award("mestre-precisao", "BRONZE")
  if (accuracy >= 85) award("mestre-precisao", "SILVER")
  if (accuracy >= 95) award("mestre-precisao", "GOLD")
}

function checkMaratonista(answers: Answer[], award: AwardFn) {
  const total = answers.length
  if (total >= 100) award("maratonista", "BRONZE")
  if (total >= 500) award("maratonista", "SILVER")
  if (total >= 2000) award("maratonista", "GOLD")
}

function checkFrequentador(sessions: GameSession[], award: AwardFn) {
  const count = sessions.length
  if (count >= 10) award("frequentador", "BRONZE")
  if (count >= 50) award("frequentador", "SILVER")
  if (count >= 150) award("frequentador", "GOLD")
}

function checkChamaAcesa(sessions: GameSession[], award: AwardFn) {
  const days = [
    ...new Set(sessions.map((s) => s.startedAt.toISOString().slice(0, 10))),
  ].sort()

  if (days.length === 0) return

  let maxStreak = 1
  let currentStreak = 1
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1])
    const curr = new Date(days[i])
    const diffMs = curr.getTime() - prev.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 1) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  if (maxStreak >= 3) award("chama-acesa", "BRONZE")
  if (maxStreak >= 7) award("chama-acesa", "SILVER")
  if (maxStreak >= 30) award("chama-acesa", "GOLD")
}

function checkMestreOperacao(answers: Answer[], award: AwardFn) {
  const ops = [
    { op: "ADDITION", medalId: "mestre-adicao" },
    { op: "SUBTRACTION", medalId: "mestre-subtracao" },
    { op: "MULTIPLICATION", medalId: "mestre-multiplicacao" },
    { op: "DIVISION", medalId: "mestre-divisao" },
  ] as const

  for (const { op, medalId } of ops) {
    const opAnswers = answers.filter((a) => a.operation === op)
    const correct = opAnswers.filter((a) => a.isCorrect).length
    const accuracy =
      opAnswers.length > 0 ? (correct / opAnswers.length) * 100 : 0

    if (correct >= 50) award(medalId, "BRONZE")
    if (correct >= 200) award(medalId, "SILVER")
    if (correct >= 500 && accuracy >= 90) award(medalId, "GOLD")
  }
}

function checkGenioCompleto(
  existingMedals: UserMedal[],
  newMedals: NewMedal[],
  award: AwardFn
) {
  const opMedalIds = [
    "mestre-adicao",
    "mestre-subtracao",
    "mestre-multiplicacao",
    "mestre-divisao",
  ]
  const levels: MedalLevel[] = ["BRONZE", "SILVER", "GOLD"]

  const allKeys = new Set([
    ...existingMedals.map((m) => `${m.medalId}:${m.level}`),
    ...newMedals.map((m) => `${m.medalId}:${m.level}`),
  ])

  for (const level of levels) {
    const hasAll = opMedalIds.every((id) => allKeys.has(`${id}:${level}`))
    if (hasAll) award("genio-completo", level)
  }
}

function checkRaio(answers: Answer[], award: AwardFn) {
  const fastCorrect = answers.filter(
    (a) => a.isCorrect && a.timeSpentMs < 3000
  ).length
  if (fastCorrect >= 10) award("raio", "BRONZE")
  if (fastCorrect >= 50) award("raio", "SILVER")
  if (fastCorrect >= 200) award("raio", "GOLD")
}

function checkSessaoVeloz(
  sessions: GameSession[],
  answers: Answer[],
  award: AwardFn
) {
  const answersBySession = new Map<string, Answer[]>()
  for (const a of answers) {
    const arr = answersBySession.get(a.sessionId) || []
    arr.push(a)
    answersBySession.set(a.sessionId, arr)
  }

  let fastSessions = 0
  for (const session of sessions) {
    const sessionAnswers = answersBySession.get(session.id)
    if (!sessionAnswers || sessionAnswers.length === 0) continue
    const avgTime =
      sessionAnswers.reduce((sum, a) => sum + a.timeSpentMs, 0) /
      sessionAnswers.length
    if (avgTime < 5000) fastSessions++
  }

  if (fastSessions >= 1) award("sessao-veloz", "BRONZE")
  if (fastSessions >= 5) award("sessao-veloz", "SILVER")
  if (fastSessions >= 15) award("sessao-veloz", "GOLD")
}

function checkPersistente(answers: Answer[], award: AwardFn) {
  const retryCorrect = answers.filter(
    (a) => a.isCorrect && a.attemptNumber > 1
  ).length
  if (retryCorrect >= 10) award("persistente", "BRONZE")
  if (retryCorrect >= 50) award("persistente", "SILVER")
  if (retryCorrect >= 150) award("persistente", "GOLD")
}

function checkPrimeiraVez(sessions: GameSession[], award: AwardFn) {
  if (sessions.length >= 1) award("primeira-vez", null)
}

function checkExplorador(sessions: GameSession[], award: AwardFn) {
  const allOps = new Set<string>()
  for (const s of sessions) {
    for (const op of s.operations) {
      allOps.add(op)
    }
  }
  if (allOps.size >= 4) award("explorador", null)
}

function checkTimeOfDay(sessions: GameSession[], award: AwardFn) {
  for (const s of sessions) {
    // Ajustar para horário de Brasília (UTC-3)
    const brHour = (s.startedAt.getUTCHours() - 3 + 24) % 24
    if (brHour < 8) {
      award("madrugador", null)
    }
    if (brHour >= 20) {
      award("corujao", null)
    }
  }
}
