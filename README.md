<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram"/>
  <img src="https://img.shields.io/badge/Google%20Gemini-886FBF?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini AI"/>
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite"/>
</p>

<h1 align="center">🤖 InvestBot</h1>

<p align="center">
  <b>Assistente de investimentos inteligente no Telegram</b><br/>
  Focado em <b>renda passiva mensal</b> para investidores iniciantes da plataforma Itaú íon
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-em%20desenvolvimento-yellow?style=flat-square" alt="Status"/>
  <img src="https://img.shields.io/badge/license-ISC-blue?style=flat-square" alt="License"/>
  <img src="https://img.shields.io/badge/versão-1.0.0-green?style=flat-square" alt="Version"/>
</p>

---

## 📋 Sobre

O **InvestBot** é um bot para Telegram que funciona como um mentor de investimentos pessoal. Ele utiliza a **API do Google Gemini AI** para analisar o mercado e recomendar investimentos acessíveis via **Itaú íon**, com foco em ativos que pagam **dividendos mensais** (FIIs, Fiagros, ETFs e ações).

### ✨ Por que usar o InvestBot?

| Benefício | Descrição |
|---|---|
| 🎯 **Filtra o ruído** | Em vez de ler 10 portais, receba o resumo de como o mercado afeta seu bolso |
| 📊 **Faz a conta** | Projeção automática de rendimento sobre o capital investido |
| ⚠️ **Evita erros** | Lembra de verificar Data Com, preço médio e diversificação |
| 💬 **Sempre disponível** | Tire dúvidas sobre investimentos a qualquer hora, direto no Telegram |

---

## 🚀 Funcionalidades

### Comandos

| Comando | Descrição | Exemplo |
|---|---|---|
| `/start` | Mensagem de boas-vindas e introdução | `/start` |
| `/investir <valor>` | Recomendação completa de investimento | `/investir 300` |
| `/carteira` | Visualizar carteira salva | `/carteira` |
| `/carteira <ativos>` | Salvar/atualizar carteira de ativos | `/carteira MXRF11 11, PETR3 2` |
| `/help` | Lista de comandos disponíveis | `/help` |

### 💬 Conversa Livre

Além dos comandos, você pode enviar qualquer mensagem sobre investimentos e o bot responde com contexto inteligente, levando em conta seu histórico de conversas e sua carteira salva.

### 📈 Formato de Recomendação

Ao usar `/investir`, o bot retorna uma análise estruturada:

```
📊 Análise de Momento
   Cenário econômico atual em até 3 linhas

💰 Recomendação de Alocação
   Ex: 70% Dividendos Mensais / 30% Crescimento

🔍 Ativos Selecionados
   Lista de ativos com código, motivo e tag [PAGAMENTO MENSAL]

📈 Estimativa de Retorno
   "Investindo R$ X → retorno estimado de R$ Y/mês"
```

---

## 🛠️ Tecnologias

