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

## v0.3.0 — Persistência e Recuperação (Concluído)

- [x] Salvar estado da sessão em `localStorage` a cada resposta
- [x] Recuperar sessão interrompida ao abrir o app
- [x] Enviar respostas ao backend periodicamente (não só ao final)
- [x] Indicador de "salvando..." durante envio

## v0.4.0 — Estatísticas Avançadas (Concluído)

- [x] Gráfico de evolução de precisão ao longo do tempo (Recharts)
- [x] Gráfico de tempo médio por operação
- [x] Filtro por período (7 dias, 30 dias, todos)
- [x] Exportar estatísticas em PDF para pais/professores
- [x] Ranking pessoal (melhores sessões)

## v0.5.0 — Gamificação

- [x] Sistema de conquistas/medalhas (17 medalhas em 6 categorias, 3 níveis)
- [x] Sequência diária (streak) com recompensa visual (medalha Chama Acesa)
- [ ] Nível/XP do jogador com barra de progresso
- [ ] Avatar customizável (escolher personagem, cor)

## v0.5.1 — Feedback (Concluído)

- [x] Página de feedback com formulário (tipo + mensagem)
- [x] Envio de email via Resend para vo-virginia@habitushealth.com.br
- [x] Link "Feedback" no menu de navegação

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

---

## Backlog

- [ ] Loja virtual de itens cosméticos com moedas ganhas
