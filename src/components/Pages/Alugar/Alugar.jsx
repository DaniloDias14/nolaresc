import "./Alugar.css";
import logo_azul from "../../../assets/img/logo/logo_azul.png";

const Alugar = () => {
  return (
    <main className="alugar-container">
      <div className="alugar-content">
        <div className="alugar-illustration">
          <div className="floating-home">
            <img
              src={logo_azul || "/placeholder.svg"}
              alt="Nolare Logo"
              style={{ width: "200px", height: "auto" }}
            />
          </div>
        </div>

        <h1 className="alugar-title">Aluguel em Desenvolvimento</h1>
        <p className="alugar-text">
          Ainda não trabalhamos com aluguel, mas em breve estaremos prontos para
          isso.
        </p>
        <p className="alugar-subtext">
          Estamos preparando as melhores opções de imóveis para locação. Fique
          atento!
        </p>
      </div>
    </main>
  );
};

export default Alugar;
