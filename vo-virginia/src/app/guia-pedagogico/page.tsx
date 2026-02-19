import Link from "next/link"

export const metadata = {
  title: "Guia Pedagógico — Vó Virgínia",
  description: "Como usar o Vó Virgínia dentro das melhores práticas de ensino de matemática no Ensino Fundamental 1",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-display text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      {children}
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="font-display text-lg font-bold text-gray-700 mb-2">{title}</h3>
      {children}
    </div>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-600 leading-relaxed mb-3">{children}</p>
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-xl mb-4">
      <p className="text-green-800 text-sm font-semibold">{children}</p>
    </div>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl mb-4">
      <p className="text-yellow-800 text-sm">{children}</p>
    </div>
  )
}

export default function GuiaPedagogicoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-2xl text-gray-400 hover:text-gray-600">&larr;</Link>
          <h1 className="font-display text-xl font-bold text-gray-800">Guia Pedagógico</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Intro */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="text-center mb-6">
            <span className="text-5xl">📚</span>
            <h1 className="font-display text-3xl font-bold text-gray-800 mt-3">
              Vó Virgínia na Sala de Aula e em Casa
            </h1>
            <p className="text-gray-500 mt-2">
              Como usar o aplicativo dentro das melhores práticas de ensino de matemática no Ensino Fundamental 1
            </p>
          </div>

          <P>
            O Vó Virgínia é um aplicativo de prática de fatos fundamentais da matemática (adição, subtração, multiplicação e divisão) voltado para crianças de 6 a 10 anos. Ele permite que a criança pratique as quatro operações com números de 0 a 10, com sessões configuráveis, feedback visual imediato, sistema de tentativas e acompanhamento por pais e professores.
          </P>
          <Highlight>
            O aplicativo não substitui a instrução conceitual feita pelo professor ou pela família. Ele é uma ferramenta de prática deliberada — a etapa em que a criança, já tendo compreendido o significado da operação, consolida esse conhecimento até alcançar a automaticidade.
          </Highlight>
        </div>

        {/* Base científica */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <Section title="Base Científica">
            <P>
              A pesquisa contemporânea em ciência cognitiva e educação matemática converge para um modelo integrado que combina compreensão conceitual e fluência procedimental. O artigo mais abrangente sobre o tema, publicado em 2025 por McNeil, Jordan, Viegut e Ansari na revista <em>Psychological Science in the Public Interest</em>, propõe um ciclo de três etapas:
            </P>

            <div className="grid gap-4 my-6">
              <div className="bg-blue-50 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">1️⃣</span>
                  <div>
                    <p className="font-display font-bold text-blue-800 mb-1">Fundamentação Conceitual</p>
                    <p className="text-blue-700 text-sm">
                      Antes de praticar que 6 &times; 8 = 48, a criança precisa entender o que significa multiplicação: 6 grupos de 8, ou 8 grupos de 6. Essa etapa acontece com materiais concretos, desenhos e discussão — fora do aplicativo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">2️⃣</span>
                  <div>
                    <p className="font-display font-bold text-green-800 mb-1">Prática Deliberada para Automaticidade</p>
                    <p className="text-green-700 text-sm">
                      Uma vez que o conceito está compreendido, a prática repetida, espaçada e cronometrada consolida o fato na memória de longo prazo. <strong>É aqui que o Vó Virgínia atua.</strong> A Teoria da Carga Cognitiva demonstra que quando fatos básicos estão automatizados, a memória de trabalho da criança fica livre para resolver problemas mais complexos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">3️⃣</span>
                  <div>
                    <p className="font-display font-bold text-purple-800 mb-1">Retorno à Reflexão</p>
                    <p className="text-purple-700 text-sm">
                      Após automatizar os fatos, a criança usa essa fluência como base para resolver problemas, perceber padrões numéricos e desenvolver raciocínio avançado — novamente em atividades que vão além do aplicativo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Highlight>
              A ciência contemporânea é clara: memorização e compreensão não são opostas — são complementares. A oposição entre &ldquo;memorizar&rdquo; e &ldquo;entender&rdquo; é uma falsa dicotomia. As crianças precisam de ambos.
            </Highlight>
          </Section>
        </div>

        {/* Recursos e conexões pedagógicas */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <Section title="Recursos do Aplicativo e Suas Conexões Pedagógicas">

            <SubSection title="Seleção de Operações e Números">
              <P>
                A criança (ou o adulto responsável) escolhe quais operações praticar (+, &minus;, &times;, &divide;) e com quais números (0 a 10). Isso permite sequenciamento progressivo, foco em fatos específicos e prática mista de operações relacionadas.
              </P>
              <Tip>
                Não tente cobrir muita coisa de uma vez. Sessões focadas em poucos fatos novos, misturados com fatos já dominados, produzem melhores resultados.
              </Tip>
            </SubSection>

            <SubSection title="Quantidade de Questões por Sessão">
              <P>
                O slider de quantidade permite definir quantas questões terá a sessão. No perfil, é possível salvar uma quantidade padrão. McNeil et al. (2025) recomendam sessões curtas e frequentes: 10 a 20 questões praticadas diariamente são mais produtivas do que 100 questões uma vez por semana.
              </P>
              <Tip>
                Para crianças do 1º e 2º ano: 10 a 15 questões. Para 3º ao 5º ano: 15 a 30 questões. O importante é manter a prática regular e espaçada.
              </Tip>
            </SubSection>

            <SubSection title="Sistema de Tentativas">
              <P>
                Quando a criança erra, ela tem oportunidade de tentar novamente (padrão: até 5 tentativas). Se esgotar as tentativas, a questão é reinserida na fila para ser praticada novamente mais adiante. Esse mecanismo implementa dois princípios fundamentais:
              </P>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-2 mb-3">
                <li><strong>Prática de recuperação:</strong> forçar a criança a buscar a resposta na memória produz retenção 2 a 3 vezes superior à simples releitura.</li>
                <li><strong>Reinserção espaçada:</strong> questões erradas voltam ao final da fila, criando um espaçamento natural antes de serem praticadas novamente.</li>
              </ul>
            </SubSection>

            <SubSection title="Feedback Visual Imediato">
              <P>
                A cada resposta, a criança recebe feedback instantâneo: confete e efeito verde para acerto; tremida e efeito vermelho para erro. A resposta correta é sempre mostrada.
              </P>
              <P>
                Diferentemente de um teste em papel, o aplicativo oferece feedback privado (só a criança vê), oportunidade imediata de retentativa e celebração dos acertos. Isso cria um ambiente de &ldquo;baixo risco&rdquo; — exatamente o tipo de prática cronometrada que a pesquisa considera benéfica.
              </P>
            </SubSection>

            <SubSection title="Timer por Questão">
              <P>
                O cronômetro mostra quanto tempo a criança leva em cada questão, com cores que mudam: verde (rápido), amarelo (moderado), vermelho (lento). A fluência aritmética não é apenas acertar — é acertar com velocidade. A definição operacional de automaticidade envolve responder corretamente em 2 a 3 segundos.
              </P>
              <Tip>
                Não pressione a criança pelo tempo. Use o timer para notar progresso: &ldquo;Na semana passada você levava 8 segundos no 7&times;8, agora leva 4!&rdquo;
              </Tip>
            </SubSection>

            <SubSection title="Operações Inversas">
              <P>
                O aplicativo usa formato inteligente para subtração e divisão. A subtração é derivada da adição (ex: se x=7 e y=8, mostra &ldquo;15 &minus; 7 = ?&rdquo;) e a divisão é derivada da multiplicação (ex: se x=8 e y=7, mostra &ldquo;56 &divide; 8 = ?&rdquo;). Isso evita resultados negativos ou decimais e reforça naturalmente a relação entre operações inversas — conceito fundamental da BNCC.
              </P>
            </SubSection>
          </Section>
        </div>

        {/* Para pais e professores */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <Section title="Recursos para Pais e Professores">
            <SubSection title="Vinculação e Acompanhamento">
              <P>
                Pais e professores podem vincular as contas das crianças usando códigos de vinculação ou e-mail. Para cada criança vinculada, o adulto pode ver: total de sessões, questões, acertos e erros; taxa de acerto geral e por operação; tempo médio por questão; e histórico de sessões recentes.
              </P>
            </SubSection>

            <SubSection title="Uso Pedagógico das Estatísticas">
              <P>As estatísticas permitem ao professor identificar:</P>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-2 mb-3">
                <li>Quais operações a criança já domina (taxa &gt; 90%)</li>
                <li>Quais operações precisam de mais prática (taxa &lt; 70%)</li>
                <li>Se a velocidade está melhorando ao longo do tempo</li>
                <li>Se a criança está praticando com regularidade (datas das sessões)</li>
              </ul>
            </SubSection>

            <SubSection title="Grupos Personalizados">
              <P>
                Professores podem organizar alunos em grupos (ex: &ldquo;Turma 3A&rdquo;, &ldquo;Grupo de Reforço&rdquo;) e filtrar as estatísticas por grupo, facilitando o acompanhamento de turmas e a identificação de alunos que precisam de intervenção.
              </P>
            </SubSection>
          </Section>
        </div>

        {/* Sugestões por ano */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <Section title="Sugestões de Uso por Ano Escolar">

            {[
              {
                year: "1º ano (6-7 anos)",
                subtitle: "Adição até 10",
                ops: "Apenas adição (+)",
                nums: "Começar com 0, 1, 2, 3. Acrescentar gradualmente 4, 5.",
                qty: "10 questões",
                retries: "5 tentativas",
                freq: "3 a 5 vezes por semana, 5 minutos",
                pre: "A criança já deve entender que somar significa juntar quantidades.",
                color: "green",
              },
              {
                year: "2º ano (7-8 anos)",
                subtitle: "Fluência em Adição e Subtração",
                ops: "Adição e subtração (+ e −)",
                nums: "Todos de 0 a 10",
                qty: "15 a 20 questões",
                retries: "3 a 5 tentativas",
                freq: "Diária, 5 a 10 minutos",
                pre: "Meta: resposta correta em 3 segundos.",
                color: "blue",
              },
              {
                year: "3º ano (8-9 anos)",
                subtitle: "Introdução à Multiplicação",
                ops: "Multiplicação (×), mantendo + e − para manutenção",
                nums: "Começar com 2, 5, 10. Depois 3, 4. Por último 6, 7, 8, 9.",
                qty: "15 a 20 questões",
                retries: "3 tentativas",
                freq: "Diária",
                pre: "A criança deve entender que multiplicação é adição repetida.",
                color: "orange",
              },
              {
                year: "4º ano (9-10 anos)",
                subtitle: "Fluência em Multiplicação e Introdução à Divisão",
                ops: "Multiplicação e divisão (× e ÷)",
                nums: "Todos de 0 a 10",
                qty: "20 a 30 questões",
                retries: "3 tentativas",
                freq: "Diária",
                pre: "Meta: domínio de toda a tabuada com automaticidade.",
                color: "purple",
              },
              {
                year: "5º ano (10-11 anos)",
                subtitle: "Manutenção e Consolidação",
                ops: "Todas as quatro (+ − × ÷)",
                nums: "Todos, com foco nos mais difíceis (6, 7, 8, 9)",
                qty: "20 a 30 questões",
                retries: "3 tentativas",
                freq: "3 a 5 vezes por semana",
                pre: "Manter a fluência como base para frações, porcentagens e álgebra.",
                color: "red",
              },
            ].map((item) => (
              <div key={item.year} className="mb-6 bg-gray-50 rounded-2xl p-5">
                <p className="font-display font-bold text-gray-800 text-lg">{item.year}</p>
                <p className="text-gray-500 text-sm mb-3">{item.subtitle}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-semibold text-gray-700">Operações:</span> <span className="text-gray-600">{item.ops}</span></div>
                  <div><span className="font-semibold text-gray-700">Números:</span> <span className="text-gray-600">{item.nums}</span></div>
                  <div><span className="font-semibold text-gray-700">Questões:</span> <span className="text-gray-600">{item.qty}</span></div>
                  <div><span className="font-semibold text-gray-700">Tentativas:</span> <span className="text-gray-600">{item.retries}</span></div>
                  <div className="col-span-2"><span className="font-semibold text-gray-700">Frequência:</span> <span className="text-gray-600">{item.freq}</span></div>
                  <div className="col-span-2"><span className="font-semibold text-gray-700">Observação:</span> <span className="text-gray-600">{item.pre}</span></div>
                </div>
              </div>
            ))}
          </Section>
        </div>

        {/* O que NÃO faz */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <Section title="O que o Vó Virgínia NÃO Faz">
            <P>O aplicativo é uma ferramenta de prática, não um currículo completo. Ele não substitui:</P>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-2 mb-4">
              <li>A explicação conceitual do professor sobre o que significa cada operação</li>
              <li>O trabalho com materiais concretos (blocos, agrupamentos, reta numérica)</li>
              <li>A resolução de problemas contextualizados</li>
              <li>A discussão e reflexão sobre estratégias</li>
              <li>O desenvolvimento do senso numérico (estimativa, comparação, decomposição)</li>
            </ul>
            <P>
              O Vó Virgínia cuida da automaticidade para que o professor e a família possam focar no que só humanos podem fazer: ensinar a pensar.
            </P>
          </Section>
        </div>

        {/* BNCC */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <Section title="Alinhamento com a BNCC">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 pr-3 font-display font-bold text-gray-700">Ano</th>
                    <th className="text-left py-2 pr-3 font-display font-bold text-gray-700">Habilidade BNCC</th>
                    <th className="text-left py-2 font-display font-bold text-gray-700">Contribuição do App</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-3 font-semibold">1º</td>
                    <td className="py-2 pr-3">EF01MA05 — Comparar quantidades, acrescentar e retirar</td>
                    <td className="py-2">Prática de adição e subtração com números pequenos</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-3 font-semibold">2º</td>
                    <td className="py-2 pr-3">EF02MA05 — Construir fatos básicos da adição e subtração</td>
                    <td className="py-2">Automatização por repetição espaçada</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-3 font-semibold">3º</td>
                    <td className="py-2 pr-3">EF03MA03 — Construir fatos básicos da adição e multiplicação</td>
                    <td className="py-2">Prática focada em multiplicação com progressão</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-3 font-semibold">4º</td>
                    <td className="py-2 pr-3">EF04MA04 — Utilizar relações entre operações inversas</td>
                    <td className="py-2">Formato de operações inversas reforça essas relações</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold">5º</td>
                    <td className="py-2 pr-3">EF05MA07 — Resolver problemas com as quatro operações</td>
                    <td className="py-2">Fluência como pré-requisito para resolução de problemas</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>
        </div>

        {/* Ciclo */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <Section title="O Ciclo Completo">
            <div className="flex flex-col items-center gap-3 my-4">
              <div className="w-full max-w-sm bg-blue-50 rounded-2xl p-4 text-center">
                <p className="font-display font-bold text-blue-800">1. COMPREENDER</p>
                <p className="text-blue-600 text-sm">Sala de aula / casa</p>
                <p className="text-blue-500 text-xs mt-1">Materiais concretos, discussão, exemplos</p>
              </div>
              <span className="text-2xl text-gray-300">&darr;</span>
              <div className="w-full max-w-sm bg-green-50 rounded-2xl p-4 text-center border-2 border-green-300">
                <p className="font-display font-bold text-green-800">2. PRATICAR</p>
                <p className="text-green-600 text-sm">Vó Virgínia</p>
                <p className="text-green-500 text-xs mt-1">Sessões curtas, diárias, com feedback e espaçamento</p>
              </div>
              <span className="text-2xl text-gray-300">&darr;</span>
              <div className="w-full max-w-sm bg-purple-50 rounded-2xl p-4 text-center">
                <p className="font-display font-bold text-purple-800">3. APLICAR</p>
                <p className="text-purple-600 text-sm">Sala de aula / casa</p>
                <p className="text-purple-500 text-xs mt-1">Problemas contextualizados, padrões, desafios</p>
              </div>
              <span className="text-2xl text-gray-300">&darr;</span>
              <p className="text-gray-400 text-sm italic">Volta ao passo 1 com novos conceitos</p>
            </div>
          </Section>
        </div>

        {/* Referências */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <Section title="Referências">
            <ul className="text-gray-500 text-sm space-y-2">
              <li>McNeil, N.M., Jordan, N.C., Viegut, A.A., &amp; Ansari, D. (2025). &ldquo;What the Science of Learning Teaches Us About Arithmetic Fluency.&rdquo; <em>Psychological Science in the Public Interest</em>, 26(1), 10–57.</li>
              <li>Sweller, J. — Teoria da Carga Cognitiva (Cognitive Load Theory).</li>
              <li>Boaler, J. (2015). &ldquo;Fluency Without Fear.&rdquo; YouCubed/Stanford.</li>
              <li>Brasil. Base Nacional Comum Curricular — Matemática, Ensino Fundamental.</li>
            </ul>
          </Section>
        </div>

        {/* CTA */}
        <div className="text-center pb-8">
          <Link
            href="/jogar"
            className="inline-block bg-gradient-to-r from-green-400 to-green-600 text-white font-display text-xl font-bold rounded-2xl py-4 px-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            Começar a Praticar
          </Link>
        </div>
      </div>
    </main>
  )
}
