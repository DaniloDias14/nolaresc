"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { IoClose, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../Toast/Toast";
import logo_azul from "../../assets/img/logo/logo_azul.png";
import {
  PoliticaDePrivacidadeConteudo,
  TermosDeUsoConteudo,
} from "../InformacoesLegais/LegalContent";
import "./LoginModal.css";

const TermosDeUso = () => <TermosDeUsoConteudo />;

const PoliticaDePrivacidade = () => <PoliticaDePrivacidadeConteudo />;

const LoginModal = ({ onClose, setAdmLogged, setUser }) => {
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Mantem o progresso do usuario ao fechar o popup (ex.: etapa de verificacao por codigo).
  // Armazenamento temporario (sessionStorage) para evitar perda acidental.
  const AUTH_DRAFT_KEY = "nolare_auth_draft_v1";
  const AUTH_DRAFT_TTL_MS = 45 * 60 * 1000; // 45 minutos

  const carregarRascunhoAuth = () => {
    try {
      const raw = sessionStorage.getItem(AUTH_DRAFT_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || !data.ts || Date.now() - data.ts > AUTH_DRAFT_TTL_MS) {
        sessionStorage.removeItem(AUTH_DRAFT_KEY);
        return null;
      }
      return data;
    } catch {
      try {
        sessionStorage.removeItem(AUTH_DRAFT_KEY);
      } catch {
        // ignore
      }
      return null;
    }
  };

  const salvarRascunhoAuth = (draft) => {
    try {
      sessionStorage.setItem(
        AUTH_DRAFT_KEY,
        JSON.stringify({ ...draft, ts: Date.now() }),
      );
    } catch {
      // Se falhar (quota/storage), apenas nao persistimos.
    }
  };

  const limparRascunhoAuth = () => {
    try {
      sessionStorage.removeItem(AUTH_DRAFT_KEY);
    } catch {
      // ignore
    }
  };
  const [tab, setTab] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [showLoginSenha, setShowLoginSenha] = useState(false);
  const [lembrarMe, setLembrarMe] = useState(false);
  const [registerNome, setRegisterNome] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerSenha, setRegisterSenha] = useState("");
  const [registerConfirmSenha, setRegisterConfirmSenha] = useState("");
  const [showRegisterSenha, setShowRegisterSenha] = useState(false);
  const [showRegisterConfirmSenha, setShowRegisterConfirmSenha] =
    useState(false);
  const [registerTipo, setRegisterTipo] = useState("user");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [aceitouPrivacidade, setAceitouPrivacidade] = useState(false);
  const [aceitaEmailsComerciais, setAceitaEmailsComerciais] = useState(false);
  const [recuperacaoEmail, setRecuperacaoEmail] = useState("");
  const [codigoRecuperacao, setCodigoRecuperacao] = useState([
    "",
    "",
    "",
    "",
    "",
  ]);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarNovaSenha, setShowConfirmarNovaSenha] = useState(false);
  const [tokenRecuperacao, setTokenRecuperacao] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [etapaRecuperacao, setEtapaRecuperacao] = useState("email"); // email, codigo, senha

  const [carregando, setCarregando] = useState(false);
  const [etapaCadastro, setEtapaCadastro] = useState("form"); // form, verificacao, termos
  const [emailCadastroVerificacao, setEmailCadastroVerificacao] = useState("");
  const [codigoCadastroVerificacao, setCodigoCadastroVerificacao] = useState([
    "",
    "",
    "",
    "",
    "",
  ]);
  const [tentativasVerificacao, setTentativasVerificacao] = useState(5);
  const [tempoRestanteVerificacao, setTempoRestanteVerificacao] = useState(0);
  const [dadosCadastroTemp, setDadosCadastroTemp] = useState({
    nome: "",
    email: "",
    senha: "", // Adicionando senha aos dados temporÃ¡rios
    tipo_usuario: "user",
  });
  // REMOVIDOS: const [visualizandoTermos, setVisualizandoTermos] = useState(false)
  // REMOVIDOS: const [visualizandoPrivacidade, setVisualizandoPrivacidade] = useState(false)
  const [mostrarTermos, setMostrarTermos] = useState(false);
  const [mostrarPrivacidade, setMostrarPrivacidade] = useState(false);
  const [fechandoTermos, setFechandoTermos] = useState(false);
  const [fechandoPrivacidade, setFechandoPrivacidade] = useState(false);

  const inputsCadastroRefs = useRef([]);
  const inputsRecuperacaoRefs = useRef([]);

  useEffect(() => {
    const credenciaisSalvas = localStorage.getItem("nolare_credenciais");
    if (credenciaisSalvas) {
      try {
        const { email, senha } = JSON.parse(credenciaisSalvas);
        setLoginEmail(email);
        setLoginSenha(senha);
        setLembrarMe(true);
      } catch (err) {
        console.error("Erro ao carregar credenciais salvas:", err);
      }
    }
  }, []);

  // Restaura o progresso do usuario (sessionStorage) ao reabrir o modal.
  useEffect(() => {
    const defaultTab = location.pathname === "/sign-up" ? "register" : "login";
    const draft = carregarRascunhoAuth();

    if (!draft) {
      setTab(defaultTab);
      return;
    }

    // Aba/fluxo
    let nextTab = draft.tab || defaultTab;
    if (draft.etapaCadastro && draft.etapaCadastro !== "form") nextTab = "register";
    if (
      draft.tab === "recuperacao" ||
      (draft.etapaRecuperacao && draft.etapaRecuperacao !== "email")
    ) {
      nextTab = "recuperacao";
    }
    setTab(nextTab);

    // Login (nao persistimos senha por seguranca)
    if (typeof draft.loginEmail === "string") setLoginEmail(draft.loginEmail);
    if (typeof draft.lembrarMe === "boolean") setLembrarMe(draft.lembrarMe);

    // Cadastro (nao persistimos senhas por seguranca)
    if (typeof draft.registerNome === "string") setRegisterNome(draft.registerNome);
    if (typeof draft.registerEmail === "string")
      setRegisterEmail(draft.registerEmail);
    if (typeof draft.registerTipo === "string") setRegisterTipo(draft.registerTipo);
    if (typeof draft.aceitouTermos === "boolean")
      setAceitouTermos(draft.aceitouTermos);
    if (typeof draft.aceitouPrivacidade === "boolean")
      setAceitouPrivacidade(draft.aceitouPrivacidade);
    if (typeof draft.aceitaEmailsComerciais === "boolean")
      setAceitaEmailsComerciais(draft.aceitaEmailsComerciais);

    if (typeof draft.etapaCadastro === "string") setEtapaCadastro(draft.etapaCadastro);
    if (typeof draft.emailCadastroVerificacao === "string")
      setEmailCadastroVerificacao(draft.emailCadastroVerificacao);
    if (
      Array.isArray(draft.codigoCadastroVerificacao) &&
      draft.codigoCadastroVerificacao.length === 5
    ) {
      setCodigoCadastroVerificacao(draft.codigoCadastroVerificacao);
    }
    if (typeof draft.tentativasVerificacao === "number")
      setTentativasVerificacao(draft.tentativasVerificacao);
    if (typeof draft.tempoRestanteVerificacao === "number")
      setTempoRestanteVerificacao(draft.tempoRestanteVerificacao);

    // Mantem apenas dados nao sensiveis do cadastro (o backend ignora nome/senha no confirmar-cadastro).
    if (draft.dadosCadastroTemp && typeof draft.dadosCadastroTemp === "object") {
      setDadosCadastroTemp({
        nome: draft.dadosCadastroTemp.nome || "",
        email: draft.dadosCadastroTemp.email || "",
        senha: "", // nao persistir
        tipo_usuario: draft.dadosCadastroTemp.tipo_usuario || "user",
      });
    }

    // Recuperacao (nao persistimos nova senha por seguranca)
    if (typeof draft.etapaRecuperacao === "string")
      setEtapaRecuperacao(draft.etapaRecuperacao);
    if (typeof draft.recuperacaoEmail === "string")
      setRecuperacaoEmail(draft.recuperacaoEmail);
    if (Array.isArray(draft.codigoRecuperacao) && draft.codigoRecuperacao.length === 5) {
      setCodigoRecuperacao(draft.codigoRecuperacao);
    }
    if (typeof draft.tokenRecuperacao === "string")
      setTokenRecuperacao(draft.tokenRecuperacao);
  }, []);

  // Sincroniza URL com a aba atual: /sign-in (login/recuperacao) e /sign-up (cadastro).
  useEffect(() => {
    if (location.pathname !== "/sign-in" && location.pathname !== "/sign-up") return;

    const desiredPath = tab === "register" ? "/sign-up" : "/sign-in";
    if (location.pathname === desiredPath) return;

    const bg = location.state && location.state.backgroundLocation ? location.state.backgroundLocation : null;
    navigate(desiredPath, {
      replace: true,
      ...(bg ? { state: { backgroundLocation: bg } } : {}),
    });
  }, [tab, location.pathname]);

  // Persiste o progresso de forma temporaria (sem salvar senhas).
  useEffect(() => {
    salvarRascunhoAuth({
      tab,
      loginEmail,
      lembrarMe,
      registerNome,
      registerEmail,
      registerTipo,
      etapaCadastro,
      emailCadastroVerificacao,
      codigoCadastroVerificacao,
      tentativasVerificacao,
      tempoRestanteVerificacao,
      aceitouTermos,
      aceitouPrivacidade,
      aceitaEmailsComerciais,
      dadosCadastroTemp: {
        nome: dadosCadastroTemp?.nome || "",
        email: dadosCadastroTemp?.email || "",
        tipo_usuario: dadosCadastroTemp?.tipo_usuario || "user",
      },
      etapaRecuperacao,
      recuperacaoEmail,
      codigoRecuperacao,
      tokenRecuperacao,
    });
  }, [
    tab,
    loginEmail,
    lembrarMe,
    registerNome,
    registerEmail,
    registerTipo,
    etapaCadastro,
    emailCadastroVerificacao,
    codigoCadastroVerificacao,
    tentativasVerificacao,
    tempoRestanteVerificacao,
    aceitouTermos,
    aceitouPrivacidade,
    aceitaEmailsComerciais,
    dadosCadastroTemp,
    etapaRecuperacao,
    recuperacaoEmail,
    codigoRecuperacao,
    tokenRecuperacao,
  ]);

  // Validar nome completo (nÃ£o vazio)
  const isValidFullName = (nome) => {
    return nome.trim().length > 0;
  };

  // Validar email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validar senha: mÃ­nimo 8 caracteres, pelo menos 1 maiÃºscula, 1 minÃºscula, 1 nÃºmero, 1 caractere especial
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

  // Obter erros especÃ­ficos da senha
  const getPasswordErrors = (senha) => {
    const errors = [];
    if (senha.length < 8) errors.push("MÃ­nimo 8 caracteres");
    if (!/[A-Z]/.test(senha)) errors.push("Uma letra maiÃºscula");
    if (!/[a-z]/.test(senha)) errors.push("Uma letra minÃºscula");
    if (!/[0-9]/.test(senha)) errors.push("Um nÃºmero");
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senha))
      errors.push("Um caractere especial");
    return errors;
  };

  const formatarTempoRestante = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${minutos}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setCarregando(true);

    const errors = {};
    if (!loginEmail.trim()) {
      errors.loginEmail = "Email Ã© obrigatÃ³rio";
    } else if (!isValidEmail(loginEmail)) {
      errors.loginEmail = "Email invÃ¡lido";
    }

    if (!loginSenha.trim()) {
      errors.loginSenha = "Senha Ã© obrigatÃ³ria";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Por favor, verifique os campos abaixo");
      setCarregando(false);
      return;
    }

    try {
      const response = await axios.post("/api/login", {
        email: loginEmail,
        senha: loginSenha,
      });

      if (response.data && response.data.user) {
        const user = response.data.user;

        // SEGURANÃ‡A: Armazena dados mÃ­nimos de exibiÃ§Ã£o + id no localStorage (2.4)
        const userParaArmazenar = {
          id: user.id,
          nome: user.nome,
          tipo_usuario: user.tipo_usuario,
        };
        setUser(user);
        localStorage.setItem("nolare_user", JSON.stringify(userParaArmazenar));

        // SEGURANÃ‡A: token de sessÃ£o Ã© mantido em cookie HttpOnly pelo backend
        // Remove legado para evitar persistÃªncia em storage acessÃ­vel via JS.
        localStorage.removeItem("nolare_token");

        // SEGURANÃ‡A: Removido salvamento de senha em texto puro no localStorage (1.3)
        // A funcionalidade "Lembrar-me" nÃ£o deve jamais salvar credenciais em texto claro
        if (!lembrarMe) {
          localStorage.removeItem("nolare_credenciais");
        }

        setAdmLogged(user.tipo_usuario === "adm");

        // SEGURANÃ‡A: Removidos console.log que expÃµem tipo de usuÃ¡rio no console (2.2)

        setError("");
        // Limpa rascunho ao concluir o login com sucesso.
        limparRascunhoAuth();
        onClose();
      } else {
        setAdmLogged(false);
        setFieldErrors({ loginEmail: "", loginSenha: "" });
        setError("Credenciais invÃ¡lidas!");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erro no servidor";
      setAdmLogged(false);
      setFieldErrors({ loginEmail: "", loginSenha: "" });
      setError(errorMsg);
    } finally {
      setCarregando(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setCarregando(true);

    const errors = {};

    if (!registerNome.trim()) {
      errors.registerNome = "Nome Ã© obrigatÃ³rio";
    } else if (!isValidFullName(registerNome)) {
      errors.registerNome = "Nome deve conter pelo menos dois nomes";
    }

    if (!registerEmail.trim()) {
      errors.registerEmail = "Email Ã© obrigatÃ³rio";
    } else if (!isValidEmail(registerEmail)) {
      errors.registerEmail = "Email invÃ¡lido";
    }

    if (!registerSenha.trim()) {
      errors.registerSenha = "Senha Ã© obrigatÃ³ria";
    } else if (!isValidPassword(registerSenha)) {
      const passwordErrors = getPasswordErrors(registerSenha);
      errors.registerSenha = `Senha deve conter: ${passwordErrors.join(", ")}`;
    }

    if (!registerConfirmSenha.trim()) {
      errors.registerConfirmSenha = "Senhas nÃ£o coincidem";
    } else if (registerSenha !== registerConfirmSenha) {
      errors.registerConfirmSenha = "Senhas nÃ£o coincidem";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Por favor, corrija os erros abaixo");
      setCarregando(false);
      return;
    }

    try {
      await axios.post("/api/register", {
        nome: registerNome,
        email: registerEmail,
        senha: registerSenha,
        tipo_usuario: registerTipo,
        aceitouTermos: false,
        aceitouPrivacidade: false,
      });

      setDadosCadastroTemp({
        nome: registerNome,
        email: registerEmail,
        senha: registerSenha,
        tipo_usuario: registerTipo,
      });

      setEmailCadastroVerificacao(registerEmail);
      setEtapaCadastro("verificacao");
      setCodigoCadastroVerificacao(["", "", "", "", ""]);
      setTentativasVerificacao(5);
      setError("");
      setFieldErrors({});
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erro no servidor";
      setError(errorMsg);
    } finally {
      setCarregando(false);
    }
  };

  const handleVerificacaoCadastro = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setCarregando(true);

    const codigoCompleto = codigoCadastroVerificacao.join("");

    if (!codigoCompleto.trim() || codigoCompleto.length !== 5) {
      setError("Por favor, digite o cÃ³digo completo");
      setFieldErrors({
        ...fieldErrors,
        codigoCadastroVerificacao: "Por favor, digite o cÃ³digo completo",
      });
      setCarregando(false);
      return;
    }

    try {
      await axios.post("/api/email/verificacao/validar", {
        email: emailCadastroVerificacao,
        codigo: codigoCompleto,
      });

      setAceitouTermos(false);
      setAceitouPrivacidade(false);
      // MODIFICADO: setEtapaCadastro("termos") -> setEtapaCadastro("verificacaoTermos")
      setEtapaCadastro("verificacaoTermos");
      setError("");
      setFieldErrors({});
    } catch (err) {
      const errorData = err.response?.data || {};

      if (errorData.statusCode === "BLOQUEADO") {
        setError(
          `${errorData.error} Tempo restante: ${formatarTempoRestante(
            errorData.tempoRestante,
          )}`,
        );
        setTempoRestanteVerificacao(errorData.tempoRestante);
      } else if (errorData.expired) {
        setError("CÃ³digo expirado. Solicitando novo cÃ³digo...");
      } else {
        setError(errorData.error || "Erro ao validar cÃ³digo");
        setFieldErrors({
          ...fieldErrors,
          codigoCadastroVerificacao:
            errorData.error || "Erro ao validar cÃ³digo",
        });
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleConfirmarCadastroComTermos = async () => {
    setError("");
    setFieldErrors({});

    // MODIFICADO: ValidaÃ§Ã£o simplificada dos checkboxes
    if (!aceitouTermos || !aceitouPrivacidade) {
      setError(
        "VocÃª deve aceitar os Termos de Uso e a PolÃ­tica de Privacidade para confirmar seu cadastro.",
      );
      return;
    }

    setCarregando(true);

    try {
      const codigoCompleto = codigoCadastroVerificacao.join("");

      const response = await axios.post("/api/email/verificacao/confirmar-cadastro", {
        email: emailCadastroVerificacao,
        codigo: codigoCompleto,
        aceitouTermos,
        aceitouPrivacidade,
        aceita_emails_comerciais: aceitaEmailsComerciais,
        nome: dadosCadastroTemp.nome,
        senha: dadosCadastroTemp.senha,
        tipo_usuario: dadosCadastroTemp.tipo_usuario,
      });

      // Limpa rascunho ao concluir o cadastro com sucesso.
      limparRascunhoAuth();
      setEtapaCadastro("form");
      setRegisterNome("");
      setRegisterEmail("");
      setRegisterSenha("");
      setRegisterConfirmSenha("");
      setCodigoCadastroVerificacao(["", "", "", "", ""]);
      setAceitouTermos(false);
      setAceitouPrivacidade(false);
      setAceitaEmailsComerciais(false);
      setDadosCadastroTemp({
        nome: "",
        email: "",
        senha: "",
        tipo_usuario: "user",
      });
      setError("");
      setFieldErrors({});

      if (response.data?.autoLogin && response.data?.user) {
        const user = response.data.user;
        const userParaArmazenar = {
          id: user.id,
          nome: user.nome,
          tipo_usuario: user.tipo_usuario,
        };

        setUser(user);
        localStorage.setItem("nolare_user", JSON.stringify(userParaArmazenar));
        localStorage.removeItem("nolare_token");
        setAdmLogged(user.tipo_usuario === "adm");

        showToast("Cadastro realizado e login efetuado com sucesso!", "success", 4000);
        onClose();
        return;
      }

      setTab("login");
      showToast(
        "Cadastro realizado com sucesso! FaÃ§a o login com suas credenciais.",
        "success",
        4000,
      );
    } catch (err) {
      const errorData = err.response?.data || {};
      setError(errorData.error || "Erro ao confirmar cadastro");
    } finally {
      setCarregando(false);
    }
  };

  const handleReenviarCodigoCadastro = async (e) => {
    e.preventDefault();
    setError("");
    setCarregando(true);

    try {
      const response = await axios.post("/api/email/verificacao/solicitar", {
        email: emailCadastroVerificacao,
      });

      if (response.data.success) {
        setCodigoCadastroVerificacao(["", "", "", "", ""]);
        setTentativasVerificacao(5);
        setTempoRestanteVerificacao(0);
        setError("");
        showToast(
          "Novo cÃ³digo de verificaÃ§Ã£o enviado para o seu e-mail!",
          "success",
        );
      }
    } catch (err) {
      const errorData = err.response?.data || {};

      if (errorData.statusCode === "LIMIT_EXCEEDED") {
        setError(
          `${errorData.error} Tente novamente em ${errorData.tempoRestante} minutos.`,
        );
      } else {
        setError(errorData.error || "Erro ao reenviar cÃ³digo");
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleSolicitarRecuperacao = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setCarregando(true);

    if (!recuperacaoEmail.trim()) {
      setError("Email Ã© obrigatÃ³rio");
      setFieldErrors({
        ...fieldErrors,
        recuperacaoEmail: "Email Ã© obrigatÃ³rio",
      });
      setCarregando(false);
      return;
    }

    if (!isValidEmail(recuperacaoEmail)) {
      setError("Email invÃ¡lido");
      setFieldErrors({ ...fieldErrors, recuperacaoEmail: "Email invÃ¡lido" });
      setCarregando(false);
      return;
    }

    try {
      await axios.post("/api/email/recuperacao/solicitar", {
        email: recuperacaoEmail,
      });

      setEtapaRecuperacao("codigo");
      setError("");
      showToast("CÃ³digo de recuperaÃ§Ã£o enviado para o seu e-mail!", "success");
    } catch (err) {
      const errorData = err.response?.data || {};

      if (errorData.statusCode === "LIMIT_EXCEEDED") {
        setError(
          `${errorData.error} Tente novamente em ${errorData.tempoRestante} minutos.`,
        );
      } else {
        setError(errorData.error || "Erro no servidor");
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleValidarCodigo = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setCarregando(true);

    const codigoCompleto = codigoRecuperacao.join("");

    if (!codigoCompleto.trim() || codigoCompleto.length !== 5) {
      setError("CÃ³digo Ã© obrigatÃ³rio");
      setFieldErrors({
        ...fieldErrors,
        codigoRecuperacao: "CÃ³digo Ã© obrigatÃ³rio",
      });
      setCarregando(false);
      return;
    }

    try {
      const response = await axios.post("/api/email/recuperacao/validar", {
        email: recuperacaoEmail,
        codigo: codigoCompleto,
      });

      if (response.data.success) {
        setTokenRecuperacao(response.data.token);
        setEtapaRecuperacao("senha");
        setError("");
      }
    } catch (err) {
      const errorData = err.response?.data || {};

      if (errorData.statusCode === "BLOQUEADO") {
        setError(
          `${errorData.error} Tempo restante: ${formatarTempoRestante(
            errorData.tempoRestante,
          )}`,
        );
        setTempoRestanteVerificacao(errorData.tempoRestante);
      } else if (errorData.tentativasRestantes !== undefined) {
        setError(errorData.error);
        setFieldErrors({ ...fieldErrors, codigoRecuperacao: errorData.error });
      } else {
        setError(errorData.error || "Erro no servidor");
        setFieldErrors({
          ...fieldErrors,
          codigoRecuperacao: errorData.error || "Erro no servidor",
        });
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleRedefinirSenha = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setCarregando(true);

    const errors = {};

    if (!novaSenha.trim()) {
      errors.novaSenha = "Nova senha Ã© obrigatÃ³ria";
    } else if (!isValidPassword(novaSenha)) {
      const passwordErrors = getPasswordErrors(novaSenha);
      errors.novaSenha = `Senha deve conter: ${passwordErrors.join(", ")}`;
    }

    if (!confirmarNovaSenha.trim()) {
      errors.confirmarNovaSenha = "ConfirmaÃ§Ã£o de senha Ã© obrigatÃ³ria";
    } else if (novaSenha !== confirmarNovaSenha) {
      errors.confirmarNovaSenha = "Senhas nÃ£o coincidem";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Por favor, corrija os erros abaixo");
      setCarregando(false);
      return;
    }

    try {
      await axios.post(
        "/api/email/recuperacao/redefinir",
        {
          email: recuperacaoEmail,
          novaSenha,
        },
        {
          headers: {
            Authorization: `Bearer ${tokenRecuperacao}`,
          },
        },
      );

      // Limpa rascunho ao concluir a recuperacao com sucesso.
      limparRascunhoAuth();
      setTab("login");
      setEtapaRecuperacao("email");
      setRecuperacaoEmail("");
      setCodigoRecuperacao(["", "", "", "", ""]);
      setNovaSenha("");
      setConfirmarNovaSenha("");
      setTokenRecuperacao("");
      setError("");
      setFieldErrors({});
      showToast(
        "Senha redefinida com sucesso! FaÃ§a o login com a nova senha.",
        "success",
        4000,
      );
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erro no servidor";
      setError(errorMsg);
    } finally {
      setCarregando(false);
    }
  };

  const renderCodigoVerificacao = () => {
    const handleInputChange = (index, value) => {
      // Aceitar apenas nÃºmeros
      if (!/^\d*$/.test(value)) return;

      const novosCodigos = [...codigoCadastroVerificacao];
      novosCodigos[index] = value;
      setCodigoCadastroVerificacao(novosCodigos);

      // Auto-focus no prÃ³ximo campo
      if (value && index < 4) {
        inputsCadastroRefs.current[index + 1]?.focus();
      }

      // Limpar erro se existir
      if (fieldErrors.codigoCadastroVerificacao) {
        setFieldErrors({
          ...fieldErrors,
          codigoCadastroVerificacao: "",
        });
      }
    };

    const handleKeyDown = (index, e) => {
      // Backspace: voltar para o campo anterior se estiver vazio
      if (
        e.key === "Backspace" &&
        !codigoCadastroVerificacao[index] &&
        index > 0
      ) {
        inputsCadastroRefs.current[index - 1]?.focus();
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

      setCodigoCadastroVerificacao(novosCodigos);

      // Focar no prÃ³ximo campo vazio ou no Ãºltimo
      const proximoIndiceVazio =
        novosDigitos.length < 5 ? novosDigitos.length : 4;
      inputsCadastroRefs.current[proximoIndiceVazio]?.focus();
    };

    return (
      <div className="login-codigo-inputs-container">
        {codigoCadastroVerificacao.map((digito, index) => (
          <input
            key={index}
            ref={(el) => (inputsCadastroRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength="1"
            value={digito}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={carregando}
            className={`login-codigo-input ${
              fieldErrors.codigoCadastroVerificacao ? "input-error" : ""
            }`}
          />
        ))}
      </div>
    );
  };

  const renderCodigoRecuperacao = () => {
    const handleInputChange = (index, value) => {
      // Aceitar apenas nÃºmeros
      if (!/^\d*$/.test(value)) return;

      const novosCodigos = [...codigoRecuperacao];
      novosCodigos[index] = value;
      setCodigoRecuperacao(novosCodigos);

      // Auto-focus no prÃ³ximo campo
      if (value && index < 4) {
        inputsRecuperacaoRefs.current[index + 1]?.focus();
      }

      // Limpar erro se existir
      if (fieldErrors.codigoRecuperacao) {
        setFieldErrors({
          ...fieldErrors,
          codigoRecuperacao: "",
        });
      }
    };

    const handleKeyDown = (index, e) => {
      // Backspace: voltar para o campo anterior se estiver vazio
      if (e.key === "Backspace" && !codigoRecuperacao[index] && index > 0) {
        inputsRecuperacaoRefs.current[index - 1]?.focus();
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

      setCodigoRecuperacao(novosCodigos);

      // Focar no prÃ³ximo campo vazio ou no Ãºltimo
      const proximoIndiceVazio =
        novosDigitos.length < 5 ? novosDigitos.length : 4;
      inputsRecuperacaoRefs.current[proximoIndiceVazio]?.focus();
    };

    return (
      <div className="login-codigo-inputs-container">
        {codigoRecuperacao.map((digito, index) => (
          <input
            key={index}
            ref={(el) => (inputsRecuperacaoRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength="1"
            value={digito}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={carregando}
            className={`login-codigo-input ${
              fieldErrors.codigoRecuperacao ? "input-error" : ""
            }`}
          />
        ))}
      </div>
    );
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      // Do nothing - keep modal open
      return;
    }
  };

  const handleToggleTermos = () => {
    if (mostrarTermos) {
      setFechandoTermos(true);
      setTimeout(() => {
        setMostrarTermos(false);
        setFechandoTermos(false);
      }, 300);
    } else {
      setMostrarTermos(true);
    }
  };

  const handleTogglePrivacidade = () => {
    if (mostrarPrivacidade) {
      setFechandoPrivacidade(true);
      setTimeout(() => {
        setMostrarPrivacidade(false);
        setFechandoPrivacidade(false);
      }, 300);
    } else {
      setMostrarPrivacidade(true);
    }
  };

  return (
    <div className="login-modal-overlay" onClick={handleOverlayClick}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        {carregando && <div className="login-modal-loading-overlay"></div>}

        <button
          className="login-close-btn"
          onClick={onClose}
          disabled={carregando}
          title=" Fechar"
        >
          <IoClose size={28} />
        </button>

        {error && <p className="login-error-msg">{error}</p>}

        {tab === "login" && (
          <form onSubmit={handleLogin} className="login-form">
            <div className="login-modal-logo-container">
              <img
                src={logo_azul || "/placeholder.svg"}
                alt="Nolare Logo"
                className="login-modal-logo-popup"
              />
            </div>

            <h2 className="login-form-title">Entrar</h2>

            <div className="login-form-group">
              <label htmlFor="loginEmail">Email</label>
              <input
                id="loginEmail"
                type="email"
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                  if (fieldErrors.loginEmail) {
                    setFieldErrors({ ...fieldErrors, loginEmail: "" });
                  }
                }}
                disabled={carregando}
                className={`login-input ${
                  fieldErrors.loginEmail ? "input-error" : ""
                }`}
              />
              {fieldErrors.loginEmail && (
                <p className="login-field-error">{fieldErrors.loginEmail}</p>
              )}
            </div>

            <div className="login-form-group">
              <label htmlFor="loginSenha">Senha</label>
              <div className="login-password-container">
                <input
                  id="loginSenha"
                  type={showLoginSenha ? "text" : "password"}
                  value={loginSenha}
                  onChange={(e) => {
                    setLoginSenha(e.target.value);
                    if (fieldErrors.loginSenha) {
                      setFieldErrors({ ...fieldErrors, loginSenha: "" });
                    }
                  }}
                  disabled={carregando}
                  className={`login-input ${
                    fieldErrors.loginSenha ? "input-error" : ""
                  }`}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowLoginSenha(!showLoginSenha)}
                  disabled={carregando}
                >
                  {showLoginSenha ? (
                    <IoEyeOutline size={20} />
                  ) : (
                    <IoEyeOffOutline size={20} />
                  )}
                </button>
              </div>
              {fieldErrors.loginSenha && (
                <p className="login-field-error">{fieldErrors.loginSenha}</p>
              )}

              <div className="login-footer-controls">
                <div className="login-checkbox-group">
                  <input
                    id="lembrarMe"
                    type="checkbox"
                    checked={lembrarMe}
                    onChange={(e) => setLembrarMe(e.target.checked)}
                    disabled={carregando}
                    className="login-checkbox"
                  />
                  <label htmlFor="lembrarMe" className="login-checkbox-label">
                    Lembrar-me
                  </label>
                </div>
                <a
                  href="#"
                  className="login-forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!carregando) {
                      setTab("recuperacao");
                      setError("");
                      setFieldErrors({});
                      setEtapaRecuperacao("email");
                    }
                  }}
                >
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar"}
            </button>

            <div className="login-footer-text">
              NÃ£o possui uma conta?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (!carregando) {
                    setTab("register");
                    setError("");
                    setFieldErrors({});
                  }
                }}
              >
                Crie uma agora
              </a>
            </div>
          </form>
        )}

        {tab === "register" && (
          <>
            {etapaCadastro === "form" && (
              <form onSubmit={handleRegister} className="login-form">
                <div className="login-modal-logo-container">
                  <img
                    src={logo_azul || "/placeholder.svg"}
                    alt="Nolare Logo"
                    className="login-modal-logo-popup"
                  />
                </div>

                <h2 className="login-form-title">Criar Conta</h2>

                <div className="login-form-group">
                  <label htmlFor="registerNome">Nome</label>
                  <input
                    id="registerNome"
                    type="text"
                    value={registerNome}
                    onChange={(e) => {
                      setRegisterNome(e.target.value);
                      if (fieldErrors.registerNome) {
                        setFieldErrors({ ...fieldErrors, registerNome: "" });
                      }
                    }}
                    disabled={carregando}
                    className={`login-input ${
                      fieldErrors.registerNome ? "input-error" : ""
                    }`}
                  />
                  {fieldErrors.registerNome && (
                    <p className="login-field-error">
                      {fieldErrors.registerNome}
                    </p>
                  )}
                </div>

                <div className="login-form-group">
                  <label htmlFor="registerEmail">Email</label>
                  <input
                    id="registerEmail"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => {
                      setRegisterEmail(e.target.value);
                      if (fieldErrors.registerEmail) {
                        setFieldErrors({ ...fieldErrors, registerEmail: "" });
                      }
                    }}
                    disabled={carregando}
                    className={`login-input ${
                      fieldErrors.registerEmail ? "input-error" : ""
                    }`}
                  />
                  {fieldErrors.registerEmail && (
                    <p className="login-field-error">
                      {fieldErrors.registerEmail}
                    </p>
                  )}
                </div>

                <div className="login-form-group">
                  <label htmlFor="registerSenha">Senha</label>
                  <div className="login-password-container">
                    <input
                      id="registerSenha"
                      type={showRegisterSenha ? "text" : "password"}
                      value={registerSenha}
                      onChange={(e) => {
                        setRegisterSenha(e.target.value);
                        if (fieldErrors.registerSenha) {
                          setFieldErrors({ ...fieldErrors, registerSenha: "" });
                        }
                      }}
                      disabled={carregando}
                      className={`login-input ${
                        fieldErrors.registerSenha ? "input-error" : ""
                      }`}
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() => setShowRegisterSenha(!showRegisterSenha)}
                      disabled={carregando}
                    >
                      {showRegisterSenha ? (
                        <IoEyeOutline size={20} />
                      ) : (
                        <IoEyeOffOutline size={20} />
                      )}
                    </button>
                  </div>
                  {fieldErrors.registerSenha && (
                    <p className="login-field-error">
                      {fieldErrors.registerSenha}
                    </p>
                  )}
                </div>

                <div className="login-form-group">
                  <label htmlFor="registerConfirmSenha">Confirmar Senha</label>
                  <div className="login-password-container">
                    <input
                      id="registerConfirmSenha"
                      type={showRegisterConfirmSenha ? "text" : "password"}
                      value={registerConfirmSenha}
                      onChange={(e) => {
                        setRegisterConfirmSenha(e.target.value);
                        if (fieldErrors.registerConfirmSenha) {
                          setFieldErrors({
                            ...fieldErrors,
                            registerConfirmSenha: "",
                          });
                        }
                      }}
                      disabled={carregando}
                      className={`login-input ${
                        fieldErrors.registerConfirmSenha ? "input-error" : ""
                      }`}
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() =>
                        setShowRegisterConfirmSenha(!showRegisterConfirmSenha)
                      }
                      disabled={carregando}
                    >
                      {showRegisterConfirmSenha ? (
                        <IoEyeOutline size={20} />
                      ) : (
                        <IoEyeOffOutline size={20} />
                      )}
                    </button>
                  </div>
                  {fieldErrors.registerConfirmSenha && (
                    <p className="login-field-error">
                      {fieldErrors.registerConfirmSenha}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="login-btn"
                  disabled={carregando}
                >
                  {carregando ? "Criando conta..." : "Cadastrar"}
                </button>

                <div className="login-footer-text">
                  JÃ¡ possui uma conta?{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!carregando) {
                        setTab("login");
                        setError("");
                        setFieldErrors({});
                      }
                    }}
                  >
                    FaÃ§a login
                  </a>
                </div>
              </form>
            )}

            {etapaCadastro === "verificacao" && (
              <form onSubmit={handleVerificacaoCadastro} className="login-form">
                <div className="login-modal-logo-container">
                  <img
                    src={logo_azul || "/placeholder.svg"}
                    alt="Nolare Logo"
                    className="login-modal-logo-popup"
                  />
                </div>

                <h2 className="login-form-title">Confirme seu Email</h2>
                <p className="login-verification-subtitle">
                  Envimos um cÃ³digo de 5 dÃ­gitos para{" "}
                  <strong>{emailCadastroVerificacao}</strong>
                </p>

                <div className="login-form-group">
                  <label>CÃ³digo de VerificaÃ§Ã£o</label>
                  {renderCodigoVerificacao()}
                  {fieldErrors.codigoCadastroVerificacao && (
                    <p className="login-field-error">
                      {fieldErrors.codigoCadastroVerificacao}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="login-btn"
                  disabled={carregando}
                >
                  {carregando ? "Verificando..." : "Confirmar CÃ³digo"}
                </button>

                <button
                  type="button"
                  className="login-resend-btn"
                  onClick={handleReenviarCodigoCadastro}
                  disabled={carregando}
                >
                  Reenviar CÃ³digo
                </button>
              </form>
            )}

            {etapaCadastro === "verificacaoTermos" && (
              <div className="login-form-wrapper">
                <div className="login-form-header">
                  <h2 className="login-form-title">Termos e CondiÃ§Ãµes</h2>
                  <p className="login-form-subtitle">
                    Por favor, leia e aceite os termos para concluir seu
                    cadastro
                  </p>
                </div>

                <div className="login-terms-section">
                  <div
                    className="login-terms-header"
                    onClick={handleToggleTermos}
                    style={{ cursor: "pointer" }}
                  >
                    <h3 className="login-terms-title">
                      {mostrarTermos ? "â–¼" : "â–¶"} Termos de Uso
                    </h3>
                  </div>
                  {mostrarTermos && (
                    <div
                      className={`login-terms-content ${
                        fechandoTermos ? "closing" : ""
                      }`}
                    >
                      <TermosDeUso />
                    </div>
                  )}
                </div>

                <div className="login-terms-section">
                  <div
                    className="login-terms-header"
                    onClick={handleTogglePrivacidade}
                    style={{ cursor: "pointer" }}
                  >
                    <h3 className="login-terms-title">
                      {mostrarPrivacidade ? "â–¼" : "â–¶"} PolÃ­tica de Privacidade
                    </h3>
                  </div>
                  {mostrarPrivacidade && (
                    <div
                      className={`login-terms-content ${
                        fechandoPrivacidade ? "closing" : ""
                      }`}
                    >
                      <PoliticaDePrivacidade />
                    </div>
                  )}
                </div>

                <div className="login-form-group">
                  <div className="login-checkbox-group">
                    <input
                      id="aceitouTermos"
                      type="checkbox"
                      checked={aceitouTermos}
                      onChange={(e) => {
                        setAceitouTermos(e.target.checked);
                        if (e.target.checked && aceitouPrivacidade && error) {
                          setError("");
                        }
                      }}
                      disabled={carregando}
                      className="login-checkbox"
                    />
                    <label
                      htmlFor="aceitouTermos"
                      className="login-checkbox-label"
                    >
                      Aceito os Termos de Uso
                    </label>
                  </div>
                </div>

                <div className="login-form-group">
                  <div className="login-checkbox-group">
                    <input
                      id="aceitouPrivacidade"
                      type="checkbox"
                      checked={aceitouPrivacidade}
                      onChange={(e) => {
                        setAceitouPrivacidade(e.target.checked);
                        if (e.target.checked && aceitouTermos && error) {
                          setError("");
                        }
                      }}
                      disabled={carregando}
                      className="login-checkbox"
                    />
                    <label
                      htmlFor="aceitouPrivacidade"
                      className="login-checkbox-label"
                    >
                      Aceito a PolÃ­tica de Privacidade
                    </label>
                  </div>
                </div>

                <div className="login-form-group">
                  <div className="login-checkbox-group">
                    <input
                      id="aceitaEmailsComerciais"
                      type="checkbox"
                      checked={aceitaEmailsComerciais}
                      onChange={(e) =>
                        setAceitaEmailsComerciais(e.target.checked)
                      }
                      disabled={carregando}
                      className="login-checkbox"
                    />
                    <label
                      htmlFor="aceitaEmailsComerciais"
                      className="login-checkbox-label"
                    >
                      Quero receber e-mails com ofertas e novidades
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  className="login-btn"
                  onClick={handleConfirmarCadastroComTermos}
                  disabled={carregando}
                >
                  {carregando ? "Confirmando..." : "Confirmar Cadastro"}
                </button>
              </div>
            )}
          </>
        )}

        {tab === "recuperacao" && (
          <>
            {etapaRecuperacao === "email" && (
              <form
                onSubmit={handleSolicitarRecuperacao}
                className="login-form"
              >
                <div className="login-modal-logo-container">
                  <img
                    src={logo_azul || "/placeholder.svg"}
                    alt="Nolare Logo"
                    className="login-modal-logo-popup"
                  />
                </div>

                <h2 className="login-form-title">Recuperar Senha</h2>

                <div className="login-form-group">
                  <label htmlFor="recuperacaoEmail">Email</label>
                  <input
                    id="recuperacaoEmail"
                    type="email"
                    value={recuperacaoEmail}
                    onChange={(e) => {
                      setRecuperacaoEmail(e.target.value);
                      if (fieldErrors.recuperacaoEmail) {
                        setFieldErrors({
                          ...fieldErrors,
                          recuperacaoEmail: "",
                        });
                      }
                    }}
                    disabled={carregando}
                    className={`login-input ${
                      fieldErrors.recuperacaoEmail ? "input-error" : ""
                    }`}
                  />
                  {fieldErrors.recuperacaoEmail && (
                    <p className="login-field-error">
                      {fieldErrors.recuperacaoEmail}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="login-btn"
                  disabled={carregando}
                >
                  {carregando ? "Enviando..." : "Solicitar CÃ³digo"}
                </button>
              </form>
            )}

            {etapaRecuperacao === "codigo" && (
              <form onSubmit={handleValidarCodigo} className="login-form">
                <div className="login-modal-logo-container">
                  <img
                    src={logo_azul || "/placeholder.svg"}
                    alt="Nolare Logo"
                    className="login-modal-logo-popup"
                  />
                </div>

                <h2 className="login-form-title">Digite o CÃ³digo</h2>
                <p className="login-verification-subtitle">
                  Envimos um cÃ³digo de 5 dÃ­gitos para{" "}
                  <strong>{recuperacaoEmail}</strong>
                </p>

                <div className="login-form-group">
                  <label>CÃ³digo de RecuperaÃ§Ã£o</label>
                  {renderCodigoRecuperacao()}
                  {fieldErrors.codigoRecuperacao && (
                    <p className="login-field-error">
                      {fieldErrors.codigoRecuperacao}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="login-btn"
                  disabled={carregando}
                >
                  {carregando ? "Validando..." : "PrÃ³ximo"}
                </button>
              </form>
            )}

            {etapaRecuperacao === "senha" && (
              <form onSubmit={handleRedefinirSenha} className="login-form">
                <div className="login-modal-logo-container">
                  <img
                    src={logo_azul || "/placeholder.svg"}
                    alt="Nolare Logo"
                    className="login-modal-logo-popup"
                  />
                </div>

                <h2 className="login-form-title">Redefinir Senha</h2>

                <div className="login-form-group">
                  <label htmlFor="novaSenha">Nova Senha</label>
                  <div className="login-password-container">
                    <input
                      id="novaSenha"
                      type={showNovaSenha ? "text" : "password"}
                      value={novaSenha}
                      onChange={(e) => {
                        setNovaSenha(e.target.value);
                        if (fieldErrors.novaSenha) {
                          setFieldErrors({ ...fieldErrors, novaSenha: "" });
                        }
                      }}
                      disabled={carregando}
                      className={`login-input ${
                        fieldErrors.novaSenha ? "input-error" : ""
                      }`}
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() => setShowNovaSenha(!showNovaSenha)}
                      disabled={carregando}
                    >
                      {showNovaSenha ? (
                        <IoEyeOutline size={20} />
                      ) : (
                        <IoEyeOffOutline size={20} />
                      )}
                    </button>
                  </div>
                  {fieldErrors.novaSenha && (
                    <p className="login-field-error">{fieldErrors.novaSenha}</p>
                  )}
                </div>

                <div className="login-form-group">
                  <label htmlFor="confirmarNovaSenha">
                    Confirmar Nova Senha
                  </label>
                  <div className="login-password-container">
                    <input
                      id="confirmarNovaSenha"
                      type={showConfirmarNovaSenha ? "text" : "password"}
                      value={confirmarNovaSenha}
                      onChange={(e) => {
                        setConfirmarNovaSenha(e.target.value);
                        if (fieldErrors.confirmarNovaSenha) {
                          setFieldErrors({
                            ...fieldErrors,
                            confirmarNovaSenha: "",
                          });
                        }
                      }}
                      disabled={carregando}
                      className={`login-input ${
                        fieldErrors.confirmarNovaSenha ? "input-error" : ""
                      }`}
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() =>
                        setShowConfirmarNovaSenha(!showConfirmarNovaSenha)
                      }
                      disabled={carregando}
                    >
                      {showConfirmarNovaSenha ? (
                        <IoEyeOutline size={20} />
                      ) : (
                        <IoEyeOffOutline size={20} />
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmarNovaSenha && (
                    <p className="login-field-error">
                      {fieldErrors.confirmarNovaSenha}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="login-btn"
                  disabled={carregando}
                >
                  {carregando ? "Redefinindo..." : "Redefinir Senha"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LoginModal;


