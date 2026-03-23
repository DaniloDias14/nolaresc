"use client";

import { useState } from "react";
import axios from "axios";
import { IoClose, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import logo_azul from "../../../assets/img/logo/logo_azul.png";
import "./AdicionarAdmin.css";

// ETAPAS DO FLUXO: 1 = formulário de dados, 2 = inserção do código de verificação
const ETAPA_FORMULARIO = 1;
const ETAPA_VERIFICACAO = 2;

const AdicionarAdmin = ({ showPopup, setShowPopup }) => {
  const [etapa, setEtapa] = useState(ETAPA_FORMULARIO);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [codigo, setCodigo] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // VALIDAÇÃO: Nome válido
  const isValidFullName = (nome) => nome.trim().length >= 3;

  // VALIDAÇÃO: Formato de e-mail
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // VALIDAÇÃO: Força da senha
  const isValidPassword = (senha) => {
    return (
      senha.length >= 8 &&
      /[A-Z]/.test(senha) &&
      /[a-z]/.test(senha) &&
      /[0-9]/.test(senha) &&
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senha)
    );
  };

  // RETORNA: Lista de erros específicos da senha
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

  // ETAPA 1: Envia os dados e solicita código de verificação por e-mail
  const handleSubmitFormulario = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setCarregando(true);

    const errors = {};

    if (!nome.trim()) {
      errors.nome = "Nome é obrigatório";
    } else if (!isValidFullName(nome)) {
      errors.nome = "Nome deve ter pelo menos 3 caracteres";
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
      // Envia dados — o servidor gera o código e o envia ao e-mail informado
      const token = localStorage.getItem("nolare_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(
        "/api/admin/adicionar-admin",
        { nome, email, senha },
        { headers },
      );

      // Avança para a etapa de verificação do código
      setEtapa(ETAPA_VERIFICACAO);
      setError("");
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        "Erro ao iniciar cadastro de administrador";
      setError(errorMsg);
    } finally {
      setCarregando(false);
    }
  };

  // ETAPA 2: Envia o código recebido por e-mail para confirmar o cadastro
  const handleSubmitVerificacao = async (e) => {
    e.preventDefault();
    setError("");
    setCarregando(true);

    if (!codigo.trim() || codigo.trim().length !== 5) {
      setError("Insira o código de 5 dígitos enviado ao e-mail.");
      setCarregando(false);
      return;
    }

    try {
      const token = localStorage.getItem("nolare_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(
        "/api/admin/confirmar-admin",
        { email, codigo: codigo.trim() },
        { headers },
      );

      setSucesso(true);
      setError("");

      // Fecha o modal após 2 segundos
      setTimeout(() => {
        resetarEstado();
        setShowPopup(false);
      }, 2000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Erro ao confirmar cadastro";
      setError(errorMsg);
    } finally {
      setCarregando(false);
    }
  };

  // RESET: Limpa todos os campos e volta à etapa 1
  const resetarEstado = () => {
    setEtapa(ETAPA_FORMULARIO);
    setNome("");
    setEmail("");
    setSenha("");
    setConfirmarSenha("");
    setCodigo("");
    setError("");
    setFieldErrors({});
    setSucesso(false);
  };

  const handleClose = () => {
    if (!carregando) {
      resetarEstado();
      setShowPopup(false);
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

        {/* ---- ETAPA 1: Formulário de dados ---- */}
        {etapa === ETAPA_FORMULARIO && !sucesso && (
          <form
            onSubmit={handleSubmitFormulario}
            className="adicionar-admin-form"
          >
            {/* Campo Nome */}
            <div className="adicionar-admin-form-group">
              <label htmlFor="adm-nome">Nome</label>
              <input
                type="text"
                id="adm-nome"
                name="adm-nome"
                autoComplete="name"
                className={`adicionar-admin-input ${fieldErrors.nome ? "input-error" : ""}`}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={carregando}
              />
              {fieldErrors.nome && (
                <p className="adicionar-admin-field-error">
                  {fieldErrors.nome}
                </p>
              )}
            </div>

            {/* Campo Email */}
            <div className="adicionar-admin-form-group">
              <label htmlFor="adm-email">Email</label>
              <input
                type="email"
                id="adm-email"
                name="adm-email"
                autoComplete="email"
                className={`adicionar-admin-input ${fieldErrors.email ? "input-error" : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={carregando}
              />
              {fieldErrors.email && (
                <p className="adicionar-admin-field-error">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div className="adicionar-admin-form-group">
              <label htmlFor="adm-senha">Senha</label>
              <div className="adicionar-admin-password-container">
                <input
                  type={showSenha ? "text" : "password"}
                  id="adm-senha"
                  name="adm-senha"
                  autoComplete="new-password"
                  className={`adicionar-admin-input ${fieldErrors.senha ? "input-error" : ""}`}
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
                <p className="adicionar-admin-field-error">
                  {fieldErrors.senha}
                </p>
              )}
            </div>

            {/* Campo Confirmar Senha */}
            <div className="adicionar-admin-form-group">
              <label htmlFor="adm-confirmar-senha">Confirmar Senha</label>
              <div className="adicionar-admin-password-container">
                <input
                  type={showConfirmarSenha ? "text" : "password"}
                  id="adm-confirmar-senha"
                  name="adm-confirmar-senha"
                  autoComplete="new-password"
                  className={`adicionar-admin-input ${fieldErrors.confirmarSenha ? "input-error" : ""}`}
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

            <button
              type="submit"
              className="adicionar-admin-btn"
              disabled={carregando}
            >
              {carregando ? "Enviando..." : "Enviar Código de Verificação"}
            </button>
          </form>
        )}

        {/* ---- ETAPA 2: Inserção do código de verificação ---- */}
        {etapa === ETAPA_VERIFICACAO && !sucesso && (
          <form
            onSubmit={handleSubmitVerificacao}
            className="adicionar-admin-form"
          >
            {/* Instrução para o admin */}
            <p className="adicionar-admin-instrucao">
              Um código de verificação foi enviado para <strong>{email}</strong>
              . Insira-o abaixo para confirmar o cadastro do novo administrador.
            </p>

            {/* Campo Código */}
            <div className="adicionar-admin-form-group">
              <label htmlFor="adm-codigo">Código de Verificação</label>
              <input
                type="text"
                id="adm-codigo"
                name="adm-codigo"
                autoComplete="one-time-code"
                className="adicionar-admin-input adicionar-admin-input-codigo"
                value={codigo}
                onChange={(e) =>
                  setCodigo(e.target.value.replace(/\D/g, "").slice(0, 5))
                }
                placeholder="00000"
                maxLength={5}
                disabled={carregando}
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="adicionar-admin-btn"
              disabled={carregando}
            >
              {carregando ? "Confirmando..." : "Confirmar Cadastro"}
            </button>

            {/* Link para voltar à etapa 1 */}
            <button
              type="button"
              className="adicionar-admin-btn-voltar"
              onClick={() => {
                setEtapa(ETAPA_FORMULARIO);
                setError("");
                setCodigo("");
              }}
              disabled={carregando}
            >
              Voltar
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdicionarAdmin;
