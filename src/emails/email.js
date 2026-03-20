import nodemailer from "nodemailer";

import VerificarCadastro from "./Conta/VerificarCadastro.js";
import RecuperarSenha from "./Conta/RecuperarSenha.js";
import LoginDetectado from "./Conta/LoginDetectado.js";
import PromocaoCurtidas from "./Comercial/PromocaoCurtidas.js";

const templates = {
  verificarCadastro: VerificarCadastro,
  recuperarSenha: RecuperarSenha,
  loginDetectado: LoginDetectado,
  promocaoCurtidas: PromocaoCurtidas,
};

function renderTemplate(templateFunction, props) {
  return templateFunction(props);
}

// Mascara e-mail em logs para evitar expor dados pessoais (ex.: jo***@gmail.com)
function mascararEmail(email) {
  if (!email || typeof email !== "string") return "";
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const prefix = (user || "").slice(0, 2);
  return `${prefix}***@${domain}`;
}

export async function enviarEmail(templateKey, to, subject, props) {
  const port = Number(process.env.EMAIL_PORT);
  const secure = port === 465;

  // OBS: por padrao mantemos validacao de TLS ativa.
  // Se houver problema de certificado no ambiente, e possivel ajustar via env:
  // EMAIL_TLS_REJECT_UNAUTHORIZED=false (ou 0) para desabilitar (nao recomendado).
  const tlsEnv = String(process.env.EMAIL_TLS_REJECT_UNAUTHORIZED || "").toLowerCase();
  const rejectUnauthorized = !["false", "0"].includes(tlsEnv);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Para porta 587 (STARTTLS), garante que o upgrade para TLS seja exigido.
    ...(secure ? {} : { requireTLS: true }),
    tls: {
      rejectUnauthorized,
    },
  });

  const Template = templates[templateKey];
  if (!Template) {
    throw new Error(`Template não encontrado: ${templateKey}`);
  }

  const html = renderTemplate(Template, props);

  try {
    return await transporter.sendMail({
      from: `"Nolare" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    // Log com dados minimamente suficientes para debug em producao (sem expor e-mail completo).
    console.error("[EMAIL] Falha ao enviar e-mail", {
      templateKey,
      to: mascararEmail(to),
      subject,
      message: err?.message,
      code: err?.code,
    });
    throw err;
  }
}
