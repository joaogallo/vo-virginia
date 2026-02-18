# Vó Virgínia

App web de prática de matemática para crianças de 6-11 anos (Ensino Fundamental I). Portado de um CLI Python para Next.js com autenticação, estatísticas e painel para pais/professores.

**Acesse:** [vo-virginia.vercel.app](https://vo-virginia.vercel.app)

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Estilo**: Tailwind CSS v4 + fontes Nunito/Baloo 2
- **Animações**: Framer Motion
- **Estado**: Zustand (game state no cliente)
- **Auth**: NextAuth.js v5 (credentials, Google, Microsoft Entra ID)
- **ORM**: Prisma 6 + PostgreSQL (Neon)
- **Deploy**: Vercel

## Funcionalidades

- Prática de adição, subtração, multiplicação e divisão
- Seleção de operações, números e quantidade de questões por sessão
- Formato reverso para subtração e divisão (evita negativos e decimais)
- Sistema de retentativas configurável (padrão 5)
- Feedback visual com animações e confete
- Cronômetro por questão
- Resumo de sessão com estatísticas
- Autenticação por email/senha, Google e Microsoft
- Perfil com configurações pessoais
- Vinculação de crianças a múltiplos adultos (pais e professores) via código
- Dashboard de pais/professores com estatísticas por criança
- Imagem decorativa da Vó Virgínia nas telas de jogo
- Layout responsivo (mobile e desktop)

## Desenvolvimento

```bash
cd vo-virginia
npm install
npx prisma generate
npm run dev
```

Variáveis de ambiente necessárias em `.env.local`:

```env
DATABASE_URL=
AUTH_SECRET=
AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
```

## Licença

MIT
