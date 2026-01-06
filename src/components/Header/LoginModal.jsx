"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { IoClose, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import logo_azul from "../../assets/img/logo/logo_azul.png";
import "./LoginModal.css";

const TermosDeUso = () => (
  <>
    <section className="legal-section">
      <p className="legal-text">
        Estes Termos de Uso regulam a utilização do site nolare.com.br ("Site"),
        de propriedade da Nolare Imobiliária ("Nolare", "nós", "nosso"). Ao
        acessar, navegar ou utilizar qualquer funcionalidade do Site, você
        declara estar ciente e de acordo com as condições abaixo.
      </p>
      <p className="legal-text legal-highlight">
        Se você não concorda com estes Termos, não deve utilizar o Site.
      </p>
    </section>
    <section className="legal-section">
      <h2 className="legal-section-title">1. Objetivo do Site</h2>
      <p className="legal-text">
        O Site tem como finalidade apresentar imóveis disponíveis para venda,
        divulgar informações sobre a Nolare e permitir o contato entre usuários
        e nossa equipe. Além disso, oferece ferramentas como:
      </p>
      <ul className="legal-list">
        <li>Visualização de imóveis com detalhes e localização.</li>
        <li>Área de destaques selecionados manualmente pela equipe.</li>
        <li>
          Área "Anunciar" para usuários interessados em apresentar seus imóveis
          para avaliação.
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
          Não utilizar mecanismos automáticos (bots, crawlers) que prejudiquem o
          funcionamento do Site.
        </li>
        <li>
          Respeitar os direitos autorais, especialmente as imagens oficiais
          produzidas pela Nolare.
        </li>
      </ul>
      <p className="legal-text">
        O descumprimento destas condições pode resultar na suspensão ou exclusão
        da conta do usuário, além de medidas legais cabíveis.
      </p>
    </section>
    <section className="legal-section">
      <h2 className="legal-section-title">
        3. Cadastro de Usuário e Acesso à Conta
      </h2>
      <p className="legal-text">
        Algumas funcionalidades exigem cadastro, como curtidas e manutenção de
        sessão. O usuário concorda que:
      </p>
      <ul className="legal-list">
        <li>É responsável por manter a confidencialidade de sua senha.</li>
        <li>É responsável por todas as ações realizadas em sua conta.</li>
        <li>
          Deve notificar imediatamente a Nolare caso suspeite de uso indevido.
        </li>
        <li>
          O nome informado no cadastro pode ser utilizado apenas para
          comunicação personalizada, como mensagens de confirmação e
          notificações.
        </li>
      </ul>
      <p className="legal-text">
        A Nolare pode suspender contas que apresentem suspeita de fraude, uso
        irregular ou violações destes Termos.
      </p>
    </section>
    <section className="legal-section">
      <h2 className="legal-section-title">4. Processo de "Anunciar Imóvel"</h2>
      <p className="legal-text">
        O formulário "Anunciar" tem como objetivo inicial avaliar se o imóvel
        enviado será ou não aceito pela Nolare.
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
        <li>A Nolare não se compromete a aceitar todos os imóveis enviados.</li>
        <li>
          A continuidade do processo depende de contato, visita e acordo entre
          as partes.
        </li>
        <li>
          Somente após a aprovação mútua o imóvel poderá ser anunciado no Site.
        </li>
      </ul>
    </section>
    <section className="legal-section">
      <h2 className="legal-section-title">
        5. Imagens e Propriedade Intelectual
      </h2>
      <h3 className="legal-subsection-title">5.1. Fotos oficiais da Nolare</h3>
      <p className="legal-text">
        As fotos tiradas pela equipe da Nolare durante a visita ao imóvel são de
        uso exclusivo e propriedade da Nolare.
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
        O proprietário não pode reutilizar essas imagens em outras plataformas
        ou para fins comerciais sem autorização prévia por escrito.
      </p>
      <h3 className="legal-subsection-title">5.2. Conteúdos do Site</h3>
      <p className="legal-text">
        Todo o conteúdo disponível — textos, marcas, logos, ícones, fotos,
        layout, design e materiais — é protegido por direitos autorais e não
        pode ser copiado, distribuído, reproduzido ou modificado sem permissão
        da Nolare.
      </p>
    </section>
    <section className="legal-section">
      <h2 className="legal-section-title">6. Funcionamento das Curtidas</h2>
      <p className="legal-text">
        O recurso de curtidas permite ao usuário salvar imóveis de interesse. Ao
        utilizar esse recurso, o usuário concorda que:
      </p>
      <ul className="legal-list">
        <li>É necessário estar logado.</li>
        <li>
          Apenas informações essenciais são armazenadas (imóvel, usuário e
          data).
        </li>
        <li>
          As curtidas não configuram reserva, intenção de compra nem garantia de
          disponibilidade.
        </li>
        <li>A Nolare pode remover ou alterar imóveis a qualquer momento.</li>
      </ul>
    </section>
    <section className="legal-section">
      <h2 className="legal-section-title">7. Área Administrativa</h2>
      <p className="legal-text">
        A área administrativa é de acesso exclusivo da equipe da Nolare. É
        proibido tentar acessar ou manipular qualquer dado, funcionalidade ou
        recurso dessa área sem autorização expressa.
      </p>
      <p className="legal-text legal-highlight">
        A violação pode resultar em responsabilização civil e penal.
      </p>
    </section>
    <section className="legal-section">
      <h2 className="legal-section-title">
        8. Disponibilidade e funcionamento do Site
      </h2>
      <p className="legal-text">
        A Nolare busca manter o Site sempre disponível, porém:
      </p>
      <ul className="legal-list">
        <li>
          Pode haver interrupções temporárias por manutenção, falhas técnicas ou
          atualizações.
        </li>
        <li>
          A Nolare não garante funcionamento ininterrupto ou livre de erros.
        </li>
        <li>
          A Nolare não se responsabiliza por danos decorrentes de
          indisponibilidade, instabilidades, falhas de conexão, dispositivos do
          usuário ou força maior.
        </li>
      </ul>
    </section>
    <section className="legal-section">
      <h2 className="legal-section-title">9. Limitação de Responsabilidade</h2>
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
    <section className="legal-section">
      <h2 className="legal-section-title">
        10. Privacidade e Proteção de Dados
      </h2>
      <p className="legal-text">
        A utilização do Site envolve o tratamento de dados pessoais. O usuário
        declara estar ciente e de acordo com a Política de Privacidade da
        Nolare, disponível no próprio Site.
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
          O currículo poderá ser excluído após o término da avaliação, sem aviso
          prévio.
        </li>
        <li>Nenhuma informação é compartilhada com terceiros.</li>
      </ul>
    </section>
    <section className="legal-section">
      <h2 className="legal-section-title">
        12. Modificações dos Termos de Uso
      </h2>
      <p className="legal-text">
        A Nolare poderá atualizar destes Termos a qualquer momento, para atender
        exigências legais, melhorias no Site ou mudanças operacionais.
      </p>
      <p className="legal-text">
        A versão mais recente estará sempre disponível nesta página. O uso
        contínuo do Site após alterações significa concordância com os novos
        termos.
      </p>
    </section>
    <section className="legal-section">
      <h2 className="legal-section-title">13. Lei Aplicável e Foro</h2>
      <p className="legal-text">
        Estes Termos são regidos pelas leis brasileiras. Caso haja qualquer
        disputa sobre a interpretação ou aplicação deste documento, as partes
        elegem o foro da comarca onde a Nolare está sediada, renunciando a
        qualquer outro, por mais privilegiado que seja.
      </p>
    </section>
    <section className="legal-section">
      <h2 className="legal-section-title">14. Contato</h2>
      <p className="legal-text">
        Para dúvidas, solicitações ou mensagens relacionadas a estes Termos,
        utilize os canais oficiais de comunicação exibidos no Site.
      </p>
    </section>
  </>
);

