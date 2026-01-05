"use client";
import "./TermosDeUso.css";

const TermosDeUso = () => {
  return (
    <div className="legal-wrapper">
      <div className="legal-container">
        {/* Cabeçalho */}
        <section className="legal-header">
          <h1 className="legal-title">Termos de Uso</h1>
          <p className="legal-subtitle">Nolare Imobiliária</p>
          <p className="legal-date">Última atualização: Janeiro de 2025</p>
        </section>

        {/* Introdução */}
        <section className="legal-section">
          <p className="legal-text">
            Estes Termos de Uso regulam a utilização do site nolare.com.br
            ("Site"), de propriedade da Nolare Imobiliária ("Nolare", "nós",
            "nosso"). Ao acessar, navegar ou utilizar qualquer funcionalidade do
            Site, você declara estar ciente e de acordo com as condições abaixo.
          </p>
          <p className="legal-text legal-highlight">
            Se você não concorda com estes Termos, não deve utilizar o Site.
          </p>
        </section>

        {/* Seção 1 */}
        <section className="legal-section">
          <h2 className="legal-section-title">1. Objetivo do Site</h2>
          <p className="legal-text">
            O Site tem como finalidade apresentar imóveis disponíveis para
            venda, divulgar informações sobre a Nolare e permitir o contato
            entre usuários e nossa equipe. Além disso, oferece ferramentas como:
          </p>
          <ul className="legal-list">
            <li>Visualização de imóveis com detalhes e localização.</li>
            <li>Área de destaques selecionados manualmente pela equipe.</li>
            <li>
              Área "Anunciar" para usuários interessados em apresentar seus
              imóveis para avaliação.
            </li>
            <li>Sistema de curtidas para usuários cadastrados.</li>
            <li>Área administrativa para gerenciamento interno dos imóveis.</li>
            <li>Formulário para envio de currículos.</li>
          </ul>
          <p className="legal-text">
            O Site não funciona como plataforma onde o usuário publica anúncios
            diretamente. Todas as publicações passam por avaliação da equipe e
            somente são disponibilizadas após processo interno da Nolare.
          </p>
        </section>

        {/* Seção 2 */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            2. Uso do Site e responsabilidades do usuário
          </h2>
          <p className="legal-text">
            Ao utilizar o Site, o usuário se compromete a:
          </p>
          <ul className="legal-list">
            <li>Fornecer informações verdadeiras, completas e atualizadas.</li>
            <li>
              Não utilizar o Site para fins ilícitos, fraudulentos ou que violem
              direitos de terceiros.
            </li>
            <li>
              Não tentar obter acesso não autorizado a áreas restritas, contas
              alheias ou funcionalidades administrativas.
            </li>
            <li>
              Não utilizar mecanismos automáticos (bots, crawlers) que
              prejudiquem o funcionamento do Site.
            </li>
            <li>
              Respeitar os direitos autorais, especialmente as imagens oficiais
              produzidas pela Nolare.
            </li>
          </ul>
          <p className="legal-text">
            O descumprimento destas condições pode resultar na suspensão ou
            exclusão da conta do usuário, além de medidas legais cabíveis.
          </p>
        </section>

        {/* Seção 3 */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            3. Cadastro de Usuário e Acesso à Conta
          </h2>
          <p className="legal-text">
            Algumas funcionalidades exigem cadastro, como curtidas e manutenção
            de sessão. O usuário concorda que:
          </p>
          <ul className="legal-list">
            <li>É responsável por manter a confidencialidade de sua senha.</li>
            <li>É responsável por todas as ações realizadas em sua conta.</li>
            <li>
              Deve notificar imediatamente a Nolare caso suspeite de uso
              indevido.
            </li>
            <li>
              O nome informado no cadastro pode ser utilizado apenas para
              comunicação personalizada, como mensagens de confirmação e
              notificações.
            </li>
          </ul>
          <p className="legal-text">
            A Nolare pode suspender contas que apresentem suspeita de fraude,
            uso irregular ou violações destes Termos.
          </p>
        </section>

        {/* Seção 4 */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            4. Processo de "Anunciar Imóvel"
          </h2>
          <p className="legal-text">
            O formulário "Anunciar" tem como objetivo inicial avaliar se o
            imóvel enviado será ou não aceito pela Nolare.
          </p>
          <p className="legal-text">
            Ao utilizar esse formulário, o usuário compreende e concorda que:
          </p>
          <ul className="legal-list">
            <li>
              As fotos e informações enviadas são utilizadas apenas para análise
              inicial, não configuram anúncio e não são publicadas no Site.
            </li>
            <li>
              As imagens enviadas são descartadas após a avaliação, sem
              armazenamento permanente.
            </li>
            <li>
              A Nolare não se compromete a aceitar todos os imóveis enviados.
            </li>
            <li>
              A continuidade do processo depende de contato, visita e acordo
              entre as partes.
            </li>
            <li>
              Somente após a aprovação mútua o imóvel poderá ser anunciado no
              Site.
            </li>
          </ul>
        </section>

        {/* Seção 5 */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            5. Imagens e Propriedade Intelectual
          </h2>

          <h3 className="legal-subsection-title">
            5.1. Fotos oficiais da Nolare
          </h3>
          <p className="legal-text">
            As fotos tiradas pela equipe da Nolare durante a visita ao imóvel
            são de uso exclusivo e propriedade da Nolare.
          </p>
          <p className="legal-text">Podemos utilizá-las para:</p>
          <ul className="legal-list">
            <li>publicar no Site</li>
            <li>postar nas redes sociais</li>
            <li>enviar para potenciais compradores</li>
            <li>criar materiais de divulgação</li>
            <li>utilizar em campanhas relacionadas à venda do imóvel</li>
          </ul>
          <p className="legal-text">
            O proprietário não pode reutilizar essas imagens em outras
            plataformas ou para fins comerciais sem autorização prévia por
            escrito.
          </p>

          <h3 className="legal-subsection-title">5.2. Conteúdos do Site</h3>
          <p className="legal-text">
            Todo o conteúdo disponível — textos, marcas, logos, ícones, fotos,
            layout, design e materiais — é protegido por direitos autorais e não
            pode ser copiado, distribuído, reproduzido ou modificado sem
            permissão da Nolare.
          </p>
        </section>

        {/* Seção 6 */}
        <section className="legal-section">
          <h2 className="legal-section-title">6. Funcionamento das Curtidas</h2>
          <p className="legal-text">
            O recurso de curtidas permite ao usuário salvar imóveis de
            interesse. Ao utilizar esse recurso, o usuário concorda que:
          </p>
          <ul className="legal-list">
            <li>É necessário estar logado.</li>
            <li>
              Apenas informações essenciais são armazenadas (imóvel, usuário e
              data).
            </li>
            <li>
              As curtidas não configuram reserva, intenção de compra nem
              garantia de disponibilidade.
            </li>
            <li>
              A Nolare pode remover ou alterar imóveis a qualquer momento.
            </li>
          </ul>
        </section>

        {/* Seção 7 */}
        <section className="legal-section">
          <h2 className="legal-section-title">7. Área Administrativa</h2>
          <p className="legal-text">
            A área administrativa é de acesso exclusivo da equipe da Nolare. É
            proibido tentar acessar ou manipular qualquer dado, funcionalidade
            ou recurso dessa área sem autorização expressa.
          </p>
          <p className="legal-text legal-highlight">
            A violação pode resultar em responsabilização civil e penal.
          </p>
        </section>

        {/* Seção 8 */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            8. Disponibilidade e funcionamento do Site
          </h2>
          <p className="legal-text">
            A Nolare busca manter o Site sempre disponível, porém:
          </p>
          <ul className="legal-list">
            <li>
              Pode haver interrupções temporárias por manutenção, falhas
              técnicas ou atualizações.
            </li>
            <li>
              A Nolare não garante funcionamento ininterrupto ou livre de erros.
            </li>
            <li>
              A Nolare não se responsabiliza por danos decorrentes de
              indisponibilidade, instabilidades, falhas de conexão, dispositivos
              do usuário ou força maior.
            </li>
          </ul>
        </section>

        {/* Seção 9 */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            9. Limitação de Responsabilidade
          </h2>
          <p className="legal-text">A Nolare não se responsabiliza por:</p>
          <ul className="legal-list">
            <li>Informações incorretas fornecidas pelo próprio usuário.</li>
            <li>Conexão de internet, equipamentos ou softwares do usuário.</li>
            <li>Uso indevido do Site por terceiros.</li>
            <li>
              Decisões tomadas pelo usuário com base em informações incompletas
              enviadas por outros usuários no formulário de "Anunciar".
            </li>
            <li>
              Conteúdos externos compartilhados por links externos (ex.: Google
              Maps).
            </li>
          </ul>
          <p className="legal-text">
            A Nolare atua de boa-fé, prezando pela precisão das informações dos
            imóveis, mas não responde por alterações feitas posteriormente pelos
            proprietários ou terceiros.
          </p>
        </section>

        {/* Seção 10 */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            10. Privacidade e Proteção de Dados
          </h2>
          <p className="legal-text">
            A utilização do Site envolve o tratamento de dados pessoais. O
            usuário declara estar ciente e de acordo com a Política de
            Privacidade da Nolare, disponível no próprio Site.
          </p>
          <p className="legal-text">Essa política explica detalhadamente:</p>
          <ul className="legal-list">
            <li>quais dados coletamos</li>
            <li>como usamos</li>
            <li>como protegemos</li>
            <li>por quanto tempo armazenamos</li>
            <li>quais direitos o usuário possui</li>
          </ul>
          <p className="legal-text">
            A Política de Privacidade é parte integrante destes Termos.
          </p>
        </section>

        {/* Seção 11 */}
        <section className="legal-section">
          <h2 className="legal-section-title">11. Envio de Currículos</h2>
          <p className="legal-text">
            Ao enviar um currículo pelo formulário "Trabalhe Conosco", o usuário
            concorda que:
          </p>
          <ul className="legal-list">
            <li>As informações serão usadas apenas para análise interna.</li>
            <li>Não há garantia de contato ou contratação.</li>
            <li>
              O currículo poderá ser excluído após o término da avaliação, sem
              aviso prévio.
            </li>
            <li>Nenhuma informação é compartilhada com terceiros.</li>
          </ul>
        </section>

        {/* Seção 12 */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            12. Modificações dos Termos de Uso
          </h2>
          <p className="legal-text">
            A Nolare poderá atualizar estes Termos a qualquer momento, para
            atender exigências legais, melhorias no Site ou mudanças
            operacionais.
          </p>
          <p className="legal-text">
            A versão mais recente estará sempre disponível nesta página. O uso
            contínuo do Site após alterações significa concordância com os novos
            termos.
          </p>
        </section>

        {/* Seção 13 */}
        <section className="legal-section">
          <h2 className="legal-section-title">13. Lei Aplicável e Foro</h2>
          <p className="legal-text">
            Estes Termos são regidos pelas leis brasileiras. Caso haja qualquer
            disputa sobre a interpretação ou aplicação deste documento, as
            partes elegem o foro da comarca onde a Nolare está sediada,
            renunciando a qualquer outro, por mais privilegiado que seja.
          </p>
        </section>

        {/* Seção 14 */}
        <section className="legal-section">
          <h2 className="legal-section-title">14. Contato</h2>
          <p className="legal-text">
            Para dúvidas, solicitações ou mensagens relacionadas a estes Termos,
            utilize os canais oficiais de comunicação exibidos no Site.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermosDeUso;
