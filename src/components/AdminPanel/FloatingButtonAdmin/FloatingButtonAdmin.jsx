"use client";
import { FiSettings } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./FloatingButtonAdmin.css";

const FloatingButtonAdmin = ({
  showConfigOptions,
  setShowConfigOptions,
  onAdicionarImovelClick,
  onDashboardClick,
  onOcultarImovelClick,
  onAdicionarAdminClick,
}) => {
  const navigate = useNavigate();

  // Função para navegar até a página de curtidas
  const handleCurtidasClick = () => {
    navigate("/curtidas");
    setShowConfigOptions(false);
  };

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
        <button onClick={handleCurtidasClick} className="config-link">
          Curtidas
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
