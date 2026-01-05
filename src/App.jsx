"use client";

import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

// Páginas públicas
import Comprar from "./components/Pages/Comprar/Comprar";
import Alugar from "./components/Pages/Alugar/Alugar";
import Anunciar from "./components/Pages/Anunciar/Anunciar";
import SobreNos from "./components/Pages/SobreNos/SobreNos";
import ImovelPage from "./components/Pages/ImovelPage/ImovelPage";

import PoliticaDePrivacidade from "./components/InformacoesLegais/PoliticaDePrivacidade";
import TermosDeUso from "./components/InformacoesLegais/TermosDeUso";
import AdicionarImovel from "./components/AdminPanel/AdicionarImovel/AdicionarImovel";
import EditarImovel from "./components/AdminPanel/EditarImovel/EditarImovel";
import OcultarImovel from "./components/AdminPanel/OcultarImovel/OcultarImovel";
import AdicionarAdmin from "./components/AdminPanel/AdicionarAdmin/AdicionarAdmin";
import Dashboard from "./components/AdminPanel/Dashboard/Dashboard";

// Botões flutuantes e painel do usuário
import AdminFloatingButton from "./components/AdminPanel/FloatingButtonAdmin/FloatingButtonAdmin";
import UserFloatingButton from "./components/UserPanel/FloatingButtonUser/FloatingButtonUser";
import Curtidas from "./components/UserPanel/Curtidas/Curtidas.jsx";

const ProtectedAdminRoute = ({ children, user, isLoggedIn }) => {
  if (!isLoggedIn || !user || user.tipo_usuario !== "adm") {
    return null;
  }
  return children;
};

const ProtectedUserRoute = ({ children, user, isLoggedIn }) => {
  if (!isLoggedIn || !user || user.tipo_usuario !== "user") {
    return null;
  }
  return children;
};

