// TEMPLATE DE E-MAIL: Verificacao de cadastro (padrao visual alinhado ao site)
// Requisitos:
// - Layout compativel (Gmail/Outlook): tabelas + estilos inline

export default function VerificarCadastro({ nome, codigo }) {
  const anoAtual = new Date().getFullYear();

  // SEGURANCA: evita injecao de HTML no conteudo do e-mail.
  const escapeHtml = (value) =>
    String(value || "").replace(/[&<>"']/g, (ch) => {
      switch (ch) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        case "'":
          return "&#39;";
        default:
          return ch;
      }
    });

  const nomeEsc = escapeHtml(nome || "");

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>Verifica&ccedil;&atilde;o de cadastro</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f0efe2;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f0efe2;">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border:1px solid rgba(25,25,112,0.12);border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background-color:#191970;height:6px;line-height:6px;font-size:0;">
                &nbsp;
              </td>
            </tr>

            <!-- Conteudo -->
            <tr>
              <td style="padding:22px 22px 8px 22px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1a1a1a;">
                  <strong>Ol&aacute;${nomeEsc ? `, ${nomeEsc}.` : "!"}</strong><br />
                  Para concluir seu cadastro, utilize o c&oacute;digo de verifica&ccedil;&atilde;o abaixo. Ele expira em <strong>10 minutos</strong>.
                </div>
              </td>
            </tr>

            <!-- Observacao -->
            <tr>
              <td style="padding:10px 22px 18px 22px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#666666;">
                  Se voc&ecirc; n&atilde;o solicitou este cadastro, basta ignorar este e-mail.
                </div>
              </td>
            </tr>

            <!-- Aviso de seguranca (mensagem vermelha) -->
            <tr>
              <td style="padding:0 22px 18px 22px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#fff3f3;border:1px solid rgba(220,53,69,0.25);border-radius:12px;">
                  <tr>
                    <td style="padding:14px 14px;">
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#7a1c27;">
                        <strong>Seguran&ccedil;a:</strong> se voc&ecirc; n&atilde;o solicitou este cadastro ou n&atilde;o reconhece esta atividade, entre em contato com o nosso
                        <a href="https://www.youtube.com/" style="color:#191970;text-decoration:underline;font-weight:700;">suporte</a>.
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Codigo em destaque (parte de baixo) -->
            <tr>
              <td align="center" style="padding:0 22px 18px 22px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:520px;background-color:#f7f7fb;border:1px solid rgba(25,25,112,0.16);border-radius:12px;">
                  <tr>
                    <td align="center" style="padding:18px 14px;">
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#666666;">
                        C&oacute;digo de verifica&ccedil;&atilde;o
                      </div>
                      <div style="font-family:Courier New,monospace;font-size:34px;line-height:1.2;letter-spacing:6px;color:#191970;font-weight:700;margin-top:10px;">
                        ${codigo}
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
                  Este &eacute; um e-mail autom&aacute;tico. Por favor, n&atilde;o responda.<br />
                  <span style="color:#191970;font-weight:700;">Nolare</span> | nolaresc.com.br
                </div>
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#666666;margin-top:6px;">
                  &copy; ${anoAtual} Nolare. Todos os direitos reservados.
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
