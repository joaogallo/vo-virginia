import { describe, it, expect, beforeEach } from "vitest"
import {
  generateQuestions,
  createGameState,
  nextQuestion,
  submitAnswer,
} from "@/lib/game-engine"
import type { GameState } from "@/types/game"

describe("generateQuestions", () => {
  it("gera quantidade correta para adição com 1 número", () => {
    const questions = generateQuestions(["addition"], [3])
    // 1 operação × 1 número × 11 (0..10) = 11
    expect(questions).toHaveLength(11)
  })

  it("gera quantidade correta para múltiplas operações e números", () => {
    const questions = generateQuestions(["addition", "multiplication"], [2, 5])
    // 2 operações × 2 números × 11 = 44
    expect(questions).toHaveLength(44)
  })

  it("pula divisão por zero (x=0)", () => {
    const questions = generateQuestions(["division"], [0])
    expect(questions).toHaveLength(0)
  })

  it("divisão com x≠0 gera 11 questões", () => {
    const questions = generateQuestions(["division"], [5])
    expect(questions).toHaveLength(11)
  })

  it("mistura com divisão desconta x=0", () => {
    const questions = generateQuestions(["division"], [0, 3])
    // x=0: 0 questões, x=3: 11 questões = 11
    expect(questions).toHaveLength(11)
  })

  it("adição: correctAnswer = displayFirst + displaySecond", () => {
    const questions = generateQuestions(["addition"], [7])
    for (const q of questions) {
      expect(q.correctAnswer).toBe(q.displayFirst + q.displaySecond)
      expect(q.operationSymbol).toBe("+")
    }
  })

  it("multiplicação: correctAnswer = displayFirst × displaySecond", () => {
    const questions = generateQuestions(["multiplication"], [4])
    for (const q of questions) {
      expect(q.correctAnswer).toBe(q.displayFirst * q.displaySecond)
      expect(q.operationSymbol).toBe("×")
    }
  })

  it("subtração: nunca gera resultado negativo", () => {
    const questions = generateQuestions(["subtraction"], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    for (const q of questions) {
      expect(q.correctAnswer).toBeGreaterThanOrEqual(0)
      expect(q.operationSymbol).toBe("−")
      // displayFirst - displaySecond = correctAnswer
      expect(q.displayFirst - q.displaySecond).toBe(q.correctAnswer)
    }
  })

  it("divisão: nunca gera resultado decimal", () => {
    const questions = generateQuestions(["division"], [1, 2, 3, 4, 5])
    for (const q of questions) {
      expect(Number.isInteger(q.correctAnswer)).toBe(true)
      expect(q.operationSymbol).toBe("÷")
      // displayFirst / displaySecond = correctAnswer
      expect(q.displayFirst / q.displaySecond).toBe(q.correctAnswer)
    }
  })

  it("embaralha as questões (ordens diferentes entre chamadas)", () => {
    const q1 = generateQuestions(["addition"], [1, 2, 3, 4, 5])
    const q2 = generateQuestions(["addition"], [1, 2, 3, 4, 5])
    // Mesmo tamanho
    expect(q1).toHaveLength(q2.length)
    // Extremamente improvável que a ordem seja idêntica
    const ids1 = q1.map((q) => q.id)
    const ids2 = q2.map((q) => q.id)
    // IDs são únicos (gerados com timestamp), então comparamos por correctAnswer+displayFirst
    const keys1 = q1.map((q) => `${q.displayFirst}-${q.displaySecond}-${q.operation}`)
    const keys2 = q2.map((q) => `${q.displayFirst}-${q.displaySecond}-${q.operation}`)
    // Mesmos elementos, mas ordem provavelmente diferente
    expect(keys1.sort()).toEqual(keys2.sort())
  })

  it("cada questão tem um id único", () => {
    const questions = generateQuestions(["addition", "subtraction"], [3, 7])
    const ids = questions.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("todas as 4 operações funcionam juntas", () => {
    const questions = generateQuestions(
      ["addition", "subtraction", "multiplication", "division"],
      [5]
    )
    // addition: 11, subtraction: 11, multiplication: 11, division: 11 = 44
    expect(questions).toHaveLength(44)
    const ops = new Set(questions.map((q) => q.operation))
    expect(ops.size).toBe(4)
  })
})

describe("createGameState", () => {
  it("cria estado com queue do tamanho correto", () => {
    const state = createGameState(["addition"], [3], 5)
    expect(state.queue).toHaveLength(11)
    expect(state.sessionTotal).toBe(11)
  })

  it("limita queue com maxQuestions", () => {
    const state = createGameState(["addition"], [3], 5, 5)
    expect(state.queue).toHaveLength(5)
    expect(state.sessionTotal).toBe(5)
  })

  it("maxQuestions maior que total não aumenta queue", () => {
    const state = createGameState(["addition"], [3], 5, 100)
    expect(state.queue).toHaveLength(11)
  })

  it("estado inicial com contadores zerados", () => {
    const state = createGameState(["addition"], [1], 3)
    expect(state.correctCount).toBe(0)
    expect(state.wrongCount).toBe(0)
    expect(state.currentAttempt).toBe(1)
    expect(state.isComplete).toBe(false)
    expect(state.currentQuestion).toBeNull()
  })

  it("maxRetries é preservado", () => {
    const state = createGameState(["addition"], [1], 7)
    expect(state.maxRetries).toBe(7)
  })
})

describe("nextQuestion", () => {
  let state: GameState

  beforeEach(() => {
    state = createGameState(["addition"], [1], 3, 3)
  })

  it("pop do final da fila", () => {
    const lastQuestion = state.queue[state.queue.length - 1]
    const newState = nextQuestion(state)
    expect(newState.currentQuestion).toEqual(lastQuestion)
    expect(newState.queue).toHaveLength(2)
  })

  it("reseta currentAttempt para 1", () => {
    const modified = { ...state, currentAttempt: 3 }
    const newState = nextQuestion(modified)
    expect(newState.currentAttempt).toBe(1)
  })

  it("marca isComplete quando fila vazia", () => {
    const empty: GameState = { ...state, queue: [] }
    const newState = nextQuestion(empty)
    expect(newState.isComplete).toBe(true)
    expect(newState.currentQuestion).toBeNull()
  })

  it("não muta o estado original", () => {
    const originalQueue = [...state.queue]
    nextQuestion(state)
    expect(state.queue).toEqual(originalQueue)
  })
})

describe("submitAnswer", () => {
  let state: GameState

  beforeEach(() => {
    const base = createGameState(["addition"], [2], 3, 3)
    state = nextQuestion(base)
  })

  it("resposta correta incrementa correctCount", () => {
    const correctAnswer = state.currentQuestion!.correctAnswer
    const result = submitAnswer(state, correctAnswer)
    expect(result.wasCorrect).toBe(true)
    expect(result.exhaustedRetries).toBe(false)
    expect(result.newState.correctCount).toBe(1)
    expect(result.newState.currentQuestion).toBeNull()
  })

  it("resposta errada com tentativas restantes mantém questão", () => {
    const wrongAnswer = state.currentQuestion!.correctAnswer + 999
    const result = submitAnswer(state, wrongAnswer)
    expect(result.wasCorrect).toBe(false)
    expect(result.exhaustedRetries).toBe(false)
    expect(result.newState.currentAttempt).toBe(2)
    expect(result.newState.wrongCount).toBe(1)
    // Questão continua a mesma
    expect(result.newState.currentQuestion).toEqual(state.currentQuestion)
  })

  it("resposta errada esgotando tentativas reinsere na fila", () => {
    // maxRetries = 3, colocar na tentativa 3
    const atLastAttempt = { ...state, currentAttempt: 3 }
    const wrongAnswer = atLastAttempt.currentQuestion!.correctAnswer + 999
    const result = submitAnswer(atLastAttempt, wrongAnswer)
    expect(result.wasCorrect).toBe(false)
    expect(result.exhaustedRetries).toBe(true)
    expect(result.newState.currentQuestion).toBeNull()
    // Questão reinserida no início da fila
    expect(result.newState.queue[0]).toEqual(state.currentQuestion)
    expect(result.newState.queue.length).toBe(state.queue.length + 1)
  })

  it("retorna correctAnswer sempre", () => {
    const correctAnswer = state.currentQuestion!.correctAnswer
    const resultCorrect = submitAnswer(state, correctAnswer)
    expect(resultCorrect.correctAnswer).toBe(correctAnswer)

    const resultWrong = submitAnswer(state, correctAnswer + 1)
    expect(resultWrong.correctAnswer).toBe(correctAnswer)
  })

  it("não muta o estado original", () => {
    const originalCorrectCount = state.correctCount
    const originalQueue = [...state.queue]
    submitAnswer(state, state.currentQuestion!.correctAnswer)
    expect(state.correctCount).toBe(originalCorrectCount)
    expect(state.queue).toEqual(originalQueue)
  })

  it("fluxo completo: responder todas as questões corretamente", () => {
    let current = state
    let answered = 0
    const maxIterations = 100

    while (!current.isComplete && answered < maxIterations) {
      if (!current.currentQuestion) {
        current = nextQuestion(current)
        if (current.isComplete) break
      }
      const result = submitAnswer(current, current.currentQuestion!.correctAnswer)
      current = nextQuestion(result.newState)
      answered++
    }

    expect(current.isComplete).toBe(true)
    expect(current.correctCount).toBe(3)
    expect(current.wrongCount).toBe(0)
  })
})
