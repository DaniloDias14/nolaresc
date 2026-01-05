import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { enviarEmail } from "./src/emails/email.js";
import jwt from "jsonwebtoken"; // Import jwt

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.BACKEND_PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET; // Ensure JWT_SECRET is defined in your .env file

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "dist")));

// =========================
// FUNÇÕES AUXILIARES
// =========================

// FUNÇÃO: Gera código de verificação de 5 dígitos
const gerarCodigoVerificacao = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
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
// FUNÇÕES DE CONTROLE DE TENTATIVAS
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
    console.error("Erro ao garantir tabelas de tentativas:", err);
  }
};

// Chamar ao iniciar servidor
garantirTabelasTentativas();

const verificarBloqueioTentativasEmail = async (email, tipo) => {
  try {
    const result = await pool.query(
      `SELECT bloqueado_ate, tentativas_restantes FROM tentativas_verificacao_email
       WHERE email = $1 AND tipo = $2`,
      [email, tipo]
    );

    if (result.rows.length === 0) {
      return { bloqueado: false, tentativasRestantes: 5 };
    }

    const dados = result.rows[0];
    const agora = new Date();

    if (dados.bloqueado_ate && agora < new Date(dados.bloqueado_ate)) {
      const tempoRestante = Math.ceil(
        (new Date(dados.bloqueado_ate) - agora) / 1000
      );
      return {
        bloqueado: true,
        tempoRestante,
        tentativasRestantes: 0,
        mensagem: `Você está bloqueado. Tente novamente em ${tempoRestante} segundos.`,
      };
    }

    return {
      bloqueado: false,
      tentativasRestantes: dados.tentativas_restantes || 5,
    };
  } catch (err) {
    console.error("Erro ao verificar bloqueio de tentativas:", err);
    return { bloqueado: false, tentativasRestantes: 5 };
  }
};

