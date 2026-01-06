"use client";

import { useState } from "react";
import axios from "axios";
import { IoClose, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import logo_azul from "../../../assets/img/logo/logo_azul.png";
import "./AdicionarAdmin.css";

const AdicionarAdmin = ({ showPopup, setShowPopup }) => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Validar nome completo
  const isValidFullName = (nome) => {
    return nome.trim().length > 0;
  };

  // Validar email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validar senha: mínimo 8 caracteres, pelo menos 1 maiúscula, 1 minúscula, 1 número, 1 caractere especial
  const isValidPassword = (senha) => {
    const hasUpperCase = /[A-Z]/.test(senha);
    const hasLowerCase = /[a-z]/.test(senha);
    const hasNumber = /[0-9]/.test(senha);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senha);
    const hasMinLength = senha.length >= 8;

    return (
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar &&
      hasMinLength
    );
  };

  // Obter erros específicos da senha
  const getPasswordErrors = (senha) => {
    const errors = [];
    if (senha.length < 8) errors.push("Mínimo 8 caracteres");
    if (!/[A-Z]/.test(senha)) errors.push("Uma letra maiúscula");
    if (!/[a-z]/.test(senha)) errors.push("Uma letra minúscula");
    if (!/[0-9]/.test(senha)) errors.push("Um número");
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senha))
      errors.push("Um caractere especial");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setCarregando(true);
    setSucesso(false);

    const errors = {};

    if (!nome.trim()) {
      errors.nome = "Nome é obrigatório";
    } else if (!isValidFullName(nome)) {
      errors.nome = "Nome deve ser válido";
    }

    if (!email.trim()) {
      errors.email = "Email é obrigatório";
    } else if (!isValidEmail(email)) {
      errors.email = "Email inválido";
    }

    if (!senha.trim()) {
      errors.senha = "Senha é obrigatória";
    } else if (!isValidPassword(senha)) {
      const passwordErrors = getPasswordErrors(senha);
      errors.senha = `Senha deve conter: ${passwordErrors.join(", ")}`;
    }

    if (!confirmarSenha.trim()) {
      errors.confirmarSenha = "Confirmação de senha é obrigatória";
    } else if (senha !== confirmarSenha) {
      errors.confirmarSenha = "Senhas não coincidem";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Por favor, corrija os erros abaixo");
      setCarregando(false);
      return;
    }

    try {
      await axios.post("/api/admin/adicionar-admin", {
        nome,
        email,
        senha,
      });

      setSucesso(true);
      setError("");
      setFieldErrors({});

      // Limpar campos após sucesso
      setNome("");
      setEmail("");
      setSenha("");
      setConfirmarSenha("");

      // Fechar popup após 2 segundos
      setTimeout(() => {
        setShowPopup(false);
        setSucesso(false);
      }, 2000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Erro ao cadastrar administrador";
      setError(errorMsg);
    } finally {
      setCarregando(false);
    }
  };

  const handleClose = () => {
    if (!carregando) {
      setShowPopup(false);
      setNome("");
      setEmail("");
      setSenha("");
      setConfirmarSenha("");
      setError("");
      setFieldErrors({});
      setSucesso(false);
    }
  };

  if (!showPopup) return null;

  return (
    <div className="adicionar-admin-overlay">
      <div className="adicionar-admin-modal">
        {/* Logo */}
        <div className="adicionar-admin-logo-container">
          <img
            src={logo_azul || "/placeholder.svg"}
            alt="Nolare Logo"
            className="adicionar-admin-logo"
          />
        </div>

        {/* Botão Fechar */}
        <button
          className="adicionar-admin-close-btn"
          onClick={handleClose}
          disabled={carregando}
        >
          <IoClose size={24} />
        </button>

        <h2 className="adicionar-admin-title">Adicionar Administrador</h2>

        {/* Mensagem de sucesso */}
        {sucesso && (
          <div className="adicionar-admin-success-msg">
            Administrador cadastrado com sucesso!
          </div>
        )}

        {/* Mensagem de erro geral */}
        {error && <div className="adicionar-admin-error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="adicionar-admin-form">
          {/* Campo Nome */}
          <div className="adicionar-admin-form-group">
            <label htmlFor="nome">Nome</label>
            <input
              type="text"
              id="nome"
              className={`adicionar-admin-input ${
                fieldErrors.nome ? "input-error" : ""
              }`}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={carregando}
            />
            {fieldErrors.nome && (
              <p className="adicionar-admin-field-error">{fieldErrors.nome}</p>
            )}
          </div>

          {/* Campo Email */}
          <div className="adicionar-admin-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className={`adicionar-admin-input ${
                fieldErrors.email ? "input-error" : ""
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={carregando}
            />
            {fieldErrors.email && (
              <p className="adicionar-admin-field-error">{fieldErrors.email}</p>
            )}
          </div>

          {/* Campo Senha */}
          <div className="adicionar-admin-form-group">
            <label htmlFor="senha">Senha</label>
            <div className="adicionar-admin-password-container">
              <input
                type={showSenha ? "text" : "password"}
                id="senha"
                className={`adicionar-admin-input ${
                  fieldErrors.senha ? "input-error" : ""
                }`}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={carregando}
              />
              <button
                type="button"
                className="adicionar-admin-password-toggle"
                onClick={() => setShowSenha(!showSenha)}
                disabled={carregando}
              >
                {showSenha ? (
                  <IoEyeOutline size={20} />
                ) : (
                  <IoEyeOffOutline size={20} />
                )}
              </button>
            </div>
            {fieldErrors.senha && (
              <p className="adicionar-admin-field-error">{fieldErrors.senha}</p>
            )}
          </div>

          {/* Campo Confirmar Senha */}
          <div className="adicionar-admin-form-group">
            <label htmlFor="confirmarSenha">Confirmar Senha</label>
            <div className="adicionar-admin-password-container">
              <input
                type={showConfirmarSenha ? "text" : "password"}
                id="confirmarSenha"
                className={`adicionar-admin-input ${
                  fieldErrors.confirmarSenha ? "input-error" : ""
                }`}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                disabled={carregando}
              />
              <button
                type="button"
                className="adicionar-admin-password-toggle"
                onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                disabled={carregando}
              >
                {showConfirmarSenha ? (
                  <IoEyeOutline size={20} />
                ) : (
                  <IoEyeOffOutline size={20} />
                )}
              </button>
            </div>
            {fieldErrors.confirmarSenha && (
              <p className="adicionar-admin-field-error">
                {fieldErrors.confirmarSenha}
              </p>
            )}
          </div>

          {/* Botão Cadastrar */}
          <button
            type="submit"
            className="adicionar-admin-btn"
            disabled={carregando}
          >
            {carregando ? "Cadastrando..." : "Cadastrar Administrador"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdicionarAdmin;
