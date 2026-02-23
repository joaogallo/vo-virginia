# Vo Virginia

App web de pratica de matematica para criancas de 6 a 11 anos (Ensino Fundamental I).

As operacoes aparecem em cartas estilo baralho com numeros grandes, acompanhadas de um avatar animado. A crianca responde usando um teclado virtual e recebe feedback visual imediato de acerto ou erro.

## Funcionalidades

- **4 operacoes**: adicao, subtracao, multiplicacao e divisao (tabuadas de 0 a 10)
- **Carta estilo baralho**: primeiro numero no topo, operacao ao centro-direita, segundo numero na base
- **Teclado virtual**: botoes grandes para dedos infantis, com backspace e limpar
- **Feedback visual e sonoro**: animacoes Lottie de acerto (confete + flip) e erro (shake), efeitos sonoros
- **Retentativas**: limite configuravel (padrao 5) antes de avancar
- **Cronometro**: tempo por questao em segundos, reinicia em nova operacao
- **Persistencia de sessao**: salva progresso a cada resposta, recupera sessoes interrompidas
- **Estatisticas avancadas**: graficos de evolucao de precisao (Recharts), tempo medio por operacao, ranking de melhores sessoes, filtro por periodo (7d/30d/tudo), exportacao em PDF
- **Sistema de medalhas**: 17 medalhas em 6 categorias com 3 niveis (Bronze, Prata, Ouro), verificadas automaticamente apos cada sessao
- **Formulario de feedback**: envio de sugestoes, bugs e elogios por email via Resend
- **Autenticacao**: email/senha, Google e Microsoft
- **Painel de pais/professores**: acompanhar progresso das criancas vinculadas
- **Vinculacao pai-filho**: sistema de codigos para vincular contas de adultos e criancas
- **Social e multiplayer**: sistema de amizade por codigo, desafios entre amigos em tempo real, quadro de lideres
- **Desafios com amigos**: criar desafios diretamente pela pagina de Desafios, aceitar/recusar convites, resultados com placar
- **PWA**: suporte offline via service worker (Serwist)
- **LGPD**: termos de uso e politica de privacidade
- **Responsivo**: funciona em celular, tablet e desktop

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS v4 |
| Animacoes | Framer Motion + Lottie |
| Graficos | Recharts |
| Estado | Zustand |
| Auth | NextAuth.js v5 |
| ORM | Prisma 6 |
| Banco | PostgreSQL (Neon) |
| Email | Resend |
| Validacao | Zod |
| Deploy | Vercel |

## Comecando

### Pre-requisitos

- Node.js 18+
- PostgreSQL (local ou Neon)

### Instalacao

```bash
# Clonar e instalar dependencias
cd vo-virginia
npm install

# Configurar variaveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais
```

### Banco de dados

```bash
# Sincronizar schema com o banco
npx prisma db push

# Gerar Prisma Client
npx prisma generate

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
  app/
    (auth)/             # Login e cadastro
    (app)/              # Rotas autenticadas
      jogar/            # Selecao e sessao de jogo
      resultado/        # Resumo da sessao com notificacao de medalhas
      estatisticas/     # Estatisticas pessoais com graficos
      medalhas/         # Galeria de medalhas conquistadas
      desafios/         # Modos de desafio (solo e amigos)
      perfil/           # Configuracoes do usuario
      amigos/           # Amizades e desafios entre amigos
      painel/           # Dashboard de pais/professores
      feedback/         # Formulario de feedback
    api/                # API REST
      sessoes/          # CRUD de sessoes e respostas
      estatisticas/     # Agregacoes de estatisticas
      medalhas/         # Consulta e verificacao de medalhas
      desafios-amigo/   # Desafios entre amigos (criar, responder, progresso)
      amizades/         # Gerenciamento de amizades
      feedback/         # Envio de email de feedback
      auth/             # Registro, login, alteracao de senha
      perfil/           # Perfil do usuario
      filhos/           # Listagem de criancas vinculadas
      vincular/         # Vinculacao pai-filho por codigo
      grupos/           # Grupos de criancas
  components/
    game/               # Carta, teclado, avatar, timer, resumo
    challenge/          # Modos de desafio solo e multiplayer
    medals/             # Notificacao de medalhas
    stats/              # Graficos, filtros, ranking, sessoes
    dashboard/          # Componentes do painel
    groups/             # Gerenciador de grupos
    notifications/      # Sino e dropdown de notificacoes
  lib/
    game-engine.ts      # Logica matematica (core)
    auth.ts             # Configuracao NextAuth
    prisma.ts           # Singleton Prisma
    medals.ts           # Definicoes de medalhas (17 medalhas, 6 categorias)
    medal-checker.ts    # Logica de verificacao de medalhas (14 checkers)
    stats-calculator.ts # Calculo de estatisticas agregadas
    session-storage.ts  # Persistencia de sessao em localStorage
    validators.ts       # Schemas Zod
  stores/
    game-store.ts       # Estado do jogo (Zustand)
  hooks/
    useSessionPersistence.ts  # Sync incremental com backend
  types/                # Tipos TypeScript
prisma/
  schema.prisma         # Schema do banco de dados
docs/
  plano-medalhas.md     # Plano detalhado do sistema de medalhas
```

## Logica Matematica

Portada fielmente do app Python original:

- **Adicao/Multiplicacao**: formato direto (`x + y`, `x * y`)
- **Subtracao**: formato reverso `(x+y) - x = y` -- garante resultado nunca negativo
- **Divisao**: formato reverso `(x*y) / x = y` -- garante resultado sempre inteiro
- **Fila**: questoes erradas sao reinseridas no inicio da fila para revisao posterior
- **Divisao por zero**: combinacoes com `x = 0` sao automaticamente ignoradas

## Sistema de Medalhas

17 medalhas organizadas em 6 categorias:

| Categoria | Medalhas | Niveis |
|-----------|----------|--------|
| Precisao | Atirador Certeiro, Sessao Perfeita, Mestre da Precisao | Bronze/Prata/Ouro |
| Volume e Dedicacao | Maratonista, Frequentador, Chama Acesa | Bronze/Prata/Ouro |
| Dominio por Operacao | Mestre da Adicao/Subtracao/Multiplicacao/Divisao, Genio Completo | Bronze/Prata/Ouro |
| Velocidade | Raio, Sessao Veloz | Bronze/Prata/Ouro |
| Superacao | Persistente | Bronze/Prata/Ouro |
| Especiais | Primeira Vez, Explorador, Madrugador, Corujao | Nivel unico |

As medalhas sao verificadas automaticamente apos cada sessao completa. Detalhes completos em `docs/plano-medalhas.md`.

## Variaveis de Ambiente

```env
DATABASE_URL="postgresql://user:password@localhost:5432/vo_virginia"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="gerar-com-openssl-rand-base64-32"

# OAuth (opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
MICROSOFT_CLIENT_ID=""
MICROSOFT_CLIENT_SECRET=""

# Email (Resend)
RESEND_API_KEY=""
```

## Deploy

Deploy recomendado no Vercel:

1. Conectar repositorio GitHub ao Vercel
2. Configurar variaveis de ambiente no painel do Vercel
3. Apontar `DATABASE_URL` para Neon PostgreSQL
4. Deploy automatico a cada push

## Licenca

MIT
