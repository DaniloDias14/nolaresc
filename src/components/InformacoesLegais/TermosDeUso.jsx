"use client";

import "./TermosDeUso.css";
import { LEGAL_LAST_UPDATED, TermosDeUsoConteudo } from "./LegalContent";

const TermosDeUso = () => {
  return (
    <div className="legal-wrapper">
      <div className="legal-container">
        <section className="legal-header">
          <h1 className="legal-title">Termos de Uso</h1>
          <p className="legal-subtitle">Nolare Imobiliária</p>
          <p className="legal-date">Última atualização: {LEGAL_LAST_UPDATED}</p>
        </section>

        <TermosDeUsoConteudo />
      </div>
    </div>
  );
};

export default TermosDeUso;

