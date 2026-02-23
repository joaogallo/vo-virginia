import Link from "next/link"

export const metadata = {
  title: "Termos de Uso — Vó Virgínia",
  description: "Termos de uso do aplicativo Vó Virgínia",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-display text-xl font-bold text-gray-800 mb-3">{title}</h2>
      {children}
    </section>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-600 leading-relaxed mb-3">{children}</p>
}

export default function TermosDeUsoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-2xl text-gray-400 hover:text-gray-600">&larr;</Link>
          <h1 className="font-display text-xl font-bold text-gray-800">Termos de Uso</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <p className="text-sm text-gray-400 mb-6">Última atualização: fevereiro de 2026</p>

          <Section title="1. Aceitação dos Termos">
            <P>
              Ao acessar ou utilizar o aplicativo Vó Virgínia (&ldquo;Serviço&rdquo;), você concorda
              com estes Termos de Uso. Se você não concordar, não utilize o Serviço.
            </P>
            <P>
              No caso de usuários menores de idade, o responsável legal deve ler e aceitar estes
              termos em nome da criança antes de permitir o uso do Serviço.
            </P>
          </Section>

          <Section title="2. Descrição do Serviço">
            <P>
              O Vó Virgínia é um aplicativo educacional gratuito voltado para a prática de operações
              matemáticas fundamentais (adição, subtração, multiplicação e divisão) por crianças do
              Ensino Fundamental 1. O Serviço inclui sessões de prática, modos de desafio, sistema
              de medalhas, estatísticas de desempenho, funcionalidades sociais (amizades e desafios
              entre amigos) e acompanhamento por pais e professores.
            </P>
          </Section>

          <Section title="3. Cadastro e Conta">
            <P>
              Para utilizar o Serviço, é necessário criar uma conta informando nome, e-mail e senha,
              ou utilizar autenticação via Google ou Microsoft. Você é responsável por manter a
              confidencialidade de suas credenciais e por todas as atividades realizadas em sua conta.
            </P>
            <P>
              Contas de crianças (perfil &ldquo;Criança&rdquo;) podem ser vinculadas a contas de
              responsáveis (perfil &ldquo;Pai/Mãe&rdquo; ou &ldquo;Professor(a)&rdquo;), que terão
              acesso às estatísticas e poderão gerenciar configurações sociais da criança.
            </P>
          </Section>

          <Section title="4. Uso para Menores de Idade">
            <P>
              O Vó Virgínia destina-se a crianças de 6 a 11 anos. Em conformidade com a Lei Geral de
              Proteção de Dados (LGPD), o tratamento de dados pessoais de crianças será realizado com
              o consentimento específico de pelo menos um dos pais ou responsável legal, conforme
              Art. 14 da Lei 13.709/2018.
            </P>
            <P>
              Funcionalidades sociais (amizades e desafios) para crianças vinculadas a um responsável
              somente são habilitadas com autorização expressa do responsável.
            </P>
          </Section>

          <Section title="5. Conduta do Usuário">
            <P>
              Ao utilizar o Serviço, você concorda em não utilizar o aplicativo para qualquer
              finalidade ilícita, não tentar acessar dados de outros usuários sem autorização, não
              interferir no funcionamento do Serviço e não compartilhar conteúdo ofensivo ou
              inadequado.
            </P>
          </Section>

          <Section title="6. Propriedade Intelectual">
            <P>
              Todo o conteúdo do Vó Virgínia — incluindo textos, imagens, animações, código-fonte,
              logotipos e design — é protegido por direitos autorais e pertence aos seus respectivos
              titulares. O uso do Serviço não confere ao usuário qualquer direito de propriedade
              sobre o conteúdo.
            </P>
          </Section>

          <Section title="7. Disponibilidade e Modificações">
            <P>
              O Serviço é fornecido &ldquo;como está&rdquo;, sem garantias de disponibilidade
              ininterrupta. Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer
              funcionalidade a qualquer momento, com ou sem aviso prévio.
            </P>
            <P>
              Estes Termos podem ser atualizados periodicamente. Alterações significativas serão
              comunicadas no aplicativo. O uso continuado do Serviço após as alterações constitui
              aceitação dos novos termos.
            </P>
          </Section>

          <Section title="8. Limitação de Responsabilidade">
            <P>
              O Vó Virgínia é uma ferramenta de apoio educacional e não substitui a instrução
              pedagógica formal. Não nos responsabilizamos por resultados educacionais específicos
              decorrentes do uso do aplicativo. Em nenhuma hipótese seremos responsáveis por danos
              indiretos, incidentais ou consequenciais.
            </P>
          </Section>

          <Section title="9. Legislação Aplicável">
            <P>
              Estes Termos são regidos pela legislação brasileira. Qualquer disputa será submetida
              ao foro da comarca de São Paulo, SP, com exclusão de qualquer outro.
            </P>
          </Section>

          <Section title="10. Contato">
            <P>
              Em caso de dúvidas sobre estes Termos, entre em contato pelo e-mail:{" "}
              <a href="mailto:vo-virginia@habitushealth.com.br" className="text-green-600 hover:underline">
                vo-virginia@habitushealth.com.br
              </a>
            </P>
          </Section>
        </div>

        <div className="text-center py-8">
          <Link
            href="/"
            className="text-green-600 font-semibold hover:underline"
          >
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </main>
  )
}
