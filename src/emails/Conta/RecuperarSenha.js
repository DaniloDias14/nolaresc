// TEMPLATE DE E-MAIL: Recuperacao de senha (padrao visual alinhado ao site)
// Requisitos:
// - Codigo na primeira linha (para aparecer na notificacao)
// - Layout compativel (Gmail/Outlook): tabelas + estilos inline

export default function RecuperarSenha({ nome, codigo }) {
  const anoAtual = new Date().getFullYear();
  const nomeSeguro = nome || "tudo bem?";

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>Recuperacao de senha</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f0efe2;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f0efe2;">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border:1px solid rgba(25,25,112,0.12);border-radius:16px;overflow:hidden;">
            <!-- Primeira linha (visivel): codigo para notificacao -->
            <tr>
              <td style="padding:16px 22px 10px 22px;font-family:Arial,Helvetica,sans-serif;color:#191970;font-size:16px;line-height:1.3;font-weight:700;">
                Codigo de recuperacao: <span style="font-family:Courier New,monospace;letter-spacing:2px;">${codigo}</span>
              </td>
            </tr>

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
              <td style="padding:22px 22px 8px 22px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1a1a1a;">
                  <strong>Ola, ${nomeSeguro}.</strong><br />
                  Recebemos uma solicitacao para redefinir a senha da sua conta. Para continuar, informe o codigo abaixo. Ele expira em <strong>10 minutos</strong>.
                </div>
              </td>
            </tr>

            <!-- Codigo em destaque -->
            <tr>
              <td align="center" style="padding:14px 22px 10px 22px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:520px;background-color:#f7f7fb;border:1px solid rgba(25,25,112,0.16);border-radius:12px;">
                  <tr>
                    <td align="center" style="padding:18px 14px;">
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#666666;">
                        Codigo de recuperacao
                      </div>
                      <div style="font-family:Courier New,monospace;font-size:34px;line-height:1.2;letter-spacing:6px;color:#191970;font-weight:700;margin-top:10px;">
                        ${codigo}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Aviso de seguranca -->
            <tr>
              <td style="padding:10px 22px 18px 22px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#fff3f3;border:1px solid rgba(220,53,69,0.25);border-radius:12px;">
                  <tr>
                    <td style="padding:14px 14px;">
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#7a1c27;">
                        <strong>Seguranca:</strong> se voce nao solicitou a redefinicao de senha, ignore este e-mail. Se desconfiar de acesso indevido, altere sua senha assim que possivel.
                      </div>
                    </td>
                  </tr>
                </table>
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
