# Vó Virgínia

App web de prática de matemática para crianças de 6 a 11 anos (Ensino Fundamental I).

As operações aparecem em cartas estilo baralho com números grandes, acompanhadas de um avatar animado. A criança responde usando um teclado virtual e recebe feedback visual imediato de acerto ou erro.

## Funcionalidades

- **4 operações**: adição, subtração, multiplicação e divisão
- **Carta estilo baralho**: primeiro número no topo, operação ao centro-direita, segundo número na base
- **Teclado virtual**: botões grandes para dedos infantis, com backspace e limpar
- **Feedback visual**: animações de acerto (confete + flip) e erro (shake)
- **Retentativas**: limite configurável (padrão 5) antes de avançar
- **Cronômetro**: tempo por questão em segundos, reinicia em nova operação
- **Autenticação**: email/senha, Google e Microsoft
- **Estatísticas**: operações realizadas, acertos, erros, tempo de uso
- **Painel de pais/professores**: acompanhar progresso das crianças vinculadas
- **Responsivo**: funciona em celular, tablet e desktop

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS v4 |
| Animações | Framer Motion |
| Estado | Zustand |
| Auth | NextAuth.js v5 |
| ORM | Prisma 6 |
| Banco | PostgreSQL |
| Deploy | Vercel |

## Começando

### Pré-requisitos

- Node.js 18+
- PostgreSQL (local ou Vercel Postgres / Neon)

### Instalação

```bash
# Clonar e instalar dependências
cd vo-virginia
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com DATABASE_URL e AUTH_SECRET
```

### Banco de dados

```bash
# Gerar Prisma Client
npx prisma generate

# Criar tabelas (primeira vez)
npx prisma migrate dev --name init

# Interface visual do banco (opcional)
npx prisma studio
```

### Rodar

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Estrutura do Projeto

```
src/
├── app/                    # Rotas do Next.js (App Router)
│   ├── (auth)/             # Login e cadastro
│   ├── (app)/              # Rotas autenticadas
│   │   ├── jogar/          # Seleção e sessão de jogo
│   │   ├── resultado/      # Resumo da sessão
│   │   ├── perfil/         # Configurações do usuário
│   │   ├── estatisticas/   # Estatísticas pessoais
│   │   └── painel/         # Dashboard de pais/professores
│   └── api/                # API REST
├── components/
│   ├── game/               # Carta, teclado, avatar, timer, etc.
│   ├── dashboard/          # Componentes do painel
│   └── ui/                 # Componentes reutilizáveis
├── lib/
│   ├── game-engine.ts      # Lógica matemática (core)
│   ├── auth.ts             # Configuração NextAuth
│   └── prisma.ts           # Singleton Prisma
├── stores/
│   └── game-store.ts       # Estado do jogo (Zustand)
├── hooks/                  # Hooks customizados
├── types/                  # Tipos TypeScript
└── constants/              # Constantes de operações
```

## Lógica Matemática

Portada fielmente do app Python original:

- **Adição/Multiplicação**: formato direto (`x + y`, `x × y`)
- **Subtração**: formato reverso `(x+y) - x = y` — garante resultado nunca negativo
- **Divisão**: formato reverso `(x*y) / x = y` — garante resultado sempre inteiro
- **Fila**: questões erradas são reinseridas no início da fila para revisão posterior
- **Divisão por zero**: combinações com `x = 0` são automaticamente ignoradas

## Variáveis de Ambiente

```env
DATABASE_URL="postgresql://user:password@localhost:5432/vo_virginia"
AUTH_SECRET="gerar-com-openssl-rand-base64-32"

# OAuth (opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
MICROSOFT_CLIENT_ID=""
MICROSOFT_CLIENT_SECRET=""
```

## Deploy

Deploy recomendado no Vercel:

1. Conectar repositório GitHub ao Vercel
2. Configurar variáveis de ambiente no painel do Vercel
3. Adicionar Vercel Postgres (ou apontar para Neon/Supabase)
4. Deploy automático a cada push

## Licença

MIT
