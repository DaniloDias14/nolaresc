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

export async function enviarEmail(templateKey, to, subject, props) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const Template = templates[templateKey];
  if (!Template) {
    throw new Error(`Template não encontrado: ${templateKey}`);
  }

  const html = renderTemplate(Template, props);

  return transporter.sendMail({
    from: `"Nolare" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
