import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import pool from "./db.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { enviarEmail } from "./src/emails/email.js";
import jwt from "jsonwebtoken";
import sharp from "sharp";
import crypto from "crypto";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// =========================
// VALIDAÇÃO DE VARIÁVEIS DE AMBIENTE CRÍTICAS
// =========================
const variaveisObrigatorias = [
  "JWT_SECRET",
  "PGUSER",
  "PGPASSWORD",
  "PGHOST",
  "PGDATABASE",
];
variaveisObrigatorias.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(
      `ERRO CRÍTICO: Variável de ambiente ${varName} não está definida.`,
    );
    process.exit(1);
  }
});

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.BACKEND_PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "https://nolaresc.com.br";

// =========================
// HEADERS DE SEGURANÇA
// =========================
app.use((req, res, next) => {
  // Previne clickjacking
  res.setHeader("X-Frame-Options", "DENY");
  // Previne XSS
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Previne MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Política de referrer
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Remove header que expõe tecnologia
  res.removeHeader("X-Powered-By");

  // SEGURANÇA: Content-Security-Policy — defesa contra XSS (1.10)
  // CORREÇÃO: Adicionado frame-src para permitir o embed do Google Maps nos imóveis
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: blob: https:; " +
      "connect-src 'self'; " +
      "frame-src https://maps.google.com https://www.google.com; " +
      "frame-ancestors 'none';",
  );

  // SEGURANÇA: HSTS — força HTTPS em produção (1.11)
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  next();
});

// =========================
// CORS CONFIGURADO
// =========================
const corsOptions = {
  origin: (origin, callback) => {
    // Permite requisições sem origin (apps mobile, Postman, etc)
    const allowedOrigins = [
      FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:3000",
      "https://nolaresc.com.br",
      "https://www.nolaresc.com.br",
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // SEGURANÇA: Rejeita origens não autorizadas (1.1)
      callback(new Error("Origem não permitida pelo CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve arquivos estáticos do build do Vite
app.use(express.static(path.join(__dirname, "dist")));

// Serve arquivos estáticos da pasta public (fotos dos imóveis)
// Rota principal para novos uploads: /fotos_imoveis/arquivo.jpg
app.use(
  "/fotos_imoveis",
  express.static(path.join(__dirname, "public", "fotos_imoveis")),
);

// Rota de compatibilidade para registros antigos no banco: /public/fotos_imoveis/arquivo.jpg
app.use(
  "/public/fotos_imoveis",
  express.static(path.join(__dirname, "public", "fotos_imoveis")),
);

// =========================
// FUNÇÕES AUXILIARES
// =========================

// FUNÇÃO: Gera código de verificação de 5 dígitos (usando crypto para maior segurança)
const gerarCodigoVerificacao = () => {
  const randomBytes = crypto.randomBytes(4);
  const randomNumber = randomBytes.readUInt32BE(0);
  return (10000 + (randomNumber % 90000)).toString();
};

// FUNÇÃO: Gera token UUID seguro
const gerarToken = () => {
  return uuidv4();
};

// FUNÇÃO: Valida se o token ainda está válido (10 minutos)
const validarToken = (expiracao) => {
  return new Date() < new Date(expiracao);
};

// =========================
// FUNÇÕES DE VALIDAÇÃO DE ENTRADA
// =========================

// FUNÇÃO: Valida formato de email
const validarEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

// FUNÇÃO: Valida força da senha
const validarForcaSenha = (senha) => {
  if (!senha || typeof senha !== "string")
    return { valido: false, mensagem: "Senha é obrigatória" };
  if (senha.length < 8)
    return { valido: false, mensagem: "Senha deve ter no mínimo 8 caracteres" };
  if (senha.length > 128)
    return {
      valido: false,
      mensagem: "Senha deve ter no máximo 128 caracteres",
    };
  if (!/[a-z]/.test(senha))
    return {
      valido: false,
      mensagem: "Senha deve conter pelo menos uma letra minúscula",
    };
  if (!/[A-Z]/.test(senha))
    return {
      valido: false,
      mensagem: "Senha deve conter pelo menos uma letra maiúscula",
    };
  if (!/[0-9]/.test(senha))
    return {
      valido: false,
      mensagem: "Senha deve conter pelo menos um número",
    };
  return { valido: true, mensagem: "" };
};

// FUNÇÃO: Sanitiza string (remove caracteres perigosos)
const sanitizarString = (str, maxLength = 255) => {
  if (!str || typeof str !== "string") return "";
  return str.trim().slice(0, maxLength).replace(/[<>]/g, ""); // Remove < e > para prevenir XSS básico
};

// FUNÇÃO: Valida nome
const validarNome = (nome) => {
  if (!nome || typeof nome !== "string") return false;
  const nomeLimpo = nome.trim();
  return nomeLimpo.length >= 3 && nomeLimpo.length <= 100;
};

// FUNÇÃO: Valida ID numérico
const validarIdNumerico = (id) => {
  const idNum = Number.parseInt(id, 10);
  return !Number.isNaN(idNum) && idNum > 0;
};

// FUNÇÃO: Log seguro (não expõe detalhes em produção)
const logErroSeguro = (contexto, erro) => {
  const codigoErro = `ERR_${Date.now()}_${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  console.error(`[${codigoErro}] ${contexto}`);
  if (process.env.NODE_ENV === "development") {
    console.error("Detalhes:", erro);
  }
  return codigoErro;
};

// =========================
// MIDDLEWARE DE AUTENTICAÇÃO JWT
// =========================

// MIDDLEWARE: Verifica token JWT
const verificarTokenJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Token de autenticação não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado" });
    }
    return res.status(401).json({ error: "Token inválido" });
  }
};

// MIDDLEWARE: Verifica se usuário é administrador
const verificarAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const result = await pool.query(
      "SELECT tipo_usuario FROM usuarios WHERE id = $1",
      [userId],
    );

    if (result.rows.length === 0 || result.rows[0].tipo_usuario !== "adm") {
      return res.status(403).json({
        error:
          "Acesso negado. Apenas administradores podem realizar esta ação.",
      });
    }

    next();
  } catch (error) {
    const codigoErro = logErroSeguro(
      "Erro ao verificar permissões de admin",
      error,
    );
    return res
      .status(500)
      .json({ error: "Erro ao verificar permissões", codigo: codigoErro });
  }
};

// FUNÇÃO: Gera token JWT para usuário
const gerarTokenJWT = (userId, tipoUsuario) => {
  return jwt.sign(
    { userId, tipoUsuario },
    JWT_SECRET,
    { expiresIn: "24h" }, // Token expira em 24 horas
  );
};

// =========================
// RATE LIMITING SIMPLES (SEM BIBLIOTECA EXTERNA)
// =========================
const tentativasLogin = new Map();
const LIMITE_TENTATIVAS = 5;
const JANELA_BLOQUEIO_MS = 15 * 60 * 1000; // 15 minutos

const verificarRateLimitLogin = (identificador) => {
  const agora = Date.now();
  const dados = tentativasLogin.get(identificador);

  if (!dados) {
    return { bloqueado: false, tentativasRestantes: LIMITE_TENTATIVAS };
  }

  // Limpa tentativas antigas
  if (agora > dados.expiraEm) {
    tentativasLogin.delete(identificador);
    return { bloqueado: false, tentativasRestantes: LIMITE_TENTATIVAS };
  }

  if (dados.tentativas >= LIMITE_TENTATIVAS) {
    const tempoRestante = Math.ceil((dados.expiraEm - agora) / 1000);
    return {
      bloqueado: true,
      tempoRestante,
      mensagem: `Muitas tentativas de login. Tente novamente em ${Math.ceil(tempoRestante / 60)} minutos.`,
    };
  }

  return {
    bloqueado: false,
    tentativasRestantes: LIMITE_TENTATIVAS - dados.tentativas,
  };
};

const registrarTentativaLoginFalha = (identificador) => {
  const agora = Date.now();
  const dados = tentativasLogin.get(identificador);

  if (!dados || agora > dados.expiraEm) {
    tentativasLogin.set(identificador, {
      tentativas: 1,
      expiraEm: agora + JANELA_BLOQUEIO_MS,
    });
  } else {
    dados.tentativas += 1;
  }
};

const limparTentativasLogin = (identificador) => {
  tentativasLogin.delete(identificador);
};

// Limpeza periódica do mapa de rate limiting (a cada 5 minutos)
setInterval(
  () => {
    const agora = Date.now();
    for (const [key, value] of tentativasLogin.entries()) {
      if (agora > value.expiraEm) {
        tentativasLogin.delete(key);
      }
    }
  },
  5 * 60 * 1000,
);

// =========================
// FUNÇÕES DE CONTROLE DE TENTATIVAS (EMAIL)
// =========================

// Função para criar tabela de rastreamento de tentativas falhas (se não existir)
const garantirTabelasTentativas = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tentativas_verificacao_email (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        tentativas_restantes INTEGER DEFAULT 5,
        bloqueado_ate TIMESTAMPTZ,
        tipo VARCHAR(50) NOT NULL,
        ultima_tentativa TIMESTAMPTZ DEFAULT NOW(),
        criado_em TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_tentativas_email_tipo 
      ON tentativas_verificacao_email(email, tipo);
    `);
  } catch (err) {
    logErroSeguro("Erro ao garantir tabelas de tentativas", err);
  }
};

// Chamar ao iniciar servidor
garantirTabelasTentativas();

// FUNÇÃO: Verifica se um email está bloqueado por excesso de tentativas erradas
// Consolidada para evitar duplicação com verificarRateLimitLogin (3.1 - código duplicado)
const verificarBloqueioTentativasEmail = async (email, tipo) => {
  try {
    const result = await pool.query(
      `SELECT bloqueado_ate, tentativas_restantes FROM tentativas_verificacao_email
       WHERE email = $1 AND tipo = $2`,
      [email, tipo],
    );

    if (result.rows.length === 0) {
      return { bloqueado: false, tentativasRestantes: 5 };
    }

    const dados = result.rows[0];
    const agora = new Date();

    if (dados.bloqueado_ate && agora < new Date(dados.bloqueado_ate)) {
      const tempoRestante = Math.ceil(
        (new Date(dados.bloqueado_ate) - agora) / 1000,
      );
      return {
        bloqueado: true,
        tempoRestante,
        tentativasRestantes: 0,
        mensagem: `Você está bloqueado. Tente novamente em ${Math.ceil(tempoRestante / 60)} minutos.`,
      };
    }

    return {
      bloqueado: false,
      tentativasRestantes: dados.tentativas_restantes || 5,
    };
  } catch (err) {
    logErroSeguro("Erro ao verificar bloqueio de tentativas por email", err);
    return { bloqueado: false, tentativasRestantes: 5 };
  }
};

// FUNÇÃO: Registra tentativa errada de verificação por email e bloqueia se necessário
// Consolidada: unifica a lógica de contagem de tentativas para todos os fluxos de email
const registrarTentativaErradaEmail = async (email, tipo) => {
  try {
    const result = await pool.query(
      `SELECT id, tentativas_restantes FROM tentativas_verificacao_email
       WHERE email = $1 AND tipo = $2`,
      [email, tipo],
    );

    if (result.rows.length === 0) {
      await pool.query(
        `INSERT INTO tentativas_verificacao_email (email, tipo, tentativas_restantes, ultima_tentativa)
         VALUES ($1, $2, $3, NOW())`,
        [email, tipo, 4], // 5 - 1 = 4 tentativas restantes
      );
      return;
    }

    const record = result.rows[0];
    const tentativasRestantes = Math.max(
      0,
      (record.tentativas_restantes || 5) - 1,
    );

    if (tentativasRestantes === 0) {
      const bloqueadoAte = new Date(Date.now() + 10 * 60 * 1000);
      await pool.query(
        `UPDATE tentativas_verificacao_email
         SET tentativas_restantes = $1, bloqueado_ate = $2, ultima_tentativa = NOW()
         WHERE id = $3`,
        [tentativasRestantes, bloqueadoAte, record.id],
      );
    } else {
      await pool.query(
        `UPDATE tentativas_verificacao_email
         SET tentativas_restantes = $1, ultima_tentativa = NOW()
         WHERE id = $2`,
        [tentativasRestantes, record.id],
      );
    }
  } catch (err) {
    logErroSeguro("Erro ao registrar tentativa errada por email", err);
  }
};

// =========================

// ROTAS DE AUTENTICAÇÃO

// =========================

// ROTA: Login de usuário
app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;

  // VALIDAÇÃO: Campos obrigatórios
  if (!email || !senha) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }

  // VALIDAÇÃO: Formato de email
  if (!validarEmail(email)) {
    return res.status(400).json({ error: "Formato de email inválido" });
  }

  // RATE LIMITING: Verifica se IP está bloqueado
  const identificador = req.ip || req.connection.remoteAddress || email;
  const rateLimit = verificarRateLimitLogin(identificador);

  if (rateLimit.bloqueado) {
    return res.status(429).json({
      error: rateLimit.mensagem,
      tempoRestante: rateLimit.tempoRestante,
    });
  }

  try {
    // DB QUERY: Busca usuário por email (sanitizado)
    const emailLimpo = sanitizarString(email.toLowerCase(), 255);
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
      emailLimpo,
    ]);

    if (result.rows.length === 0) {
      // SEGURANÇA: Registra tentativa falha e retorna mensagem genérica
      registrarTentativaLoginFalha(identificador);
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const user = result.rows[0];

    // VALIDAÇÃO: Compara senha com hash armazenado
    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      // SEGURANÇA: Registra tentativa falha
      registrarTentativaLoginFalha(identificador);
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // SUCESSO: Limpa tentativas de login
    limparTentativasLogin(identificador);

    // DB QUERY: Registra sessão de login
    await pool.query(
      "INSERT INTO usuario_sessoes (usuario_id, data_login, ativo) VALUES ($1, CURRENT_TIMESTAMP, TRUE)",
      [user.id],
    );

    const dataHora = new Date().toLocaleString("pt-BR", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    });

    // SEGURANÇA: Envio de email assíncrono sem expor erros
    enviarEmail("loginDetectado", user.email, "Novo Login Detectado - Nolare", {
      nome: user.nome,
      dataHora: dataHora,
    }).catch((err) => {
      logErroSeguro("Erro ao enviar e-mail de login detectado", err);
    });

    // SEGURANÇA: Remove senha antes de enviar resposta
    const { senha: _, ...userSemSenha } = user;

    // SEGURANÇA: Gera token JWT para autenticação
    const token = gerarTokenJWT(user.id, user.tipo_usuario);

    res.json({
      user: userSemSenha,
      token,
      expiresIn: 86400, // 24 horas em segundos
    });
  } catch (err) {
    const codigoErro = logErroSeguro("Erro ao fazer login", err);
    res.status(500).json({ error: "Erro no servidor", codigo: codigoErro });
  }
});

