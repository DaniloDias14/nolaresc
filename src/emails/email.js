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

// Texto alternativo (plain-text) para melhor compatibilidade e para ajudar a exibir o codigo no preview/notificacao.
// Mantemos o codigo na primeira linha nos fluxos de verificacao/recuperacao.
function renderText(templateKey, props) {
  try {
    if (!templateKey) return undefined;

    switch (templateKey) {
      case "verificarCadastro": {
        const codigo = props?.codigo || "";
        const nome = props?.nome || "";
        return `Codigo de verificacao: ${codigo}\n\nOla, ${nome}.\nUse este codigo para confirmar seu cadastro na Nolare. Ele e valido por 10 minutos.\n\nSe voce nao solicitou este cadastro, ignore este e-mail.`;
      }
      case "recuperarSenha": {
        const codigo = props?.codigo || "";
        const nome = props?.nome || "";
        return `Codigo de recuperacao: ${codigo}\n\nOla, ${nome}.\nRecebemos uma solicitacao para redefinir sua senha. Use o codigo acima para continuar. Ele e valido por 10 minutos.\n\nSe voce nao solicitou, ignore este e-mail.`;
      }
      case "loginDetectado": {
        const nome = props?.nome || "";
        const dataHora = props?.dataHora || "Nao informado";
        return `Alerta de seguranca: novo login detectado.\n\nOla, ${nome}.\nData e hora do acesso: ${dataHora}\n\nSe nao reconhece esta atividade, recomendamos alterar sua senha imediatamente.`;
      }
      case "promocaoCurtidas": {
        const nome = props?.nome || "";
        const titulo = props?.imovel?.titulo || "Imovel";
        const id = props?.imovel?.id;
        const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const url = id ? `${baseUrl}/imovel/${id}` : baseUrl;
        return `Atualizacao de preco: imovel curtido com preco promocional.\n\nOla, ${nome}.\nImovel: ${titulo}\nLink: ${url}`;
      }
      default:
        return undefined;
    }
  } catch {
    // Se falhar, seguimos apenas com o HTML.
    return undefined;
  }
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
  const text = renderText(templateKey, props);

  return transporter.sendMail({
    from: `"Nolare" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    ...(text ? { text } : {}),
  });
}
