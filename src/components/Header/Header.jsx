"use client";

// Header.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { TiUserOutline } from "react-icons/ti";
import { IoLogOutOutline } from "react-icons/io5";
import { RxHamburgerMenu } from "react-icons/rx";
import LoginModal from "./LoginModal";
import "./Header.css";
import logo_azul from "../../assets/img/logo/logo_azul.png";

const Header = ({
  setAdmLogged,
  setUser,
  user,
  isLoggedIn,
  onLogout,
  onAdicionarAdminClick,
  onAdicionarImovelClick,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);
  const userButtonRef = useRef(null);

  const handleLogoClick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMenuClick = () => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    onLogout();
    setUserDropdownOpen(false);
    setMenuOpen(false); // Fechar menu mobile ao fazer logout
    setModalOpen(true);
  };

  const getTruncatedName = (name) => {
    if (!name) return "";
    return name.length > 10 ? `${name.substring(0, 9)}...` : name;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Fechar dropdown de usuário
      if (
        userDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }

      // Fechar menu mobile ao clicar fora
      if (menuOpen) {
        const menu = document.querySelector(".menu");
        const menuToggle = document.querySelector(".menu-toggle");

        if (
          menu &&
          !menu.contains(event.target) &&
          menuToggle &&
          !menuToggle.contains(event.target)
        ) {
          setMenuOpen(false);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setUserDropdownOpen(false);
      }
    };

    const handleBlur = () => {
      setUserDropdownOpen(false);
    };

    if (userDropdownOpen || menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("blur", handleBlur);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [userDropdownOpen, menuOpen]);

  return (
    <header className="header">
      <nav className="nav">
        <a href="/" className="logo" onClick={handleLogoClick}>
          <img
            src={logo_azul || "/placeholder.svg"}
            alt="Nolare"
            className="logo-img"
          />
        </a>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <RxHamburgerMenu size={28} />
        </button>

        <ul className={`menu ${menuOpen ? "menu-open" : ""}`}>
          <div className="menu-header">
            {isLoggedIn && user ? (
              <button
                className="menu-user-button"
                onClick={() => {
                  setMenuOpen(false);
                }}
              >
                <span className="menu-user-name">
                  {getTruncatedName(user.nome)}
                </span>
              </button>
            ) : (
              <button
                className="menu-connect-button"
                onClick={() => {
                  setModalOpen(true);
                  setMenuOpen(false);
                }}
              >
                <span>Conectar-se</span>
                <TiUserOutline size={20} />
              </button>
            )}

            <button className="menu-close" onClick={() => setMenuOpen(false)}>
              <RxHamburgerMenu size={28} />
            </button>
          </div>
          <li>
            <Link
              to="/comprar"
              onClick={handleMenuClick}
              className={isActive("/comprar") ? "active" : ""}
            >
              Comprar
            </Link>
          </li>
          <li>
            <Link
              to="/alugar"
              onClick={handleMenuClick}
              className={isActive("/alugar") ? "active" : ""}
            >
              Alugar
            </Link>
          </li>
          <li>
            <Link
              to="/anunciar"
              onClick={handleMenuClick}
              className={isActive("/anunciar") ? "active" : ""}
            >
              Anunciar
            </Link>
          </li>
          <li>
            <Link
              to="/sobre-nos"
              onClick={handleMenuClick}
              className={isActive("/sobre-nos") ? "active" : ""}
            >
              Sobre Nós
            </Link>
          </li>
          {isLoggedIn && user?.tipo_usuario === "user" && (
            <li className="mobile-only">
              <Link
                to="/curtidas"
                onClick={handleMenuClick}
                className={isActive("/curtidas") ? "active" : ""}
              >
                Curtidas
              </Link>
            </li>
          )}
          {isLoggedIn && user?.tipo_usuario === "adm" && (
            <>
              <li className="mobile-only">
                <button
                  onClick={() => {
                    onAdicionarAdminClick();
                    handleMenuClick();
                  }}
                  className="menu-action-button"
                >
                  Adicionar Adm
                </button>
              </li>
              <li className="mobile-only">
                <Link
                  to="/dashboard"
                  onClick={handleMenuClick}
                  className={isActive("/dashboard") ? "active" : ""}
                >
                  Dashboard
                </Link>
              </li>
              <li className="mobile-only">
                <Link
                  to="/imoveis-ocultos"
                  onClick={handleMenuClick}
                  className={isActive("/imoveis-ocultos") ? "active" : ""}
                >
                  Imóveis Ocultos
                </Link>
              </li>
            </>
          )}
          {isLoggedIn && user && (
            <li className="mobile-only">
              <button className="menu-logout-button" onClick={handleLogout}>
                Sair
              </button>
            </li>
          )}
        </ul>

        {isLoggedIn && user ? (
          <div className="user-menu">
            <button
              ref={userButtonRef}
              className="user-button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            >
              <span className="user-name">{getTruncatedName(user.nome)}</span>
            </button>
            <div
              ref={dropdownRef}
              className={`user-dropdown ${
                userDropdownOpen ? "dropdown-open" : "dropdown-closed"
              }`}
            >
              <button className="logout-button" onClick={handleLogout}>
                <span>Sair</span>
                <IoLogOutOutline size={18} />
              </button>
            </div>
          </div>
        ) : (
          <button className="perfil-icon" onClick={() => setModalOpen(true)}>
            <span className="connect-text">Conectar-se</span>
            <TiUserOutline size={20} />
          </button>
        )}
      </nav>

      {modalOpen && (
        <LoginModal
          onClose={() => setModalOpen(false)}
          setAdmLogged={setAdmLogged}
          setUser={setUser}
        />
      )}
    </header>
  );
};

export default Header;
