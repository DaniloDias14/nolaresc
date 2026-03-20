// TEMPLATE DE E-MAIL: Promocao de imovel curtido (padrao visual alinhado ao site)
// Layout compativel (Gmail/Outlook): tabelas + estilos inline

export default function PromocaoCurtidas({ nome, imovel }) {
  const anoAtual = new Date().getFullYear();

  const precoOriginal = imovel?.preco
    ? Number.parseFloat(imovel.preco).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    : "Nao informado";

  const precoPromocional = imovel?.preco_destaque
    ? Number.parseFloat(imovel.preco_destaque).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    : "Nao informado";

  const urlImovel = `${
    process.env.FRONTEND_URL || "http://localhost:3000"
  }/imovel/${imovel?.id}`;

  const nomeSeguro = nome || "tudo bem?";
  const titulo = imovel?.titulo || "Imovel em destaque";
  const descricao =
    imovel?.descricao || "Um imovel que voce curtiu recebeu uma atualizacao.";

  const preheader = "Atualizacao: um imovel curtido esta com preco promocional.";

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>Preco promocional</title>
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
                  Atualizacao de preco
                </div>
              </td>
            </tr>

            <!-- Conteudo -->
            <tr>
              <td style="padding:22px 22px 10px 22px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1a1a1a;">
                  <strong>Ola, ${nomeSeguro}.</strong><br />
                  O imovel que voce curtiu recebeu um preco promocional. Veja os detalhes abaixo.
                </div>
              </td>
            </tr>

            <!-- Card do imovel -->
            <tr>
              <td style="padding:0 22px 14px 22px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#f7f7fb;border:1px solid rgba(25,25,112,0.16);border-radius:12px;">
                  <tr>
                    <td style="padding:16px 14px;">
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.3;color:#191970;font-weight:800;">
                        ${titulo}
                      </div>
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#666666;margin-top:8px;">
                        ${descricao}
                      </div>

                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin-top:14px;background-color:#ffffff;border:1px solid rgba(25,25,112,0.10);border-radius:10px;">
                        <tr>
                          <td style="padding:12px 12px;">
                            <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#666666;">
                              Preco original
                            </div>
                            <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.4;color:#777777;text-decoration:line-through;margin-top:4px;">
                              ${precoOriginal}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:0 12px 12px 12px;">
                            <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#666666;">
                              Preco promocional
                            </div>
                            <div style="font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:1.3;color:#191970;font-weight:900;margin-top:4px;">
                              ${precoPromocional}
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- CTA -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:16px;">
                        <tr>
                          <td bgcolor="#191970" style="border-radius:10px;">
                            <a href="${urlImovel}" style="display:inline-block;padding:12px 18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.2;color:#ffffff;text-decoration:none;font-weight:700;border-radius:10px;">
                              Ver imovel
                            </a>
                          </td>
                        </tr>
                      </table>
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