// ROTA: Logout de usuário (PROTEGIDA — usa ID do próprio token JWT) (1.8)
app.post("/api/logout", verificarTokenJWT, async (req, res) => {
  // SEGURANÇA: Usa o ID extraído do token JWT, ignorando qualquer body enviado
  const usuario_id = req.user.userId;

  try {
    // DB QUERY: Atualiza sessão ativa para inativa
    await pool.query(
      `UPDATE usuario_sessoes
       SET data_logout = CURRENT_TIMESTAMP, ativo = FALSE
       WHERE usuario_id = $1 AND ativo = TRUE`,
      [usuario_id],
    );

    res.json({ message: "Logout realizado com sucesso" });
  } catch (err) {
    const codigoErro = logErroSeguro("Erro ao fazer logout", err);
    res.status(500).json({ error: "Erro no servidor", codigo: codigoErro });
  }
});

// ROTA: Registro de novo usuário
app.post("/api/register", async (req, res) => {
  const {
    nome,
    email,
    senha,
    tipo_usuario,
    aceitouTermos,
    aceitouPrivacidade,
  } = req.body;

  // VALIDAÇÃO: Campos obrigatórios
  if (!nome || !email || !senha || !tipo_usuario) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  // VALIDAÇÃO: Nome
  if (!validarNome(nome)) {
    return res
      .status(400)
      .json({ error: "Nome deve ter entre 3 e 100 caracteres" });
  }

  // VALIDAÇÃO: Formato de email
  if (!validarEmail(email)) {
    return res.status(400).json({ error: "Formato de email inválido" });
  }

  // VALIDAÇÃO: Força da senha
  const validacaoSenha = validarForcaSenha(senha);
  if (!validacaoSenha.valido) {
    return res.status(400).json({ error: validacaoSenha.mensagem });
  }

  // VALIDAÇÃO: Tipo de usuário permitido (não permite criar admin via registro público)
  if (tipo_usuario !== "user") {
    return res.status(400).json({ error: "Tipo de usuário inválido" });
  }

  try {
    // Sanitização dos dados
    const nomeLimpo = sanitizarString(nome, 100);
    const emailLimpo = sanitizarString(email.toLowerCase(), 255);

    // DB QUERY: Verifica se email já existe
    const emailExiste = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [emailLimpo],
    );
    const emailJaExiste = emailExiste.rows.length > 0;

    const codigo = gerarCodigoVerificacao();
    const expiracao = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    const aceitouTermosValue = aceitouTermos === true ? true : false;
    const aceitouPrivacidadeValue = aceitouPrivacidade === true ? true : false;

    // HASH DA SENHA: feito antes do INSERT para reutilizar o valor no ON CONFLICT DO UPDATE
    const senhaHash = await bcrypt.hash(senha, 12);

    // Usamos tabela de pendências de verificação
    // CORREÇÃO: Usa EXCLUDED para referenciar os valores que seriam inseridos no ON CONFLICT
    await pool.query(
      `INSERT INTO email_verificacao_pendente
        (nome, email, senha, tipo_usuario, codigo, expiracao, aceitou_termos, aceitou_privacidade, aceita_emails_comerciais)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE)
       ON CONFLICT (email) DO UPDATE SET
         nome = EXCLUDED.nome,
         senha = EXCLUDED.senha,
         codigo = EXCLUDED.codigo,
         expiracao = EXCLUDED.expiracao,
         aceitou_termos = EXCLUDED.aceitou_termos,
         aceitou_privacidade = EXCLUDED.aceitou_privacidade,
         aceita_emails_comerciais = FALSE,
         atualizado_em = NOW(),
         verificado = FALSE`,
      [
        nomeLimpo,
        emailLimpo,
        senhaHash,
        "user", // Sempre user, nunca admin via registro público
        codigo,
        expiracao,
        aceitouTermosValue,
        aceitouPrivacidadeValue,
      ],
    );

    if (!emailJaExiste) {
      // Email novo - enviar código real
      await enviarEmail(
        "verificarCadastro",
        emailLimpo,
        "Verificação de Cadastro - Nolare",
        {
          nome: nomeLimpo,
          codigo: codigo,
        },
      );
    }

    // SEGURANÇA: Resposta uniforme para prevenir enumeração de usuários
    res.status(201).json({
      success: true,
      needsVerification: true,
      message:
        "Se este email não estiver cadastrado, você receberá um código de verificação em breve.",
    });
  } catch (err) {
    // DEBUG: Log completo do erro para identificar o problema
    console.error("=== ERRO DETALHADO NO REGISTRO ===");
    console.error("Erro:", err);
    console.error("Mensagem:", err.message);
    console.error("Código PostgreSQL:", err.code);
    console.error("Detalhes:", err.detail);
    console.error("Tabela:", err.table);
    console.error("Coluna:", err.column);
    console.error("Stack:", err.stack);
    console.error("=== FIM DO ERRO ===");

    const codigoErro = logErroSeguro("Erro ao registrar usuário", err);
    res.status(500).json({ error: "Erro no servidor", codigo: codigoErro });
  }
});

// =========================

// ROTAS DE E-MAIL

// =========================

const verificarLimiteSolicitacao = async (usuarioId, tipo) => {
  try {
    const result = await pool.query(
      `SELECT criado_em FROM email_conta
       WHERE usuario_id = $1 AND tipo = $2 AND usado = FALSE
       ORDER BY criado_em DESC LIMIT 1`,
      [usuarioId, tipo],
    );

    if (result.rows.length === 0) {
      return { permitido: true };
    }

    const ultimoToken = new Date(result.rows[0].criado_em);
    const agora = new Date();
    const diferenca = (agora - ultimoToken) / 1000 / 60; // em minutos

    if (diferenca < 10) {
      const tempoRestante = Math.ceil(10 - diferenca);
      return {
        permitido: false,
        mensagem: `Você pode solicitar um novo token em ${tempoRestante} minutos.`,
        tempoRestante,
      };
    }

    return { permitido: true };
  } catch (err) {
    logErroSeguro("Erro ao verificar limite de solicitação", err);
    return { permitido: true };
  }
};

const criarRegistroFalsoVerificacao = async (email) => {
  try {
    const codigoFalso = "00000";
    const expiracao = new Date(Date.now() + 10 * 60 * 1000);

    // Criar registro na tabela email_conta para rastrear tentativas
    const resultado = await pool.query(
      `INSERT INTO email_conta (usuario_id, tipo, token, expiracao, tentativas_restantes, usado)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING`,
      [-1, "verificacao_falsa_" + email, codigoFalso, expiracao, 5, false],
    );
  } catch (err) {
    logErroSeguro("Erro ao criar registro falso de verificação", err);
  }
};

// Funções de controle de tentativas para usuários específicos (substituídas pelas novas funções gerais)
const verificarBloqueioTentativas = async (usuarioId, tipo) => {
  try {
    // BUSCA O USUÁRIO PELO ID PARA OBTER O EMAIL
    const usuarioResult = await pool.query(
      "SELECT email FROM usuarios WHERE id = $1",
      [usuarioId],
    );
    if (usuarioResult.rows.length === 0) {
      return { bloqueado: false, tentativasRestantes: 5 }; // Usuário não encontrado
    }
    const email = usuarioResult.rows[0].email;
    return verificarBloqueioTentativasEmail(email, tipo);
  } catch (err) {
    logErroSeguro("Erro ao verificar bloqueio para usuário", err);
    return { bloqueado: false, tentativasRestantes: 5 };
  }
};

const registrarTentativaErrada = async (usuarioId, tipo) => {
  try {
    // BUSCA O USUÁRIO PELO ID PARA OBTER O EMAIL
    const usuarioResult = await pool.query(
      "SELECT email FROM usuarios WHERE id = $1",
      [usuarioId],
    );
    if (usuarioResult.rows.length === 0) {
      return; // Usuário não encontrado
    }
    const email = usuarioResult.rows[0].email;
    await registrarTentativaErradaEmail(email, tipo);
  } catch (err) {
    logErroSeguro("Erro ao registrar tentativa errada para usuário", err);
  }
};

app.post("/api/email/verificacao/solicitar", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email é obrigatório" });
  }

  try {
    // DB QUERY: Busca usuário
    const userResult = await pool.query(
      "SELECT id, nome, email FROM usuarios WHERE email = $1",
      [email],
    );

    if (userResult.rows.length === 0) {
      // Se o email não existe, cria um registro falso para controle de tentativas
      await criarRegistroFalsoVerificacao(email);
      return res.status(200).json({
        success: true,
        message: "Código de verificação enviado para o e-mail",
      });
    }

    const user = userResult.rows[0];

    const limiteSolicitacao = await verificarLimiteSolicitacao(
      user.id,
      "verificacao",
    );
    if (!limiteSolicitacao.permitido) {
      return res.status(429).json({
        error: limiteSolicitacao.mensagem,
        tempoRestante: limiteSolicitacao.tempoRestante,
        statusCode: "LIMIT_EXCEEDED",
      });
    }

    // Apenas retornamos sucesso sem enviar
    const codigo = gerarCodigoVerificacao();
    const token = gerarToken();
    const expiracao = new Date(Date.now() + 10 * 60 * 1000);

    // DB QUERY: Marca tokens anteriores como usados
    await pool.query(
      "UPDATE email_conta SET usado = TRUE WHERE usuario_id = $1 AND tipo = $2",
      [user.id, "verificacao"],
    );

    // DB QUERY: Cria novo token com campos de controle de tentativas
    await pool.query(
      "INSERT INTO email_conta (usuario_id, tipo, token, expiracao, tentativas_restantes) VALUES ($1, $2, $3, $4, $5)",
      [user.id, "verificacao", token, expiracao, 5],
    );

    // Não enviamos email se o usuário já existe - isso é uma medida de segurança
    // O usuário receberá um código "inválido" que nunca será aceito

    res.json({
      success: true,
      message: "Código de verificação enviado para o e-mail",
    });
  } catch (err) {
    const codigoErro = logErroSeguro("Erro ao solicitar verificação", err);
    res.status(500).json({ error: "Erro no servidor", codigo: codigoErro });
  }
});