const App = () => {
  // Estados de autenticação e controle de usuário
  const [admLogged, setAdmLogged] = useState(false); // Controla se o usuário é administrador
  const [user, setUser] = useState(null); // Armazena dados do usuário logado
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Controla se há usuário logado

  // Estados de controle de interface
  const [showConfigOptions, setShowConfigOptions] = useState(false); // Controla menu de opções do admin
  const [showAdicionarImovelPopup, setShowAdicionarImovelPopup] =
    useState(false); // Controla popup de adicionar imóvel
  const [showEditarImovelPopup, setShowEditarImovelPopup] = useState(false);
  const [imovelIdToEdit, setImovelIdToEdit] = useState(null);
  const [showAdicionarAdminPopup, setShowAdicionarAdminPopup] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const isDashboardRoute = location.pathname === "/dashboard";

  // Recupera dados do usuário do localStorage ao carregar a aplicação
  useEffect(() => {
    const savedUser = localStorage.getItem("nolare_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setAdmLogged(parsedUser.tipo_usuario === "adm");
      setIsLoggedIn(true);
    }
  }, []);

  // Abre popup de adicionar imóvel (apenas para admin)
  const handleAdicionarImovelClick = () => {
    setShowAdicionarImovelPopup(true);
    setShowConfigOptions(false);
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
    setShowConfigOptions(false);
  };

  const handleOcultarImovelClick = () => {
    navigate("/imoveis-ocultos");
    setShowConfigOptions(false);
  };

  const handleAdicionarAdminClick = () => {
    setShowAdicionarAdminPopup(true);
    setShowConfigOptions(false);
  };

  // Atualiza estado de login quando usuário faz login via Header
  const handleUserLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setAdmLogged(userData.tipo_usuario === "adm");
  };

  const handleUserLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setAdmLogged(false);
    localStorage.removeItem("nolare_user");
  };

  // Abre popup de editar imóvel com imóvel data (apenas para admin)
  const handleEditarImovelClick = (imovelId) => {
    setImovelIdToEdit(imovelId);
    setShowEditarImovelPopup(true);
    setShowConfigOptions(false);
  };

  return (
    <div className="app-container">
      {/* Header é ocultado apenas na rota do dashboard */}
      {!isDashboardRoute && (
        <Header
          setAdmLogged={setAdmLogged}
          setUser={handleUserLogin}
          user={user}
          isLoggedIn={isLoggedIn}
          onLogout={handleUserLogout}
          onAdicionarAdminClick={handleAdicionarAdminClick}
          onAdicionarImovelClick={handleAdicionarImovelClick}
        />
      )}

      {/* Rotas principais da aplicação */}
      <main>
        <Routes>
          {/* Redireciona raiz para /comprar */}
          <Route path="/" element={<Navigate to="/comprar" replace />} />

          {/* Páginas públicas */}
          <Route
            path="/comprar"
            element={<Comprar usuario={isLoggedIn ? user : null} />}
          />
          <Route
            path="/alugar"
            element={<Alugar usuario={isLoggedIn ? user : null} />}
          />
          <Route
            path="/anunciar"
            element={<Anunciar usuario={isLoggedIn ? user : null} />}
          />
          <Route path="/sobre-nos" element={<SobreNos />} />

          <Route
            path="/politica-de-privacidade"
            element={<PoliticaDePrivacidade />}
          />
          <Route path="/termos-de-uso" element={<TermosDeUso />} />

          {/* Rota para visualização de imóvel individual (compartilhamento) */}
          <Route
            path="/imovel/:id"
            element={<ImovelPage usuario={isLoggedIn ? user : null} />}
          />

          <Route path="/entrar" element={<Navigate to="/comprar" replace />} />
          <Route
            path="/criar-conta"
            element={<Navigate to="/comprar" replace />}
          />

          <Route
            path="/dashboard"
            element={
              isLoggedIn && user && user.tipo_usuario === "adm" ? (
                <Dashboard />
              ) : (
                <></>
              )
            }
          />

          <Route
            path="/adicionar-imovel"
            element={
              <ProtectedAdminRoute user={user} isLoggedIn={isLoggedIn}>
                <Navigate to="/comprar" replace />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/curtidas"
            element={
              <ProtectedUserRoute user={user} isLoggedIn={isLoggedIn}>
                <Curtidas usuario={user} />
              </ProtectedUserRoute>
            }
          />

          <Route
            path="/imoveis-ocultos"
            element={
              isLoggedIn && user && user.tipo_usuario === "adm" ? (
                <OcultarImovel usuario={user} />
              ) : (
                <></>
              )
            }
          />

          <Route path="*" element={<></>} />
        </Routes>
      </main>

      {/* Footer é ocultado apenas na rota do dashboard */}
      {!isDashboardRoute && <Footer />}

      {admLogged && (
        <>
          <AdminFloatingButton
            showConfigOptions={showConfigOptions}
            setShowConfigOptions={setShowConfigOptions}
            onAdicionarImovelClick={handleAdicionarImovelClick}
            onDashboardClick={handleDashboardClick}
            onOcultarImovelClick={handleOcultarImovelClick}
            onAdicionarAdminClick={handleAdicionarAdminClick}
          />
          <AdicionarImovel
            showPopup={showAdicionarImovelPopup}
            setShowPopup={setShowAdicionarImovelPopup}
          />
          <AdicionarAdmin
            showPopup={showAdicionarAdminPopup}
            setShowPopup={setShowAdicionarAdminPopup}
          />
          <EditarImovel
            showPopup={showEditarImovelPopup}
            setShowPopup={setShowEditarImovelPopup}
            imovelId={imovelIdToEdit}
            onImovelUpdated={() => {
              window.location.reload();
            }}
          />
        </>
      )}

      {/* Botão flutuante para usuários comuns (apenas quando logado como user) */}
      {isLoggedIn && user && user.tipo_usuario === "user" && (
        <UserFloatingButton user={user} />
      )}
    </div>
  );
};

export default App;