- **[Node.js](https://nodejs.org/)** — Runtime JavaScript
- **[node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)** — Integração com a API do Telegram
- **[Google Generative AI](https://ai.google.dev/)** — Gemini 2.0 Flash (gratuito)
- **[better-sqlite3](https://github.com/WiseLibs/better-sqlite3)** — Banco de dados local para histórico
- **[dotenv](https://github.com/motdotla/dotenv)** — Variáveis de ambiente

---

## 📁 Estrutura do Projeto

```
invest/
├── 📄 index.js               # Entry point da aplicação
├── 📄 package.json            # Dependências e scripts
├── 📄 .env.example            # Template de variáveis de ambiente
├── 📄 .gitignore              # Arquivos ignorados pelo Git
└── 📂 src/
    ├── 📄 config.js           # System prompt do agente + mensagens
    ├── 📄 gemini.js           # Integração com Gemini AI
    ├── 📄 database.js         # SQLite - histórico e carteiras
    ├── 📄 bot.js              # Bot Telegram + handlers
    └── 📂 commands/
        ├── 📄 start.js        # /start - boas-vindas
        ├── 📄 investir.js     # /investir - recomendação
        ├── 📄 carteira.js     # /carteira - gerenciar ativos
        └── 📄 help.js         # /help - ajuda
```

---

## ⚡ Instalação e Configuração

### Pré-requisitos

- **Node.js** 18+ instalado ([download](https://nodejs.org/))
- Conta no **Telegram**
- Conta no **Google AI Studio** (gratuita)

### 1️⃣ Clone o repositório

```bash
git clone https://github.com/seu-usuario/invest-bot.git
cd invest-bot
```

### 2️⃣ Instale as dependências

```bash
npm install
```

### 3️⃣ Crie o bot no Telegram

1. Abra o Telegram e procure **[@BotFather](https://t.me/BotFather)**
2. Envie `/newbot`
3. Escolha um **nome** e um **username** para o bot
4. Copie o **token** que o BotFather enviar

### 4️⃣ Gere a API Key do Gemini

1. Acesse **[Google AI Studio](https://aistudio.google.com/apikey)**
2. Clique em **"Create API Key"**
3. Copie a chave gerada

> 💡 O tier gratuito inclui **15 requisições por minuto** e **1 milhão de tokens por dia** — mais que suficiente para uso pessoal.

### 5️⃣ Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas chaves:

```env
TELEGRAM_BOT_TOKEN=seu_token_do_botfather_aqui
GEMINI_API_KEY=sua_api_key_do_google_aqui
```

### 6️⃣ Inicie o bot

```bash
# Produção
npm start

# Desenvolvimento (auto-restart ao salvar)
npm run dev
```

Se tudo estiver certo, você verá:

```
✅ Gemini AI inicializado (gemini-2.0-flash)
🤖 InvestBot iniciando...
✅ InvestBot rodando! Aguardando mensagens...
```

---

## 💡 Exemplos de Uso

### Primeira configuração
```
Você: /start
Bot:  🤖 Bem-vindo ao InvestBot! ...

Você: /carteira MXRF11 11, PETR3 2, ITUB4 1
Bot:  ✅ Carteira salva com sucesso!
```

### Pedindo recomendação
```
Você: /investir 500
Bot:  📊 Análise de Momento
      A Selic em 13,25% favorece ativos de renda fixa...
      💰 Recomendação: 70% Dividendos / 30% Crescimento
      🔍 MXRF11, HGLG11, KNRI11...
      📈 Retorno estimado: R$ 4,50/mês
```

### Conversa livre
```
Você: O que são FIIs e por que pagar dividendos mensais?
Bot:  FIIs (Fundos de Investimento Imobiliário) são...
```

---

## 🗄️ Banco de Dados

O bot utiliza **SQLite** (local, sem necessidade de servidor) com as seguintes tabelas:

### `mensagens`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id_mensagem` | INTEGER (PK) | Identificador único |
| `idUsuario` | TEXT | ID do usuário no Telegram |
| `papel` | TEXT | `'user'` ou `'model'` |
| `conteudo` | TEXT | Conteúdo da mensagem |
| `criadoEm` | DATETIME | Data/hora de criação |

### `carteiras`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id_carteira` | INTEGER (PK) | Identificador único |
| `idUsuario` | TEXT (UNIQUE) | ID do usuário no Telegram |
| `ativos` | TEXT (JSON) | Array de ativos `[{codigo, quantidade}]` |
| `atualizadoEm` | DATETIME | Última atualização |

---

## 🗺️ Roadmap

- [x] Bot básico com Gemini AI
- [x] Comando `/investir` com recomendação estruturada
- [x] Histórico de conversas persistente
- [x] Gestão de carteira (`/carteira`)
- [ ] Integração com APIs de cotações em tempo real
- [ ] Alertas de oportunidade (queda de preço, Data Com)
- [ ] Dashboard web com relatórios
- [ ] Suporte ao WhatsApp
- [ ] Deploy em servidor cloud

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma [issue](https://github.com/seu-usuario/invest-bot/issues) ou enviar um pull request.

1. Faça um fork do projeto
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commit: `git commit -m 'feat: minha nova feature'`
4. Push: `git push origin feature/minha-feature`
5. Abra um Pull Request

---

## ⚠️ Disclaimer

> **Este bot não é um serviço de consultoria financeira.** As recomendações são geradas por inteligência artificial com base em dados públicos e não constituem aconselhamento profissional de investimento. Sempre faça sua própria pesquisa e, se necessário, consulte um assessor financeiro certificado antes de tomar decisões de investimento.

---

## 📄 Licença

Este projeto está sob a licença **ISC**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">
  Feito com ❤️ e ☕ por <a href="https://github.com/seu-usuario">Nicolas Zalasik</a>
</p>