// ROTA: Valida código de verificação (usado para recuperação de senha)
app.post("/api/email/verificacao/validar", async (req, res) => {
  const { email, codigo } = req.body;

  if (!email || !codigo) {
    return res.status(400).json({ error: "Email e código são obrigatórios" });
  }

  try {
    const pendente = await pool.query(
      "SELECT * FROM email_verificacao_pendente WHERE email = $1",
      [email],
    );

    if (pendente.rows.length > 0) {
      const registroPendente = pendente.rows[0];

      const verificacao = await verificarBloqueioTentativasEmail(
        email,
        "cadastro",
      );
      if (verificacao.bloqueado) {
        return res.status(429).json({
          error: verificacao.mensagem,
          statusCode: "BLOQUEADO",
          tempoRestante: verificacao.tempoRestante,
        });
      }

      // Valida expiração
      if (!validarToken(registroPendente.expiracao)) {
        return res.status(400).json({
          error: "Código expirado. Por favor, solicite um novo código.",
          expired: true,
        });
      }

      // Compara código diretamente
      if (registroPendente.codigo !== codigo) {
        await registrarTentativaErradaEmail(email, "cadastro");

        const verificacaoAtualizada = await verificarBloqueioTentativasEmail(
          email,
          "cadastro",
        );

        if (verificacaoAtualizada.bloqueado) {
          return res.status(429).json({
            error:
              "Muitas tentativas erradas. Você foi bloqueado por 10 minutos.",
            statusCode: "BLOQUEADO",
            tempoRestante: verificacaoAtualizada.tempoRestante,
          });
        }

        return res.status(400).json({
          error: `Código inválido. Tentativas restantes: ${verificacaoAtualizada.tentativasRestantes}`,
          tentativasRestantes: verificacaoAtualizada.tentativasRestantes,
        });
      }

      return res.json({
        success: true,
        message: "Código válido! Agora você pode confirmar seu cadastro.",
        type: "cadastro",
      });
    }

    // DB QUERY: Busca usuário (para recuperação de senha)
    const userResult = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email],
    );

    if (userResult.rows.length === 0) {
      // Email não existe - aplicar sistema de tentativas para emails inexistentes
      const verificacao = await verificarBloqueioTentativasEmail(
        email,
        "recuperacao",
      );
      if (verificacao.bloqueado) {
        return res.status(429).json({
          error: verificacao.mensagem,
          statusCode: "BLOQUEADO",
          tempoRestante: verificacao.tempoRestante,
        });
      }

      // Registrar tentativa errada
      await registrarTentativaErradaEmail(email, "recuperacao");

      const verificacaoAtualizada = await verificarBloqueioTentativasEmail(
        email,
        "recuperacao",
      );

      if (verificacaoAtualizada.bloqueado) {
        return res.status(429).json({
          error:
            "Muitas tentativas erradas. Você foi bloqueado por 10 minutos.",
          statusCode: "BLOQUEADO",
          tempoRestante: verificacaoAtualizada.tempoRestante,
        });
      }

      return res.status(400).json({
        error: `Código inválido. Tentativas restantes: ${verificacaoAtualizada.tentativasRestantes}`,
        tentativasRestantes: verificacaoAtualizada.tentativasRestantes,
      });
    }

    const user = userResult.rows[0];

    const verificacao = await verificarBloqueioTentativas(
      user.id,
      "verificacao",
    );
    if (verificacao.bloqueado) {
      return res.status(429).json({
        error: verificacao.mensagem,
        statusCode: "BLOQUEADO",
        tempoRestante: verificacao.tempoRestante,
      });
    }

    // DB QUERY: Busca token mais recente
    const tokenResult = await pool.query(
      "SELECT * FROM email_conta WHERE usuario_id = $1 AND tipo = $2 AND usado = FALSE ORDER BY criado_em DESC LIMIT 1",
      [user.id, "verificacao"],
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({
        error: "Nenhum código de verificação encontrado",
      });
    }

    const tokenData = tokenResult.rows[0];

    // Valida expiração
    if (!validarToken(tokenData.expiracao)) {
      return res.status(400).json({
        error: "Código expirado. Por favor, solicite um novo código.",
        expired: true,
      });
    }

    // Compara o código com o token
    if (tokenData.token !== codigo) {
      await registrarTentativaErrada(user.id, "verificacao");

      const verificacaoAtualizada = await verificarBloqueioTentativas(
        user.id,
        "verificacao",
      );

      if (verificacaoAtualizada.bloqueado) {
        return res.status(429).json({
          error:
            "Muitas tentativas erradas. Você foi bloqueado por 10 minutos.",
          statusCode: "BLOQUEADO",
          tempoRestante: verificacaoAtualizada.tempoRestante,
        });
      }

      return res.status(400).json({
        error: `Código inválido. Tentativas restantes: ${verificacaoAtualizada.tentativasRestantes}`,
        tentativasRestantes: verificacaoAtualizada.tentativasRestantes,
      });
    }

    // Marca token como usado
    await pool.query("UPDATE email_conta SET usado = TRUE WHERE id = $1", [
      tokenData.id,
    ]);

    res.json({
      success: true,
      message: "E-mail verificado com sucesso!",
      type: "recuperacao",
    });
  } catch (err) {
    const codigoErro = logErroSeguro("Erro ao validar código", err);
    res.status(500).json({ error: "Erro no servidor", codigo: codigoErro });
  }
});

// ROTA: Confirma cadastro após verificação do código (aceita termos e preferência de email comercial)
app.post("/api/email/verificacao/confirmar-cadastro", async (req, res) => {
  const {
    email,
    codigo,
    aceitouTermos,
    aceitouPrivacidade,
    aceita_emails_comerciais,
  } = req.body;

  if (!email || !codigo) {
    return res.status(400).json({ error: "Email e código são obrigatórios" });
  }

  if (!aceitouTermos || !aceitouPrivacidade) {
    return res.status(400).json({
      error:
        "É necessário aceitar os termos de uso e a política de privacidade",
    });
  }

  try {
    const emailLimpo = sanitizarString(email.toLowerCase(), 255);

    const pendente = await pool.query(
      "SELECT * FROM email_verificacao_pendente WHERE email = $1 AND verificado = FALSE",
      [emailLimpo],
    );

    if (pendente.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Nenhum cadastro pendente para este email" });
    }

    const registro = pendente.rows[0];

    if (!validarToken(registro.expiracao)) {
      return res.status(400).json({
        error: "Código expirado. Solicite um novo cadastro.",
        expired: true,
      });
    }

    if (registro.codigo !== codigo) {
      return res.status(400).json({ error: "Código inválido" });
    }

    // Verifica se email já existe
    const emailExiste = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [emailLimpo],
    );
    if (emailExiste.rows.length > 0) {
      // Marca como verificado e retorna sucesso (idempotente)
      await pool.query(
        "UPDATE email_verificacao_pendente SET verificado = TRUE WHERE email = $1",
        [emailLimpo],
      );
      return res.json({
        success: true,
        message: "Cadastro confirmado com sucesso!",
      });
    }

    const aceitaEmailsComerciais = aceita_emails_comerciais === true;

    // Insere usuário definitivamente
    await pool.query(
      "INSERT INTO usuarios (nome, email, senha, tipo_usuario, aceita_emails_comerciais) VALUES ($1, $2, $3, $4, $5)",
      [
        registro.nome,
        emailLimpo,
        registro.senha,
        "user",
        aceitaEmailsComerciais,
      ],
    );

    // Marca pendente como verificado
    await pool.query(
      "UPDATE email_verificacao_pendente SET verificado = TRUE WHERE email = $1",
      [emailLimpo],
    );

    // Envia email de boas-vindas (categoria Conta — sempre enviado)
    enviarEmail(
      "verificarCadastro",
      emailLimpo,
      "Cadastro Confirmado - Nolare",
      {
        nome: registro.nome,
        codigo: "",
      },
    ).catch((err) => logErroSeguro("Erro ao enviar email de boas-vindas", err));

    res.json({ success: true, message: "Cadastro confirmado com sucesso!" });
  } catch (err) {
    const codigoErro = logErroSeguro("Erro ao confirmar cadastro", err);
    res.status(500).json({ error: "Erro no servidor", codigo: codigoErro });
  }
});

app.post("/api/email/recuperacao/solicitar", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email é obrigatório" });
  }

  // VALIDAÇÃO: Formato de email
  if (!validarEmail(email)) {
    return res.status(400).json({ error: "Formato de email inválido" });
  }

  try {
    const emailLimpo = sanitizarString(email.toLowerCase(), 255);

    // DB QUERY: Busca usuário
    const userResult = await pool.query(
      "SELECT id, nome, email FROM usuarios WHERE email = $1",
      [emailLimpo],
    );

    // Criar registro pendente com código inválido para bloquear qualquer tentativa
    const emailExiste = userResult.rows.length > 0;

    if (!emailExiste) {
      // Email não existe - criar registro falso para simular fluxo
      await criarRegistroFalsoVerificacao(emailLimpo);

      // SEGURANÇA: Resposta uniforme para prevenir enumeração de usuários
      res.json({
        success: true,
        message:
          "Se o email estiver cadastrado, você receberá um código de recuperação em breve.",
      });
      return;
    }

    const user = userResult.rows[0];

    const limiteSolicitacao = await verificarLimiteSolicitacao(
      user.id,
      "recuperacao",
    );
    if (!limiteSolicitacao.permitido) {
      return res.status(429).json({
        error: limiteSolicitacao.mensagem,
        tempoRestante: limiteSolicitacao.tempoRestante,
        statusCode: "LIMIT_EXCEEDED",
      });
    }

    const codigo = gerarCodigoVerificacao();
    const expiracao = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // DB QUERY: Marca tokens anteriores como usados
    await pool.query(
      "UPDATE email_conta SET usado = TRUE WHERE usuario_id = $1 AND tipo = $2",
      [user.id, "recuperacao"],
    );

    // DB QUERY: Cria novo token com o código de 5 dígitos
    await pool.query(
      "INSERT INTO email_conta (usuario_id, tipo, token, expiracao, tentativas_restantes) VALUES ($1, $2, $3, $4, $5)",
      [user.id, "recuperacao", codigo, expiracao, 5],
    );

    // Envia e-mail
    await enviarEmail(
      "recuperarSenha",
      user.email,
      "Recuperação de Senha - Nolare",
      {
        nome: user.nome,
        codigo: codigo,
      },
    );

    // SEGURANÇA: Resposta uniforme para prevenir enumeração de usuários
    res.json({
      success: true,
      message:
        "Se o email estiver cadastrado, você receberá um código de recuperação em breve.",
    });
  } catch (err) {
    const codigoErro = logErroSeguro("Erro ao solicitar recuperação", err);
    res.status(500).json({ error: "Erro no servidor", codigo: codigoErro });
  }
});

