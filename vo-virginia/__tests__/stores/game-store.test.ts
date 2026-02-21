import { describe, it, expect, beforeEach } from "vitest"
import { useGameStore } from "@/stores/game-store"

describe("game-store", () => {
  beforeEach(() => {
    // Reset store entre testes
    useGameStore.getState().resetSetup()
  })

  describe("setup actions", () => {
    it("toggleOperation adiciona operação", () => {
      useGameStore.getState().toggleOperation("addition")
      expect(useGameStore.getState().selectedOperations).toEqual(["addition"])
    })

    it("toggleOperation remove operação existente", () => {
      useGameStore.getState().toggleOperation("addition")
      useGameStore.getState().toggleOperation("addition")
      expect(useGameStore.getState().selectedOperations).toEqual([])
    })

    it("toggleNumber adiciona número", () => {
      useGameStore.getState().toggleNumber(5)
      expect(useGameStore.getState().selectedNumbers).toEqual([5])
    })

    it("toggleNumber remove número existente", () => {
      useGameStore.getState().toggleNumber(5)
      useGameStore.getState().toggleNumber(5)
      expect(useGameStore.getState().selectedNumbers).toEqual([])
    })

    it("setQuestionLimit define limite", () => {
      useGameStore.getState().setQuestionLimit(10)
      expect(useGameStore.getState().questionLimit).toBe(10)
    })

    it("setQuestionLimit aceita null", () => {
      useGameStore.getState().setQuestionLimit(10)
      useGameStore.getState().setQuestionLimit(null)
      expect(useGameStore.getState().questionLimit).toBeNull()
    })
  })

  describe("totalQuestions", () => {
    it("calcula produto cartesiano correto", () => {
      useGameStore.getState().toggleOperation("addition")
      useGameStore.getState().toggleNumber(3)
      // 1 op × 1 num × 11 = 11
      expect(useGameStore.getState().totalQuestions()).toBe(11)
    })

    it("desconta divisão por zero", () => {
      useGameStore.getState().toggleOperation("division")
      useGameStore.getState().toggleNumber(0)
      expect(useGameStore.getState().totalQuestions()).toBe(0)
    })

    it("retorna 0 sem seleção", () => {
      expect(useGameStore.getState().totalQuestions()).toBe(0)
    })
  })

  describe("startSession", () => {
    it("cria gameState válido", () => {
      useGameStore.getState().toggleOperation("addition")
      useGameStore.getState().toggleNumber(2)
      useGameStore.getState().startSession(5)

      const { gameState } = useGameStore.getState()
      expect(gameState).not.toBeNull()
      expect(gameState!.currentQuestion).not.toBeNull()
      expect(gameState!.maxRetries).toBe(5)
      expect(gameState!.isComplete).toBe(false)
    })

    it("reseta answerHistory", () => {
      useGameStore.getState().toggleOperation("addition")
      useGameStore.getState().toggleNumber(1)
      useGameStore.getState().startSession(3)
      expect(useGameStore.getState().answerHistory).toEqual([])
    })
  })

  describe("input actions", () => {
    beforeEach(() => {
      useGameStore.getState().toggleOperation("addition")
      useGameStore.getState().toggleNumber(1)
      useGameStore.getState().startSession(3)
    })

    it("appendDigit adiciona dígito", () => {
      useGameStore.getState().appendDigit("5")
      expect(useGameStore.getState().inputValue).toBe("5")
    })

    it("appendDigit concatena múltiplos dígitos", () => {
      useGameStore.getState().appendDigit("1")
      useGameStore.getState().appendDigit("2")
      expect(useGameStore.getState().inputValue).toBe("12")
    })

    it("appendDigit limita a 4 dígitos", () => {
      useGameStore.getState().appendDigit("1")
      useGameStore.getState().appendDigit("2")
      useGameStore.getState().appendDigit("3")
      useGameStore.getState().appendDigit("4")
      useGameStore.getState().appendDigit("5")
      expect(useGameStore.getState().inputValue).toBe("1234")
    })

    it("deleteDigit remove último dígito", () => {
      useGameStore.getState().appendDigit("1")
      useGameStore.getState().appendDigit("2")
      useGameStore.getState().deleteDigit()
      expect(useGameStore.getState().inputValue).toBe("1")
    })

    it("clearInput limpa o input", () => {
      useGameStore.getState().appendDigit("1")
      useGameStore.getState().appendDigit("2")
      useGameStore.getState().clearInput()
      expect(useGameStore.getState().inputValue).toBe("")
    })

    it("avatarState muda para thinking ao digitar", () => {
      useGameStore.getState().appendDigit("1")
      expect(useGameStore.getState().avatarState).toBe("thinking")
    })

    it("avatarState volta para idle ao limpar", () => {
      useGameStore.getState().appendDigit("1")
      useGameStore.getState().clearInput()
      expect(useGameStore.getState().avatarState).toBe("idle")
    })
  })

  describe("confirmAnswer", () => {
    beforeEach(() => {
      useGameStore.getState().toggleOperation("addition")
      useGameStore.getState().toggleNumber(1)
      useGameStore.getState().startSession(3)
    })

    it("resposta correta: feedback correct", () => {
      const correctAnswer = useGameStore.getState().gameState!.currentQuestion!.correctAnswer
      useGameStore.getState().appendDigit(String(correctAnswer))
      const result = useGameStore.getState().confirmAnswer()

      expect(result).not.toBeNull()
      expect(result!.wasCorrect).toBe(true)
      expect(useGameStore.getState().feedbackType).toBe("correct")
      expect(useGameStore.getState().showingFeedback).toBe(true)
      expect(useGameStore.getState().avatarState).toBe("correct")
    })

    it("resposta errada: feedback incorrect", () => {
      const correctAnswer = useGameStore.getState().gameState!.currentQuestion!.correctAnswer
      useGameStore.getState().appendDigit(String(correctAnswer + 100))
      const result = useGameStore.getState().confirmAnswer()

      expect(result).not.toBeNull()
      expect(result!.wasCorrect).toBe(false)
      expect(useGameStore.getState().feedbackType).toBe("incorrect")
      expect(useGameStore.getState().avatarState).toBe("incorrect")
    })

    it("retorna null se input vazio", () => {
      const result = useGameStore.getState().confirmAnswer()
      expect(result).toBeNull()
    })

    it("adiciona ao answerHistory", () => {
      const correctAnswer = useGameStore.getState().gameState!.currentQuestion!.correctAnswer
      useGameStore.getState().appendDigit(String(correctAnswer))
      useGameStore.getState().confirmAnswer()

      expect(useGameStore.getState().answerHistory).toHaveLength(1)
      expect(useGameStore.getState().answerHistory[0].isCorrect).toBe(true)
    })
  })

  describe("advanceToNext", () => {
    beforeEach(() => {
      useGameStore.getState().toggleOperation("addition")
      useGameStore.getState().toggleNumber(1)
      useGameStore.getState().startSession(3)
    })

    it("avança para próxima questão após acerto", () => {
      const prevQuestion = useGameStore.getState().gameState!.currentQuestion
      const correctAnswer = prevQuestion!.correctAnswer
      useGameStore.getState().appendDigit(String(correctAnswer))
      useGameStore.getState().confirmAnswer()
      useGameStore.getState().advanceToNext()

      expect(useGameStore.getState().showingFeedback).toBe(false)
      expect(useGameStore.getState().inputValue).toBe("")
      // Questão mudou (ou sessão completou)
      const newQuestion = useGameStore.getState().gameState!.currentQuestion
      if (!useGameStore.getState().gameState!.isComplete) {
        expect(newQuestion).not.toEqual(prevQuestion)
      }
    })

    it("mantém mesma questão após erro sem esgotar tentativas", () => {
      const prevQuestion = useGameStore.getState().gameState!.currentQuestion
      const wrongAnswer = prevQuestion!.correctAnswer + 100
      useGameStore.getState().appendDigit(String(wrongAnswer))
      useGameStore.getState().confirmAnswer()
      useGameStore.getState().advanceToNext()

      expect(useGameStore.getState().showingFeedback).toBe(false)
      // Mesma questão (retry)
      expect(useGameStore.getState().gameState!.currentQuestion).toEqual(prevQuestion)
    })
  })

  describe("resetSetup", () => {
    it("limpa tudo", () => {
      useGameStore.getState().toggleOperation("addition")
      useGameStore.getState().toggleNumber(5)
      useGameStore.getState().startSession(3)
      useGameStore.getState().resetSetup()

      const state = useGameStore.getState()
      expect(state.selectedOperations).toEqual([])
      expect(state.selectedNumbers).toEqual([])
      expect(state.gameState).toBeNull()
      expect(state.answerHistory).toEqual([])
      expect(state.inputValue).toBe("")
      expect(state.backendSessionId).toBeNull()
    })
  })
})
