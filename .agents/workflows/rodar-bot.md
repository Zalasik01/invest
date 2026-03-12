---
description: como rodar o bot localmente
---

# Rodar o Bot

// turbo-all

1. Copiar variáveis de ambiente (se ainda não existir `.env`):
```bash
cp .env.example .env
```

2. Instalar dependências:
```bash
npm install
```

3. Iniciar o bot em modo desenvolvimento (auto-restart):
```bash
npm run dev
```

4. Ou iniciar em modo produção:
```bash
npm start
```

5. Verificar no terminal se aparece:
```
✅ Gemini AI inicializado (gemini-2.5-flash)
✅ InvestBot rodando! Aguardando mensagens...
```
