# Vó Virgínia — Guia para o Claude Code

## Visão Geral

App web responsivo de prática de matemática para crianças de 6-11 anos (Ensino Fundamental I). Portado de um CLI Python para Next.js com autenticação, estatísticas e painel para pais/professores.

**Produção:** [vo-virginia.vercel.app](https://vo-virginia.vercel.app)

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Estilo**: Tailwind CSS v4 + fontes Nunito/Baloo 2
- **Animações**: Framer Motion
- **Estado**: Zustand (game state no cliente)
- **Auth**: NextAuth.js v5 (credentials, Google, Microsoft Entra ID)
- **ORM**: Prisma 6 + PostgreSQL (Neon)
- **Deploy**: Vercel (org: joaogallos-projects-bfdd3046)

## Comandos

```bash
npm run dev          # Dev server em localhost:3000
npm run build        # Build de produção (inclui prisma generate)
npm run lint         # ESLint
npx prisma generate  # Gerar Prisma Client
npx prisma migrate dev --name <nome>  # Criar migration
npx prisma studio    # Interface visual do banco
```

## Arquitetura

### Lógica do Jogo (`src/lib/game-engine.ts`)

Este é o arquivo mais crítico. Porta fielmente a lógica do Python original:

- **Geração**: Produto cartesiano `operações × números × [0..10]`, embaralhado (Fisher-Yates)
- **Subtração**: Formato reverso `(x+y) - x = y` — evita resultados negativos
- **Divisão**: Formato reverso `(x*y) / x = y` — evita decimais. Pula quando `x = 0`
- **Fila**: `pop()` do final, erros reinseridos no início (`index 0`)
- **Retentativas**: Configurável (`maxRetries`, padrão 5). Esgotou → reinsere na fila e avança
- **Limite de questões**: Parâmetro opcional `maxQuestions` que fatia a fila embaralhada

Qualquer alteração neste arquivo deve preservar o comportamento da fila e dos formatos reversos.

### Estado do Jogo (`src/stores/game-store.ts`)

Zustand store com todo o estado da sessão de jogo. O motor roda **inteiramente no cliente** — respostas são enviadas ao backend via API ao final da sessão.

Inclui `questionLimit` para o seletor de quantidade na tela de setup.

### Rotas do App

Rotas usam **português** (público-alvo brasileiro). Código interno em inglês.

- Route groups: `(auth)` para login/cadastro, `(app)` para rotas autenticadas
- `(app)/layout.tsx` contém o header com navegação
- `(app)/jogar/layout.tsx` posiciona a imagem da Vó Virgínia à direita (desktop)
- Middleware em `src/middleware.ts` protege rotas por autenticação e role

### Imagens

- `src/media/vo-transparente.png` — Usada nas telas de jogo (layout à direita em desktop)
- `src/media/vo-netos.png` — Usada na landing page

### Banco de Dados

Schema em `prisma/schema.prisma`. Modelos principais:

- `User` (com `role`: CHILD/PARENT/TEACHER e `maxRetries` configurável)
- `ParentChild` (vinculação muitos-para-muitos entre crianças e adultos)
- `GameSession` (operações, números, contadores, timestamps)
- `Answer` (cada tentativa individual com tempo gasto)

### Autenticação

Config em `src/lib/auth.ts`. Usa JWT strategy (necessário para credentials provider). Callbacks injetam `id` e `role` no token/session.

- `basePath: "/api/auth"` é obrigatório (NextAuth v5 default é `/auth`)
- `trustHost: true` para funcionar no Vercel
- `allowDangerousEmailAccountLinking: true` nos providers OAuth
- Middleware usa `getToken()` de `next-auth/jwt` (leve, para Edge)
- Cookie names: `authjs.session-token` / `__Secure-authjs.session-token`
- `AUTH_URL` no Vercel deve ser `https://vo-virginia.vercel.app`

API de registro em `src/app/api/auth/register/route.ts` — cria hash bcrypt, gera `linkCode` para pais/professores.

### Vinculação de Adultos

- Adultos (pais/professores) recebem `linkCode` ao se cadastrar, visível no perfil
- Crianças podem vincular adultos via `/api/vincular` usando o linkCode
- Suporta múltiplos adultos por criança
- A criança também pode vincular durante o cadastro (campo opcional)

## Convenções

- Componentes do jogo em `src/components/game/`
- Validação de API com Zod (`src/lib/validators.ts`)
- Tipos em `src/types/game.ts` e `src/types/next-auth.d.ts`
- Constantes de operações em `src/constants/operations.ts`
- Hooks customizados em `src/hooks/`

## Notas Importantes

- O middleware usa a convention `middleware.ts` (Next.js 16 sugere migrar para `proxy`).
- Não há testes ainda — priorizar testes do game-engine.
- As fontes `font-sans` (Nunito) e `font-display` (Baloo 2) são definidas via CSS custom properties no `globals.css`.