app.post("/api/email/recuperacao/validar", async (req, res) => {
  const { email, codigo } = req.body;

  if (!email || !codigo) {
    return res.status(400).json({ error: "Email e código são obrigatórios" });
  }

  try {
    // DB QUERY: Busca usuário
    const userResult = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email],
    );

    if (userResult.rows.length === 0) {
      // Email não existe - aplicar sistema de tentativas para emails inexistentes
      const verificacao = await verificarBloqueioTentativasEmail(
        email,
        "recuperacao",
      );
      if (verificacao.bloqueado) {
        return res.status(429).json({
          error: verificacao.mensagem,
          statusCode: "BLOQUEADO",
          tempoRestante: verificacao.tempoRestante,
        });
      }

      // Registrar tentativa errada
      await registrarTentativaErradaEmail(email, "recuperacao");

      const verificacaoAtualizada = await verificarBloqueioTentativasEmail(
        email,
        "recuperacao",
      );

      if (verificacaoAtualizada.bloqueado) {
        return res.status(429).json({
          error:
            "Muitas tentativas erradas. Você foi bloqueado por 10 minutos.",
          statusCode: "BLOQUEADO",
          tempoRestante: verificacaoAtualizada.tempoRestante,
        });
      }

      return res.status(400).json({
        error: `Código inválido. Tentativas restantes: ${verificacaoAtualizada.tentativasRestantes}`,
        tentativasRestantes: verificacaoAtualizada.tentativasRestantes,
      });
    }

    const user = userResult.rows[0];

    const verificacao = await verificarBloqueioTentativas(
      user.id,
      "recuperacao",
    );
    if (verificacao.bloqueado) {
      return res.status(429).json({
        error: verificacao.mensagem,
        statusCode: "BLOQUEADO",
        tempoRestante: verificacao.tempoRestante,
      });
    }

    // DB QUERY: Busca token mais recente
    const tokenResult = await pool.query(
      "SELECT * FROM email_conta WHERE usuario_id = $1 AND tipo = $2 AND usado = FALSE ORDER BY criado_em DESC LIMIT 1",
      [user.id, "recuperacao"],
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({
        error: "Nenhum código de recuperação encontrado",
      });
    }

    const tokenData = tokenResult.rows[0];

    // Valida expiração
    if (!validarToken(tokenData.expiracao)) {
      return res.status(400).json({
        error: "Código expirado. Por favor, solicite um novo código.",
        expired: true,
      });
    }

    const codigoValido = tokenData.token === codigo;

    if (!codigoValido) {
      await registrarTentativaErrada(user.id, "recuperacao");

      const verificacaoAtualizada = await verificarBloqueioTentativas(
        user.id,
        "recuperacao",
      );

      if (verificacaoAtualizada.bloqueado) {
        return res.status(429).json({
          error:
            "Muitas tentativas erradas. Você foi bloqueado por 10 minutos.",
          statusCode: "BLOQUEADO",
          tempoRestante: verificacaoAtualizada.tempoRestante,
        });
      }

      return res.status(400).json({
        error: `Código inválido. Tentativas restantes: ${verificacaoAtualizada.tentativasRestantes}`,
        tentativasRestantes: verificacaoAtualizada.tentativasRestantes,
      });
    }

    // Apenas retorna o token para o frontend continuar
    res.json({
      success: true,
      token: tokenData.id,
      message: "Código válido!",
    });
  } catch (err) {
    console.error("Erro ao validar código:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

app.post("/api/email/recuperacao/redefinir", async (req, res) => {
  const { email, novaSenha } = req.body;
  const token = req.headers.authorization?.split(" ")[1]; // Pega o token do header Authorization

  if (!email || !token || !novaSenha) {
    return res.status(400).json({
      error: "Todos os campos são obrigatórios (email, token e novaSenha)",
    });
  }

  // VALIDAÇÃO: Formato de email
  if (!validarEmail(email)) {
    return res.status(400).json({ error: "Formato de email inválido" });
  }

  // VALIDAÇÃO: Força da nova senha
  const validacaoSenha = validarForcaSenha(novaSenha);
  if (!validacaoSenha.valido) {
    return res.status(400).json({ error: validacaoSenha.mensagem });
  }

  try {
    const emailLimpo = sanitizarString(email.toLowerCase(), 255);

    // DB QUERY: Busca usuário
    const userResult = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [emailLimpo],
    );

    if (userResult.rows.length === 0) {
      // SEGURANÇA: Resposta genérica para não revelar se email existe
      return res.status(400).json({ error: "Token inválido ou expirado" });
    }

    const user = userResult.rows[0];

    const tokenResult = await pool.query(
      "SELECT * FROM email_conta WHERE id = $1 AND usuario_id = $2 AND tipo = $3 AND usado = FALSE",
      [token, user.id, "recuperacao"],
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: "Token inválido ou expirado" });
    }

    const tokenData = tokenResult.rows[0];

    // Valida expiração
    if (!validarToken(tokenData.expiracao)) {
      return res.status(400).json({ error: "Token expirado" });
    }

    // Hash da nova senha com 12 rounds
    const senhaHash = await bcrypt.hash(novaSenha, 12);

    // Atualiza senha
    await pool.query("UPDATE usuarios SET senha = $1 WHERE id = $2", [
      senhaHash,
      user.id,
    ]);

    // Marca token como usado
    await pool.query("UPDATE email_conta SET usado = TRUE WHERE id = $1", [
      tokenData.id,
    ]);

    // SEGURANÇA: Invalida todas as sessões anteriores do usuário
    await pool.query(
      "UPDATE usuario_sessoes SET ativo = FALSE WHERE usuario_id = $1",
      [user.id],
    );

    res.json({
      success: true,
      message: "Senha redefinida com sucesso!",
    });
  } catch (err) {
    const codigoErro = logErroSeguro("Erro ao redefinir senha", err);
    res
      .status(500)
      .json({ error: "Erro ao redefinir senha", codigo: codigoErro });
  }
});

// =========================

// ROTAS DE SESSÕES (Dashboard)

// =========================

// ROTA: Conta usuários ativos (PROTEGIDA — apenas admins) (1.6)
app.get(
  "/api/sessoes/ativos",
  verificarTokenJWT,
  verificarAdmin,
  async (req, res) => {
    try {
      // DB QUERY: Conta sessões ativas únicas
      const result = await pool.query(
        "SELECT COUNT(DISTINCT usuario_id) as count FROM usuario_sessoes WHERE ativo = TRUE",
      );
      res.json({ count: Number.parseInt(result.rows[0].count) });
    } catch (err) {
      console.error("Erro ao buscar usuários ativos:", err);
      res.status(500).json({ error: "Erro ao buscar usuários ativos" });
    }
  },
);

// ROTA: Pico de usuários em uma data específica (PROTEGIDA — apenas admins) (1.6 + 1.14)
app.get(
  "/api/sessoes/pico/:data",
  verificarTokenJWT,
  verificarAdmin,
  async (req, res) => {
    const { data } = req.params;

    // VALIDAÇÃO: Formato de data YYYY-MM-DD (1.14)
    const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dataRegex.test(data) || isNaN(Date.parse(data))) {
      return res
        .status(400)
        .json({ error: "Formato de data inválido. Use YYYY-MM-DD" });
    }

    try {
      // DB QUERY: Calcula pico de usuários simultâneos em uma data
      const result = await pool.query(
        `WITH sessoes_dia AS (
        SELECT
          usuario_id,
          data_login,
          COALESCE(data_logout, CURRENT_TIMESTAMP) as data_logout
        FROM usuario_sessoes
        WHERE DATE(data_login) = $1 OR DATE(data_logout) = $1
      ),
      intervalos AS (
        SELECT data_login as momento FROM sessoes_dia
        UNION
        SELECT data_logout as momento FROM sessoes_dia
      ),
      contagem AS (
        SELECT
          i.momento,
          COUNT(DISTINCT s.usuario_id) as usuarios_ativos
        FROM intervalos i
        LEFT JOIN sessoes_dia s ON i.momento >= s.data_login AND i.momento <= s.data_logout
        WHERE DATE(i.momento) = $1
        GROUP BY i.momento
      )
      SELECT COALESCE(MAX(usuarios_ativos), 0) as pico
      FROM contagem`,
        [data],
      );

      res.json({ pico: Number.parseInt(result.rows[0].pico) });
    } catch (err) {
      console.error("Erro ao buscar pico de usuários:", err);
      res.status(500).json({ error: "Erro ao buscar pico de usuários" });
    }
  },
);

// =========================
// ROTAS DE ESTATÍSTICAS (Dashboard)
// =========================

// ROTA: Estatísticas de usuários (PROTEGIDA — apenas admins) (1.7)
app.get(
  "/api/estatisticas/usuarios",
  verificarTokenJWT,
  verificarAdmin,
  async (req, res) => {
    try {
      // DB QUERY: Total de usuários
      const totalResult = await pool.query(
        "SELECT COUNT(*) as total FROM usuarios",
      );

      // DB QUERY: Usuários por tipo
      const tiposResult = await pool.query(
        "SELECT tipo_usuario, COUNT(*) as count FROM usuarios GROUP BY tipo_usuario",
      );

      // DB QUERY: Data do últimocadastro
      const ultimoResult = await pool.query(
        "SELECT data_criacao FROM usuarios ORDER BY data_criacao DESC LIMIT 1",
      );

      const tipos = {};
      tiposResult.rows.forEach((row) => {
        tipos[row.tipo_usuario] = Number.parseInt(row.count);
      });

      res.json({
        total: Number.parseInt(totalResult.rows[0].total),
        tipos: tipos,
        ultimo_cadastro: ultimoResult.rows[0]?.data_criacao || null,
      });
    } catch (err) {
      console.error("Erro ao buscar estatísticas de usuários:", err);
      res.status(500).json({ error: "Erro ao buscar estatísticas" });
    }
  },
);

// ROTA: Estatísticas de imóveis (PROTEGIDA — apenas admins) (1.7)
app.get(
  "/api/estatisticas/imoveis",
  verificarTokenJWT,
  verificarAdmin,
  async (req, res) => {
    try {
      // DB QUERY: Total de imóveis visíveis
      const totalResult = await pool.query(
        "SELECT COUNT(*) as total FROM imoveis WHERE visivel = TRUE",
      );

      // DB QUERY: Preço médio dos imóveis
      const mediaPrecoResult = await pool.query(
        "SELECT AVG(preco) as media FROM imoveis WHERE visivel = TRUE",
      );

      // DB QUERY: Data do último cadastro
      const ultimoResult = await pool.query(
        "SELECT data_criacao FROM imoveis WHERE visivel = TRUE ORDER BY data_criacao DESC LIMIT 1",
      );

      // DB QUERY: Total de imóveis em destaque
      const destaqueResult = await pool.query(
        "SELECT COUNT(*) as count FROM imoveis WHERE destaque = TRUE AND visivel = TRUE",
      );

      // DB QUERY: Imóveis por status
      const statusResult = await pool.query(
        "SELECT status, COUNT(*) as count FROM imoveis WHERE visivel = TRUE GROUP BY status",
      );

      // DB QUERY: Imóveis por finalidade
      const finalidadeResult = await pool.query(
        "SELECT finalidade, COUNT(*) as count FROM imoveis WHERE visivel = TRUE GROUP BY finalidade",
      );

      // DB QUERY: Imóveis por tipo
      const tipoResult = await pool.query(
        "SELECT tipo, COUNT(*) as count FROM imoveis WHERE visivel = TRUE GROUP BY tipo",
      );

      // DB QUERY: Imóveis por construtora
      const construtoraResult = await pool.query(
        `SELECT ic.construtora, COUNT(*) as count
       FROM imoveis_caracteristicas ic
       JOIN imoveis i ON i.id = ic.imovel_id
       WHERE i.visivel = TRUE AND ic.construtora IS NOT NULL
       GROUP BY ic.construtora`,
      );

      const status = {};
      statusResult.rows.forEach((row) => {
        if (row.status) status[row.status] = Number.parseInt(row.count);
      });

      const finalidade = {};
      finalidadeResult.rows.forEach((row) => {
        if (row.finalidade)
          finalidade[row.finalidade] = Number.parseInt(row.count);
      });

      const tipo = {};
      tipoResult.rows.forEach((row) => {
        if (row.tipo) tipo[row.tipo] = Number.parseInt(row.count);
      });

      const construtora = {};
      construtoraResult.rows.forEach((row) => {
        construtora[row.construtora] = Number.parseInt(row.count);
      });

      res.json({
        total: Number.parseInt(totalResult.rows[0].total),
        media_preco: Number.parseFloat(mediaPrecoResult.rows[0].media) || 0,
        ultimo_cadastro: ultimoResult.rows[0]?.data_criacao || null,
        destaque: Number.parseInt(destaqueResult.rows[0].count),
        status: status,
        finalidade: finalidade,
        tipo: tipo,
        construtora: construtora,
      });
    } catch (err) {
      console.error("Erro ao buscar estatísticas de imóveis:", err);
      res.status(500).json({ error: "Erro ao buscar estatísticas" });
    }
  },
);

