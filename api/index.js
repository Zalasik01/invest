module.exports = function handler(req, res) {
  res.status(200).send(`
    <html>
      <head>
        <title>InvestBot - Status</title>
        <style>
          body { font-family: sans-serif; text-align: center; padding: 50px; background: #f0f2f5; color: #333; }
          .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: inline-block; }
          h1 { color: #0088cc; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🤖 InvestBot</h1>
          <p>O servidor do bot está <strong>ONLINE</strong> e rodando na Vercel.</p>
          <p><em>Webhook aguardando mensagens no Telegram.</em></p>
        </div>
      </body>
    </html>
  `);
};