const PoliticaDePrivacidade = () => (
  <>
    <section className="legal-section">
      <p className="legal-text">
        A Nolare Imobiliária ("Nolare", "nós", "nosso") tem o compromisso de
        proteger a privacidade dos usuários e garantir a transparência sobre
        como coletamos, utilizamos e protegemos os dados pessoais no site
        nolare.com.br ("Site"). Esta Política de Privacidade explica, de forma
        clara e objetiva, quais informações são coletadas, por qual motivo, como
        são utilizadas e quais direitos você possui em relação aos seus dados.
      </p>
      <p className="legal-text">
        Ao utilizar o Site, você declara estar ciente e de acordo com os termos
        desta Política.
      </p>
    </section>
    <section className="legal-section">
      <h2 className="legal-section-title">1. Informações que coletamos</h2>
      <p className="legal-text">
        Coletamos apenas as informações necessárias para garantir a
        funcionalidade do Site e para permitir que nossa equipe possa entrar em
        contato com você quando necessário. As informações podem ser coletadas
        das seguintes formas:
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
      <h4 className="legal-subitem-title">b) Formulário "Anunciar Imóvel":</h4>
      <ul className="legal-list">
        <li>Nome</li>
        <li>Telefone</li>
        <li>Fotos enviadas pelo usuário</li>
        <li>
          Informações fornecidas espontaneamente sobre o imóvel (valor desejado,
          localização, detalhes gerais, observações extras)
        </li>
      </ul>
      <h4 className="legal-subitem-title">c) Formulário "Trabalhe Conosco":</h4>
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
        Utilizamos apenas cookies necessários para manter o usuário autenticado
        no Site, evitando que precise refazer login ao fechar e reabrir a
        página. Não utilizamos cookies para fins de publicidade, rastreamento ou
        análise comportamental.
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
    <section className="legal-section">
      <h2 className="legal-section-title">
        2. Finalidade do uso das informações
      </h2>
      <p className="legal-text">
        Todos os dados coletados são utilizados exclusivamente para fins
        legítimos e específicos, incluindo:
      </p>
      <ul className="legal-list">
        <li>Manter o funcionamento adequado do Site e suas funcionalidades.</li>
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
          Proteger a segurança do sistema e prevenir acessos não autorizados.
        </li>
        <li>Cumprir obrigações legais ou regulatórias, quando aplicável.</li>
      </ul>
      <p className="legal-text legal-highlight">
        A Nolare não vende, não aluga e não compartilha suas informações
        pessoais com terceiros para fins comerciais.
      </p>
    </section>
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
        forma definitiva, sem armazenamento permanente e sem qualquer tipo de
        reuso.
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
        Essas imagens fazem parte do processo comercial da imobiliária e não são
        cedidas para terceiros fora desse contexto.
      </p>
      <h3 className="legal-subsection-title">3.3. Proteção dos dados</h3>
      <p className="legal-text">
        Adotamos medidas técnicas e administrativas para proteger os dados
        pessoais contra acesso não autorizado, perda, alteração ou destruição.
        Entre elas:
      </p>
      <ul className="legal-list">
        <li>Armazenamento de senhas usando métodos de criptografia (hash).</li>
        <li>Controle restrito de acesso ao Painel Administrativo.</li>
        <li>Monitoramento de sessões para segurança da conta do usuário.</li>
        <li>
          Utilização de práticas seguras no desenvolvimento e manutenção do
          Site.
        </li>
      </ul>
    </section>
    <section className="legal-section">
      <h2 className="legal-section-title">
        4. Compartilhamento de informações
      </h2>
      <p className="legal-text">
        A Nolare não compartilha informações pessoais com terceiros, exceto se:
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
    <section className="legal-section">
      <h2 className="legal-section-title">5. Direitos do titular dos dados</h2>
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
        Para exercer qualquer direito, o usuário pode entrar em contato pelos
        canais oficiais no Site.
      </p>
    </section>
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
          Currículos: mantidos apenas durante o período de avaliação interna.
        </li>
        <li>
          Fotos enviadas no formulário "Anunciar": descartadas após análise
          inicial.
        </li>
        <li>
          Fotos oficiais tiradas pela Nolare: mantidas para fins de divulgação
          do imóvel.
        </li>
      </ul>
      <p className="legal-text">
        Quando os dados não forem mais necessários, serão definitivamente
        excluídos com segurança.
      </p>
    </section>
    <section className="legal-section">
      <h2 className="legal-section-title">7. Sobre menores de idade</h2>
      <p className="legal-text">
        O Site não é destinado a menores de 18 anos. Caso identifiquemos contas
        criadas por menores, podemos removê-las para proteção do próprio
        usuário.
      </p>
    </section>
    <section className="legal-section">
      <h2 className="legal-section-title">8. Alterações nesta Política</h2>
      <p className="legal-text">
        A Nolare poderá atualizar esta Política de Privacidade periodicamente
        para refletir melhorias, mudanças no Site ou exigências legais. A versão
        mais recente estará sempre disponível nesta mesma página.
      </p>
      <p className="legal-text">
        Recomendamos que o usuário consulte este documento ocasionalmente.
      </p>
    </section>
    <section className="legal-section">
      <h2 className="legal-section-title">9. Contato</h2>
      <p className="legal-text">
        Para dúvidas, solicitações ou exercício de direitos relacionados aos
        seus dados pessoais, entre em contato pelos canais oficiais disponíveis
        no Site ou pelos WhatsApps exibidos na página "Sobre Nós".
      </p>
    </section>
  </>
);

