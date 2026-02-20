# Roadmap — Vó Virgínia

## v0.1.0 — MVP (Concluído)

- [x] Projeto Next.js com TypeScript e Tailwind CSS
- [x] Game engine portado fielmente do Python
- [x] Carta estilo baralho com números grandes
- [x] Teclado virtual com backspace e clear
- [x] Feedback visual de acerto/erro com animações
- [x] Cronômetro por questão (reinicia em nova questão)
- [x] Sistema de retentativas configurável (padrão 5)
- [x] Seleção de operações e números a cada sessão
- [x] Seletor de quantidade de questões (slider min 1, max total)
- [x] Resumo de sessão com estatísticas
- [x] Autenticação (email/senha, Google, Microsoft)
- [x] Perfil do usuário com configuração de tentativas
- [x] Página de estatísticas pessoais
- [x] Dashboard de pais/professores
- [x] Vinculação pai-filho por código (bidirecional, múltiplos adultos)
- [x] Vinculação de adultos pelo perfil da criança
- [x] Alteração de senha e criação de senha para usuários OAuth
- [x] API REST completa (sessões, respostas, estatísticas, filhos, perfil, vincular)
- [x] Prisma schema com todos os modelos
- [x] Imagem da Vó Virgínia na landing page e telas de jogo
- [x] Layout responsivo com imagem decorativa à direita (desktop)
- [x] Deploy no Vercel com Neon PostgreSQL
- [x] Build compilando sem erros

## v0.2.0 — Avatar Lottie e Sons

- [x] Substituir imagem estática por animações Lottie
- [x] Animação Lottie de confete (substituir implementação CSS atual)
- [x] Efeitos sonoros de acerto/erro (com toggle para silenciar)
- [x] Som de comemoração ao completar sessão
- [x] Animação de transição entre questões mais elaborada

## v0.3.0 — Persistência e Recuperação

- [x] Salvar estado da sessão em `localStorage` a cada resposta
- [x] Recuperar sessão interrompida ao abrir o app
- [x] Enviar respostas ao backend periodicamente (não só ao final)
- [x] Indicador de "salvando..." durante envio

## v0.4.0 — Estatísticas Avançadas

- [ ] Gráfico de evolução de precisão ao longo do tempo (Recharts)
- [ ] Gráfico de tempo médio por operação
- [ ] Filtro por período (7 dias, 30 dias, todos)
- [ ] Exportar estatísticas em PDF para pais/professores
- [ ] Ranking pessoal (melhores sessões)

## v0.5.0 — Gamificação

- [ ] Sistema de conquistas/medalhas (ex: "10 acertos seguidos", "Mestre da divisão")
- [ ] Nível/XP do jogador com barra de progresso
- [ ] Sequência diária (streak) com recompensa visual
- [ ] Avatar customizável (escolher personagem, cor)
- [ ] Loja virtual de itens cosméticos com moedas ganhas

## v0.6.0 — Acessibilidade e i18n

- [ ] Auditoria completa de acessibilidade (WCAG 2.1 AA)
- [ ] Navegação por teclado em todos os componentes
- [ ] Labels de screen reader em português
- [ ] Modo alto contraste
- [ ] Suporte a modo escuro (opcional, tema claro é padrão para crianças)
- [ ] Internacionalização (i18n) para inglês e espanhol

## v0.7.0 — Testes

- [ ] Testes unitários do game-engine (Vitest)
- [ ] Testes de componentes com React Testing Library
- [ ] Testes E2E dos fluxos críticos (Playwright)
- [ ] CI/CD com GitHub Actions (lint + test + build)
- [ ] Coverage mínimo de 80% no game-engine

## v0.8.0 — Modo Desafio

- [ ] Modo contra o tempo (resolver X questões em Y segundos)
- [ ] Modo maratona (questões infinitas, ver até onde vai)
- [ ] Modo revisão (foco em questões que mais errou)
- [ ] Histórico de modos completados

## v0.9.0 — Social e Multiplayer

- [ ] Desafio entre amigos (gerar link, competir em tempo real)
- [ ] Quadro de líderes da turma (professor cria sala)
- [ ] Compartilhar conquistas
- [ ] Notificações para pais quando criança completar sessão

## v1.0.0 — Lançamento

- [ ] PWA (Progressive Web App) com suporte offline
- [ ] Favicon e ícones do app customizados
- [ ] Open Graph e SEO otimizados para landing page
- [ ] Domínio personalizado
- [ ] Termos de uso e política de privacidade (LGPD)
- [ ] Documentação completa para contribuidores
