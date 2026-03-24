"use client";

import "./PoliticaDePrivacidade.css";
import {
  LEGAL_LAST_UPDATED,
  PoliticaDePrivacidadeConteudo,
} from "./LegalContent";

const PoliticaDePrivacidade = () => {
  return (
    <div className="legal-wrapper">
      <div className="legal-container">
        <section className="legal-header">
          <h1 className="legal-title">Política de Privacidade</h1>
          <p className="legal-subtitle">Nolare Imobiliária</p>
          <p className="legal-date">Última atualização: {LEGAL_LAST_UPDATED}</p>
        </section>

        <PoliticaDePrivacidadeConteudo />
      </div>
    </div>
  );
};

export default PoliticaDePrivacidade;

