"use client";
import { FiSettings } from "react-icons/fi";
import "./FloatingButtonAdmin.css";

const FloatingButtonAdmin = ({
  showConfigOptions,
  setShowConfigOptions,
  onAdicionarImovelClick,
  onDashboardClick,
  onOcultarImovelClick,
  onAdicionarAdminClick,
}) => {
  return (
    <div className="floating-container">
      {/* Botão principal */}
      <button
        className="floating-btn"
        onClick={() => setShowConfigOptions(!showConfigOptions)}
      >
        <FiSettings size={24} className="settings-icon" />
      </button>

      <div className={`config-options ${showConfigOptions ? "show" : ""}`}>
        <button onClick={onAdicionarAdminClick} className="config-link">
          Adicionar Adm
        </button>
        <button onClick={onAdicionarImovelClick} className="config-link">
          Adicionar Imóvel
        </button>
        <button onClick={onDashboardClick} className="config-link">
          Dashboard
        </button>
        <button onClick={onOcultarImovelClick} className="config-link">
          Imóveis Ocultos
        </button>
      </div>
    </div>
  );
};

export default FloatingButtonAdmin;
