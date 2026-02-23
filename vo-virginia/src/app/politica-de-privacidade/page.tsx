import Link from "next/link"

export const metadata = {
  title: "Política de Privacidade — Vó Virgínia",
  description: "Política de privacidade do aplicativo Vó Virgínia, em conformidade com a LGPD",
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

export default function PoliticaDePrivacidadePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-2xl text-gray-400 hover:text-gray-600">&larr;</Link>
          <h1 className="font-display text-xl font-bold text-gray-800">Política de Privacidade</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <p className="text-sm text-gray-400 mb-6">Última atualização: fevereiro de 2026</p>

          <P>
            Esta Política de Privacidade descreve como o aplicativo Vó Virgínia
            (&ldquo;Serviço&rdquo;) coleta, utiliza, armazena e protege os dados pessoais de seus
            usuários, em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei
            13.709/2018 — LGPD).
          </P>

          <Section title="1. Dados Coletados">
            <P>Coletamos os seguintes dados pessoais:</P>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-2 mb-3">
              <li><strong>Dados de cadastro:</strong> nome, endereço de e-mail e senha (ou dados de autenticação via Google/Microsoft)</li>
              <li><strong>Dados de uso:</strong> sessões de prática (operações, respostas, tempo, taxa de acerto), medalhas conquistadas, configurações do perfil</li>
              <li><strong>Dados de vinculação:</strong> relação entre contas de crianças e responsáveis/professores</li>
              <li><strong>Dados sociais:</strong> lista de amigos, desafios realizados, participação em grupos</li>
            </ul>
            <P>
              Não coletamos dados sensíveis (origem racial, convicções religiosas, dados de saúde
              etc.) nem dados de geolocalização.
            </P>
          </Section>

          <Section title="2. Finalidade do Tratamento">
            <P>Os dados coletados são utilizados para:</P>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-2 mb-3">
              <li>Fornecer e manter o funcionamento do Serviço</li>
              <li>Registrar e exibir estatísticas de desempenho ao usuário e seus responsáveis</li>
              <li>Possibilitar funcionalidades sociais (amizades, desafios, grupos)</li>
              <li>Enviar notificações dentro do aplicativo (conclusão de sessão, medalhas, desafios)</li>
              <li>Permitir o acompanhamento por pais e professores</li>
              <li>Melhorar a experiência do usuário e o funcionamento do Serviço</li>
            </ul>
          </Section>

          <Section title="3. Base Legal">
            <P>
              O tratamento de dados pessoais é realizado com base no consentimento do titular
              (Art. 7º, I da LGPD) e no legítimo interesse do controlador para a prestação do
              Serviço (Art. 7º, IX da LGPD).
            </P>
            <P>
              Para dados de crianças (menores de 12 anos), o tratamento é realizado com o
              consentimento específico de pelo menos um dos pais ou responsável legal, conforme
              Art. 14 da LGPD.
            </P>
          </Section>

          <Section title="4. Compartilhamento de Dados">
            <P>
              Seus dados pessoais não são vendidos, alugados ou compartilhados com terceiros para
              fins comerciais. Os dados são compartilhados apenas com:
            </P>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-2 mb-3">
              <li><strong>Vercel:</strong> hospedagem da aplicação</li>
              <li><strong>Neon:</strong> banco de dados PostgreSQL</li>
              <li><strong>Resend:</strong> envio de e-mails transacionais (feedback)</li>
              <li><strong>Google/Microsoft:</strong> autenticação OAuth (quando o usuário opta por este método)</li>
            </ul>
            <P>
              Esses provedores atuam como operadores de dados e estão sujeitos a suas respectivas
              políticas de privacidade e medidas de segurança.
            </P>
          </Section>

          <Section title="5. Dados de Menores">
            <P>
              O Vó Virgínia é destinado a crianças de 6 a 11 anos. Em conformidade com o Art. 14
              da LGPD:
            </P>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-2 mb-3">
              <li>O cadastro de crianças deve ser realizado ou supervisionado pelo responsável legal</li>
              <li>Funcionalidades sociais só são habilitadas com autorização do responsável vinculado</li>
              <li>Coletamos apenas os dados estritamente necessários para o funcionamento do Serviço</li>
              <li>Os dados da criança são acessíveis ao responsável vinculado a qualquer momento</li>
            </ul>
          </Section>

          <Section title="6. Direitos do Titular">
            <P>
              Em conformidade com a LGPD, você tem direito a:
            </P>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-2 mb-3">
              <li><strong>Acesso:</strong> consultar quais dados pessoais são tratados</li>
              <li><strong>Correção:</strong> solicitar a correção de dados incompletos ou incorretos</li>
              <li><strong>Eliminação:</strong> solicitar a exclusão dos dados pessoais tratados com base no consentimento</li>
              <li><strong>Portabilidade:</strong> solicitar a transferência dos dados a outro fornecedor</li>
              <li><strong>Revogação do consentimento:</strong> retirar o consentimento a qualquer momento</li>
              <li><strong>Informação:</strong> ser informado sobre o compartilhamento de dados</li>
            </ul>
            <P>
              Para exercer qualquer desses direitos, entre em contato pelo e-mail indicado ao final
              desta política.
            </P>
          </Section>

          <Section title="7. Armazenamento e Segurança">
            <P>
              Os dados são armazenados em servidores seguros (Neon PostgreSQL) com criptografia em
              trânsito (HTTPS/TLS). Senhas são armazenadas com hash bcrypt. Adotamos medidas
              técnicas e organizacionais para proteger os dados contra acesso não autorizado,
              alteração, divulgação ou destruição.
            </P>
          </Section>

          <Section title="8. Retenção de Dados">
            <P>
              Os dados pessoais são mantidos enquanto a conta do usuário estiver ativa. Ao solicitar
              a exclusão da conta, os dados serão removidos em até 30 dias, exceto quando houver
              obrigação legal de retenção.
            </P>
          </Section>

          <Section title="9. Cookies e Tecnologias Similares">
            <P>
              O Serviço utiliza cookies essenciais para autenticação e manutenção da sessão do
              usuário. Não utilizamos cookies de rastreamento ou publicidade.
            </P>
          </Section>

          <Section title="10. Alterações nesta Política">
            <P>
              Esta política pode ser atualizada periodicamente. Alterações significativas serão
              comunicadas no aplicativo. A data da última atualização é indicada no topo desta página.
            </P>
          </Section>

          <Section title="11. Contato do Controlador">
            <P>
              Para dúvidas, solicitações ou exercício de direitos relacionados à proteção de dados,
              entre em contato:
            </P>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700 text-sm">
                <strong>Vó Virgínia</strong><br />
                E-mail:{" "}
                <a href="mailto:vo-virginia@habitushealth.com.br" className="text-green-600 hover:underline">
                  vo-virginia@habitushealth.com.br
                </a>
              </p>
            </div>
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
