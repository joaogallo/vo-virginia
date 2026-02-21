# Vo Virginia -- Guia para o Claude Code

## Visao Geral

App web responsivo de pratica de matematica para criancas de 6-11 anos (Ensino Fundamental I). Portado de um CLI Python para Next.js com autenticacao, estatisticas avancadas, sistema de medalhas, feedback por email e painel para pais/professores.

**Producao:** [vo-virginia.vercel.app](https://vo-virginia.vercel.app)

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Estilo**: Tailwind CSS v4 + fontes Nunito/Baloo 2
- **Animacoes**: Framer Motion + Lottie (lottie-react)
- **Graficos**: Recharts
- **Estado**: Zustand (game state no cliente)
- **Auth**: NextAuth.js v5 (credentials, Google, Microsoft Entra ID)
- **ORM**: Prisma 6 + PostgreSQL (Neon)
- **Email**: Resend
- **Validacao**: Zod
- **Deploy**: Vercel (org: joaogallos-projects-bfdd3046)

## Comandos

```bash
npm run dev          # Dev server em localhost:3000
npm run build        # Build de producao (inclui prisma generate)
npm run lint         # ESLint
npx prisma generate  # Gerar Prisma Client
npx prisma db push   # Sincronizar schema com banco (sem migrations)
npx prisma studio    # Interface visual do banco
```

**Nota:** O banco de producao nao usa migrations (`prisma migrate`). Usar `prisma db push` para aplicar mudancas no schema.

## Arquitetura

### Logica do Jogo (`src/lib/game-engine.ts`)

Este e o arquivo mais critico. Porta fielmente a logica do Python original:

- **Geracao**: Produto cartesiano `operacoes x numeros x [0..10]`, embaralhado (Fisher-Yates)
- **Subtracao**: Formato reverso `(x+y) - x = y` -- evita resultados negativos
- **Divisao**: Formato reverso `(x*y) / x = y` -- evita decimais. Pula quando `x = 0`
- **Fila**: `pop()` do final, erros reinseridos no inicio (`index 0`)
- **Retentativas**: Configuravel (`maxRetries`, padrao 5). Esgotou -> reinsere na fila e avanca
- **Limite de questoes**: Parametro opcional `maxQuestions` que fatia a fila embaralhada

Qualquer alteracao neste arquivo deve preservar o comportamento da fila e dos formatos reversos.

### Estado do Jogo (`src/stores/game-store.ts`)

Zustand store com todo o estado da sessao de jogo. O motor roda **inteiramente no cliente**.

- `backendSessionId` e `syncedAnswerCount` controlam a persistencia incremental
- Respostas sao enviadas ao backend apos cada uma (via `useSessionPersistence` hook)
- Sessao e salva em `localStorage` a cada resposta para recuperacao em caso de interrupcao
- `questionLimit` para o seletor de quantidade na tela de setup

### Persistencia de Sessao

- `src/lib/session-storage.ts` -- salva/carrega/limpa estado em localStorage (expira em 24h)
- `src/hooks/useSessionPersistence.ts` -- hook que faz sync incremental com backend
- `src/components/game/SessionRecoveryDialog.tsx` -- dialogo de recuperacao ao reabrir o app
- Sessao e criada no backend via `POST /api/sessoes` ao iniciar (nao ao finalizar)
- Respostas enviadas incrementalmente; finalizacao via `PATCH /api/sessoes/[id]`

### Rotas do App

Rotas usam **portugues** (publico-alvo brasileiro). Codigo interno em ingles.

- Route groups: `(auth)` para login/cadastro, `(app)` para rotas autenticadas
- `(app)/layout.tsx` contem o header com navegacao
- `(app)/jogar/layout.tsx` posiciona a imagem da Vo Virginia a direita (desktop)
- Middleware em `src/middleware.ts` protege rotas por autenticacao e role

### Paginas Principais

| Rota | Descricao |
|------|-----------|
| `/jogar` | Setup da sessao (operacoes, numeros, quantidade) |
| `/jogar/sessao` | Sessao de jogo ativa |
| `/resultado` | Resumo da sessao + notificacao de novas medalhas |
| `/medalhas` | Galeria de medalhas (conquistadas e nao-conquistadas) |
| `/estatisticas` | Graficos de evolucao, tempo por operacao, ranking, filtro por periodo |
| `/painel` | Dashboard de pais/professores |
| `/perfil` | Configuracoes do usuario |
| `/feedback` | Formulario de feedback por email |

### Sistema de Medalhas

- Definicoes estaticas em `src/lib/medals.ts` -- 17 medalhas, 6 categorias, constantes e helpers
- Logica de verificacao em `src/lib/medal-checker.ts` -- 14 checkers server-side
- APIs: `GET /api/medalhas` (consulta) e `POST /api/medalhas/verificar` (verifica + persiste)
- Verificacao ocorre apos finalizacao da sessao na pagina `/resultado`
- `MedalNotification` exibe medalhas recem-conquistadas com animacao spring
- Pagina `/medalhas` mostra grid por categoria: conquistadas normais, nao-conquistadas em `opacity-20 grayscale`
- Medalhas com 3 niveis (Bronze/Prata/Ouro) e medalhas especiais de nivel unico
- Detalhes da medalha em overlay (bottom sheet) ao clicar

### Estatisticas Avancadas

- `src/lib/stats-calculator.ts` -- calcula dailyProgress, avgTimeByOperation, bestSessions
- APIs: `GET /api/estatisticas` e `GET /api/estatisticas/[childId]` com filtro `?period=7d|30d|all`
- Componentes em `src/components/stats/`: AccuracyChart, TimeByOperationChart, BestSessions, PeriodFilter, ExportPdfButton
- Exportacao PDF via `window.print()` com estilos `@media print` em `globals.css`

### Feedback

- API em `src/app/api/feedback/route.ts` -- envia email via Resend
- Remetente: `Contato Vo Virginia <vo-virginia@habitushealth.com.br>`
- Destinatario: `vo-virginia@habitushealth.com.br`
- Reply-to: email do usuario logado
- Instancia Resend criada via funcao (lazy) para evitar erro de build sem API key

### Imagens e Animacoes

- `src/media/vo-transparente.png` -- Usada no header e layout de jogo (desktop)
- `src/media/vo-netos.png` -- Usada na landing page
- Animacoes Lottie em `src/media/lottie/` (confete, acerto, erro)
- Sons em `src/media/sounds/` (acerto, erro, comemoracrao)

### Banco de Dados

Schema em `prisma/schema.prisma`. Modelos:

- `User` (com `role`: CHILD/PARENT/TEACHER, `maxRetries`, `defaultQuestionLimit`)
- `ParentChild` (vinculacao muitos-para-muitos entre criancas e adultos)
- `GameSession` (operacoes, numeros, contadores, timestamps)
- `Answer` (cada tentativa individual com tempo gasto)
- `UserMedal` (medalhas conquistadas: medalId, level, unlockedAt)
- `ChildGroup` / `ChildGroupMember` (grupos de criancas)

Enums: `UserRole`, `OperationType`, `MedalLevel`

### Autenticacao

Config em `src/lib/auth.ts`. Usa JWT strategy (necessario para credentials provider). Callbacks injetam `id` e `role` no token/session.

- `basePath: "/api/auth"` e obrigatorio (NextAuth v5 default e `/auth`)
- `trustHost: true` para funcionar no Vercel
- `allowDangerousEmailAccountLinking: true` nos providers OAuth
- Middleware usa `getToken()` de `next-auth/jwt` (leve, para Edge)
- `AUTH_URL` no Vercel deve ser `https://vo-virginia.vercel.app`

### Vinculacao de Adultos

- Adultos (pais/professores) recebem `linkCode` ao se cadastrar, visivel no perfil
- Criancas podem vincular adultos via `/api/vincular` usando o linkCode
- Suporta multiplos adultos por crianca
- A crianca tambem pode vincular durante o cadastro (campo opcional)

## Convencoes

- Componentes do jogo em `src/components/game/`
- Componentes de medalhas em `src/components/medals/`
- Componentes de estatisticas em `src/components/stats/`
- Validacao de API com Zod (`src/lib/validators.ts`)
- Tipos em `src/types/game.ts` e `src/types/next-auth.d.ts`
- Constantes de operacoes em `src/constants/operations.ts`
- Hooks customizados em `src/hooks/`
- Cores por operacao definidas como custom properties em `globals.css` (addition=#22c55e, subtraction=#3b82f6, multiplication=#f97316, division=#a855f7)

## Notas Importantes

- O middleware usa a convention `middleware.ts` (Next.js 16 sugere migrar para `proxy`)
- Nao ha testes ainda -- priorizar testes do game-engine
- As fontes `font-sans` (Nunito) e `font-display` (Baloo 2) sao definidas via CSS custom properties no `globals.css`
- O banco de producao usa `prisma db push` (sem migrations). Nao usar `prisma migrate dev` pois detecta drift e tenta resetar
- Variavel `RESEND_API_KEY` precisa estar configurada no Vercel para o feedback funcionar
- Horarios de medalhas Madrugador/Corujao sao calculados em horario de Brasilia (UTC-3)
