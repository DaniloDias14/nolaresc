// MÓDULO DE E-MAILS - NOLARE
// Sistema unificado de renderização e envio de e-mails usando templates

import nodemailer from "nodemailer";

// Importação dos templates de conta
import VerificarCadastro from "./Conta/VerificarCadastro.js";
import RecuperarSenha from "./Conta/RecuperarSenha.js";
import LoginDetectado from "./Conta/LoginDetectado.js";

// Importação dos templates comerciais
import PromocaoCurtidas from "./Comercial/PromocaoCurtidas.js";

// MAPEAMENTO: Chave do template → Componente
const templates = {
  verificarCadastro: VerificarCadastro,
  recuperarSenha: RecuperarSenha,
  loginDetectado: LoginDetectado,
  promocaoCurtidas: PromocaoCurtidas,
};

// FUNÇÃO: Renderiza template em HTML completo
function renderTemplate(templateFunction, props) {
  const html = templateFunction(props);
  return html;
}

// FUNÇÃO: Envia e-mail usando template específico
export async function enviarEmail(templateKey, to, subject, props) {
  // Valida se o template existe
  const Template = templates[templateKey];
  if (!Template) {
    throw new Error(`Template não encontrado: ${templateKey}`);
  }

  // Renderiza o template em HTML
  const html = renderTemplate(Template, props);

  // Configura o transporte SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Envia o e-mail
  return transporter.sendMail({
    from: `"Nolare" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