// ROTA: Busca o imóvel mais curtido (PROTEGIDA — apenas admins) (1.7)
app.get(
  "/api/estatisticas/imovel-mais-curtido",
  verificarTokenJWT,
  verificarAdmin,
  async (req, res) => {
    try {
      // DB QUERY: Busca o imóvel com mais curtidas
      const result = await pool.query(
        `SELECT 
        c.imovel_id, 
        i.titulo, 
        COUNT(c.id) as total_curtidas
       FROM curtidas c
       JOIN imoveis i ON i.id = c.imovel_id
       WHERE i.visivel = TRUE
       GROUP BY c.imovel_id, i.titulo
       ORDER BY total_curtidas DESC
       LIMIT 1`,
      );

      if (result.rows.length > 0) {
        res.json({
          imovel_id: result.rows[0].imovel_id,
          titulo: result.rows[0].titulo,
          total_curtidas: Number.parseInt(result.rows[0].total_curtidas),
        });
      } else {
        res.json({
          imovel_id: null,
          titulo: null,
          total_curtidas: 0,
        });
      }
    } catch (err) {
      console.error("Erro ao buscar imóvel mais curtido:", err);
      res.status(500).json({ error: "Erro ao buscar imóvel mais curtido" });
    }
  },
);

// =========================
// ROTAS DE CURTIDAS
// =========================

// ROTA: Busca todas as curtidas de um usuário específico (com paginação opcional)
app.get("/api/curtidas/:usuarioId", verificarTokenJWT, async (req, res) => {
  const { usuarioId } = req.params;

  // VALIDAÇÃO: Campo obrigatório e numérico
  if (!usuarioId || !validarIdNumerico(usuarioId)) {
    return res.status(400).json({ error: "usuarioId inválido" });
  }

  // SEGURANÇA: Usuário comum só pode ver as próprias curtidas; admin pode ver qualquer uma
  if (
    req.user.tipoUsuario !== "adm" &&
    String(req.user.userId) !== String(usuarioId)
  ) {
    return res.status(403).json({ error: "Acesso negado" });
  }

  try {
    // PAGINAÇÃO: Parâmetros opcionais via query string (?page=1&limit=20)
    const pagina = req.query.page
      ? Math.max(1, Number.parseInt(req.query.page, 10))
      : null;
    const limite = req.query.limit
      ? Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10)))
      : null;

    // DB QUERY: Conta total de curtidas do usuário
    const totalResult = await pool.query(
      `SELECT COUNT(*) as total FROM curtidas c
       LEFT JOIN imoveis i ON i.id = c.imovel_id
       WHERE c.usuario_id = $1 AND i.visivel = true`,
      [usuarioId],
    );
    const total = Number.parseInt(totalResult.rows[0].total, 10);

    // SEGURANÇA: Usa parâmetros posicionais para paginação em vez de interpolação (1.12)
    // DB QUERY: Busca todas as curtidas do usuário (apenas imóveis visíveis)
    let result;
    if (pagina && limite) {
      result = await pool.query(
        `SELECT c.*, i.titulo, i.preco, i.preco_destaque, i.cidade, i.bairro
         FROM curtidas c
         LEFT JOIN imoveis i ON i.id = c.imovel_id
         WHERE c.usuario_id = $1 AND i.visivel = true
         ORDER BY c.data_curtida DESC
         LIMIT $2 OFFSET $3`,
        [usuarioId, limite, (pagina - 1) * limite],
      );
    } else {
      result = await pool.query(
        `SELECT c.*, i.titulo, i.preco, i.preco_destaque, i.cidade, i.bairro
         FROM curtidas c
         LEFT JOIN imoveis i ON i.id = c.imovel_id
         WHERE c.usuario_id = $1 AND i.visivel = true
         ORDER BY c.data_curtida DESC`,
        [usuarioId],
      );
    }

    // Retorna dados com metadados de paginação quando paginação é usada
    if (pagina && limite) {
      res.json({
        dados: result.rows,
        paginacao: {
          total,
          pagina,
          limite,
          totalPaginas: Math.ceil(total / limite),
        },
      });
    } else {
      res.json(result.rows);
    }
  } catch (err) {
    const codigoErro = logErroSeguro("Erro ao buscar curtidas", err);
    res
      .status(500)
      .json({ error: "Erro ao buscar curtidas", codigo: codigoErro });
  }
});

// ROTA: Toggle curtida — protegida por JWT (1.5) com validação numérica (1.13)
app.post(
  "/api/curtidas/:usuarioId/:imovelId",
  verificarTokenJWT,
  async (req, res) => {
    const { usuarioId, imovelId } = req.params;

    // VALIDAÇÃO: IDs numéricos (1.13)
    if (!validarIdNumerico(usuarioId) || !validarIdNumerico(imovelId)) {
      return res.status(400).json({ error: "IDs inválidos" });
    }

    // SEGURANÇA: Garante que o usuário logado só pode curtir em seu próprio nome (1.5)
    if (String(req.user.userId) !== String(usuarioId)) {
      return res.status(403).json({ error: "Ação não permitida" });
    }

    try {
      // DB QUERY: Verifica se curtida já existe
      const curtidaExiste = await pool.query(
        "SELECT * FROM curtidas WHERE usuario_id = $1 AND imovel_id = $2",
        [usuarioId, imovelId],
      );

      if (curtidaExiste.rows.length > 0) {
        // Remove curtida
        await pool.query(
          "DELETE FROM curtidas WHERE usuario_id = $1 AND imovel_id = $2",
          [usuarioId, imovelId],
        );
        res.json({ message: "Curtida removida com sucesso", curtido: false });
      } else {
        // Adiciona curtida
        await pool.query(
          "INSERT INTO curtidas (usuario_id, imovel_id, data_curtida) VALUES ($1, $2, NOW())",
          [usuarioId, imovelId],
        );
        res.json({ message: "Curtida adicionada com sucesso", curtido: true });
      }
    } catch (err) {
      const codigoErro = logErroSeguro("Erro ao alternar curtida", err);
      res
        .status(500)
        .json({ error: "Erro ao alternar curtida", codigo: codigoErro });
    }
  },
);

// =========================

// ROTAS DE IMÓVEIS

// =========================

app.get(
  "/api/imoveis/ocultos",
  verificarTokenJWT,
  verificarAdmin,
  async (req, res) => {
    try {
      // PAGINAÇÃO: Parâmetros opcionais via query string (?page=1&limit=50)
      const pagina = req.query.page
        ? Math.max(1, Number.parseInt(req.query.page, 10))
        : null;
      const limite = req.query.limit
        ? Math.min(200, Math.max(1, Number.parseInt(req.query.limit, 10)))
        : null;

      // DB QUERY: Conta total de imóveis ocultos
      const totalResult = await pool.query(
        "SELECT COUNT(*) as total FROM imoveis WHERE visivel = false",
      );
      const total = Number.parseInt(totalResult.rows[0].total, 10);

      // SEGURANÇA: Prepara parâmetros posicionais para paginação (1.12)
      const queryParams =
        pagina && limite ? [limite, (pagina - 1) * limite] : [];

      // DB QUERY: Busca imóveis ocultos com características e fotos
      const result = await pool.query(
        `SELECT
        i.id AS imovel_id,
        i.titulo,
        i.descricao,
        i.preco,
        i.preco_destaque,
        i.destaque,
        i.status,
        i.finalidade,
        i.cep,
        i.area_total,
        i.area_construida,
        i.visivel,
        i.criado_por,
        i.estado,
        i.cidade,
        i.bairro,
        i.tipo,
        i.data_criacao,
        i.coordenadas,

        json_build_object(
          'id', ic.id,
          'condominio', ic.condominio,
          'iptu', ic.iptu,
          'quarto', ic.quarto,
          'suite', ic.suite,
          'banheiro', ic.banheiro,
          'vaga', ic.vaga,
          'andar', ic.andar,
          'andar_total', ic.andar_total,
          'mobiliado', ic.mobiliado,
          'piscina', ic.piscina,
          'churrasqueira', ic.churrasqueira,
          'salao_de_festa', ic.salao_de_festa,
          'academia', ic.academia,
          'playground', ic.playground,
          'jardim', ic.jardim,
          'varanda', ic.varanda,
          'interfone', ic.interfone,
          'acessibilidade_pcd', ic.acessibilidade_pcd,
          'ar_condicionado', ic.ar_condicionado,
          'energia_solar', ic.energia_solar,
          'quadra', ic.quadra,
          'lavanderia', ic.lavanderia,
          'closet', ic.closet,
          'escritorio', ic.escritorio,
          'lareira', ic.lareira,
          'alarme', ic.alarme,
          'camera_vigilancia', ic.camera_vigilancia,
          'bicicletario', ic.bicicletario,
          'sala_jogos', ic.sala_jogos,
          'brinquedoteca', ic.brinquedoteca,
          'elevador', ic.elevador,
          'pomar', ic.pomar,
          'lago', ic.lago,
          'aceita_animais', ic.aceita_animais,
          'na_planta', ic.na_planta,
          'portaria_24h', ic.portaria_24h,
          'carregador_carro_eletrico', ic.carregador_carro_eletrico,
          'gerador_energia', ic.gerador_energia,
          'estudio', ic.estudio,
          'construtora', ic.construtora,
          'lancamento', ic.lancamento,
          'data_entrega', ic.data_entrega
        ) AS caracteristicas,

        COALESCE(
          (SELECT json_agg(f ORDER BY f.id) 
           FROM fotos_imoveis f 
           WHERE f.imovel_id = i.id), 
          '[]'
        ) AS fotos
      FROM imoveis i
      LEFT JOIN imoveis_caracteristicas ic ON ic.imovel_id = i.id
      WHERE i.visivel = false
      GROUP BY i.id, ic.id
      ORDER BY i.data_criacao DESC
      ${queryParams.length ? "LIMIT $1 OFFSET $2" : ""}`,
        queryParams,
      );

      // Retorna dados com metadados de paginação quando paginação é usada
      if (pagina && limite) {
        res.json({
          dados: result.rows,
          paginacao: {
            total,
            pagina,
            limite,
            totalPaginas: Math.ceil(total / limite),
          },
        });
      } else {
        res.json(result.rows);
      }
    } catch (err) {
      const codigoErro = logErroSeguro("Erro ao buscar imóveis ocultos", err);
      res
        .status(500)
        .json({ error: "Erro ao buscar imóveis ocultos", codigo: codigoErro });
    }
  },
);

