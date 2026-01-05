"use client";

import { FaWhatsapp, FaFileAlt, FaSearchPlus, FaRocket } from "react-icons/fa";
import "./Anunciar.css";

const Anunciar = ({ usuario }) => {
  return (
    <div className="anunciar-wrapper">
      <div className="anunciar-container">
        {/* Hero Section */}
        <section className="anunciar-hero">
          <div className="anunciar-hero-content">
            <h1 className="anunciar-hero-title">Quer vender seu imóvel?</h1>
            <p className="anunciar-hero-text">
              Seu imóvel merece ser visto. Nossa equipe avalia cada imóvel para
              garantir qualidade, visibilidade e resultados.
            </p>
            <button
              className="anunciar-btn-primary"
              onClick={() => {
                window.open(
                  "https://docs.google.com/forms/d/e/1FAIpQLScT6m0_uwqUVvZzgjGlfGhGO15uT1sI07n-rBqOkYnagyzFlQ/viewform?usp=header",
                  "_blank"
                );
              }}
            >
              Anunciar meu imóvel
            </button>
          </div>
        </section>

        {/* Process Section */}
        <section className="anunciar-process">
          <h2 className="anunciar-process-title">Como funciona</h2>
          <div className="anunciar-process-grid">
            <div className="anunciar-process-card">
              <div className="anunciar-process-icon-wrapper">
                <FaFileAlt className="anunciar-process-icon" />
              </div>
              <h3 className="anunciar-process-card-title">Envie os dados</h3>
              <p className="anunciar-process-card-text">
                Preencha nosso formulário com as informações e fotos do seu
                imóvel.
              </p>
            </div>

            <div className="anunciar-process-card">
              <div className="anunciar-process-icon-wrapper">
                <FaSearchPlus className="anunciar-process-icon" />
              </div>
              <h3 className="anunciar-process-card-title">Avaliamos</h3>
              <p className="anunciar-process-card-text">
                Nossa equipe analisa os detalhes e entra em contato para
                confirmar.
              </p>
            </div>

            <div className="anunciar-process-card">
              <div className="anunciar-process-icon-wrapper">
                <FaRocket className="anunciar-process-icon" />
              </div>
              <h3 className="anunciar-process-card-title">Anunciamos</h3>
              <p className="anunciar-process-card-text">
                Seu imóvel fica visível na Nolare e recebe destaque especial.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="anunciar-contact">
          <div className="anunciar-contact-content">
            <h2 className="anunciar-contact-title">
              Prefere conversar com a gente?
            </h2>
            <p className="anunciar-contact-text">
              Tire suas dúvidas diretamente com nosso time via WhatsApp
            </p>
            <button
              className="anunciar-btn-whatsapp"
              onClick={() => {
                window.open("https://www.youtube.com", "_blank");
              }}
            >
              <FaWhatsapp className="anunciar-whatsapp-icon" />
              Entrar em contato via WhatsApp
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Anunciar;
