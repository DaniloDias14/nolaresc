"use client";
import "./SobreNos.css";
import logo_azul from "../../../assets/img/logo/logo_azul.png";
import danilo_dias from "../../../assets/img/equipe/danilo_dias.jpg";
import marco_dias from "../../../assets/img/equipe/marco_dias.jpg";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaEnvelope,
  FaWhatsapp,
} from "react-icons/fa";
import {
  buildCommercialWhatsAppUrl,
  buildSupportWhatsAppUrl,
} from "../../../utils/whatsapp.js";

const SobreNos = ({ usuario }) => {
  const equipaRedesSociais = [
    {
      id: 1,
      icon: <FaEnvelope />,
      link: "https://youtube.com",
      nome: "E-mail",
    },
    {
      id: 2,
      icon: <FaFacebook />,
      link: "https://youtube.com",
      nome: "Facebook",
    },
    {
      id: 3,
      icon: <FaInstagram />,
      link: "https://youtube.com",
      nome: "Instagram",
    },
    {
      id: 4,
      icon: <FaLinkedin />,
      link: "https://youtube.com",
      nome: "LinkedIn",
    },
  ];

  const contatoOptions = [
    {
      id: 1,
      icon: <FaEnvelope />,
      titulo: "E-mail",
      valor: "contato@nolare.com",
      link: "mailto:contato@nolare.com",
      tipo: "email",
    },
    {
      id: 2,
      icon: <FaWhatsapp />,
      titulo: "WhatsApp - Comercial",
      valor: "(48) 99157-6559",
      link: buildCommercialWhatsAppUrl(),
      tipo: "whatsapp",
    },
    {
      id: 3,
      icon: <FaWhatsapp />,
      titulo: "WhatsApp - Suporte",
      valor: "(48) 99172-0855",
      link: buildSupportWhatsAppUrl(),
      tipo: "whatsapp",
    },
  ];

  const equipa = [
    {
      id: 1,
      nome: "Danilo Dias",
      cargo: "Fundador",
      foto: danilo_dias,
    },
    {
      id: 2,
      nome: "Marco Dias",
      cargo: "Corretor de Imóveis - CRECI: 53498",
      foto: marco_dias,
    },
  ];

  const redesSociais = [
    {
      id: 1,
      icon: <FaFacebook />,
      link: "https://facebook.com/nolare",
      nome: "Facebook",
    },
    {
      id: 2,
      icon: <FaInstagram />,
      link: "https://instagram.com/nolare",
      nome: "Instagram",
    },
    {
      id: 3,
      icon: <FaLinkedin />,
      link: "https://linkedin.com/company/nolare",
      nome: "LinkedIn",
    },
  ];

  const handleIconClick = (link) => {
    window.open(link, "_blank");
  };

  return (
    <div className="sobrenos-wrapper">
      <div className="sobrenos-container">
        {/* ==================== SEÇÃO 1: INTRODUÇÃO ==================== */}
        <section className="sobrenos-introducao">
          <div className="sobrenos-introducao-content">
            <div className="sobrenos-logo-container">
              <img
                src={logo_azul || "/placeholder.svg"}
                alt="Nolare Logo"
                className="sobrenos-logo"
              />
            </div>
            <h1 className="sobrenos-introducao-title">Nolare</h1>
            <p className="sobrenos-introducao-subtitle">
              Transformando lugares em lares
            </p>
            <p className="sobrenos-introducao-text sobrenos-text-centered">
              Encontrar o espaço certo é uma jornada que envolve expectativas,
              lembranças e planos para o futuro. O que torna essa jornada
              especial é o cuidado em cada passo, o respeito por cada escolha e
              a certeza de que um lar representa um novo começo.
            </p>
            <p className="sobrenos-introducao-text">
              Nosso objetivo é facilitar o caminho de quem busca ou oferece um
              imóvel. Porque transformar lugares em lares é o que dá sentido ao
              que fazemos.
            </p>
          </div>
        </section>

        {/* ==================== SEÇÃO 2: CONTATO E REDES SOCIAIS ==================== */}
        <section className="sobrenos-contato">
          <h2 className="sobrenos-contato-title">Entre em Contato</h2>
          <p className="sobrenos-contato-intro">
            Se quiser saber mais sobre nossos serviços ou tirar dúvidas, estamos
            sempre disponíveis para conversar. Nossa equipe tem prazer em
            orientar, ouvir e encontrar as melhores soluções para cada
            necessidade.
          </p>

          <div className="sobrenos-contato-grid">
            {contatoOptions.map((opcao) => (
              <div key={opcao.id} className="sobrenos-contato-card">
                <button
                  className="sobrenos-contato-icon-button"
                  onClick={() => handleIconClick(opcao.link)}
                  title={opcao.titulo}
                >
                  {opcao.icon}
                </button>
                <h3>{opcao.titulo}</h3>
                <p>{opcao.valor}</p>
              </div>
            ))}
          </div>

          <div className="sobrenos-redes-section">
            <h3 className="sobrenos-redes-title">Siga-nos nas Redes Sociais</h3>
            <div className="sobrenos-redes-container">
              {redesSociais.map((rede) => (
                <a
                  key={rede.id}
                  href={rede.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sobrenos-rede-link"
                  title={rede.nome}
                >
                  {rede.icon}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== SEÇÃO 3: EQUIPE ==================== */}
        <section className="sobrenos-equipa">
          <div className="sobrenos-equipa-header">
            <h2 className="sobrenos-equipa-title">Equipe</h2>
            <p className="sobrenos-equipa-intro">
              Conheça os profissionais que fazem parte desta jornada,
              comprometidos com qualidade, confiança e o desejo de criar algo
              verdadeiro.
            </p>
          </div>

          <div className="sobrenos-equipa-grid">
            {equipa.map((membro) => (
              <div key={membro.id} className="sobrenos-equipa-card">
                <div className="sobrenos-equipa-image-wrapper">
                  <img
                    src={membro.foto || "/placeholder.svg"}
                    alt={membro.nome}
                    className="sobrenos-equipa-image"
                  />
                </div>
                <div className="sobrenos-equipa-content">
                  <h3 className="sobrenos-equipa-nome">{membro.nome}</h3>
                  <p className="sobrenos-equipa-cargo">{membro.cargo}</p>
                  <div className="sobrenos-equipa-redes">
                    {equipaRedesSociais.map((rede) => (
                      <a
                        key={rede.id}
                        href={rede.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sobrenos-equipa-rede-link"
                        title={rede.nome}
                      >
                        {rede.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================== SEÇÃO 4: TRABALHE CONOSCO ==================== */}
        <section className="sobrenos-trabalhe">
          <div className="sobrenos-trabalhe-content">
            <h2 className="sobrenos-trabalhe-title">Faça Parte da Equipe</h2>
            <p className="sobrenos-trabalhe-text sobrenos-text-centered">
              Queremos ao nosso lado pessoas que enxergam sentido em transformar
              lugares em lares. Profissionais que têm empatia, vontade de
              aprender e acreditam que o trabalho pode gerar impacto real na
              vida das pessoas. Se você gosta de desafios e busca fazer parte de
              algo com propósito, aqui é o seu lugar.
            </p>
            <p className="sobrenos-trabalhe-text">
              Valorizamos quem busca aprender, compartilhar e crescer junto.
              Mais do que um time, somos uma rede de pessoas que acreditam no
              poder de transformar lugares em lares.
            </p>
            <button
              className="sobrenos-btn-curriculo"
              onClick={() => window.open("https://www.youtube.com", "_blank")}
            >
              📄 Envie seu Currículo
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SobreNos;
