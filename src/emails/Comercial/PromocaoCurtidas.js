// TEMPLATE DE E-MAIL: Promoção de Imóveis Curtidos

export default function PromocaoCurtidas({ nome, imovel }) {
  const anoAtual = new Date().getFullYear();

  const precoOriginal = imovel.preco
    ? Number.parseFloat(imovel.preco).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    : "Não informado";

  const precoPromocional = imovel.preco_destaque
    ? Number.parseFloat(imovel.preco_destaque).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    : "Não informado";

  const urlImovel = `${
    process.env.FRONTEND_URL || "http://localhost:3000"
  }/imovel/${imovel.id}`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px 20px;
      }
      .email-wrapper {
        max-width: 600px;
        margin: 0 auto;
      }
      .email-container {
        background-color: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }
      .email-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px 30px;
        text-align: center;
        position: relative;
      }
      .promo-badge {
        display: inline-block;
        background-color: #fbbf24;
        color: #78350f;
        padding: 8px 20px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 15px;
      }
      .logo {
        font-size: 32px;
        font-weight: bold;
        color: #ffffff;
        margin-bottom: 10px;
        letter-spacing: 2px;
      }
      .header-subtitle {
        color: rgba(255, 255, 255, 0.9);
        font-size: 18px;
        font-weight: 600;
      }
      .email-content {
        padding: 40px 30px;
      }
      .greeting {
        font-size: 24px;
        color: #1a202c;
        margin-bottom: 20px;
        font-weight: 600;
      }
      .message {
        color: #4a5568;
        font-size: 16px;
        line-height: 1.6;
        margin-bottom: 30px;
      }
      .property-card {
        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
        border-radius: 12px;
        padding: 30px;
        margin: 30px 0;
        border: 2px solid #e2e8f0;
      }
      .property-title {
        font-size: 22px;
        font-weight: bold;
        color: #1a202c;
        margin-bottom: 12px;
      }
      .property-description {
        color: #718096;
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 25px;
      }
      .price-section {
        background-color: #ffffff;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }
      .price-label {
        color: #718096;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 5px;
      }
      .price-original {
        text-decoration: line-through;
        color: #a0aec0;
        font-size: 18px;
        margin-bottom: 8px;
      }
      .price-promo {
        font-size: 36px;
        font-weight: bold;
        color: #667eea;
        margin-bottom: 5px;
      }
      .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #ffffff;
        text-decoration: none;
        padding: 16px 40px;
        border-radius: 8px;
        font-weight: 600;
        margin-top: 20px;
        text-align: center;
        font-size: 16px;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      }
      .email-footer {
        background-color: #f7fafc;
        padding: 30px;
        text-align: center;
        border-top: 1px solid #e2e8f0;
      }
      .footer-text {
        color: #718096;
        font-size: 13px;
        line-height: 1.6;
      }
      .footer-brand {
        color: #667eea;
        font-weight: 600;
        margin-top: 10px;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <div class="email-container">
        <div class="email-header">
          <div class="promo-badge">🔥 Oferta Especial</div>
          <div class="logo">NOLARE</div>
          <div class="header-subtitle"> Transformando lugares em lares</div>
        </div>
        
        <div class="email-content">
          <div class="greeting">Olá, ${nome}!</div>
          
          <div class="message">
            Temos uma excelente notícia! O imóvel que você curtiu está em 
            <strong>PREÇO PROMOCIONAL</strong>. Esta é uma oportunidade única 
            que você não pode perder!
          </div>

          <div class="property-card">
            <div class="property-title">${imovel.titulo}</div>
            <div class="property-description">
              ${
                imovel.descricao ||
                "Imóvel exclusivo com características especiais"
              }
            </div>

            <div class="price-section">
              <div class="price-label">Preço Original</div>
              <div class="price-original">${precoOriginal}</div>
              
              <div class="price-label" style="margin-top: 15px;">Preço Promocional</div>
              <div class="price-promo">${precoPromocional}</div>
            </div>

            <center>
              <a href="${urlImovel}" class="cta-button">
                VER IMÓVEL AGORA →
              </a>
            </center>
          </div>

          <div class="message">
            Não perca esta oportunidade única! Entre em contato conosco para mais 
            informações.
          </div>
        </div>

        <div class="email-footer">
          <div class="footer-text">
            Este é um e-mail automático. Por favor, não responda.
          </div>
          <div class="footer-brand">
            © ${anoAtual} Nolare Imobiliária. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}