// ROTA: Busca todos os imóveis visíveis (com paginação opcional)
app.get("/api/imoveis", async (req, res) => {
  try {
    // PAGINAÇÃO: Parâmetros opcionais via query string (?page=1&limit=50)
    // Se não fornecidos, retorna todos os imóveis (comportamento padrão mantido)
    const pagina = req.query.page
      ? Math.max(1, Number.parseInt(req.query.page, 10))
      : null;
    const limite = req.query.limit
      ? Math.min(200, Math.max(1, Number.parseInt(req.query.limit, 10)))
      : null;

    // DB QUERY: Conta total de imóveis visíveis (para metadados de paginação)
    const totalResult = await pool.query(
      "SELECT COUNT(*) as total FROM imoveis WHERE visivel = true",
    );
    const total = Number.parseInt(totalResult.rows[0].total, 10);

    // SEGURANÇA: Prepara parâmetros posicionais para paginação (1.12)
    const queryParams = pagina && limite ? [limite, (pagina - 1) * limite] : [];

    // DB QUERY: Busca imóveis com características e fotos
    const result = await pool.query(
      `SELECT
        i.id AS imovel_id,
        i.titulo,
        i.descricao,
        i.preco,
        i.preco_destaque,
        i.destaque,
        i.status,
        i.finalidade,
        i.cep,
        i.area_total,
        i.area_construida,
        i.visivel,
        i.criado_por,
        i.estado,
        i.cidade,
        i.bairro,
        i.tipo,
        i.data_criacao,
        i.coordenadas,

        json_build_object(
          'id', ic.id,
          'condominio', ic.condominio,
          'iptu', ic.iptu,
          'quarto', ic.quarto,
          'suite', ic.suite,
          'banheiro', ic.banheiro,
          'vaga', ic.vaga,
          'andar', ic.andar,
          'andar_total', ic.andar_total,
          'mobiliado', ic.mobiliado,
          'piscina', ic.piscina,
          'churrasqueira', ic.churrasqueira,
          'salao_de_festa', ic.salao_de_festa,
          'academia', ic.academia,
          'playground', ic.playground,
          'jardim', ic.jardim,
          'varanda', ic.varanda,
          'interfone', ic.interfone,
          'acessibilidade_pcd', ic.acessibilidade_pcd,
          'ar_condicionado', ic.ar_condicionado,
          'energia_solar', ic.energia_solar,
          'quadra', ic.quadra,
          'lavanderia', ic.lavanderia,
          'closet', ic.closet,
          'escritorio', ic.escritorio,
          'lareira', ic.lareira,
          'alarme', ic.alarme,
          'camera_vigilancia', ic.camera_vigilancia,
          'bicicletario', ic.bicicletario,
          'sala_jogos', ic.sala_jogos,
          'brinquedoteca', ic.brinquedoteca,
          'elevador', ic.elevador,
          'pomar', ic.pomar,
          'lago', ic.lago,
          'aceita_animais', ic.aceita_animais,
          'na_planta', ic.na_planta,
          'portaria_24h', ic.portaria_24h,
          'carregador_carro_eletrico', ic.carregador_carro_eletrico,
          'gerador_energia', ic.gerador_energia,
          'estudio', ic.estudio,
          'construtora', ic.construtora,
          'lancamento', ic.lancamento,
          'data_entrega', ic.data_entrega
        ) AS caracteristicas,

        COALESCE(
          (SELECT json_agg(f ORDER BY f.id) 
           FROM fotos_imoveis f 
           WHERE f.imovel_id = i.id), 
          '[]'
        ) AS fotos
      FROM imoveis i
      LEFT JOIN imoveis_caracteristicas ic ON ic.imovel_id = i.id
      WHERE i.visivel = true
      GROUP BY i.id, ic.id
      ORDER BY i.data_criacao DESC
      ${queryParams.length ? "LIMIT $1 OFFSET $2" : ""}`,
      queryParams,
    );

    // Retorna dados com metadados de paginação quando paginação é usada
    if (pagina && limite) {
      res.json({
        dados: result.rows,
        paginacao: {
          total,
          pagina,
          limite,
          totalPaginas: Math.ceil(total / limite),
        },
      });
    } else {
      // Mantém compatibilidade: retorna array simples quando sem paginação
      res.json(result.rows);
    }
  } catch (err) {
    const codigoErro = logErroSeguro("Erro ao buscar imóveis", err);
    res
      .status(500)
      .json({ error: "Erro ao buscar imóveis", codigo: codigoErro });
  }
});

// ROTA: Busca um imóvel específico por ID
app.get("/api/imoveis/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // DB QUERY: Busca imóvel específico com características e fotos
    const result = await pool.query(
      `SELECT
        i.id AS imovel_id,
        i.titulo,
        i.descricao,
        i.preco,
        i.preco_destaque,
        i.destaque,
        i.status,
        i.finalidade,
        i.cep,
        i.area_total,
        i.area_construida,
        i.visivel,
        i.criado_por,
        i.estado,
        i.cidade,
        i.bairro,
        i.tipo,
        i.data_criacao,
        i.coordenadas,

        json_build_object(
          'id', ic.id,
          'condominio', ic.condominio,
          'iptu', ic.iptu,
          'quarto', ic.quarto,
          'suite', ic.suite,
          'banheiro', ic.banheiro,
          'vaga', ic.vaga,
          'andar', ic.andar,
          'andar_total', ic.andar_total,
          'mobiliado', ic.mobiliado,
          'piscina', ic.piscina,
          'churrasqueira', ic.churrasqueira,
          'salao_de_festa', ic.salao_de_festa,
          'academia', ic.academia,
          'playground', ic.playground,
          'jardim', ic.jardim,
          'varanda', ic.varanda,
          'interfone', ic.interfone,
          'acessibilidade_pcd', ic.acessibilidade_pcd,
          'ar_condicionado', ic.ar_condicionado,
          'energia_solar', ic.energia_solar,
          'quadra', ic.quadra,
          'lavanderia', ic.lavanderia,
          'closet', ic.closet,
          'escritorio', ic.escritorio,
          'lareira', ic.lareira,
          'alarme', ic.alarme,
          'camera_vigilancia', ic.camera_vigilancia,
          'bicicletario', ic.bicicletario,
          'sala_jogos', ic.sala_jogos,
          'brinquedoteca', ic.brinquedoteca,
          'elevador', ic.elevador,
          'pomar', ic.pomar,
          'lago', ic.lago,
          'aceita_animais', ic.aceita_animais,
          'na_planta', ic.na_planta,
          'portaria_24h', ic.portaria_24h,
          'carregador_carro_eletrico', ic.carregador_carro_eletrico,
          'gerador_energia', ic.gerador_energia,
          'estudio', ic.estudio,
          'construtora', ic.construtora,
          'lancamento', ic.lancamento,
          'data_entrega', ic.data_entrega
        ) AS caracteristicas,

        COALESCE(
          (SELECT json_agg(f ORDER BY f.id) 
           FROM fotos_imoveis f 
           WHERE f.imovel_id = i.id), 
          '[]'
        ) AS fotos
      FROM imoveis i
      LEFT JOIN imoveis_caracteristicas ic ON ic.imovel_id = i.id
      WHERE i.id = $1
      GROUP BY i.id, ic.id`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Imóvel não encontrado" });
    }

    const imovel = result.rows[0];

    if (!imovel.visivel) {
      // Check if user is authenticated and is admin
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(403).json({ error: "Imóvel não disponível" });
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userResult = await pool.query(
          "SELECT tipo_usuario FROM usuarios WHERE id = $1", // Assuming 'tipo_usuario' is 'adm' for admins
          [decoded.userId],
        );

        if (
          userResult.rows.length === 0 ||
          userResult.rows[0].tipo_usuario !== "adm"
        ) {
          return res.status(403).json({ error: "Imóvel não disponível" });
        }
      } catch (error) {
        // SEGURANÇA: Não expõe detalhes do erro JWT (1.9)
        logErroSeguro("Erro ao verificar JWT (imovel oculto)", error);
        return res.status(403).json({ error: "Imóvel não disponível" });
      }
    }

    res.json(imovel);
  } catch (error) {
    // SEGURANÇA: Usa log seguro para não expor stack trace (1.9)
    const codigoErro = logErroSeguro("Erro ao buscar imóvel", error);
    res
      .status(500)
      .json({ error: "Erro ao buscar imóvel", codigo: codigoErro });
  }
});

// ROTA: Cria novo imóvel (PROTEGIDA - APENAS ADMINS)
app.post(
  "/api/imoveis",
  verificarTokenJWT,
  verificarAdmin,
  async (req, res) => {
    const {
      titulo,
      descricao,
      preco,
      preco_destaque,
      destaque,
      status,
      finalidade,
      cep,
      area_total,
      area_construida,
      visivel,
      estado,
      cidade,
      bairro,
      tipo,
      coordenadas,
    } = req.body;

    // SEGURANÇA: criado_por extraído do token JWT, nunca do body
    const criado_por = req.user.userId;

    // VALIDAÇÃO: Campos obrigatórios
    if (!titulo || !preco) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes" });
    }

    // VALIDAÇÃO: Título
    if (
      typeof titulo !== "string" ||
      titulo.trim().length < 3 ||
      titulo.trim().length > 200
    ) {
      return res
        .status(400)
        .json({ error: "Título deve ter entre 3 e 200 caracteres" });
    }

    // VALIDAÇÃO: Preço
    const precoNumerico = Number.parseFloat(preco);
    if (Number.isNaN(precoNumerico) || precoNumerico <= 0) {
      return res
        .status(400)
        .json({ error: "Preço deve ser um número positivo" });
    }

    // VALIDAÇÃO: Tipos de imóvel permitidos
    const tiposPermitidos = [
      "Casa",
      "Apartamento",
      "Cobertura",
      "Kitnet",
      "Terreno",
      "Sala comercial",
      "Galpão",
      "Sítio",
      "Fazenda",
    ];

    if (tipo && !tiposPermitidos.includes(tipo)) {
      return res.status(400).json({ error: "Tipo de imóvel inválido" });
    }

    try {
      // Sanitiza strings
      const tituloLimpo = sanitizarString(titulo, 200);
      const descricaoLimpa = sanitizarString(descricao || "", 5000);
      const estadoLimpo = sanitizarString(estado || "", 50);
      const cidadeLimpa = sanitizarString(cidade || "", 100);
      const bairroLimpo = sanitizarString(bairro || "", 100);

      // DB QUERY: Insere novo imóvel
      const imovelResult = await pool.query(
        `INSERT INTO imoveis
        (titulo, descricao, preco, preco_destaque, destaque, status, finalidade, cep, area_total, area_construida, visivel, criado_por, estado, cidade, bairro, tipo, coordenadas)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING id`,
        [
          tituloLimpo,
          descricaoLimpa,
          precoNumerico,
          preco_destaque ? Number.parseFloat(preco_destaque) : null,
          destaque || false,
          status || null,
          finalidade || null,
          cep || null,
          area_total ? Number.parseFloat(area_total) : null,
          area_construida ? Number.parseFloat(area_construida) : null,
          visivel !== undefined ? visivel : true,
          criado_por,
          estadoLimpo || null,
          cidadeLimpa || null,
          bairroLimpo || null,
          tipo || null,
          coordenadas || null,
        ],
      );

      const imovelId = imovelResult.rows[0].id;
      res.status(201).json({ id: imovelId });
    } catch (err) {
      const codigoErro = logErroSeguro("Erro ao cadastrar imóvel", err);
      res
        .status(500)
        .json({ error: "Erro ao cadastrar imóvel", codigo: codigoErro });
    }
  },
);

// ROTA: Atualiza imóvel (PROTEGIDA — apenas admins) (1.4)
app.put(
  "/api/imoveis/:id",
  verificarTokenJWT,
  verificarAdmin,
  async (req, res) => {
    const { id } = req.params;
    const {
      titulo,
      descricao,
      preco,
      preco_destaque,
      destaque,
      status,
      finalidade,
      cep,
      area_total,
      area_construida,
      visivel,
      estado,
      cidade,
      bairro,
      tipo,
      coordenadas,
      enviarNotificacao,
    } = req.body;

    // SEGURANÇA: atualizado_por extraído do token JWT, nunca do body
    const atualizadoPor = req.user.userId;

    // VALIDAÇÃO: Campos obrigatórios
    if (!titulo || !preco) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes" });
    }

    // VALIDAÇÃO: Verifica se imóvel existe
    try {
      const imovelExiste = await pool.query(
        "SELECT * FROM imoveis WHERE id = $1",
        [id],
      );
      if (imovelExiste.rows.length === 0) {
        return res.status(404).json({ error: "Imóvel não encontrado" });
      }

      // SEGURANÇA: Sanitiza strings antes de salvar
      const tituloLimpo = sanitizarString(titulo, 200);
      const descricaoLimpa = sanitizarString(descricao || "", 5000);
      const estadoLimpo = sanitizarString(estado || "", 50);
      const cidadeLimpa = sanitizarString(cidade || "", 100);
      const bairroLimpo = sanitizarString(bairro || "", 100);

      // DB QUERY: Atualiza imóvel
      await pool.query(
        `UPDATE imoveis
       SET titulo = $1, descricao = $2, preco = $3, preco_destaque = $4,
           destaque = $5, status = $6, finalidade = $7, cep = $8,
           area_total = $9, area_construida = $10, visivel = $11,
           atualizado_por = $12, estado = $13, cidade = $14,
           bairro = $15, tipo = $16, coordenadas = $17, data_atualizacao = CURRENT_TIMESTAMP
       WHERE id = $18`,
        [
          tituloLimpo,
          descricaoLimpa,
          preco,
          preco_destaque || null,
          destaque || false,
          status || null,
          finalidade || null,
          cep || null,
          area_total || null,
          area_construida || null,
          visivel !== undefined ? visivel : true,
          atualizadoPor,
          estadoLimpo || null,
          cidadeLimpa || null,
          bairroLimpo || null,
          tipo || null,
          coordenadas || null,
          id,
        ],
      );

      // Envia e-mails apenas se o admin marcou a checkbox de notificação
      if (enviarNotificacao === true) {
        const imovelAtual = imovelExiste.rows[0];

        const curtidasResult = await pool.query(
          `SELECT u.email, u.nome
           FROM curtidas c
           JOIN usuarios u ON u.id = c.usuario_id
           WHERE c.imovel_id = $1 AND u.aceita_emails_comerciais = TRUE`,
          [id],
        );

        const imovelAtualizado = {
          id,
          titulo,
          descricao,
          preco,
          preco_destaque,
        };

        // Envia e-mails de forma assíncrona
        for (const curtida of curtidasResult.rows) {
          enviarEmail(
            "promocaoCurtidas",
            curtida.email,
            `Oferta Especial: ${imovelAtualizado.titulo} - Nolare`,
            {
              nome: curtida.nome,
              imovel: imovelAtualizado,
            },
          )
            .then(() => {
              return pool.query(
                "INSERT INTO email_comercial (usuario_id, imovel_id) SELECT id, $2 FROM usuarios WHERE email = $1",
                [curtida.email, id],
              );
            })
            .catch((err) => {
              logErroSeguro(
                `Erro ao enviar e-mail de promoção para ${curtida.email}`,
                err,
              );
            });
        }
      }

      res.json({ message: "Imóvel atualizado com sucesso!" });
    } catch (err) {
      const codigoErro = logErroSeguro("Erro ao atualizar imóvel", err);
      res
        .status(500)
        .json({ error: "Erro ao atualizar imóvel", codigo: codigoErro });
    }
  },
);

