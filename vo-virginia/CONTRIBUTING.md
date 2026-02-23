# Contribuindo para o Vó Virgínia

Obrigado pelo interesse em contribuir! Este guia explica como configurar o ambiente local e o fluxo de contribuição.

## Pré-requisitos

- Node.js 18+
- npm 9+
- PostgreSQL (ou uma instância [Neon](https://neon.tech) gratuita)

## Configuração Local

1. Clone o repositório:

```bash
git clone https://github.com/joaogallo/vo-virginia.git
cd vo-virginia/vo-virginia
```

2. Instale as dependências:

```bash
npm install
```

3. Crie o arquivo `.env.local` na raiz do projeto (`vo-virginia/vo-virginia/.env.local`):

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="gere-com-openssl-rand-base64-32"
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
AUTH_MICROSOFT_ID="..."
AUTH_MICROSOFT_SECRET="..."
RESEND_API_KEY="..."
```

4. Aplique o schema do banco de dados:

```bash
npx prisma db push
```

5. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O app estará disponível em `http://localhost:3000`.

## Estrutura do Projeto

```
vo-virginia/
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── public/                    # Arquivos estáticos (ícones, manifest, robots.txt)
├── src/
│   ├── app/
│   │   ├── (app)/             # Rotas autenticadas (jogar, perfil, painel, etc.)
│   │   ├── api/               # API Routes (REST)
│   │   ├── layout.tsx         # Layout raiz
│   │   └── page.tsx           # Landing page
│   ├── components/            # Componentes React
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilitários (auth, prisma, game-engine, validators)
│   ├── media/                 # Imagens e assets
│   └── stores/                # Zustand stores
├── tests/                     # Testes unitários e de componentes
└── e2e/                       # Testes E2E (Playwright)
```

## Stack Tecnológica

- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript (strict mode)
- **Estilização:** Tailwind CSS v4
- **Banco de dados:** PostgreSQL (Neon) via Prisma 6
- **Autenticação:** NextAuth.js v5 (JWT)
- **Animações:** Framer Motion, Lottie
- **Gráficos:** Recharts
- **Testes:** Vitest + React Testing Library + Playwright
- **Deploy:** Vercel

## Testes

```bash
# Testes unitários e de componentes
npm test

# Testes com watch mode
npm run test:watch

# Cobertura de código
npm run test:coverage

# Testes E2E
npm run test:e2e
```

## Padrões de Código

- ESLint configurado com `eslint-config-next`
- Componentes de página em `src/app/(app)/` (client components com `"use client"`)
- API routes em `src/app/api/` (server-side)
- Validação de input com Zod (`src/lib/validators.ts`)
- Autenticação verificada com `auth()` de `@/lib/auth`
- Prisma Client via singleton `prisma` de `@/lib/prisma`

## Fluxo de Contribuição

1. Faça um fork do repositório
2. Crie uma branch: `git checkout -b minha-feature`
3. Faça suas alterações
4. Execute lint e testes: `npm run lint && npm test`
5. Verifique o build: `npm run build`
6. Commit: `git commit -m "Descrição da alteração"`
7. Push: `git push origin minha-feature`
8. Abra um Pull Request
