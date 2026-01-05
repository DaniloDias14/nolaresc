// TEMPLATE DE E-MAIL: Verificação de Cadastro

export default function VerificarCadastro({ nome, codigo }) {
  const anoAtual = new Date().getFullYear();

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
        font-size: 14px;
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
      .code-section {
        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
        border-radius: 12px;
        padding: 30px;
        text-align: center;
        margin: 30px 0;
        border: 2px solid #e2e8f0;
      }
      .code-label {
        color: #718096;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 15px;
        font-weight: 600;
      }
      .code {
        font-size: 42px;
        font-weight: bold;
        color: #667eea;
        letter-spacing: 12px;
        font-family: 'Courier New', monospace;
        text-shadow: 2px 2px 4px rgba(102, 126, 234, 0.1);
      }
      .info-box {
        background-color: #fef5e7;
        border-left: 4px solid #f59e0b;
        padding: 16px 20px;
        margin: 25px 0;
        border-radius: 4px;
      }
      .info-box-title {
        color: #92400e;
        font-weight: 600;
        margin-bottom: 8px;
        font-size: 14px;
      }
      .info-box-text {
        color: #78350f;
        font-size: 14px;
        line-height: 1.5;
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
          <div class="logo">NOLARE</div>
          <div class="header-subtitle">Transformando lugares em lares</div>
        </div>
        
        <div class="email-content">
          <div class="greeting">Olá, ${nome}!</div>
          
          <div class="message">
            Bem-vindo(a) à Nolare! Estamos muito felizes em tê-lo(a) conosco. 
            Para concluir seu cadastro e começar a explorar nossos imóveis, 
            utilize o código de verificação abaixo:
          </div>

          <div class="code-section">
            <div class="code-label">Seu Código de Verificação</div>
            <div class="code">${codigo}</div>
          </div>

          <div class="info-box">
            <div class="info-box-title">⏰ Informação Importante</div>
            <div class="info-box-text">
              Este código é válido por apenas <strong>10 minutos</strong>. 
              Caso expire, você poderá solicitar um novo código facilmente.
            </div>
          </div>

          <div class="message">
            Se você não solicitou este cadastro, pode ignorar este e-mail com segurança.
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