const LoginModal = ({ onClose, setAdmLogged, setUser }) => {
  const [tab, setTab] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [showLoginSenha, setShowLoginSenha] = useState(false);
  const [lembrarMe, setLembrarMe] = useState(false);
  const [registerNome, setRegisterNome] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerSenha, setRegisterSenha] = useState("");
  const [registerConfirmSenha, setRegisterConfirmSenha] = useState("");
  const [showRegisterSenha, setShowRegisterSenha] = useState(false);
  const [showRegisterConfirmSenha, setShowRegisterConfirmSenha] =
    useState(false);
  const [registerTipo, setRegisterTipo] = useState("user");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [aceitouPrivacidade, setAceitouPrivacidade] = useState(false);
  const [recuperacaoEmail, setRecuperacaoEmail] = useState("");
  const [codigoRecuperacao, setCodigoRecuperacao] = useState([
    "",
    "",
    "",
    "",
    "",
  ]);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarNovaSenha, setShowConfirmarNovaSenha] = useState(false);
  const [tokenRecuperacao, setTokenRecuperacao] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [etapaRecuperacao, setEtapaRecuperacao] = useState("email"); // email, codigo, senha

  const [carregando, setCarregando] = useState(false);
  const [etapaCadastro, setEtapaCadastro] = useState("form"); // form, verificacao, termos
  const [emailCadastroVerificacao, setEmailCadastroVerificacao] = useState("");
  const [codigoCadastroVerificacao, setCodigoCadastroVerificacao] = useState([
    "",
    "",
    "",
    "",
    "",
  ]);
  const [tentativasVerificacao, setTentativasVerificacao] = useState(5);
  const [tempoRestanteVerificacao, setTempoRestanteVerificacao] = useState(0);
  const [dadosCadastroTemp, setDadosCadastroTemp] = useState({
    nome: "",
    email: "",
    senha: "", // Adicionando senha aos dados temporários
    tipo_usuario: "user",
  });
  // REMOVIDOS: const [visualizandoTermos, setVisualizandoTermos] = useState(false)
  // REMOVIDOS: const [visualizandoPrivacidade, setVisualizandoPrivacidade] = useState(false)
  const [mostrarTermos, setMostrarTermos] = useState(true);
  const [mostrarPrivacidade, setMostrarPrivacidade] = useState(true);
  const [fechandoTermos, setFechandoTermos] = useState(false);
  const [fechandoPrivacidade, setFechandoPrivacidade] = useState(false);

  const inputsCadastroRefs = useRef([]);
  const inputsRecuperacaoRefs = useRef([]);

  useEffect(() => {
    const credenciaisSalvas = localStorage.getItem("nolare_credenciais");
    if (credenciaisSalvas) {
      try {
        const { email, senha } = JSON.parse(credenciaisSalvas);
        setLoginEmail(email);
        setLoginSenha(senha);
        setLembrarMe(true);
      } catch (err) {
        console.error("Erro ao carregar credenciais salvas:", err);
      }
    }
  }, []);

  // Validar nome completo (não vazio)
  const isValidFullName = (nome) => {
    return nome.trim().length > 0;
  };

  // Validar email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validar senha: mínimo 8 caracteres, pelo menos 1 maiúscula, 1 minúscula, 1 número, 1 caractere especial
  const isValidPassword = (senha) => {
    const hasUpperCase = /[A-Z]/.test(senha);
    const hasLowerCase = /[a-z]/.test(senha);
    const hasNumber = /[0-9]/.test(senha);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senha);
    const hasMinLength = senha.length >= 8;

    return (
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar &&
      hasMinLength
    );
  };

  // Obter erros específicos da senha
  const getPasswordErrors = (senha) => {
    const errors = [];
    if (senha.length < 8) errors.push("Mínimo 8 caracteres");
    if (!/[A-Z]/.test(senha)) errors.push("Uma letra maiúscula");
    if (!/[a-z]/.test(senha)) errors.push("Uma letra minúscula");
    if (!/[0-9]/.test(senha)) errors.push("Um número");
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senha))
      errors.push("Um caractere especial");
    return errors;
  };

  const formatarTempoRestante = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${minutos}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setCarregando(true);

    const errors = {};
    if (!loginEmail.trim()) {
      errors.loginEmail = "Email é obrigatório";
    } else if (!isValidEmail(loginEmail)) {
      errors.loginEmail = "Email inválido";
    }

    if (!loginSenha.trim()) {
      errors.loginSenha = "Senha é obrigatória";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Por favor, verifique os campos abaixo");
      setCarregando(false);
      return;
    }

    try {
      const response = await axios.post("/api/login", {
        email: loginEmail,
        senha: loginSenha,
      });

      if (response.data && response.data.user) {
        const user = response.data.user;

        setUser(user);
        localStorage.setItem("nolare_user", JSON.stringify(user));

        if (lembrarMe) {
          localStorage.setItem(
            "nolare_credenciais",
            JSON.stringify({ email: loginEmail, senha: loginSenha })
          );
        } else {
          localStorage.removeItem("nolare_credenciais");
        }

        setAdmLogged(user.tipo_usuario === "adm");

        if (user.tipo_usuario === "adm") {
          console.log("Fez login como adm");
        } else if (user.tipo_usuario === "user") {
          console.log("Fez login como user");
        }

        setError("");
        onClose();
      } else {
        setAdmLogged(false);
        setFieldErrors({ loginEmail: "", loginSenha: "" });
        setError("Credenciais inválidas!");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erro no servidor";
      setAdmLogged(false);
      setFieldErrors({ loginEmail: "", loginSenha: "" });
      setError(errorMsg);
    } finally {
      setCarregando(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setCarregando(true);

    const errors = {};

    if (!registerNome.trim()) {
      errors.registerNome = "Nome é obrigatório";
    } else if (!isValidFullName(registerNome)) {
      errors.registerNome = "Nome deve conter pelo menos dois nomes";
    }

    if (!registerEmail.trim()) {
      errors.registerEmail = "Email é obrigatório";
    } else if (!isValidEmail(registerEmail)) {
      errors.registerEmail = "Email inválido";
    }

    if (!registerSenha.trim()) {
      errors.registerSenha = "Senha é obrigatória";
    } else if (!isValidPassword(registerSenha)) {
      const passwordErrors = getPasswordErrors(registerSenha);
      errors.registerSenha = `Senha deve conter: ${passwordErrors.join(", ")}`;
    }

    if (!registerConfirmSenha.trim()) {
      errors.registerConfirmSenha = "Senhas não coincidem";
    } else if (registerSenha !== registerConfirmSenha) {
      errors.registerConfirmSenha = "Senhas não coincidem";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Por favor, corrija os erros abaixo");
      setCarregando(false);
      return;
    }

    try {
      await axios.post("/api/register", {
        nome: registerNome,
        email: registerEmail,
        senha: registerSenha,
        tipo_usuario: registerTipo,
        aceitouTermos: false,
        aceitouPrivacidade: false,
      });

      setDadosCadastroTemp({
        nome: registerNome,
        email: registerEmail,
        senha: registerSenha,
        tipo_usuario: registerTipo,
      });

      setEmailCadastroVerificacao(registerEmail);
      setEtapaCadastro("verificacao");
      setCodigoCadastroVerificacao(["", "", "", "", ""]);
      setTentativasVerificacao(5);
      setError("");
      setFieldErrors({});
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erro no servidor";
      setError(errorMsg);
    } finally {
      setCarregando(false);
    }
  };

  const handleVerificacaoCadastro = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setCarregando(true);

    const codigoCompleto = codigoCadastroVerificacao.join("");

    if (!codigoCompleto.trim() || codigoCompleto.length !== 5) {
      setError("Por favor, digite o código completo");
      setFieldErrors({
        ...fieldErrors,
        codigoCadastroVerificacao: "Por favor, digite o código completo",
      });
      setCarregando(false);
      return;
    }

    try {
      await axios.post("/api/email/verificacao/validar", {
        email: emailCadastroVerificacao,
        codigo: codigoCompleto,
      });

      setAceitouTermos(false);
      setAceitouPrivacidade(false);
      // MODIFICADO: setEtapaCadastro("termos") -> setEtapaCadastro("verificacaoTermos")
      setEtapaCadastro("verificacaoTermos");
      setError("");
      setFieldErrors({});
    } catch (err) {
      const errorData = err.response?.data || {};

      if (errorData.statusCode === "BLOQUEADO") {
        setError(
          `${errorData.error} Tempo restante: ${formatarTempoRestante(
            errorData.tempoRestante
          )}`
        );
        setTempoRestanteVerificacao(errorData.tempoRestante);
      } else if (errorData.expired) {
        setError("Código expirado. Solicitando novo código...");
      } else {
        setError(errorData.error || "Erro ao validar código");
        setFieldErrors({
          ...fieldErrors,
          codigoCadastroVerificacao:
            errorData.error || "Erro ao validar código",
        });
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleConfirmarCadastroComTermos = async () => {
    setError("");
    setFieldErrors({});

    // MODIFICADO: Validação simplificada dos checkboxes
    if (!aceitouTermos || !aceitouPrivacidade) {
      setError(
        "Você deve aceitar os Termos de Uso e a Política de Privacidade para confirmar seu cadastro."
      );
      return;
    }

    setCarregando(true);

    try {
      const codigoCompleto = codigoCadastroVerificacao.join("");

      // MODIFICADO: Enviando aceitouTermos e aceitouPrivacidade para o backend
      await axios.post("/api/email/verificacao/confirmar-cadastro", {
        email: emailCadastroVerificacao,
        codigo: codigoCompleto,
        aceitouTermos,
        aceitouPrivacidade,
        nome: dadosCadastroTemp.nome, // Mantido para compatibilidade com o backend
        senha: dadosCadastroTemp.senha, // Mantido para compatibilidade com o backend
        tipo_usuario: dadosCadastroTemp.tipo_usuario, // Mantido para compatibilidade com o backend
      });

      setTab("login");
      setEtapaCadastro("form");
      setRegisterNome("");
      setRegisterEmail("");
      setRegisterSenha("");
      setRegisterConfirmSenha("");
      setCodigoCadastroVerificacao(["", "", "", "", ""]);
      setAceitouTermos(false);
      setAceitouPrivacidade(false);
      setDadosCadastroTemp({
        nome: "",
        email: "",
        senha: "",
        tipo_usuario: "user",
      });
      setError("");
      setFieldErrors({});
      alert(
        "Cadastro realizado com sucesso! Faça o login com suas credenciais."
      );
    } catch (err) {
      const errorData = err.response?.data || {};
      setError(errorData.error || "Erro ao confirmar cadastro");
    } finally {
      setCarregando(false);
    }
  };

  const handleReenviarCodigoCadastro = async (e) => {
    e.preventDefault();
    setError("");
    setCarregando(true);

    try {
      const response = await axios.post("/api/email/verificacao/solicitar", {
        email: emailCadastroVerificacao,
      });

      if (response.data.success) {
        setCodigoCadastroVerificacao(["", "", "", "", ""]);
        setTentativasVerificacao(5);
        setTempoRestanteVerificacao(0);
        setError("");
        alert("Novo código de verificação enviado para o seu e-mail!");
      }
    } catch (err) {
      const errorData = err.response?.data || {};

      if (errorData.statusCode === "LIMIT_EXCEEDED") {
        setError(
          `${errorData.error} Tente novamente em ${errorData.tempoRestante} minutos.`
        );
      } else {
        setError(errorData.error || "Erro ao reenviar código");
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleSolicitarRecuperacao = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setCarregando(true);

    if (!recuperacaoEmail.trim()) {
      setError("Email é obrigatório");
      setFieldErrors({
        ...fieldErrors,
        recuperacaoEmail: "Email é obrigatório",
      });
      setCarregando(false);
      return;
    }

    if (!isValidEmail(recuperacaoEmail)) {
      setError("Email inválido");
      setFieldErrors({ ...fieldErrors, recuperacaoEmail: "Email inválido" });
      setCarregando(false);
      return;
    }

    try {
      await axios.post("/api/email/recuperacao/solicitar", {
        email: recuperacaoEmail,
      });

      setEtapaRecuperacao("codigo");
      setError("");
      alert("Código de recuperação enviado para o seu e-mail!");
    } catch (err) {
      const errorData = err.response?.data || {};

      if (errorData.statusCode === "LIMIT_EXCEEDED") {
        setError(
          `${errorData.error} Tente novamente em ${errorData.tempoRestante} minutos.`
        );
      } else {
        setError(errorData.error || "Erro no servidor");
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleValidarCodigo = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setCarregando(true);

    const codigoCompleto = codigoRecuperacao.join("");

    if (!codigoCompleto.trim() || codigoCompleto.length !== 5) {
      setError("Código é obrigatório");
      setFieldErrors({
        ...fieldErrors,
        codigoRecuperacao: "Código é obrigatório",
      });
      setCarregando(false);
      return;
    }

    try {
      const response = await axios.post("/api/email/recuperacao/validar", {
        email: recuperacaoEmail,
        codigo: codigoCompleto,
      });

      if (response.data.success) {
        setTokenRecuperacao(response.data.token);
        setEtapaRecuperacao("senha");
        setError("");
      }
    } catch (err) {
      const errorData = err.response?.data || {};

      if (errorData.statusCode === "BLOQUEADO") {
        setError(
          `${errorData.error} Tempo restante: ${formatarTempoRestante(
            errorData.tempoRestante
          )}`
        );
        setTempoRestanteVerificacao(errorData.tempoRestante);
      } else if (errorData.tentativasRestantes !== undefined) {
        setError(errorData.error);
        setFieldErrors({ ...fieldErrors, codigoRecuperacao: errorData.error });
      } else {
        setError(errorData.error || "Erro no servidor");
        setFieldErrors({
          ...fieldErrors,
          codigoRecuperacao: errorData.error || "Erro no servidor",
        });
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleRedefinirSenha = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setCarregando(true);

    const errors = {};

    if (!novaSenha.trim()) {
      errors.novaSenha = "Nova senha é obrigatória";
    } else if (!isValidPassword(novaSenha)) {
      const passwordErrors = getPasswordErrors(novaSenha);
      errors.novaSenha = `Senha deve conter: ${passwordErrors.join(", ")}`;
    }

    if (!confirmarNovaSenha.trim()) {
      errors.confirmarNovaSenha = "Confirmação de senha é obrigatória";
    } else if (novaSenha !== confirmarNovaSenha) {
      errors.confirmarNovaSenha = "Senhas não coincidem";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Por favor, corrija os erros abaixo");
      setCarregando(false);
      return;
    }

    try {
      await axios.post(
        "/api/email/recuperacao/redefinir",
        {
          email: recuperacaoEmail,
          novaSenha,
        },
        {
          headers: {
            Authorization: `Bearer ${tokenRecuperacao}`,
          },
        }
      );

      setTab("login");
      setEtapaRecuperacao("email");
      setRecuperacaoEmail("");
      setCodigoRecuperacao(["", "", "", "", ""]);
      setNovaSenha("");
      setConfirmarNovaSenha("");
      setTokenRecuperacao("");
      setError("");
      setFieldErrors({});
      alert("Senha redefinida com sucesso! Faça o login com a nova senha.");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erro no servidor";
      setError(errorMsg);
    } finally {
      setCarregando(false);
    }
  };

  const renderCodigoVerificacao = () => {
    const handleInputChange = (index, value) => {
      // Aceitar apenas números
      if (!/^\d*$/.test(value)) return;

      const novosCodigos = [...codigoCadastroVerificacao];
      novosCodigos[index] = value;
      setCodigoCadastroVerificacao(novosCodigos);

      // Auto-focus no próximo campo
      if (value && index < 4) {
        inputsCadastroRefs.current[index + 1]?.focus();
      }

      // Limpar erro se existir
      if (fieldErrors.codigoCadastroVerificacao) {
        setFieldErrors({
          ...fieldErrors,
          codigoCadastroVerificacao: "",
        });
      }
    };

    const handleKeyDown = (index, e) => {
      // Backspace: voltar para o campo anterior se estiver vazio
      if (
        e.key === "Backspace" &&
        !codigoCadastroVerificacao[index] &&
        index > 0
      ) {
        inputsCadastroRefs.current[index - 1]?.focus();
      }
    };

    const handlePaste = (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 5);
      const novosDigitos = pastedData.split("");
      const novosCodigos = ["", "", "", "", ""];

      novosDigitos.forEach((digito, idx) => {
        if (idx < 5) novosCodigos[idx] = digito;
      });

      setCodigoCadastroVerificacao(novosCodigos);

      // Focar no próximo campo vazio ou no último
      const proximoIndiceVazio =
        novosDigitos.length < 5 ? novosDigitos.length : 4;
      inputsCadastroRefs.current[proximoIndiceVazio]?.focus();
    };

    return (
      <div className="login-codigo-inputs-container">
        {codigoCadastroVerificacao.map((digito, index) => (
          <input
            key={index}
            ref={(el) => (inputsCadastroRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength="1"
            value={digito}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={carregando}
            className={`login-codigo-input ${
              fieldErrors.codigoCadastroVerificacao ? "input-error" : ""
            }`}
          />
        ))}
      </div>
    );
  };

  const renderCodigoRecuperacao = () => {
    const handleInputChange = (index, value) => {
      // Aceitar apenas números
      if (!/^\d*$/.test(value)) return;

      const novosCodigos = [...codigoRecuperacao];
      novosCodigos[index] = value;
      setCodigoRecuperacao(novosCodigos);

      // Auto-focus no próximo campo
      if (value && index < 4) {
        inputsRecuperacaoRefs.current[index + 1]?.focus();
      }

      // Limpar erro se existir
      if (fieldErrors.codigoRecuperacao) {
        setFieldErrors({
          ...fieldErrors,
          codigoRecuperacao: "",
        });
      }
    };

    const handleKeyDown = (index, e) => {
      // Backspace: voltar para o campo anterior se estiver vazio
      if (e.key === "Backspace" && !codigoRecuperacao[index] && index > 0) {
        inputsRecuperacaoRefs.current[index - 1]?.focus();
      }
    };

    const handlePaste = (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 5);
      const novosDigitos = pastedData.split("");
      const novosCodigos = ["", "", "", "", ""];

      novosDigitos.forEach((digito, idx) => {
        if (idx < 5) novosCodigos[idx] = digito;
      });

      setCodigoRecuperacao(novosCodigos);

      // Focar no próximo campo vazio ou no último
      const proximoIndiceVazio =
        novosDigitos.length < 5 ? novosDigitos.length : 4;
      inputsRecuperacaoRefs.current[proximoIndiceVazio]?.focus();
    };

    return (
      <div className="login-codigo-inputs-container">
        {codigoRecuperacao.map((digito, index) => (
          <input
            key={index}
            ref={(el) => (inputsRecuperacaoRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength="1"
            value={digito}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={carregando}
            className={`login-codigo-input ${
              fieldErrors.codigoRecuperacao ? "input-error" : ""
            }`}
          />
        ))}
      </div>
    );
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      // Do nothing - keep modal open
      return;
    }
  };

  const handleToggleTermos = () => {
    if (mostrarTermos) {
      setFechandoTermos(true);
      setTimeout(() => {
        setMostrarTermos(false);
        setFechandoTermos(false);
      }, 300);
    } else {
      setMostrarTermos(true);
    }
  };

  const handleTogglePrivacidade = () => {
    if (mostrarPrivacidade) {
      setFechandoPrivacidade(true);
      setTimeout(() => {
        setMostrarPrivacidade(false);
        setFechandoPrivacidade(false);
      }, 300);
    } else {
      setMostrarPrivacidade(true);
    }
  };

  return (
    <div className="login-modal-overlay" onClick={handleOverlayClick}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        {carregando && <div className="login-modal-loading-overlay"></div>}

        <button
          className="login-close-btn"
          onClick={onClose}
          disabled={carregando}
          title=" Fechar"
        >
          <IoClose size={28} />
        </button>

        {error && <p className="login-error-msg">{error}</p>}

        {tab === "login" && (
          <form onSubmit={handleLogin} className="login-form">
            <div className="login-modal-logo-container">
              <img
                src={logo_azul || "/placeholder.svg"}
                alt="Nolare Logo"
                className="login-modal-logo-popup"
              />
            </div>

            <h2 className="login-form-title">Entrar</h2>

            <div className="login-form-group">
              <label htmlFor="loginEmail">Email</label>
              <input
                id="loginEmail"
                type="email"
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                  if (fieldErrors.loginEmail) {
                    setFieldErrors({ ...fieldErrors, loginEmail: "" });
                  }
                }}
                disabled={carregando}
                className={`login-input ${
                  fieldErrors.loginEmail ? "input-error" : ""
                }`}
              />
              {fieldErrors.loginEmail && (
                <p className="login-field-error">{fieldErrors.loginEmail}</p>
              )}
            </div>

            <div className="login-form-group">
              <label htmlFor="loginSenha">Senha</label>
              <div className="login-password-container">
                <input
                  id="loginSenha"
                  type={showLoginSenha ? "text" : "password"}
                  value={loginSenha}
                  onChange={(e) => {
                    setLoginSenha(e.target.value);
                    if (fieldErrors.loginSenha) {
                      setFieldErrors({ ...fieldErrors, loginSenha: "" });
                    }
                  }}
                  disabled={carregando}
                  className={`login-input ${
                    fieldErrors.loginSenha ? "input-error" : ""
                  }`}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowLoginSenha(!showLoginSenha)}
                  disabled={carregando}
                >
                  {showLoginSenha ? (
                    <IoEyeOutline size={20} />
                  ) : (
                    <IoEyeOffOutline size={20} />
                  )}
                </button>
              </div>
              {fieldErrors.loginSenha && (
                <p className="login-field-error">{fieldErrors.loginSenha}</p>
              )}

              <div className="login-footer-controls">
                <div className="login-checkbox-group">
                  <input
                    id="lembrarMe"
                    type="checkbox"
                    checked={lembrarMe}
                    onChange={(e) => setLembrarMe(e.target.checked)}
                    disabled={carregando}
                    className="login-checkbox"
                  />
                  <label htmlFor="lembrarMe" className="login-checkbox-label">
                    Lembrar-me
                  </label>
                </div>
                <a
                  href="#"
                  className="login-forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!carregando) {
                      setTab("recuperacao");
                      setError("");
                      setFieldErrors({});
                      setEtapaRecuperacao("email");
                    }
                  }}
                >
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar"}
            </button>

            <div className="login-footer-text">
              Não possui uma conta?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (!carregando) {
                    setTab("register");
                    setError("");
                    setFieldErrors({});
                  }
                }}
              >
                Crie uma agora
              </a>
            </div>
          </form>
        )}

        {tab === "register" && (
          <>
            {etapaCadastro === "form" && (
              <form onSubmit={handleRegister} className="login-form">
                <div className="login-modal-logo-container">
                  <img
                    src={logo_azul || "/placeholder.svg"}
                    alt="Nolare Logo"
                    className="login-modal-logo-popup"
                  />
                </div>

                <h2 className="login-form-title">Criar Conta</h2>

                <div className="login-form-group">
                  <label htmlFor="registerNome">Nome</label>
                  <input
                    id="registerNome"
                    type="text"
                    value={registerNome}
                    onChange={(e) => {
                      setRegisterNome(e.target.value);
                      if (fieldErrors.registerNome) {
                        setFieldErrors({ ...fieldErrors, registerNome: "" });
                      }
                    }}
                    disabled={carregando}
                    className={`login-input ${
                      fieldErrors.registerNome ? "input-error" : ""
                    }`}
                  />
                  {fieldErrors.registerNome && (
                    <p className="login-field-error">
                      {fieldErrors.registerNome}
                    </p>
                  )}
                </div>

                <div className="login-form-group">
                  <label htmlFor="registerEmail">Email</label>
                  <input
                    id="registerEmail"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => {
                      setRegisterEmail(e.target.value);
                      if (fieldErrors.registerEmail) {
                        setFieldErrors({ ...fieldErrors, registerEmail: "" });
                      }
                    }}
                    disabled={carregando}
                    className={`login-input ${
                      fieldErrors.registerEmail ? "input-error" : ""
                    }`}
                  />
                  {fieldErrors.registerEmail && (
                    <p className="login-field-error">
                      {fieldErrors.registerEmail}
                    </p>
                  )}
                </div>

                <div className="login-form-group">
                  <label htmlFor="registerSenha">Senha</label>
                  <div className="login-password-container">
                    <input
                      id="registerSenha"
                      type={showRegisterSenha ? "text" : "password"}
                      value={registerSenha}
                      onChange={(e) => {
                        setRegisterSenha(e.target.value);
                        if (fieldErrors.registerSenha) {
                          setFieldErrors({ ...fieldErrors, registerSenha: "" });
                        }
                      }}
                      disabled={carregando}
                      className={`login-input ${
                        fieldErrors.registerSenha ? "input-error" : ""
                      }`}
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() => setShowRegisterSenha(!showRegisterSenha)}
                      disabled={carregando}
                    >
                      {showRegisterSenha ? (
                        <IoEyeOutline size={20} />
                      ) : (
                        <IoEyeOffOutline size={20} />
                      )}
                    </button>
                  </div>
                  {fieldErrors.registerSenha && (
                    <p className="login-field-error">
                      {fieldErrors.registerSenha}
                    </p>
                  )}
                </div>

                <div className="login-form-group">
                  <label htmlFor="registerConfirmSenha">Confirmar Senha</label>
                  <div className="login-password-container">
                    <input
                      id="registerConfirmSenha"
                      type={showRegisterConfirmSenha ? "text" : "password"}
                      value={registerConfirmSenha}
                      onChange={(e) => {
                        setRegisterConfirmSenha(e.target.value);
                        if (fieldErrors.registerConfirmSenha) {
                          setFieldErrors({
                            ...fieldErrors,
                            registerConfirmSenha: "",
                          });
                        }
                      }}
                      disabled={carregando}
                      className={`login-input ${
                        fieldErrors.registerConfirmSenha ? "input-error" : ""
                      }`}
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() =>
                        setShowRegisterConfirmSenha(!showRegisterConfirmSenha)
                      }
                      disabled={carregando}
                    >
                      {showRegisterConfirmSenha ? (
                        <IoEyeOutline size={20} />
                      ) : (
                        <IoEyeOffOutline size={20} />
                      )}
                    </button>
                  </div>
                  {fieldErrors.registerConfirmSenha && (
                    <p className="login-field-error">
                      {fieldErrors.registerConfirmSenha}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="login-btn"
                  disabled={carregando}
                >
                  {carregando ? "Criando conta..." : "Cadastrar"}
                </button>

                <div className="login-footer-text">
                  Já possui uma conta?{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!carregando) {
                        setTab("login");
                        setError("");
                        setFieldErrors({});
                      }
                    }}
                  >
                    Faça login
                  </a>
                </div>
              </form>
            )}

            {etapaCadastro === "verificacao" && (
              <form onSubmit={handleVerificacaoCadastro} className="login-form">
                <div className="login-modal-logo-container">
                  <img
                    src={logo_azul || "/placeholder.svg"}
                    alt="Nolare Logo"
                    className="login-modal-logo-popup"
                  />
                </div>

                <h2 className="login-form-title">Confirme seu Email</h2>
                <p className="login-verification-subtitle">
                  Envimos um código de 5 dígitos para{" "}
                  <strong>{emailCadastroVerificacao}</strong>
                </p>

                <div className="login-form-group">
                  <label>Código de Verificação</label>
                  {renderCodigoVerificacao()}
                  {fieldErrors.codigoCadastroVerificacao && (
                    <p className="login-field-error">
                      {fieldErrors.codigoCadastroVerificacao}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="login-btn"
                  disabled={carregando}
                >
                  {carregando ? "Verificando..." : "Confirmar Código"}
                </button>

                <button
                  type="button"
                  className="login-resend-btn"
                  onClick={handleReenviarCodigoCadastro}
                  disabled={carregando}
                >
                  Reenviar Código
                </button>
              </form>
            )}

            {etapaCadastro === "verificacaoTermos" && (
              <div className="login-form-wrapper">
                <div className="login-form-header">
                  <h2 className="login-form-title">Termos e Condições</h2>
                  <p className="login-form-subtitle">
                    Por favor, leia e aceite os termos para concluir seu
                    cadastro
                  </p>
                </div>

                {error && (
                  <div className="login-alert login-alert-error" role="alert">
                    {error}
                  </div>
                )}

                <div className="login-terms-section">
                  <div
                    className="login-terms-header"
                    onClick={handleToggleTermos}
                    style={{ cursor: "pointer" }}
                  >
                    <h3 className="login-terms-title">
                      {mostrarTermos ? "▼" : "▶"} Termos de Uso
                    </h3>
                  </div>
                  {mostrarTermos && (
                    <div
                      className={`login-terms-content ${
                        fechandoTermos ? "closing" : ""
                      }`}
                    >
                      <TermosDeUso />
                    </div>
                  )}
                </div>

                <div className="login-terms-section">
                  <div
                    className="login-terms-header"
                    onClick={handleTogglePrivacidade}
                    style={{ cursor: "pointer" }}
                  >
                    <h3 className="login-terms-title">
                      {mostrarPrivacidade ? "▼" : "▶"} Política de Privacidade
                    </h3>
                  </div>
                  {mostrarPrivacidade && (
                    <div
                      className={`login-terms-content ${
                        fechandoPrivacidade ? "closing" : ""
                      }`}
                    >
                      <PoliticaDePrivacidade />
                    </div>
                  )}
                </div>

                <div className="login-form-group">
                  <div className="login-checkbox-group">
                    <input
                      id="aceitouTermos"
                      type="checkbox"
                      checked={aceitouTermos}
                      onChange={(e) => {
                        setAceitouTermos(e.target.checked);
                        if (e.target.checked && aceitouPrivacidade && error) {
                          setError("");
                        }
                      }}
                      disabled={carregando}
                      className="login-checkbox"
                    />
                    <label
                      htmlFor="aceitouTermos"
                      className="login-checkbox-label"
                    >
                      Aceito os Termos de Uso
                    </label>
                  </div>
                </div>

                <div className="login-form-group">
                  <div className="login-checkbox-group">
                    <input
                      id="aceitouPrivacidade"
                      type="checkbox"
                      checked={aceitouPrivacidade}
                      onChange={(e) => {
                        setAceitouPrivacidade(e.target.checked);
                        if (e.target.checked && aceitouTermos && error) {
                          setError("");
                        }
                      }}
                      disabled={carregando}
                      className="login-checkbox"
                    />
                    <label
                      htmlFor="aceitouPrivacidade"
                      className="login-checkbox-label"
                    >
                      Aceito a Política de Privacidade
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  className="login-btn"
                  onClick={handleConfirmarCadastroComTermos}
                  disabled={carregando}
                >
                  {carregando ? "Confirmando..." : "Confirmar Cadastro"}
                </button>
              </div>
            )}
          </>
        )}

        {tab === "recuperacao" && (
          <>
            {etapaRecuperacao === "email" && (
              <form
                onSubmit={handleSolicitarRecuperacao}
                className="login-form"
              >
                <div className="login-modal-logo-container">
                  <img
                    src={logo_azul || "/placeholder.svg"}
                    alt="Nolare Logo"
                    className="login-modal-logo-popup"
                  />
                </div>

                <h2 className="login-form-title">Recuperar Senha</h2>

                <div className="login-form-group">
                  <label htmlFor="recuperacaoEmail">Email</label>
                  <input
                    id="recuperacaoEmail"
                    type="email"
                    value={recuperacaoEmail}
                    onChange={(e) => {
                      setRecuperacaoEmail(e.target.value);
                      if (fieldErrors.recuperacaoEmail) {
                        setFieldErrors({
                          ...fieldErrors,
                          recuperacaoEmail: "",
                        });
                      }
                    }}
                    disabled={carregando}
                    className={`login-input ${
                      fieldErrors.recuperacaoEmail ? "input-error" : ""
                    }`}
                  />
                  {fieldErrors.recuperacaoEmail && (
                    <p className="login-field-error">
                      {fieldErrors.recuperacaoEmail}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="login-btn"
                  disabled={carregando}
                >
                  {carregando ? "Enviando..." : "Solicitar Código"}
                </button>
              </form>
            )}

            {etapaRecuperacao === "codigo" && (
              <form onSubmit={handleValidarCodigo} className="login-form">
                <div className="login-modal-logo-container">
                  <img
                    src={logo_azul || "/placeholder.svg"}
                    alt="Nolare Logo"
                    className="login-modal-logo-popup"
                  />
                </div>

                <h2 className="login-form-title">Digite o Código</h2>
                <p className="login-verification-subtitle">
                  Envimos um código de 5 dígitos para{" "}
                  <strong>{recuperacaoEmail}</strong>
                </p>

                <div className="login-form-group">
                  <label>Código de Recuperação</label>
                  {renderCodigoRecuperacao()}
                  {fieldErrors.codigoRecuperacao && (
                    <p className="login-field-error">
                      {fieldErrors.codigoRecuperacao}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="login-btn"
                  disabled={carregando}
                >
                  {carregando ? "Validando..." : "Próximo"}
                </button>
              </form>
            )}

            {etapaRecuperacao === "senha" && (
              <form onSubmit={handleRedefinirSenha} className="login-form">
                <div className="login-modal-logo-container">
                  <img
                    src={logo_azul || "/placeholder.svg"}
                    alt="Nolare Logo"
                    className="login-modal-logo-popup"
                  />
                </div>

                <h2 className="login-form-title">Redefinir Senha</h2>

                <div className="login-form-group">
                  <label htmlFor="novaSenha">Nova Senha</label>
                  <div className="login-password-container">
                    <input
                      id="novaSenha"
                      type={showNovaSenha ? "text" : "password"}
                      value={novaSenha}
                      onChange={(e) => {
                        setNovaSenha(e.target.value);
                        if (fieldErrors.novaSenha) {
                          setFieldErrors({ ...fieldErrors, novaSenha: "" });
                        }
                      }}
                      disabled={carregando}
                      className={`login-input ${
                        fieldErrors.novaSenha ? "input-error" : ""
                      }`}
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() => setShowNovaSenha(!showNovaSenha)}
                      disabled={carregando}
                    >
                      {showNovaSenha ? (
                        <IoEyeOutline size={20} />
                      ) : (
                        <IoEyeOffOutline size={20} />
                      )}
                    </button>
                  </div>
                  {fieldErrors.novaSenha && (
                    <p className="login-field-error">{fieldErrors.novaSenha}</p>
                  )}
                </div>

                <div className="login-form-group">
                  <label htmlFor="confirmarNovaSenha">
                    Confirmar Nova Senha
                  </label>
                  <div className="login-password-container">
                    <input
                      id="confirmarNovaSenha"
                      type={showConfirmarNovaSenha ? "text" : "password"}
                      value={confirmarNovaSenha}
                      onChange={(e) => {
                        setConfirmarNovaSenha(e.target.value);
                        if (fieldErrors.confirmarNovaSenha) {
                          setFieldErrors({
                            ...fieldErrors,
                            confirmarNovaSenha: "",
                          });
                        }
                      }}
                      disabled={carregando}
                      className={`login-input ${
                        fieldErrors.confirmarNovaSenha ? "input-error" : ""
                      }`}
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() =>
                        setShowConfirmarNovaSenha(!showConfirmarNovaSenha)
                      }
                      disabled={carregando}
                    >
                      {showConfirmarNovaSenha ? (
                        <IoEyeOutline size={20} />
                      ) : (
                        <IoEyeOffOutline size={20} />
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmarNovaSenha && (
                    <p className="login-field-error">
                      {fieldErrors.confirmarNovaSenha}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="login-btn"
                  disabled={carregando}
                >
                  {carregando ? "Redefinindo..." : "Redefinir Senha"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
