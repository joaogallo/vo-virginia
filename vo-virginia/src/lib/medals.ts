export type MedalCategory =
  | "precisao"
  | "volume"
  | "operacao"
  | "velocidade"
  | "superacao"
  | "especiais"

export type MedalLevel = "BRONZE" | "SILVER" | "GOLD"

export interface MedalThreshold {
  level: MedalLevel
  value: number
  accuracyPercent?: number
  description: string
}

export interface MedalDefinition {
  id: string
  name: string
  description: string
  category: MedalCategory
  icon: string
  hasLevels: boolean
  thresholds?: MedalThreshold[]
}

export const MEDAL_CATEGORIES: { id: MedalCategory; label: string }[] = [
  { id: "precisao", label: "Precisão" },
  { id: "volume", label: "Volume e Dedicação" },
  { id: "operacao", label: "Domínio por Operação" },
  { id: "velocidade", label: "Velocidade" },
  { id: "superacao", label: "Superação" },
  { id: "especiais", label: "Especiais" },
]

export const MEDAL_DEFINITIONS: MedalDefinition[] = [
  // Precisão
  {
    id: "atirador-certeiro",
    name: "Atirador Certeiro",
    description: "Acerte várias questões seguidas sem errar.",
    category: "precisao",
    icon: "🎯",
    hasLevels: true,
    thresholds: [
      { level: "BRONZE", value: 5, description: "5 acertos consecutivos" },
      { level: "SILVER", value: 15, description: "15 acertos consecutivos" },
      { level: "GOLD", value: 30, description: "30 acertos consecutivos" },
    ],
  },
  {
    id: "sessao-perfeita",
    name: "Sessão Perfeita",
    description: "Complete uma sessão inteira sem nenhum erro.",
    category: "precisao",
    icon: "⭐",
    hasLevels: true,
    thresholds: [
      { level: "BRONZE", value: 1, description: "1 sessão perfeita" },
      { level: "SILVER", value: 5, description: "5 sessões perfeitas" },
      { level: "GOLD", value: 15, description: "15 sessões perfeitas" },
    ],
  },
  {
    id: "mestre-precisao",
    name: "Mestre da Precisão",
    description: "Mantenha uma precisão geral acima de um percentual.",
    category: "precisao",
    icon: "🏆",
    hasLevels: true,
    thresholds: [
      { level: "BRONZE", value: 70, description: "Precisão geral ≥ 70%" },
      { level: "SILVER", value: 85, description: "Precisão geral ≥ 85%" },
      { level: "GOLD", value: 95, description: "Precisão geral ≥ 95%" },
    ],
  },

  // Volume e Dedicação
  {
    id: "maratonista",
    name: "Maratonista",
    description: "Responda uma grande quantidade de questões no total.",
    category: "volume",
    icon: "👟",
    hasLevels: true,
    thresholds: [
      { level: "BRONZE", value: 100, description: "100 questões respondidas" },
      { level: "SILVER", value: 500, description: "500 questões respondidas" },
      { level: "GOLD", value: 2000, description: "2.000 questões respondidas" },
    ],
  },
  {
    id: "frequentador",
    name: "Frequentador",
    description: "Complete um número de sessões de prática.",
    category: "volume",
    icon: "📅",
    hasLevels: true,
    thresholds: [
      { level: "BRONZE", value: 10, description: "10 sessões completas" },
      { level: "SILVER", value: 50, description: "50 sessões completas" },
      { level: "GOLD", value: 150, description: "150 sessões completas" },
    ],
  },
  {
    id: "chama-acesa",
    name: "Chama Acesa",
    description: "Pratique em dias consecutivos.",
    category: "volume",
    icon: "🔥",
    hasLevels: true,
    thresholds: [
      { level: "BRONZE", value: 3, description: "3 dias seguidos" },
      { level: "SILVER", value: 7, description: "7 dias seguidos" },
      { level: "GOLD", value: 30, description: "30 dias seguidos" },
    ],
  },

  // Domínio por Operação
  {
    id: "mestre-adicao",
    name: "Mestre da Adição",
    description: "Acerte questões de adição com alta precisão.",
    category: "operacao",
    icon: "➕",
    hasLevels: true,
    thresholds: [
      { level: "BRONZE", value: 50, description: "50 acertos em adição" },
      { level: "SILVER", value: 200, description: "200 acertos em adição" },
      { level: "GOLD", value: 500, accuracyPercent: 90, description: "500 acertos com ≥ 90% precisão" },
    ],
  },
  {
    id: "mestre-subtracao",
    name: "Mestre da Subtração",
    description: "Acerte questões de subtração com alta precisão.",
    category: "operacao",
    icon: "➖",
    hasLevels: true,
    thresholds: [
      { level: "BRONZE", value: 50, description: "50 acertos em subtração" },
      { level: "SILVER", value: 200, description: "200 acertos em subtração" },
      { level: "GOLD", value: 500, accuracyPercent: 90, description: "500 acertos com ≥ 90% precisão" },
    ],
  },
  {
    id: "mestre-multiplicacao",
    name: "Mestre da Multiplicação",
    description: "Acerte questões de multiplicação com alta precisão.",
    category: "operacao",
    icon: "✖️",
    hasLevels: true,
    thresholds: [
      { level: "BRONZE", value: 50, description: "50 acertos em multiplicação" },
      { level: "SILVER", value: 200, description: "200 acertos em multiplicação" },
      { level: "GOLD", value: 500, accuracyPercent: 90, description: "500 acertos com ≥ 90% precisão" },
    ],
  },
  {
    id: "mestre-divisao",
    name: "Mestre da Divisão",
    description: "Acerte questões de divisão com alta precisão.",
    category: "operacao",
    icon: "➗",
    hasLevels: true,
    thresholds: [
      { level: "BRONZE", value: 50, description: "50 acertos em divisão" },
      { level: "SILVER", value: 200, description: "200 acertos em divisão" },
      { level: "GOLD", value: 500, accuracyPercent: 90, description: "500 acertos com ≥ 90% precisão" },
    ],
  },
  {
    id: "genio-completo",
    name: "Gênio Completo",
    description: "Desbloqueie medalhas em todas as 4 operações.",
    category: "operacao",
    icon: "👑",
    hasLevels: true,
    thresholds: [
      { level: "BRONZE", value: 4, description: "4 operações com Bronze" },
      { level: "SILVER", value: 4, description: "4 operações com Prata" },
      { level: "GOLD", value: 4, description: "4 operações com Ouro" },
    ],
  },

  // Velocidade
  {
    id: "raio",
    name: "Raio",
    description: "Responda corretamente em menos de 3 segundos.",
    category: "velocidade",
    icon: "⚡",
    hasLevels: true,
    thresholds: [
      { level: "BRONZE", value: 10, description: "10 respostas corretas em < 3s" },
      { level: "SILVER", value: 50, description: "50 respostas corretas em < 3s" },
      { level: "GOLD", value: 200, description: "200 respostas corretas em < 3s" },
    ],
  },
  {
    id: "sessao-veloz",
    name: "Sessão Veloz",
    description: "Complete sessões com tempo médio abaixo de 5 segundos por questão.",
    category: "velocidade",
    icon: "⏱️",
    hasLevels: true,
    thresholds: [
      { level: "BRONZE", value: 1, description: "1 sessão veloz" },
      { level: "SILVER", value: 5, description: "5 sessões velozes" },
      { level: "GOLD", value: 15, description: "15 sessões velozes" },
    ],
  },

  // Superação
  {
    id: "persistente",
    name: "Persistente",
    description: "Acerte uma questão após errar na primeira tentativa.",
    category: "superacao",
    icon: "⛰️",
    hasLevels: true,
    thresholds: [
      { level: "BRONZE", value: 10, description: "10 acertos após erro" },
      { level: "SILVER", value: 50, description: "50 acertos após erro" },
      { level: "GOLD", value: 150, description: "150 acertos após erro" },
    ],
  },

  // Especiais
  {
    id: "primeira-vez",
    name: "Primeira Vez",
    description: "Complete sua primeira sessão de prática.",
    category: "especiais",
    icon: "🚀",
    hasLevels: false,
  },
  {
    id: "explorador",
    name: "Explorador",
    description: "Pratique todas as 4 operações pelo menos uma vez.",
    category: "especiais",
    icon: "🧭",
    hasLevels: false,
  },
  {
    id: "madrugador",
    name: "Madrugador",
    description: "Pratique antes das 8h da manhã.",
    category: "especiais",
    icon: "🌅",
    hasLevels: false,
  },
  {
    id: "corujao",
    name: "Corujão",
    description: "Pratique depois das 20h.",
    category: "especiais",
    icon: "🌙",
    hasLevels: false,
  },
]

export const MEDAL_BY_ID = Object.fromEntries(
  MEDAL_DEFINITIONS.map((m) => [m.id, m])
) as Record<string, MedalDefinition>

export const LEVEL_LABELS: Record<MedalLevel, string> = {
  BRONZE: "Bronze",
  SILVER: "Prata",
  GOLD: "Ouro",
}

export const LEVEL_COLORS: Record<MedalLevel, string> = {
  BRONZE: "from-amber-600 to-amber-800",
  SILVER: "from-gray-300 to-gray-500",
  GOLD: "from-yellow-300 to-yellow-500",
}
