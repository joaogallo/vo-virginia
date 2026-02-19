import type { Question, GameState, Operation } from "@/types/game"

let questionIdCounter = 0

function generateId(): string {
  questionIdCounter++
  return `q-${Date.now()}-${questionIdCounter}`
}

/**
 * Gera todas as questões para uma sessão.
 * Port fiel do Python: gerar_tabuada + operacao
 *
 * Produto cartesiano: operações × números × [0..10]
 * Embaralhado com Fisher-Yates.
 */
export function generateQuestions(
  operations: Operation[],
  numbers: number[]
): Question[] {
  const questions: Question[] = []

  for (const op of operations) {
    for (const x of numbers) {
      for (let y = 0; y <= 10; y++) {
        // Fix: pular divisão por zero (bug no Python original)
        if (op === "division" && x === 0) continue

        const question = buildQuestion(op, x, y)
        questions.push(question)
      }
    }
  }

  // Fisher-Yates shuffle (equivalente ao random.shuffle do Python)
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[questions[i], questions[j]] = [questions[j], questions[i]]
  }

  return questions
}

/**
 * Constrói uma questão individual com a lógica de formato reverso.
 * Port fiel do Python: função operacao()
 *
 * - Adição: x + y = ?
 * - Multiplicação: x × y = ?
 * - Subtração: (x+y) - x = ? (resposta é y, evita negativos)
 * - Divisão: (x*y) / x = ? (resposta é y, evita decimais)
 */
function buildQuestion(op: Operation, x: number, y: number): Question {
  const id = generateId()

  switch (op) {
    case "addition":
      return {
        id,
        operation: op,
        displayFirst: x,
        displaySecond: y,
        operationSymbol: "+",
        correctAnswer: x + y,
        _genX: x,
        _genY: y,
      }
    case "multiplication":
      return {
        id,
        operation: op,
        displayFirst: x,
        displaySecond: y,
        operationSymbol: "×",
        correctAnswer: x * y,
        _genX: x,
        _genY: y,
      }
    case "subtraction":
      // Formato reverso: (x+y) - x = y
      return {
        id,
        operation: op,
        displayFirst: x + y,
        displaySecond: x,
        operationSymbol: "−",
        correctAnswer: y,
        _genX: x,
        _genY: y,
      }
    case "division":
      // Formato reverso: (x*y) / x = y
      return {
        id,
        operation: op,
        displayFirst: x * y,
        displaySecond: x,
        operationSymbol: "÷",
        correctAnswer: y,
        _genX: x,
        _genY: y,
      }
  }
}

/**
 * Cria o estado inicial do jogo.
 */
export function createGameState(
  operations: Operation[],
  numbers: number[],
  maxRetries: number,
  maxQuestions?: number
): GameState {
  let queue = generateQuestions(operations, numbers)
  if (maxQuestions && maxQuestions < queue.length) {
    queue = queue.slice(0, maxQuestions)
  }
  return {
    queue,
    currentQuestion: null,
    correctCount: 0,
    wrongCount: 0,
    currentAttempt: 1,
    maxRetries,
    sessionStartTime: Date.now(),
    questionStartTime: Date.now(),
    isComplete: false,
    sessionTotal: queue.length,
  }
}

/**
 * Avança para a próxima questão (pop do final da fila).
 * Retorna o estado atualizado. Se a fila está vazia, marca como completo.
 */
export function nextQuestion(state: GameState): GameState {
  if (state.queue.length === 0) {
    return { ...state, isComplete: true, currentQuestion: null }
  }

  const newQueue = [...state.queue]
  const question = newQueue.pop()! // pop do final (como Python)

  return {
    ...state,
    queue: newQueue,
    currentQuestion: question,
    currentAttempt: 1,
    questionStartTime: Date.now(),
  }
}

/**
 * Valida uma resposta e retorna o novo estado do jogo.
 *
 * Comportamento de retry:
 * - Se correto: avança (currentQuestion = null)
 * - Se errado e ainda tem tentativas: mantém na mesma questão
 * - Se errado e esgotou tentativas: reinsere no início da fila e avança
 *
 * A reinserção no início (index 0) + pop do final replica exatamente
 * o comportamento do Python: tabuada.insert(0, ...) + tabuada.pop()
 */
export function submitAnswer(
  state: GameState,
  userAnswer: number
): {
  newState: GameState
  wasCorrect: boolean
  correctAnswer: number
  exhaustedRetries: boolean
} {
  const question = state.currentQuestion!
  const wasCorrect = userAnswer === question.correctAnswer

  if (wasCorrect) {
    return {
      wasCorrect: true,
      correctAnswer: question.correctAnswer,
      exhaustedRetries: false,
      newState: {
        ...state,
        correctCount: state.correctCount + 1,
        currentAttempt: 1,
        currentQuestion: null,
      },
    }
  }

  // Resposta errada
  const newAttempt = state.currentAttempt + 1
  const newWrongCount = state.wrongCount + 1

  if (newAttempt > state.maxRetries) {
    // Esgotou tentativas: reinsere no início da fila e avança
    const newQueue = [question, ...state.queue]
    return {
      wasCorrect: false,
      correctAnswer: question.correctAnswer,
      exhaustedRetries: true,
      newState: {
        ...state,
        queue: newQueue,
        wrongCount: newWrongCount,
        currentAttempt: 1,
        currentQuestion: null,
      },
    }
  }

  // Ainda tem tentativas: fica na mesma questão
  return {
    wasCorrect: false,
    correctAnswer: question.correctAnswer,
    exhaustedRetries: false,
    newState: {
      ...state,
      wrongCount: newWrongCount,
      currentAttempt: newAttempt,
    },
  }
}