// ROTA: Cria características do imóvel (PROTEGIDA — apenas admins) (1.4)
app.post(
  "/api/imoveis_caracteristicas",
  verificarTokenJWT,
  verificarAdmin,
  async (req, res) => {
    const campos = [
      "imovel_id",
      "condominio",
      "iptu",
      "quarto",
      "suite",
      "banheiro",
      "vaga",
      "andar",
      "andar_total",
      "piscina",
      "churrasqueira",
      "salao_de_festa",
      "academia",
      "playground",
      "jardim",
      "varanda",
      "interfone",
      "acessibilidade_pcd",
      "mobiliado",
      "ar_condicionado",
      "energia_solar",
      "quadra",
      "lavanderia",
      "closet",
      "escritorio",
      "lareira",
      "alarme",
      "camera_vigilancia",
      "bicicletario",
      "sala_jogos",
      "brinquedoteca",
      "elevador",
      "pomar",
      "lago",
      "aceita_animais",
      "na_planta",
      "portaria_24h",
      "carregador_carro_eletrico",
      "gerador_energia",
      "estudio",
      "construtora",
      "lancamento",
      "data_entrega",
    ];

    // VALIDAÇÃO: Campo obrigatório
    if (!req.body.imovel_id) {
      return res.status(400).json({ error: "imovel_id é obrigatório" });
    }

    // VALIDAÇÃO: Verifica se imóvel existe
    try {
      const imovelExiste = await pool.query(
        "SELECT id FROM imoveis WHERE id = $1",
        [req.body.imovel_id],
      );
      if (imovelExiste.rows.length === 0) {
        return res.status(404).json({ error: "Imóvel não encontrado" });
      }
    } catch (err) {
      const codigoErro = logErroSeguro(
        "Erro ao validar imóvel (POST caract)",
        err,
      );
      return res
        .status(500)
        .json({ error: "Erro ao validar imóvel", codigo: codigoErro });
    }

    // Define valores padrão para campos booleanos
    const camposBooleanos = [
      "suite",
      "piscina",
      "churrasqueira",
      "salao_de_festa",
      "academia",
      "playground",
      "jardim",
      "varanda",
      "interfone",
      "acessibilidade_pcd",
      "mobiliado",
      "ar_condicionado",
      "energia_solar",
      "quadra",
      "lavanderia",
      "closet",
      "escritorio",
      "lareira",
      "alarme",
      "camera_vigilancia",
      "bicicletario",
      "sala_jogos",
      "brinquedoteca",
      "elevador",
      "pomar",
      "lago",
      "aceita_animais",
      "na_planta",
      "portaria_24h",
      "carregador_carro_eletrico",
      "gerador_energia",
      "estudio",
      "construtora",
      "lancamento",
    ];

    const values = campos.map((c) => {
      if (c === "condominio" || c === "iptu") {
        const valor = req.body[c];
        if (
          valor === undefined ||
          valor === null ||
          valor === 0 ||
          valor === "0"
        ) {
          return null;
        }
        return valor;
      }
      return req.body[c] !== undefined
        ? req.body[c]
        : camposBooleanos.includes(c)
          ? false
          : null;
    });

    try {
      // DB QUERY: Insere características do imóvel
      const placeholders = campos.map((_, idx) => `$${idx + 1}`).join(",");
      await pool.query(
        `INSERT INTO imoveis_caracteristicas (${campos.join(
          ",",
        )}) VALUES (${placeholders})`,
        values,
      );
      res
        .status(201)
        .json({ message: "Características cadastradas com sucesso!" });
    } catch (err) {
      const codigoErro = logErroSeguro(
        "Erro ao cadastrar características",
        err,
      );
      res.status(500).json({
        error: "Erro ao cadastrar características",
        codigo: codigoErro,
      });
    }
  },
);

// ROTA: Atualiza características do imóvel (PROTEGIDA — apenas admins) (1.4)
app.put(
  "/api/imoveis_caracteristicas/:imovel_id",
  verificarTokenJWT,
  verificarAdmin,
  async (req, res) => {
    const { imovel_id } = req.params;
    const campos = [
      "condominio",
      "iptu",
      "quarto",
      "suite",
      "banheiro",
      "vaga",
      "andar",
      "andar_total",
      "piscina",
      "churrasqueira",
      "salao_de_festa",
      "academia",
      "playground",
      "jardim",
      "varanda",
      "interfone",
      "acessibilidade_pcd",
      "mobiliado",
      "ar_condicionado",
      "energia_solar",
      "quadra",
      "lavanderia",
      "closet",
      "escritorio",
      "lareira",
      "alarme",
      "camera_vigilancia",
      "bicicletario",
      "sala_jogos",
      "brinquedoteca",
      "elevador",
      "pomar",
      "lago",
      "aceita_animais",
      "na_planta",
      "portaria_24h",
      "carregador_carro_eletrico",
      "gerador_energia",
      "estudio",
      "construtora",
      "lancamento",
      "data_entrega",
    ];

    // VALIDAÇÃO: Campo obrigatório
    if (!imovel_id) {
      return res.status(400).json({ error: "imovel_id é obrigatório" });
    }

    // VALIDAÇÃO: imovel_id deve ser numérico para evitar erro 500 por cast inválido
    if (!validarIdNumerico(imovel_id)) {
      return res.status(400).json({ error: "imovel_id inválido" });
    }

    // VALIDAÇÃO: Verifica se imóvel existe
    try {
      const imovelExiste = await pool.query(
        "SELECT id FROM imoveis WHERE id = $1",
        [imovel_id],
      );
      if (imovelExiste.rows.length === 0) {
        return res.status(404).json({ error: "Imóvel não encontrado" });
      }
    } catch (err) {
      const codigoErro = logErroSeguro(
        "Erro ao validar imóvel (PUT caract)",
        err,
      );
      return res
        .status(500)
        .json({ error: "Erro ao validar imóvel", codigo: codigoErro });
    }

    // Define valores padrão para campos booleanos
    const camposBooleanos = [
      "suite",
      "piscina",
      "churrasqueira",
      "salao_de_festa",
      "academia",
      "playground",
      "jardim",
      "varanda",
      "interfone",
      "acessibilidade_pcd",
      "mobiliado",
      "energia_solar",
      "quadra",
      "lavanderia",
      "closet",
      "escritorio",
      "lareira",
      "alarme",
      "camera_vigilancia",
      "bicicletario",
      "sala_jogos",
      "brinquedoteca",
      "elevador",
      "pomar",
      "lago",
      "aceita_animais",
      "na_planta",
      "portaria_24h",
      "carregador_carro_eletrico",
      "gerador_energia",
      "estudio",
      "lancamento",
    ];

    // DB QUERY: Usa placeholders para todos os campos e manda NULL via parâmetros.
    // Isso evita inconsistências de numeração/tipagem quando alguns campos ficam "NULL" no texto do SQL.
    const setClauses = campos
      .map((campo, idx) => `${campo} = $${idx + 1}`)
      .join(", ");

    const values = campos.map((c) => {
      const valor = req.body[c];

      if (c === "condominio" || c === "iptu") {
        if (
          valor === undefined ||
          valor === null ||
          valor === 0 ||
          valor === "0"
        ) {
          return null;
        }
        return valor;
      }

      if (c === "ar_condicionado") {
        // ar_condicionado é numérico, não booleano
        return valor !== undefined && valor !== null && valor !== ""
          ? valor
          : null;
      }

      if (c === "construtora" || c === "data_entrega") {
        return valor !== undefined && valor !== null && valor !== ""
          ? valor
          : null;
      }

      if (camposBooleanos.includes(c)) {
        return valor !== undefined ? !!valor : false;
      }

      return valor !== undefined && valor !== null && valor !== ""
        ? valor
        : null;
    });

    try {
      const query = `UPDATE imoveis_caracteristicas
       SET ${setClauses}
       WHERE imovel_id = $${campos.length + 1}`;

      const updateResult = await pool.query(query, [...values, imovel_id]);

      /* Compatibilidade: alguns imóveis antigos podem não ter linha em imoveis_caracteristicas.
         Se não atualizou nenhuma linha, insere uma nova com os mesmos valores. */
      if (updateResult.rowCount === 0) {
        const insertCampos = ["imovel_id", ...campos];
        const placeholders = insertCampos.map((_, idx) => `$${idx + 1}`).join(",");
        await pool.query(
          `INSERT INTO imoveis_caracteristicas (${insertCampos.join(",")})
           VALUES (${placeholders})`,
          [imovel_id, ...values],
        );
      }

      res
        .status(200)
        .json({ message: "Características atualizadas com sucesso!" });
    } catch (err) {
      // SEGURANÇA: Usa log seguro que não expõe detalhes em produção
      const codigoErro = logErroSeguro(
        "Erro ao atualizar características",
        err,
      );
      res.status(500).json({
        error: "Erro ao atualizar características",
        codigo: codigoErro,
      });
    }
  },
);

// =========================

// ROTAS DE UPLOAD DE FOTOS

// =========================

// Caminho absoluto e estável para uploads
const uploadDir = path.join(process.cwd(), "public", "fotos_imoveis");

// Usa memoryStorage para processar a imagem com sharp antes de salvar
const storage = multer.memoryStorage();

// LIMITE DE TAMANHO: 200MB por arquivo — sem limite prático para imagens
// FORMATOS PERMITIDOS: qualquer formato de imagem (PNG, JPG, JPEG, GIF, WebP, AVIF, BMP, TIFF, HEIC, etc.)
const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB por arquivo
    files: 10, // máximo 10 arquivos por request
  },
  fileFilter: (req, file, cb) => {
    // VALIDAÇÃO: Aceita qualquer arquivo cujo mimetype comece com "image/"
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Formato não permitido. Envie apenas arquivos de imagem."));
    }
  },
});

// Aceita múltiplas fotos (envio em lote) OU uma foto única (envio individual)
const uploadFotos = upload.array("fotos", 10);

// Função para otimizar imagem e converter para WebP
const otimizarImagem = async (buffer, outputPath) => {
  await sharp(buffer)
    // Corrige automaticamente a rotação baseada nos dados EXIF da foto
    // Isso resolve fotos tiradas em retrato que chegam deitadas
    .rotate()
    .resize({
      width: 1200,
      height: 1200,
      fit: "contain", // Encaixa a imagem inteira sem cortar nenhuma borda
      background: { r: 255, g: 255, b: 255, alpha: 1 }, // Fundo branco nas áreas vazias
      withoutEnlargement: true, // Não aumenta imagens menores que 1200x1200
    })
    .webp({ quality: 85 }) // WebP com qualidade alta (85%)
    .toFile(outputPath);
};