const registrarTentativaErradaEmail = async (email, tipo) => {
  try {
    const result = await pool.query(
      `SELECT id, tentativas_restantes FROM tentativas_verificacao_email
       WHERE email = $1 AND tipo = $2`,
      [email, tipo]
    );

    if (result.rows.length === 0) {
      await pool.query(
        `INSERT INTO tentativas_verificacao_email (email, tipo, tentativas_restantes, ultima_tentativa)
         VALUES ($1, $2, $3, NOW())`,
        [email, tipo, 4] // 5 - 1 = 4 tentativas restantes
      );
      return;
    }

    const record = result.rows[0];
    const tentativasRestantes = Math.max(
      0,
      (record.tentativas_restantes || 5) - 1
    );

    if (tentativasRestantes === 0) {
      const bloqueadoAte = new Date(Date.now() + 10 * 60 * 1000);
      await pool.query(
        `UPDATE tentativas_verificacao_email
         SET tentativas_restantes = $1, bloqueado_ate = $2, ultima_tentativa = NOW()
         WHERE id = $3`,
        [tentativasRestantes, bloqueadoAte, record.id]
      );
    } else {
      await pool.query(
        `UPDATE tentativas_verificacao_email
         SET tentativas_restantes = $1, ultima_tentativa = NOW()
         WHERE id = $2`,
        [tentativasRestantes, record.id]
      );
    }
  } catch (err) {
    console.error("Erro ao registrar tentativa errada:", err);
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

  try {
    // DB QUERY: Busca usuário por email
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const user = result.rows[0];

    // VALIDAÇÃO: Compara senha com hash armazenado
    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // DB QUERY: Registra sessão de login
    await pool.query(
      "INSERT INTO usuario_sessoes (usuario_id, data_login, ativo) VALUES ($1, CURRENT_TIMESTAMP, TRUE)",
      [user.id]
    );

    const dataHora = new Date().toLocaleString("pt-BR", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    });

    enviarEmail("loginDetectado", user.email, "Novo Login Detectado - Nolare", {
      nome: user.nome,
      dataHora: dataHora,
    }).catch((err) => {
      console.error("Erro ao enviar e-mail de login detectado:", err);
    });

    // SEGURANÇA: Remove senha antes de enviar resposta
    const { senha: _, ...userSemSenha } = user;

    res.json({ user: userSemSenha });
  } catch (err) {
    console.error("Erro ao fazer login:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ROTA: Logout de usuário
app.post("/api/logout", async (req, res) => {
  const { usuario_id } = req.body;

  // VALIDAÇÃO: Campo obrigatório
  if (!usuario_id) {
    return res.status(400).json({ error: "usuario_id é obrigatório" });
  }

  try {
    // DB QUERY: Atualiza sessão ativa para inativa
    await pool.query(
      `UPDATE usuario_sessoes
       SET data_logout = CURRENT_TIMESTAMP, ativo = FALSE
       WHERE usuario_id = $1 AND ativo = TRUE`,
      [usuario_id]
    );

    res.json({ message: "Logout realizado com sucesso" });
  } catch (err) {
    console.error("Erro ao fazer logout:", err);
    res.status(500).json({ error: "Erro no servidor" });
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

  // VALIDAÇÃO: Tipo de usuário permitido
  if (!["user", "adm"].includes(tipo_usuario)) {
    return res.status(400).json({ error: "Tipo de usuário inválido" });
  }

  try {
    // DB QUERY: Verifica se email já existe
    const emailExiste = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );
    const emailJaExiste = emailExiste.rows.length > 0;

    const codigo = gerarCodigoVerificacao();
    const expiracao = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    const aceitouTermosValue = aceitouTermos === true ? true : false;
    const aceitouPrivacidadeValue = aceitouPrivacidade === true ? true : false;

    // Usamos tabela de pendências de verificação
    await pool.query(
      "INSERT INTO email_verificacao_pendente (nome, email, senha, tipo_usuario, codigo, expiracao, aceitou_termos, aceitou_privacidade) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (email) DO UPDATE SET codigo = $5, expiracao = $6, criado_em = NOW()",
      [
        nome,
        email,
        await bcrypt.hash(senha, 10),
        tipo_usuario,
        codigo,
        expiracao,
        aceitouTermosValue,
        aceitouPrivacidadeValue,
      ]
    );

    if (!emailJaExiste) {
      // Email novo - enviar código real
      await enviarEmail(
        "verificarCadastro",
        email,
        "Verificação de Cadastro - Nolare",
        {
          nome: nome,
          codigo: codigo,
        }
      );
    }

    res.status(201).json({
      success: true,
      needsVerification: true,
      message:
        "Cadastro iniciado! Verifique seu e-mail para confirmar sua conta.",
    });
  } catch (err) {
    console.error("Erro ao registrar usuário:", err);
    res.status(500).json({ error: "Erro no servidor" });
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
      [usuarioId, tipo]
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
    console.error("Erro ao verificar limite de solicitação:", err);
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
      [-1, "verificacao_falsa_" + email, codigoFalso, expiracao, 5, false]
    );
  } catch (err) {
    console.error("Erro ao criar registro falso de verificação:", err);
  }
};

// Funções de controle de tentativas para usuários específicos (substituídas pelas novas funções gerais)
const verificarBloqueioTentativas = async (usuarioId, tipo) => {
  try {
    // BUSCA O USUÁRIO PELO ID PARA OBTER O EMAIL
    const usuarioResult = await pool.query(
      "SELECT email FROM usuarios WHERE id = $1",
      [usuarioId]
    );
    if (usuarioResult.rows.length === 0) {
      return { bloqueado: false, tentativasRestantes: 5 }; // Usuário não encontrado
    }
    const email = usuarioResult.rows[0].email;
    return verificarBloqueioTentativasEmail(email, tipo);
  } catch (err) {
    console.error("Erro ao verificar bloqueio para usuário:", err);
    return { bloqueado: false, tentativasRestantes: 5 };
  }
};

const registrarTentativaErrada = async (usuarioId, tipo) => {
  try {
    // BUSCA O USUÁRIO PELO ID PARA OBTER O EMAIL
    const usuarioResult = await pool.query(
      "SELECT email FROM usuarios WHERE id = $1",
      [usuarioId]
    );
    if (usuarioResult.rows.length === 0) {
      return; // Usuário não encontrado
    }
    const email = usuarioResult.rows[0].email;
    await registrarTentativaErradaEmail(email, tipo);
  } catch (err) {
    console.error("Erro ao registrar tentativa errada para usuário:", err);
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
      [email]
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
      "verificacao"
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
      [user.id, "verificacao"]
    );

    // DB QUERY: Cria novo token com campos de controle de tentativas
    await pool.query(
      "INSERT INTO email_conta (usuario_id, tipo, token, expiracao, tentativas_restantes) VALUES ($1, $2, $3, $4, $5)",
      [user.id, "verificacao", token, expiracao, 5]
    );

    // Não enviamos email se o usuário já existe - isso é uma medida de segurança
    // O usuário receberá um código "inválido" que nunca será aceito

    res.json({
      success: true,
      message: "Código de verificação enviado para o e-mail",
    });
  } catch (err) {
    console.error("Erro ao solicitar verificação:", err);
    res.status(500).json({ error: "Erro no servidor" });
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
      [email]
    );

    if (pendente.rows.length > 0) {
      const registroPendente = pendente.rows[0];

      const verificacao = await verificarBloqueioTentativasEmail(
        email,
        "cadastro"
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
          "cadastro"
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
      [email]
    );

    if (userResult.rows.length === 0) {
      // Email não existe - aplicar sistema de tentativas para emails inexistentes
      const verificacao = await verificarBloqueioTentativasEmail(
        email,
        "recuperacao"
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
        "recuperacao"
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
      "verificacao"
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
      [user.id, "verificacao"]
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
        "verificacao"
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
    console.error("Erro ao validar código:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

app.post("/api/email/verificacao/confirmar-cadastro", async (req, res) => {
  const { email, codigo, aceitouTermos, aceitouPrivacidade } = req.body;

  if (!email || !codigo) {
    return res.status(400).json({ error: "Email e código são obrigatórios" });
  }

  if (!aceitouTermos || !aceitouPrivacidade) {
    return res.status(400).json({
      error:
        "Você deve aceitar os Termos de Uso e a Política de Privacidade para confirmar seu cadastro.",
    });
  }

  try {
    // DB QUERY: Busca registro pendente
    const pendente = await pool.query(
      "SELECT * FROM email_verificacao_pendente WHERE email = $1",
      [email]
    );

    if (pendente.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Código inválido ou não encontrado" });
    }

    const registroPendente = pendente.rows[0];

    const emailExisteUsers = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );
    const emailJaExistia = emailExisteUsers.rows.length > 0;

    if (emailJaExistia) {
      // É um email que já existe - aplicar sistema de tentativas
      const verificacao = await verificarBloqueioTentativas(
        emailExisteUsers.rows[0].id,
        "verificacao"
      );
      if (verificacao.bloqueado) {
        return res.status(429).json({
          error: verificacao.mensagem,
          statusCode: "BLOQUEADO",
          tempoRestante: verificacao.tempoRestante,
        });
      }

      // Registrar tentativa errada
      await registrarTentativaErrada(
        emailExisteUsers.rows[0].id,
        "verificacao"
      );

      const verificacaoAtualizada = await verificarBloqueioTentativas(
        emailExisteUsers.rows[0].id,
        "verificacao"
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

    if (registroPendente.codigo !== codigo) {
      return res.status(400).json({
        error: "Código inválido.",
      });
    }

    // Valida expiração
    if (!validarToken(registroPendente.expiracao)) {
      return res.status(400).json({
        error: "Código expirado. Por favor, solicite um novo código.",
        expired: true,
      });
    }

    const result = await pool.query(
      "INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, tipo_usuario, data_criacao",
      [
        registroPendente.nome,
        registroPendente.email,
        registroPendente.senha,
        registroPendente.tipo_usuario,
      ]
    );

    // Marcar como verificado
    await pool.query(
      "UPDATE email_verificacao_pendente SET verificado = TRUE WHERE email = $1",
      [email]
    );

    // Deletar o registro pendente após confirmação
    await pool.query(
      "DELETE FROM email_verificacao_pendente WHERE email = $1",
      [email]
    );

    res.status(201).json({
      success: true,
      user: result.rows[0],
      message: "Cadastro confirmado com sucesso!",
    });
  } catch (err) {
    console.error("Erro ao confirmar cadastro:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

app.post("/api/email/recuperacao/solicitar", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email é obrigatório" });
  }

  try {
    // DB QUERY: Busca usuário
    const userResult = await pool.query(
      "SELECT id, nome, email FROM usuarios WHERE email = $1",
      [email]
    );

    // Criar registro pendente com código inválido para bloquear qualquer tentativa
    const emailExiste = userResult.rows.length > 0;

    if (!emailExiste) {
      // Email não existe - criar registro falso para simular fluxo
      await criarRegistroFalsoVerificacao(email); // Usando a nova função

      // Enviar resposta como se tudo estivesse normal
      res.json({
        success: true,
        message: "Código de recuperação enviado para o e-mail",
      });
      return;
    }

    const user = userResult.rows[0];

    const limiteSolicitacao = await verificarLimiteSolicitacao(
      user.id,
      "recuperacao"
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
      [user.id, "recuperacao"]
    );

    // DB QUERY: Cria novo token com o código de 5 dígitos
    await pool.query(
      "INSERT INTO email_conta (usuario_id, tipo, token, expiracao, tentativas_restantes) VALUES ($1, $2, $3, $4, $5)",
      [user.id, "recuperacao", codigo, expiracao, 5]
    );

    // Envia e-mail
    await enviarEmail(
      "recuperarSenha",
      user.email,
      "Recuperação de Senha - Nolare",
      {
        nome: user.nome,
        codigo: codigo,
      }
    );

    res.json({
      success: true,
      message: "Código de recuperação enviado para o e-mail",
    });
  } catch (err) {
    console.error("Erro ao solicitar recuperação:", err);
    res.status(500).json({ error: "Erro no servidor" });
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
      [email]
    );

    if (userResult.rows.length === 0) {
      // Email não existe - aplicar sistema de tentativas para emails inexistentes
      const verificacao = await verificarBloqueioTentativasEmail(
        email,
        "recuperacao"
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
        "recuperacao"
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
      "recuperacao"
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
      [user.id, "recuperacao"]
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
        "recuperacao"
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

  try {
    // DB QUERY: Busca usuário
    const userResult = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const user = userResult.rows[0];

    const tokenResult = await pool.query(
      "SELECT * FROM email_conta WHERE id = $1 AND usuario_id = $2 AND tipo = $3 AND usado = FALSE",
      [token, user.id, "recuperacao"]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: "Token inválido ou expirado" });
    }

    const tokenData = tokenResult.rows[0];

    // Valida expiração
    if (!validarToken(tokenData.expiracao)) {
      return res.status(400).json({ error: "Token expirado" });
    }

    // Hash da nova senha
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualiza senha
    await pool.query("UPDATE usuarios SET senha = $1 WHERE id = $2", [
      senhaHash,
      user.id,
    ]);

    // Marca token como usado
    await pool.query("UPDATE email_conta SET usado = TRUE WHERE id = $1", [
      tokenData.id,
    ]);

    res.json({
      success: true,
      message: "Senha redefinida com sucesso!",
    });
  } catch (err) {
    console.error("Erro ao redefinir senha:", err);
    res.status(500).json({ error: "Erro ao redefinir senha" });
  }
});

// =========================

// ROTAS DE SESSÕES (Dashboard)

// =========================

// ROTA: Conta usuários ativos
app.get("/api/sessoes/ativos", async (req, res) => {
  try {
    // DB QUERY: Conta sessões ativas únicas
    const result = await pool.query(
      "SELECT COUNT(DISTINCT usuario_id) as count FROM usuario_sessoes WHERE ativo = TRUE"
    );
    res.json({ count: Number.parseInt(result.rows[0].count) });
  } catch (err) {
    console.error("Erro ao buscar usuários ativos:", err);
    res.status(500).json({ error: "Erro ao buscar usuários ativos" });
  }
});

// ROTA: Pico de usuários em uma data específica
app.get("/api/sessoes/pico/:data", async (req, res) => {
  const { data } = req.params;

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
      [data]
    );

    res.json({ pico: Number.parseInt(result.rows[0].pico) });
  } catch (err) {
    console.error("Erro ao buscar pico de usuários:", err);
    res.status(500).json({ error: "Erro ao buscar pico de usuários" });
  }
});

// =========================
// ROTAS DE ESTATÍSTICAS (Dashboard)
// =========================

// ROTA: Estatísticas de usuários
app.get("/api/estatisticas/usuarios", async (req, res) => {
  try {
    // DB QUERY: Total de usuários
    const totalResult = await pool.query(
      "SELECT COUNT(*) as total FROM usuarios"
    );

    // DB QUERY: Usuários por tipo
    const tiposResult = await pool.query(
      "SELECT tipo_usuario, COUNT(*) as count FROM usuarios GROUP BY tipo_usuario"
    );

    // DB QUERY: Data do últimocadastro
    const ultimoResult = await pool.query(
      "SELECT data_criacao FROM usuarios ORDER BY data_criacao DESC LIMIT 1"
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
});

// ROTA: Estatísticas de imóveis
app.get("/api/estatisticas/imoveis", async (req, res) => {
  try {
    // DB QUERY: Total de imóveis visíveis
    const totalResult = await pool.query(
      "SELECT COUNT(*) as total FROM imoveis WHERE visivel = TRUE"
    );

    // DB QUERY: Preço médio dos imóveis
    const mediaPrecoResult = await pool.query(
      "SELECT AVG(preco) as media FROM imoveis WHERE visivel = TRUE"
    );

    // DB QUERY: Data do último cadastro
    const ultimoResult = await pool.query(
      "SELECT data_criacao FROM imoveis WHERE visivel = TRUE ORDER BY data_criacao DESC LIMIT 1"
    );

    // DB QUERY: Total de imóveis em destaque
    const destaqueResult = await pool.query(
      "SELECT COUNT(*) as count FROM imoveis WHERE destaque = TRUE AND visivel = TRUE"
    );

    // DB QUERY: Imóveis por status
    const statusResult = await pool.query(
      "SELECT status, COUNT(*) as count FROM imoveis WHERE visivel = TRUE GROUP BY status"
    );

    // DB QUERY: Imóveis por finalidade
    const finalidadeResult = await pool.query(
      "SELECT finalidade, COUNT(*) as count FROM imoveis WHERE visivel = TRUE GROUP BY finalidade"
    );

    // DB QUERY: Imóveis por tipo
    const tipoResult = await pool.query(
      "SELECT tipo, COUNT(*) as count FROM imoveis WHERE visivel = TRUE GROUP BY tipo"
    );

    // DB QUERY: Imóveis por construtora
    const construtoraResult = await pool.query(
      `SELECT ic.construtora, COUNT(*) as count
       FROM imoveis_caracteristicas ic
       JOIN imoveis i ON i.id = ic.imovel_id
       WHERE i.visivel = TRUE AND ic.construtora IS NOT NULL
       GROUP BY ic.construtora`
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
});

// ROTA: Busca o imóvel mais curtido
app.get("/api/estatisticas/imovel-mais-curtido", async (req, res) => {
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
       LIMIT 1`
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
});

// =========================
// ROTAS DE CURTIDAS
// =========================

// ROTA: Busca todas as curtidas de um usuário específico
app.get("/api/curtidas/:usuarioId", async (req, res) => {
  const { usuarioId } = req.params;

  // VALIDAÇÃO: Campo obrigatório
  if (!usuarioId) {
    return res.status(400).json({ error: "usuarioId é obrigatório" });
  }

  try {
    // DB QUERY: Busca todas as curtidas do usuário (apenas imóveis visíveis)
    const result = await pool.query(
      `SELECT c.*, i.titulo, i.preco, i.preco_destaque, i.cidade, i.bairro
       FROM curtidas c
       LEFT JOIN imoveis i ON i.id = c.imovel_id
       WHERE c.usuario_id = $1 AND i.visivel = true
       ORDER BY c.data_curtida DESC`,
      [usuarioId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar curtidas:", err);
    res.status(500).json({ error: "Erro ao buscar curtidas" });
  }
});

// ROTA: Toggle curtida - adiciona se não existe, remove se já existe
app.post("/api/curtidas/:usuarioId/:imovelId", async (req, res) => {
  const { usuarioId, imovelId } = req.params;

  // VALIDAÇÃO: Campos obrigatórios
  if (!usuarioId || !imovelId) {
    return res
      .status(400)
      .json({ error: "usuarioId e imovelId são obrigatórios" });
  }

  try {
    // DB QUERY: Verifica se curtida já existe
    const curtidaExiste = await pool.query(
      "SELECT * FROM curtidas WHERE usuario_id = $1 AND imovel_id = $2",
      [usuarioId, imovelId]
    );

    if (curtidaExiste.rows.length > 0) {
      // Remove curtida
      await pool.query(
        "DELETE FROM curtidas WHERE usuario_id = $1 AND imovel_id = $2",
        [usuarioId, imovelId]
      );
      res.json({ message: "Curtida removida com sucesso", curtido: false });
    } else {
      // Adiciona curtida
      await pool.query(
        "INSERT INTO curtidas (usuario_id, imovel_id, data_curtida) VALUES ($1, $2, NOW())",
        [usuarioId, imovelId]
      );
      res.json({ message: "Curtida adicionada com sucesso", curtido: true });
    }
  } catch (err) {
    console.error("Erro ao alternar curtida:", err);
    res.status(500).json({ error: "Erro ao alternar curtida" });
  }
});

// =========================

// ROTAS DE IMÓVEIS

// =========================

app.get("/api/imoveis/ocultos", async (req, res) => {
  try {
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
      ORDER BY i.data_criacao DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar imóveis ocultos:", err);
    res.status(500).json({ error: "Erro ao buscar imóveis ocultos" });
  }
});

// ROTA: Busca todos os imóveis visíveis
app.get("/api/imoveis", async (req, res) => {
  try {
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
      ORDER BY i.data_criacao DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar imóveis:", err);
    res.status(500).json({ error: "Erro ao buscar imóveis" });
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
      [id]
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
          [decoded.userId]
        );

        if (
          userResult.rows.length === 0 ||
          userResult.rows[0].tipo_usuario !== "adm"
        ) {
          return res.status(403).json({ error: "Imóvel não disponível" });
        }
      } catch (error) {
        console.error("JWT verification error:", error);
        return res.status(403).json({ error: "Imóvel não disponível" });
      }
    }

    res.json(imovel);
  } catch (error) {
    // Changed err to error for consistency with the catch block
    console.error("Erro ao buscar imóvel:", error);
    res.status(500).json({ error: "Erro ao buscar imóvel" });
  }
});

// ROTA: Cria novo imóvel
app.post("/api/imoveis", async (req, res) => {
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
    criado_por,
    estado,
    cidade,
    bairro,
    tipo,
    coordenadas,
  } = req.body;

  // VALIDAÇÃO: Campos obrigatórios
  if (!titulo || !preco || !criado_por) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });
  }

  // VALIDAÇÃO: Verifica se usuário existe
  try {
    const usuarioExiste = await pool.query(
      "SELECT id FROM usuarios WHERE id = $1",
      [criado_por]
    );
    if (usuarioExiste.rows.length === 0) {
      return res.status(404).json({ error: "Usuário criador não encontrado" });
    }
  } catch (err) {
    console.error("Erro ao validar usuário:", err);
    return res.status(500).json({ error: "Erro ao validar usuário" });
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
    // DB QUERY: Insere novo imóvel
    const imovelResult = await pool.query(
      `INSERT INTO imoveis
        (titulo, descricao, preco, preco_destaque, destaque, status, finalidade, cep, area_total, area_construida, visivel, criado_por, estado, cidade, bairro, tipo, coordenadas)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING id`,
      [
        titulo,
        descricao || "",
        preco,
        preco_destaque || null,
        destaque || false,
        status || null,
        finalidade || null,
        cep || null,
        area_total || null,
        area_construida || null,
        visivel !== undefined ? visivel : true,
        criado_por,
        estado || null,
        cidade || null,
        bairro || null,
        tipo || null,
        coordenadas || null,
      ]
    );

    const imovelId = imovelResult.rows[0].id;
    res.status(201).json({ id: imovelId });
  } catch (err) {
    console.error("Erro ao cadastrar imóvel:", err);
    res.status(500).json({ error: "Erro ao cadastrar imóvel" });
  }
});

// ROTA: Atualiza imóvel (cria nova linha de informações no BD)
app.put("/api/imoveis/:id", async (req, res) => {
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
    atualizado_por,
    estado,
    cidade,
    bairro,
    tipo,
    coordenadas,
  } = req.body;

  // VALIDAÇÃO: Campos obrigatórios
  if (!titulo || !preco) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });
  }

  // VALIDAÇÃO: Verifica se imóvel existe
  try {
    const imovelExiste = await pool.query(
      "SELECT * FROM imoveis WHERE id = $1",
      [id]
    );
    if (imovelExiste.rows.length === 0) {
      return res.status(404).json({ error: "Imóvel não encontrado" });
    }

    const imovelAntigo = imovelExiste.rows[0];
    const precoDestiqueAnterior = imovelAntigo.preco_destaque;
    const novoPrecoDestaque = preco_destaque;

    let deveEnviarEmail = false;

    // Se adicionou preco_destaque ou se reduziu o valor
    if (
      novoPrecoDestaque &&
      (!precoDestiqueAnterior || novoPrecoDestaque < precoDestiqueAnterior)
    ) {
      deveEnviarEmail = true;
    }

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
        titulo,
        descricao || "",
        preco,
        preco_destaque || null,
        destaque || false,
        status || null,
        finalidade || null,
        cep || null,
        area_total || null,
        area_construida || null,
        visivel !== undefined ? visivel : true,
        atualizado_por || null,
        estado || null,
        cidade || null,
        bairro || null,
        tipo || null,
        coordenadas || null,
        id,
      ]
    );

    if (deveEnviarEmail) {
      const curtidasResult = await pool.query(
        `SELECT u.email, u.nome
         FROM curtidas c
         JOIN usuarios u ON u.id = c.usuario_id
         WHERE c.imovel_id = $1`,
        [id]
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
          `🔥 Oferta Especial: ${imovelAtualizado.titulo} - Nolare`,
          {
            nome: curtida.nome,
            imovel: imovelAtualizado,
          }
        )
          .then(() => {
            // Registra o envio no banco
            return pool.query(
              "INSERT INTO email_comercial (usuario_id, imovel_id) SELECT id, $2 FROM usuarios WHERE email = $1",
              [curtida.email, id]
            );
          })
          .catch((err) => {
            console.error(
              `Erro ao enviar e-mail de promoção para ${curtida.email}:`,
              err
            );
          });
      }
    }

    res.json({ message: "Imóvel atualizado com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar imóvel:", err);
    res.status(500).json({ error: "Erro ao atualizar imóvel" });
  }
});

// ROTA: Cria características do imóvel
app.post("/api/imoveis_caracteristicas", async (req, res) => {
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
      [req.body.imovel_id]
    );
    if (imovelExiste.rows.length === 0) {
      return res.status(404).json({ error: "Imóvel não encontrado" });
    }
  } catch (err) {
    console.error("Erro ao validar imóvel:", err);
    return res.status(500).json({ error: "Erro ao validar imóvel" });
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
        ","
      )}) VALUES (${placeholders})`,
      values
    );
    res
      .status(201)
      .json({ message: "Características cadastradas com sucesso!" });
  } catch (err) {
    console.error("Erro ao cadastrar características:", err);
    res.status(500).json({ error: "Erro ao cadastrar características" });
  }
});

// ROTA: Atualiza características do imóvel (cria nova linha)
app.put("/api/imoveis_caracteristicas/:imovel_id", async (req, res) => {
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

  // VALIDAÇÃO: Verifica se imóvel existe
  try {
    const imovelExiste = await pool.query(
      "SELECT id FROM imoveis WHERE id = $1",
      [imovel_id]
    );
    if (imovelExiste.rows.length === 0) {
      return res.status(404).json({ error: "Imóvel não encontrado" });
    }
  } catch (err) {
    console.error("Erro ao validar imóvel:", err);
    return res.status(500).json({ error: "Erro ao validar imóvel" });
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

  const setClauses = campos
    .map((campo, idx) => {
      if (campo === "condominio" || campo === "iptu") {
        const valor = req.body[campo];
        if (
          valor === undefined ||
          valor === null ||
          valor === 0 ||
          valor === "0"
        ) {
          return `${campo} = NULL`;
        }
        return `${campo} = $${idx + 1}`;
      }
      return `${campo} = $${idx + 1}`;
    })
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

    return valor !== undefined && valor !== null && valor !== "" ? valor : null;
  });

  try {
    const query = `UPDATE imoveis_caracteristicas
       SET ${setClauses}
       WHERE imovel_id = $${campos.length + 1}`;

    await pool.query(query, [...values, imovel_id]);

    res
      .status(200)
      .json({ message: "Características atualizadas com sucesso!" });
  } catch (err) {
    console.error("[v0] Erro ao atualizar características:", err);
    console.error("[v0] Query values:", values);
    console.error("[v0] Body recebido:", req.body);
    res.status(500).json({
      error: "Erro ao atualizar características",
      details: err.message,
    });
  }
});

// =========================

// ROTAS DE UPLOAD DE FOTOS

// =========================

// ROTA: Upload de fotos do imóvel
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "public/fotos_imoveis";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(
        file.originalname
      )}`
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Aceita apenas imagens
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos de imagem são permitidos"));
    }
  },
});

const uploadFotos = upload.array("fotos", 10);

app.post("/api/imoveis/:id/upload", uploadFotos, async (req, res) => {
  const { id } = req.params;

  // VALIDAÇÃO: Verifica se arquivos foram enviados
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "Arquivos não enviados" });
  }

  // VALIDAÇÃO: Verifica se imóvel existe
  try {
    const imovelExiste = await pool.query(
      "SELECT id FROM imoveis WHERE id = $1",
      [id]
    );
    if (imovelExiste.rows.length === 0) {
      return res.status(404).json({ error: "Imóvel não encontrado" });
    }
  } catch (err) {
    console.error("Erro ao validar imóvel:", err);
    return res.status(500).json({ error: "Erro ao validar imóvel" });
  }

  try {
    const fotosInseridas = [];

    // Processa fotos
    for (const file of req.files) {
      const caminho = `/fotos_imoveis/${file.filename}`;
      const result = await pool.query(
        "INSERT INTO fotos_imoveis (imovel_id, caminho_foto) VALUES ($1, $2) RETURNING *",
        [id, caminho]
      );
      fotosInseridas.push(result.rows[0]);
    }

    res.status(201).json(fotosInseridas);
  } catch (err) {
    console.error("Erro ao salvar fotos no banco:", err);
    res.status(500).json({ error: "Erro ao salvar fotos no banco" });
  }
});

// ROTA: Deleta foto do imóvel
app.delete("/api/fotos/:id", async (req, res) => {
  const { id } = req.params;

  // VALIDAÇÃO: Campo obrigatório
  if (!id) {
    return res.status(400).json({ error: "id da foto é obrigatório" });
  }

  try {
    // DB QUERY: Busca foto para obter o caminho
    const fotoResult = await pool.query(
      "SELECT * FROM fotos_imoveis WHERE id = $1",
      [id]
    );

    if (fotoResult.rows.length === 0) {
      return res.status(404).json({ error: "Foto não encontrada" });
    }

    const foto = fotoResult.rows[0];

    // DB QUERY: Deleta foto do banco de dados
    await pool.query("DELETE FROM fotos_imoveis WHERE id = $1", [id]);

    // Deleta arquivo físico se existir
    const filePath = `public${foto.caminho_foto}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: "Foto deletada com sucesso!" });
  } catch (err) {
    console.error("Erro ao deletar foto:", err);
    res.status(500).json({ error: "Erro ao deletar foto" });
  }
});

// =========================
// ROTAS DE ADMINISTRAÇÃO
// =========================

app.post("/api/admin/adicionar-admin", async (req, res) => {
  const { nome, email, senha } = req.body;

  // VALIDAÇÃO: Campos obrigatórios
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  try {
    // DB QUERY: Verifica se email já existe
    const emailExiste = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (emailExiste.rows.length > 0) {
      return res.status(400).json({ error: "Este email já está cadastrado" });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Insere diretamente na tabela usuarios com tipo_usuario = 'adm'
    const result = await pool.query(
      "INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, tipo_usuario, data_criacao",
      [nome, email, senhaHash, "adm"]
    );

    res.status(201).json({
      success: true,
      user: result.rows[0],
      message: "Administrador cadastrado com sucesso!",
    });
  } catch (err) {
    console.error("Erro ao cadastrar administrador:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});
// </CHANGE>

// =========================
// MIDDLEWARE DE TRATAMENTO DE ERROS DO MULTER
// =========================

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "Arquivo muito grande. O tamanho máximo é 10MB." });
    }
    return res.status(400).json({ error: `Erro no upload: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// =========================
// FRONTEND (VITE BUILD)
// =========================

// Serve os arquivos estáticos do React/Vite
app.use(express.static(path.resolve("dist")));

// Fallback para SPA (React Router)
app.get("/*", (req, res) => {
  res.sendFile(path.resolve("dist", "index.html"));
});

// =========================
// INICIA O SERVIDOR
// =========================

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
