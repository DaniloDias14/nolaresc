"use client";

import "./Footer.css";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { MdPhone } from "react-icons/md";
import { Link } from "react-router-dom";
import logo_branco from "../../assets/img/logo/logo_branco.png";
import {
  buildCommercialWhatsAppUrl,
  buildSupportWhatsAppUrl,
} from "../../utils/whatsapp.js";

const Footer = () => {
  const whatsappComercialUrl = buildCommercialWhatsAppUrl();
  const whatsappSuporteUrl = buildSupportWhatsAppUrl();

  const handleSobreNosClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo-section">
          <div className="footer-logo-container">
            <Link
              to="/sobre-nos"
              className="footer-logo-link"
              onClick={handleSobreNosClick}
            >
              <img
                src={logo_branco || "/placeholder.svg"}
                alt="Nolare"
                className="footer-logo-img"
              />
            </Link>
            <div className="footer-logo-text-wrapper">
              <div className="footer-logo-text">
                <h3>Nolare</h3>
              </div>
              <p className="footer-slogan">Transformando lugares em lares.</p>
            </div>
          </div>
        </div>

        <div className="footer-section">
          <h4>Contato</h4>
          <div className="footer-contact">
            <a
              href={whatsappComercialUrl}
              className="contact-item"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Comercial"
            >
              <MdPhone size={18} />
              <span>Comercial: (48) 99157-6559</span>
            </a>
            <a
              href={whatsappSuporteUrl}
              className="contact-item"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Suporte"
            >
              <MdPhone size={18} />
              <span>Suporte: (48) 99172-0855</span>
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Redes Sociais</h4>
          <div className="footer-social">
            <a
              href="https://facebook.com/nolare"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook size={24} />
            </a>
            <a
              href="https://instagram.com/nolare"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram size={24} />
            </a>
            <a
              href="https://linkedin.com/company/nolare"
              aria-label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin size={24} />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Informações Legais</h4>
          <div className="footer-legal">
            <Link to="/politica-de-privacidade" onClick={handleScrollToTop}>
              Política de Privacidade
            </Link>
            <Link to="/termos-de-uso" onClick={handleScrollToTop}>
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Nolare. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
