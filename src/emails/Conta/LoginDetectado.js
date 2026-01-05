// TEMPLATE DE E-MAIL: Login Detectado

export default function LoginDetectado({ nome, dataHora }) {
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
      .info-box {
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        border-left: 4px solid #10b981;
        padding: 20px;
        margin: 25px 0;
        border-radius: 4px;
      }
      .info-label {
        color: #065f46;
        font-weight: 600;
        font-size: 13px;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .info-value {
        color: #064e3b;
        font-size: 18px;
        font-weight: 600;
      }
      .warning-box {
        background-color: #fee;
        border-left: 4px solid #ef4444;
        padding: 16px 20px;
        margin: 25px 0;
        border-radius: 4px;
      }
      .warning-box-title {
        color: #991b1b;
        font-weight: 600;
        margin-bottom: 8px;
        font-size: 14px;
      }
      .warning-box-text {
        color: #7f1d1d;
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
            Detectamos um novo acesso à sua conta na Nolare. 
            Este é um alerta de segurança para manter você informado sobre as atividades da sua conta.
          </div>

          <div class="info-box">
            <div class="info-label">📅 Data e Hora do Acesso</div>
            <div class="info-value">${dataHora}</div>
          </div>

          <div class="message">
            Se foi você quem realizou este login, pode ignorar este e-mail. 
            Sua conta está segura e funcionando normalmente.
          </div>

          <div class="warning-box">
            <div class="warning-box-title">🔒 Não Reconhece Esta Atividade?</div>
            <div class="warning-box-text">
              Se você <strong>não reconhece</strong> este acesso, 
              recomendamos alterar sua senha imediatamente e entrar em contato conosco 
              para garantir a segurança da sua conta.
            </div>
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