// ROTA: Upload de fotos (PROTEGIDA — apenas admins) (1.4)
// SEGURANÇA: O middleware JWT/admin é aplicado ANTES do multer para evitar upload desnecessário (2.6)
app.post(
  "/api/imoveis/:id/upload",
  verificarTokenJWT,
  verificarAdmin,
  uploadFotos,
  async (req, res) => {
    const { id } = req.params;

    try {
      // SEGURANÇA: Verifica existência do imóvel antes de processar (2.6)
      if (!validarIdNumerico(id)) {
        return res.status(400).json({ error: "ID de imóvel inválido" });
      }

      const imovelExiste = await pool.query(
        "SELECT id FROM imoveis WHERE id = $1",
        [id],
      );
      if (imovelExiste.rows.length === 0) {
        return res.status(404).json({ error: "Imóvel não encontrado" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "Nenhuma imagem enviada" });
      }

      // Garante que o diretório de upload existe
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fotosInseridas = [];

      // Processa cada foto, otimiza e salva
      for (const file of req.files) {
        // Gera nome único com extensão .webp
        const nomeArquivo = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
        const caminhoCompleto = path.join(uploadDir, nomeArquivo);

        // Otimiza e converte para WebP
        await otimizarImagem(file.buffer, caminhoCompleto);

        // Caminho relativo que será acessado pelo frontend via rota estática /fotos_imoveis
        const caminho = `/fotos_imoveis/${nomeArquivo}`;

        const result = await pool.query(
          "INSERT INTO fotos_imoveis (imovel_id, caminho_foto) VALUES ($1, $2) RETURNING *",
          [id, caminho],
        );

        fotosInseridas.push(result.rows[0]);
      }

      res.status(201).json(fotosInseridas);
    } catch (err) {
      const codigoErro = logErroSeguro("Erro ao salvar fotos do imóvel", err);
      res
        .status(500)
        .json({ error: "Erro ao salvar fotos do imóvel", codigo: codigoErro });
    }
  },
);

// ROTA: Deleta foto do imóvel (PROTEGIDA — apenas admins) (1.4)
app.delete(
  "/api/fotos/:id",
  verificarTokenJWT,
  verificarAdmin,
  async (req, res) => {
    const { id } = req.params;

    // VALIDAÇÃO: Campo obrigatório e numérico
    if (!validarIdNumerico(id)) {
      return res.status(400).json({ error: "id da foto é inválido" });
    }

    try {
      // DB QUERY: Busca foto para obter o caminho
      const fotoResult = await pool.query(
        "SELECT * FROM fotos_imoveis WHERE id = $1",
        [id],
      );

      if (fotoResult.rows.length === 0) {
        return res.status(404).json({ error: "Foto não encontrada" });
      }

      const foto = fotoResult.rows[0];

      // DB QUERY: Deleta foto do banco de dados
      await pool.query("DELETE FROM fotos_imoveis WHERE id = $1", [id]);

      // Deleta arquivo físico se existir
      // O caminho no banco é /fotos_imoveis/arquivo.jpg, o arquivo físico está em public/fotos_imoveis/arquivo.jpg
      const filePath = path.join(process.cwd(), "public", foto.caminho_foto);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.json({ message: "Foto deletada com sucesso!" });
    } catch (err) {
      const codigoErro = logErroSeguro("Erro ao deletar foto", err);
      res
        .status(500)
        .json({ error: "Erro ao deletar foto", codigo: codigoErro });
    }
  },
);

// =========================
// ROTAS DE ADMINISTRAÇÃO (PROTEGIDAS)
// =========================

// ROTA: Solicita cadastro de novo administrador — envia código de verificação por e-mail (APENAS ADMINS AUTENTICADOS)
// ETAPA 1: O admin preenche nome, email e senha → sistema envia código para o e-mail informado
app.post(
  "/api/admin/adicionar-admin",
  verificarTokenJWT,
  verificarAdmin,
  async (req, res) => {
    const { nome, email, senha } = req.body;

    // VALIDAÇÃO: Campos obrigatórios
    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    // VALIDAÇÃO: Nome
    if (!validarNome(nome)) {
      return res
        .status(400)
        .json({ error: "Nome deve ter entre 3 e 100 caracteres" });
    }

    // VALIDAÇÃO: Formato de email
    if (!validarEmail(email)) {
      return res.status(400).json({ error: "Formato de email inválido" });
    }

    // VALIDAÇÃO: Força da senha
    const validacaoSenha = validarForcaSenha(senha);
    if (!validacaoSenha.valido) {
      return res.status(400).json({ error: validacaoSenha.mensagem });
    }

    try {
      const nomeLimpo = sanitizarString(nome, 100);
      const emailLimpo = sanitizarString(email.toLowerCase(), 255);

      // DB QUERY: Verifica se email já está em uso por usuário ativo
      const emailExiste = await pool.query(
        "SELECT id, tipo_usuario FROM usuarios WHERE email = $1",
        [emailLimpo],
      );

      // Se o usuário já existe como admin, retorna erro
      if (
        emailExiste.rows.length > 0 &&
        emailExiste.rows[0].tipo_usuario === "adm"
      ) {
        return res
          .status(400)
          .json({ error: "Este email já está cadastrado como administrador" });
      }

      // Se o usuário existe como user, será promovido a admin na confirmação
      const usuarioExistenteId =
        emailExiste.rows.length > 0 ? emailExiste.rows[0].id : null;

      // Hash da senha antes de armazenar na tabela de pendência
      const senhaHash = await bcrypt.hash(senha, 12);

      // Gera código de verificação de 5 dígitos e validade de 10 minutos
      const codigo = gerarCodigoVerificacao();
      const expiracao = new Date(Date.now() + 10 * 60 * 1000);

      // Salva (ou atualiza) pendência na tabela de verificação — reutiliza mesmo fluxo do cadastro comum
      await pool.query(
        `INSERT INTO email_verificacao_pendente
          (nome, email, senha, tipo_usuario, codigo, expiracao, aceitou_termos, aceitou_privacidade, aceita_emails_comerciais)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE, TRUE, FALSE)
         ON CONFLICT (email) DO UPDATE SET
           nome = EXCLUDED.nome,
           senha = EXCLUDED.senha,
           tipo_usuario = EXCLUDED.tipo_usuario,
           codigo = EXCLUDED.codigo,
           expiracao = EXCLUDED.expiracao,
           atualizado_em = NOW(),
           verificado = FALSE`,
        [nomeLimpo, emailLimpo, senhaHash, "adm", codigo, expiracao],
      );

      // Envia código de verificação para o e-mail do novo administrador
      await enviarEmail(
        "verificarCadastro",
        emailLimpo,
        "Verificação de Cadastro de Administrador - Nolare",
        {
          nome: nomeLimpo,
          codigo: codigo,
        },
      );

      res.status(200).json({
        success: true,
        needsVerification: true,
        message:
          "Código de verificação enviado para o e-mail informado. Insira o código para confirmar o cadastro.",
      });
    } catch (err) {
      const codigoErro = logErroSeguro(
        "Erro ao iniciar cadastro de administrador",
        err,
      );
      res.status(500).json({ error: "Erro no servidor", codigo: codigoErro });
    }
  },
);

// ROTA: Confirma cadastro de administrador após verificação do código de e-mail (APENAS ADMINS AUTENTICADOS)
// ETAPA 2: O admin insere o código recebido → sistema cria o novo administrador
app.post(
  "/api/admin/confirmar-admin",
  verificarTokenJWT,
  verificarAdmin,
  async (req, res) => {
    const { email, codigo } = req.body;

    // VALIDAÇÃO: Campos obrigatórios
    if (!email || !codigo) {
      return res.status(400).json({ error: "Email e código são obrigatórios" });
    }

    try {
      const emailLimpo = sanitizarString(email.toLowerCase(), 255);

      // DB QUERY: Busca pendência de cadastro de admin
      const pendente = await pool.query(
        "SELECT * FROM email_verificacao_pendente WHERE email = $1 AND verificado = FALSE AND tipo_usuario = $2",
        [emailLimpo, "adm"],
      );

      if (pendente.rows.length === 0) {
        return res
          .status(400)
          .json({ error: "Nenhum cadastro pendente para este email" });
      }

      const registro = pendente.rows[0];

      // VALIDAÇÃO: Código expirado
      if (!validarToken(registro.expiracao)) {
        return res.status(400).json({
          error: "Código expirado. Inicie o cadastro novamente.",
          expired: true,
        });
      }

      // VALIDAÇÃO: Código incorreto — usa sistema de tentativas
      if (registro.codigo !== codigo) {
        await registrarTentativaErradaEmail(emailLimpo, "cadastro_adm");

        const verificacao = await verificarBloqueioTentativasEmail(
          emailLimpo,
          "cadastro_adm",
        );

        if (verificacao.bloqueado) {
          return res.status(429).json({
            error:
              "Muitas tentativas erradas. Você foi bloqueado por 10 minutos.",
            statusCode: "BLOQUEADO",
            tempoRestante: verificacao.tempoRestante,
          });
        }

        return res.status(400).json({
          error: `Código inválido. Tentativas restantes: ${verificacao.tentativasRestantes}`,
          tentativasRestantes: verificacao.tentativasRestantes,
        });
      }

      // VERIFICAÇÃO: Verifica se usuário já existe e qual o tipo
      const emailExiste = await pool.query(
        "SELECT id, tipo_usuario FROM usuarios WHERE email = $1",
        [emailLimpo],
      );

      let result;

      if (emailExiste.rows.length > 0) {
        const usuarioExistente = emailExiste.rows[0];

        // Se já é admin, marca como verificado e retorna erro
        if (usuarioExistente.tipo_usuario === "adm") {
          await pool.query(
            "UPDATE email_verificacao_pendente SET verificado = TRUE WHERE email = $1",
            [emailLimpo],
          );
          return res.status(400).json({
            error: "Este email já está cadastrado como administrador",
          });
        }

        // Se é user, promove para admin (atualiza tipo_usuario e senha)
        result = await pool.query(
          "UPDATE usuarios SET tipo_usuario = $1, senha = $2 WHERE id = $3 RETURNING id, nome, email, tipo_usuario, data_criacao",
          ["adm", registro.senha, usuarioExistente.id],
        );
      } else {
        // Insere novo administrador
        result = await pool.query(
          "INSERT INTO usuarios (nome, email, senha, tipo_usuario, aceita_emails_comerciais) VALUES ($1, $2, $3, $4, FALSE) RETURNING id, nome, email, tipo_usuario, data_criacao",
          [registro.nome, emailLimpo, registro.senha, "adm"],
        );
      }

      // Marca pendência como verificada
      await pool.query(
        "UPDATE email_verificacao_pendente SET verificado = TRUE WHERE email = $1",
        [emailLimpo],
      );

      res.status(201).json({
        success: true,
        user: result.rows[0],
        message: "Administrador cadastrado com sucesso!",
      });
    } catch (err) {
      const codigoErro = logErroSeguro(
        "Erro ao confirmar cadastro de administrador",
        err,
      );
      res.status(500).json({ error: "Erro no servidor", codigo: codigoErro });
    }
  },
);

// =========================
// MIDDLEWARE DE ERROS DO MULTER
// =========================
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // ERRO: Arquivo excede o limite definido no multer — retorna 413 para o cliente
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(413)
        .json({
          error: "Arquivo muito grande. O limite por arquivo é de 200MB.",
        });
    }
    return res.status(400).json({ error: `Erro no upload: ${err.message}` });
  }

  if (err) {
    return res.status(400).json({ error: err.message });
  }

  next();
});

// =========================
// FRONTEND (VITE BUILD)
// =========================

// fallback SPA — Express 5 SAFE (não usar "*")
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(process.cwd(), "dist", "index.html"));
});

// =========================
// INICIA O SERVIDOR
// =========================
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
