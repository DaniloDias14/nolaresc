// TEMPLATE DE E-MAIL: Alerta de login detectado (padrao visual alinhado ao site)
// Layout compativel (Gmail/Outlook): tabelas + estilos inline

export default function LoginDetectado({ nome, dataHora }) {
  const anoAtual = new Date().getFullYear();
  const nomeSeguro = nome || "tudo bem?";
  const dataHoraSeguro = dataHora || "Nao informado";

  const preheader = "Alerta de seguranca: novo login detectado na sua conta.";

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>Novo login detectado</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f0efe2;">
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#f0efe2;opacity:0;">
      ${preheader}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f0efe2;">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border:1px solid rgba(25,25,112,0.12);border-radius:16px;overflow:hidden;">
            <!-- Header -->
            <tr>
              <td style="background-color:#191970;padding:18px 22px;text-align:left;">
                <div style="font-family:Georgia,Times,serif;font-size:22px;line-height:1.2;color:#ffffff;font-weight:700;">
                  Nolare
                </div>
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;color:rgba(255,255,255,0.9);margin-top:4px;">
                  Transformando lugares em lares
                </div>
              </td>
            </tr>

            <!-- Conteudo -->
            <tr>
              <td style="padding:22px 22px 10px 22px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1a1a1a;">
                  <strong>Ola, ${nomeSeguro}.</strong><br />
                  Identificamos um novo acesso a sua conta. Este e um aviso automatico para ajudar na sua seguranca.
                </div>
              </td>
            </tr>

            <!-- Detalhes -->
            <tr>
              <td style="padding:0 22px 14px 22px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#f7f7fb;border:1px solid rgba(25,25,112,0.16);border-radius:12px;">
                  <tr>
                    <td style="padding:14px 14px;">
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#666666;">
                        Data e hora do acesso
                      </div>
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.4;color:#191970;font-weight:700;margin-top:6px;">
                        ${dataHoraSeguro}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Orientacao -->
            <tr>
              <td style="padding:0 22px 18px 22px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#666666;">
                  Se foi voce quem realizou este acesso, nao e necessario fazer nada.<br />
                  Se nao reconhece esta atividade, recomendamos alterar sua senha imediatamente.
                </div>
              </td>
            </tr>

            <!-- Rodape -->
            <tr>
              <td style="background-color:#faf9f3;border-top:1px solid rgba(25,25,112,0.10);padding:16px 22px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#666666;">
                  Este e um e-mail automatico. Por favor, nao responda.<br />
                  <span style="color:#191970;font-weight:700;">Nolare</span> | nolaresc.com.br
                </div>
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#666666;margin-top:6px;">
                  &copy; ${anoAtual} Nolare Imobiliaria. Todos os direitos reservados.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

