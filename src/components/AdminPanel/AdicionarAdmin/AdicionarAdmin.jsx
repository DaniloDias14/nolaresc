"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { IoClose, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import logo_azul from "../../../assets/img/logo/logo_azul.png";
import "./AdicionarAdmin.css";

// ETAPAS DO FLUXO: 1 = formulario de dados, 2 = insercao do codigo de verificacao
const ETAPA_FORMULARIO = 1;
const ETAPA_VERIFICACAO = 2;

const AdicionarAdmin = ({ showPopup, setShowPopup }) => {
  const [etapa, setEtapa] = useState(ETAPA_FORMULARIO);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [codigoVerificacao, setCodigoVerificacao] = useState([
    "",
    "",
    "",
    "",
    "",
  ]);
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const inputsCodigoRefs = useRef([]);

  const isValidFullName = (nomeCompleto) => nomeCompleto.trim().length >= 3;

  const isValidEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const isValidPassword = (senhaValue) => {
    return (
      senhaValue.length >= 8 &&
      /[A-Z]/.test(senhaValue) &&
      /[a-z]/.test(senhaValue) &&
      /[0-9]/.test(senhaValue) &&
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senhaValue)
    );
  };

  const getPasswordErrors = (senhaValue) => {
    const errors = [];
    if (senhaValue.length < 8) errors.push("Minimo 8 caracteres");
    if (!/[A-Z]/.test(senhaValue)) errors.push("Uma letra maiuscula");
    if (!/[a-z]/.test(senhaValue)) errors.push("Uma letra minuscula");
    if (!/[0-9]/.test(senhaValue)) errors.push("Um numero");
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senhaValue)) {
      errors.push("Um caractere especial");
    }
    return errors;
  };

  const handleSubmitFormulario = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setCarregando(true);

    const errors = {};

    if (!nome.trim()) {
      errors.nome = "Nome e obrigatorio";
    } else if (!isValidFullName(nome)) {
      errors.nome = "Nome deve ter pelo menos 3 caracteres";
    }

    if (!email.trim()) {
      errors.email = "Email e obrigatorio";
    } else if (!isValidEmail(email)) {
      errors.email = "Email invalido";
    }

    if (!senha.trim()) {
      errors.senha = "Senha e obrigatoria";
    } else if (!isValidPassword(senha)) {
      const passwordErrors = getPasswordErrors(senha);
      errors.senha = `Senha deve conter: ${passwordErrors.join(", ")}`;
    }

    if (!confirmarSenha.trim()) {
      errors.confirmarSenha = "Confirmacao de senha e obrigatoria";
    } else if (senha !== confirmarSenha) {
      errors.confirmarSenha = "Senhas nao coincidem";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Por favor, corrija os erros abaixo");
      setCarregando(false);
      return;
    }

    try {
      const token = localStorage.getItem("nolare_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(
        "/api/admin/adicionar-admin",
        { nome, email, senha },
        { headers },
      );

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

  const handleSubmitVerificacao = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setCarregando(true);

    const codigoCompleto = codigoVerificacao.join("");
    if (!codigoCompleto || codigoCompleto.length !== 5) {
      setFieldErrors({
        codigoVerificacao: "Por favor, digite o codigo completo",
      });
      setError("Insira o codigo de 5 digitos enviado ao e-mail.");
      setCarregando(false);
      return;
    }

    try {
      const token = localStorage.getItem("nolare_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(
        "/api/admin/confirmar-admin",
        { email, codigo: codigoCompleto },
        { headers },
      );

      setSucesso(true);
      setError("");

      setTimeout(() => {
        resetarEstado();
        setShowPopup(false);
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erro ao confirmar cadastro";
      setError(errorMsg);
    } finally {
      setCarregando(false);
    }
  };

  const handleReenviarCodigo = async () => {
    setError("");
    setFieldErrors({});
    setCarregando(true);
    try {
      const token = localStorage.getItem("nolare_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(
        "/api/admin/adicionar-admin",
        { nome, email, senha },
        { headers },
      );
      setCodigoVerificacao(["", "", "", "", ""]);
      inputsCodigoRefs.current[0]?.focus();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erro ao reenviar codigo";
      setError(errorMsg);
    } finally {
      setCarregando(false);
    }
  };

  const renderCodigoVerificacao = () => {
    const handleInputChange = (index, value) => {
      if (!/^\d*$/.test(value)) return;

      const novosCodigos = [...codigoVerificacao];
      novosCodigos[index] = value;
      setCodigoVerificacao(novosCodigos);

      if (value && index < 4) {
        inputsCodigoRefs.current[index + 1]?.focus();
      }

      if (fieldErrors.codigoVerificacao) {
        setFieldErrors({
          ...fieldErrors,
          codigoVerificacao: "",
        });
      }
    };

    const handleKeyDown = (index, e) => {
      if (e.key === "Backspace" && !codigoVerificacao[index] && index > 0) {
        inputsCodigoRefs.current[index - 1]?.focus();
      }
    };

    const handlePaste = (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 5);
      const novosDigitos = pastedData.split("");
      const novosCodigos = ["", "", "", "", ""];

      novosDigitos.forEach((digito, idx) => {
        if (idx < 5) novosCodigos[idx] = digito;
      });

      setCodigoVerificacao(novosCodigos);
      const proximoIndiceVazio = novosDigitos.length < 5 ? novosDigitos.length : 4;
      inputsCodigoRefs.current[proximoIndiceVazio]?.focus();
    };

    return (
      <div className="adicionar-admin-codigo-inputs-container login-codigo-inputs-container">
        {codigoVerificacao.map((digito, index) => (
          <input
            key={index}
            ref={(el) => (inputsCodigoRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength="1"
            value={digito}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={carregando}
            className={`adicionar-admin-codigo-input login-codigo-input ${
              fieldErrors.codigoVerificacao ? "input-error" : ""
            }`}
          />
        ))}
      </div>
    );
  };

  const resetarEstado = () => {
    setEtapa(ETAPA_FORMULARIO);
    setNome("");
    setEmail("");
    setSenha("");
    setConfirmarSenha("");
    setCodigoVerificacao(["", "", "", "", ""]);
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
        <div className="adicionar-admin-logo-container">
          <img
            src={logo_azul || "/placeholder.svg"}
            alt="Nolare Logo"
            className="adicionar-admin-logo"
          />
        </div>

        <button
          className="adicionar-admin-close-btn"
          onClick={handleClose}
          disabled={carregando}
        >
          <IoClose size={24} />
        </button>

        <h2 className="adicionar-admin-title">Adicionar Administrador</h2>

        {sucesso && (
          <div className="adicionar-admin-success-msg">
            Administrador cadastrado com sucesso!
          </div>
        )}

        {error && <div className="adicionar-admin-error-msg">{error}</div>}

        {etapa === ETAPA_FORMULARIO && !sucesso && (
          <form onSubmit={handleSubmitFormulario} className="adicionar-admin-form login-form">
            <div className="adicionar-admin-form-group login-form-group">
              <label htmlFor="adm-nome">Nome</label>
              <input
                type="text"
                id="adm-nome"
                name="adm-nome"
                autoComplete="name"
                className={`adicionar-admin-input login-input ${fieldErrors.nome ? "input-error" : ""}`}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={carregando}
              />
              {fieldErrors.nome && (
                <p className="adicionar-admin-field-error login-field-error">
                  {fieldErrors.nome}
                </p>
              )}
            </div>

            <div className="adicionar-admin-form-group login-form-group">
              <label htmlFor="adm-email">Email</label>
              <input
                type="email"
                id="adm-email"
                name="adm-email"
                autoComplete="email"
                className={`adicionar-admin-input login-input ${fieldErrors.email ? "input-error" : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={carregando}
              />
              {fieldErrors.email && (
                <p className="adicionar-admin-field-error">{fieldErrors.email}</p>
              )}
            </div>

            <div className="adicionar-admin-form-group login-form-group">
              <label htmlFor="adm-senha">Senha</label>
              <div className="adicionar-admin-password-container login-password-container">
                <input
                  type={showSenha ? "text" : "password"}
                  id="adm-senha"
                  name="adm-senha"
                  autoComplete="new-password"
                  className={`adicionar-admin-input login-input ${fieldErrors.senha ? "input-error" : ""}`}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={carregando}
                />
                <button
                  type="button"
                  className="adicionar-admin-password-toggle login-password-toggle"
                  onClick={() => setShowSenha(!showSenha)}
                  disabled={carregando}
                >
                  {showSenha ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
                </button>
              </div>
              {fieldErrors.senha && (
                <p className="adicionar-admin-field-error login-field-error">
                  {fieldErrors.senha}
                </p>
              )}
            </div>

            <div className="adicionar-admin-form-group login-form-group">
              <label htmlFor="adm-confirmar-senha">Confirmar Senha</label>
              <div className="adicionar-admin-password-container login-password-container">
                <input
                  type={showConfirmarSenha ? "text" : "password"}
                  id="adm-confirmar-senha"
                  name="adm-confirmar-senha"
                  autoComplete="new-password"
                  className={`adicionar-admin-input login-input ${fieldErrors.confirmarSenha ? "input-error" : ""}`}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  disabled={carregando}
                />
                <button
                  type="button"
                  className="adicionar-admin-password-toggle login-password-toggle"
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
                <p className="adicionar-admin-field-error">{fieldErrors.confirmarSenha}</p>
              )}
            </div>

            <button type="submit" className="adicionar-admin-btn login-btn" disabled={carregando}>
              {carregando ? "Enviando..." : "Enviar Codigo de Verificacao"}
            </button>
          </form>
        )}

        {etapa === ETAPA_VERIFICACAO && !sucesso && (
          <form onSubmit={handleSubmitVerificacao} className="adicionar-admin-form login-form">
            <p className="adicionar-admin-instrucao login-verification-subtitle">
              Um codigo de verificacao foi enviado para <strong>{email}</strong>. Insira-o abaixo
              para confirmar o cadastro do novo administrador.
            </p>

            <div className="adicionar-admin-form-group login-form-group">
              <label>Codigo de Verificacao</label>
              {renderCodigoVerificacao()}
              {fieldErrors.codigoVerificacao && (
                <p className="adicionar-admin-field-error login-field-error">
                  {fieldErrors.codigoVerificacao}
                </p>
              )}
            </div>

            <button type="submit" className="adicionar-admin-btn login-btn" disabled={carregando}>
              {carregando ? "Confirmando..." : "Confirmar Codigo"}
            </button>

            <button
              type="button"
              className="adicionar-admin-btn-voltar login-resend-btn"
              onClick={handleReenviarCodigo}
              disabled={carregando}
            >
              Reenviar Codigo
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdicionarAdmin;
