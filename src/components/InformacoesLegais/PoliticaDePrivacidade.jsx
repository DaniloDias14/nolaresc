"use client";
import "./PoliticaDePrivacidade.css";

const PoliticaDePrivacidade = () => {
  return (
    <div className="legal-wrapper">
      <div className="legal-container">
        {/* Cabeçalho */}
        <section className="legal-header">
          <h1 className="legal-title">Política de Privacidade</h1>
          <p className="legal-subtitle">Nolare Imobiliária</p>
          <p className="legal-date">Última atualização: Janeiro de 2025</p>
        </section>

        {/* Introdução */}
        <section className="legal-section">
          <p className="legal-text">
            A Nolare Imobiliária ("Nolare", "nós", "nosso") tem o compromisso de
            proteger a privacidade dos usuários e garantir a transparência sobre
            como coletamos, utilizamos e protegemos os dados pessoais no site
            nolare.com.br ("Site"). Esta Política de Privacidade explica, de
            forma clara e objetiva, quais informações são coletadas, por qual
            motivo, como são utilizadas e quais direitos você possui em relação
            aos seus dados.
          </p>
          <p className="legal-text">
            Ao utilizar o Site, você declara estar ciente e de acordo com os
            termos desta Política.
          </p>
        </section>

        {/* Seção 1 */}
        <section className="legal-section">
          <h2 className="legal-section-title">1. Informações que coletamos</h2>
          <p className="legal-text">
            Coletamos apenas as informações necessárias para garantir a
            funcionalidade do Site e para permitir que nossa equipe possa entrar
            em contato com você quando necessário. As informações podem ser
            coletadas das seguintes formas:
          </p>

          <h3 className="legal-subsection-title">
            1.1. Informações fornecidas pelo usuário
          </h3>

          <h4 className="legal-subitem-title">a) Cadastro (Login):</h4>
          <ul className="legal-list">
            <li>Nome</li>
            <li>E-mail</li>
            <li>Senha (armazenada de forma criptografada – hash)</li>
            <li>Tipo de usuário (usuário comum ou administrador)</li>
          </ul>

          <h4 className="legal-subitem-title">
            b) Formulário "Anunciar Imóvel":
          </h4>
          <ul className="legal-list">
            <li>Nome</li>
            <li>Telefone</li>
            <li>Fotos enviadas pelo usuário</li>
            <li>
              Informações fornecidas espontaneamente sobre o imóvel (valor
              desejado, localização, detalhes gerais, observações extras)
            </li>
          </ul>

          <h4 className="legal-subitem-title">
            c) Formulário "Trabalhe Conosco":
          </h4>
          <ul className="legal-list">
            <li>Nome e dados de contato</li>
            <li>Informações profissionais</li>
            <li>Currículo enviado em anexo</li>
          </ul>

          <h3 className="legal-subsection-title">
            1.2. Informações registradas automaticamente
          </h3>

          <h4 className="legal-subitem-title">a) Sessões de usuário:</h4>
          <p className="legal-text">
            Registramos dados mínimos para controle de login, como:
          </p>
          <ul className="legal-list">
            <li>ID do usuário</li>
            <li>Data e hora de login</li>
            <li>Data e hora de logout</li>
            <li>Status da sessão (ativa ou não)</li>
          </ul>

          <h4 className="legal-subitem-title">b) Cookies essenciais:</h4>
          <p className="legal-text">
            Utilizamos apenas cookies necessários para manter o usuário
            autenticado no Site, evitando que precise refazer login ao fechar e
            reabrir a página. Não utilizamos cookies para fins de publicidade,
            rastreamento ou análise comportamental.
          </p>

          <h3 className="legal-subsection-title">
            1.3. Informações relacionadas às curtidas
          </h3>
          <p className="legal-text">
            Para que o usuário salve imóveis de interesse, armazenamos somente:
          </p>
          <ul className="legal-list">
            <li>ID da curtida</li>
            <li>ID do usuário</li>
            <li>ID do imóvel</li>
            <li>Data da ação</li>
          </ul>
        </section>

        {/* Seção 2 */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            2. Finalidade do uso das informações
          </h2>
          <p className="legal-text">
            Todos os dados coletados são utilizados exclusivamente para fins
            legítimos e específicos, incluindo:
          </p>
          <ul className="legal-list">
            <li>
              Manter o funcionamento adequado do Site e suas funcionalidades.
            </li>
            <li>
              Permitir que o usuário realize login e mantenha uma sessão ativa.
            </li>
            <li>Permitir curtidas e recuperação de imóveis favoritos.</li>
            <li>
              Entrar em contato com proprietários interessados em anunciar seus
              imóveis.
            </li>
            <li>
              Avaliar previamente os imóveis enviados por usuários através do
              formulário de "Anunciar".
            </li>
            <li>Receber e analisar currículos enviados à Nolare.</li>
            <li>
              Proteger a segurança do sistema e prevenir acessos não
              autorizados.
            </li>
            <li>
              Cumprir obrigações legais ou regulatórias, quando aplicável.
            </li>
          </ul>
          <p className="legal-text legal-highlight">
            A Nolare não vende, não aluga e não compartilha suas informações
            pessoais com terceiros para fins comerciais.
          </p>
        </section>

        {/* Seção 3 */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            3. Armazenamento, descarte e proteção das informações
          </h2>

          <h3 className="legal-subsection-title">
            3.1. Fotos enviadas pelo usuário no formulário "Anunciar"
          </h3>
          <p className="legal-text">
            Todas as imagens enviadas pelo usuário para avaliação são utilizadas
            exclusivamente para análise inicial e posteriormente descartadas de
            forma definitiva, sem armazenamento permanente e sem qualquer tipo
            de reuso.
          </p>

          <h3 className="legal-subsection-title">
            3.2. Fotos tiradas pela equipe da Nolare
          </h3>
          <p className="legal-text">
            As fotografias realizadas pela equipe da Nolare durante a visita ao
            imóvel são de uso exclusivo da Nolare e podem ser utilizadas em:
          </p>
          <ul className="legal-list">
            <li>anúncios no Site</li>
            <li>redes sociais</li>
            <li>envio para potenciais compradores</li>
            <li>materiais de divulgação relacionados à venda do imóvel</li>
          </ul>
          <p className="legal-text">
            Essas imagens fazem parte do processo comercial da imobiliária e não
            são cedidas para terceiros fora desse contexto.
          </p>

          <h3 className="legal-subsection-title">3.3. Proteção dos dados</h3>
          <p className="legal-text">
            Adotamos medidas técnicas e administrativas para proteger os dados
            pessoais contra acesso não autorizado, perda, alteração ou
            destruição. Entre elas:
          </p>
          <ul className="legal-list">
            <li>
              Armazenamento de senhas usando métodos de criptografia (hash).
            </li>
            <li>Controle restrito de acesso ao Painel Administrativo.</li>
            <li>
              Monitoramento de sessões para segurança da conta do usuário.
            </li>
            <li>
              Utilização de práticas seguras no desenvolvimento e manutenção do
              Site.
            </li>
          </ul>
        </section>

        {/* Seção 4 */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            4. Compartilhamento de informações
          </h2>
          <p className="legal-text">
            A Nolare não compartilha informações pessoais com terceiros, exceto
            se:
          </p>
          <ul className="legal-list">
            <li>Houver exigência legal ou judicial.</li>
            <li>
              For necessário para proteger nossos direitos, sistemas ou prevenir
              atividades ilícitas.
            </li>
            <li>O usuário consentir explicitamente.</li>
          </ul>
          <p className="legal-text">
            Não utilizamos dados do usuário para campanhas de marketing de
            terceiros, anúncios direcionados ou qualquer tipo de rastreamento
            externo.
          </p>
        </section>

        {/* Seção 5 */}
        <section className="legal-section">
          <h2 className="legal-section-title">
            5. Direitos do titular dos dados
          </h2>
          <p className="legal-text">
            De acordo com a legislação aplicável (como a LGPD – Lei Geral de
            Proteção de Dados), o usuário tem o direito de:
          </p>
          <ul className="legal-list">
            <li>Confirmar se tratamos seus dados.</li>
            <li>Solicitar acesso às informações pessoais armazenadas.</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
            <li>
              Solicitar a exclusão dos dados pessoais, quando permitido por lei.
            </li>
            <li>Revogar consentimentos concedidos anteriormente.</li>
            <li>Solicitar informações sobre o compartilhamento de dados.</li>
            <li>Solicitar portabilidade, quando aplicável.</li>
          </ul>
          <p className="legal-text">
            Para exercer qualquer direito, o usuário pode entrar em contato
            pelos canais oficiais no Site.
          </p>
        </section>

        {/* Seção 6 */}
        <section className="legal-section">
          <h2 className="legal-section-title">6. Retenção dos dados</h2>
          <p className="legal-text">
            Mantemos as informações pessoais somente pelo tempo necessário para
            atender às finalidades descritas nesta Política. Isso significa:
          </p>
          <ul className="legal-list">
            <li>Dados de login e conta: enquanto a conta estiver ativa.</li>
            <li>
              Dados de sessões: por tempo limitado, para segurança e auditoria.
            </li>
            <li>
              Currículos: mantidos apenas durante o período de avaliação
              interna.
            </li>
            <li>
              Fotos enviadas no formulário "Anunciar": descartadas após análise
              inicial.
            </li>
            <li>
              Fotos oficiais tiradas pela Nolare: mantidas para fins de
              divulgação do imóvel.
            </li>
          </ul>
          <p className="legal-text">
            Quando os dados não forem mais necessários, serão definitivamente
            excluídos com segurança.
          </p>
        </section>

        {/* Seção 7 */}
        <section className="legal-section">
          <h2 className="legal-section-title">7. Sobre menores de idade</h2>
          <p className="legal-text">
            O Site não é destinado a menores de 18 anos. Caso identifiquemos
            contas criadas por menores, podemos removê-las para proteção do
            próprio usuário.
          </p>
        </section>

        {/* Seção 8 */}
        <section className="legal-section">
          <h2 className="legal-section-title">8. Alterações nesta Política</h2>
          <p className="legal-text">
            A Nolare poderá atualizar esta Política de Privacidade
            periodicamente para refletir melhorias, mudanças no Site ou
            exigências legais. A versão mais recente estará sempre disponível
            nesta mesma página.
          </p>
          <p className="legal-text">
            Recomendamos que o usuário consulte este documento ocasionalmente.
          </p>
        </section>

        {/* Seção 9 */}
        <section className="legal-section">
          <h2 className="legal-section-title">9. Contato</h2>
          <p className="legal-text">
            Para dúvidas, solicitações ou exercício de direitos relacionados aos
            seus dados pessoais, entre em contato pelos canais oficiais
            disponíveis no Site ou pelos WhatsApps exibidos na página "Sobre
            Nós".
          </p>
        </section>
      </div>
    </div>
  );
};

export default PoliticaDePrivacidade;
