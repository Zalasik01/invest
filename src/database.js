const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'investbot.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    criarTabelas();
  }
  return db;
}

function criarTabelas() {
  // Chamado de dentro de getDb(), então usa db diretamente
  const database = db;

  database.exec(`
    CREATE TABLE IF NOT EXISTS mensagens (
      id_mensagem INTEGER PRIMARY KEY AUTOINCREMENT,
      idUsuario TEXT NOT NULL,
      papel TEXT NOT NULL CHECK(papel IN ('user', 'model')),
      conteudo TEXT NOT NULL,
      criadoEm DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS carteiras (
      id_carteira INTEGER PRIMARY KEY AUTOINCREMENT,
      idUsuario TEXT NOT NULL UNIQUE,
      ativos TEXT NOT NULL,
      atualizadoEm DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_mensagens_usuario ON mensagens(idUsuario);
    CREATE INDEX IF NOT EXISTS idx_carteiras_usuario ON carteiras(idUsuario);
  `);
}

function salvarMensagem(idUsuario, papel, conteudo) {
  const database = getDb();
  const stmt = database.prepare(
    'INSERT INTO mensagens (idUsuario, papel, conteudo) VALUES (?, ?, ?)'
  );
  stmt.run(String(idUsuario), papel, conteudo);
}

function buscarHistorico(idUsuario, limite = 20) {
  const database = getDb();
  const stmt = database.prepare(
    'SELECT papel, conteudo FROM mensagens WHERE idUsuario = ? ORDER BY id_mensagem DESC LIMIT ?'
  );
  const rows = stmt.all(String(idUsuario), limite);
  return rows.reverse();
}

function salvarCarteira(idUsuario, ativos) {
  const database = getDb();
  const stmt = database.prepare(`
    INSERT INTO carteiras (idUsuario, ativos, atualizadoEm) 
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(idUsuario) 
    DO UPDATE SET ativos = excluded.ativos, atualizadoEm = CURRENT_TIMESTAMP
  `);
  stmt.run(String(idUsuario), JSON.stringify(ativos));
}

function buscarCarteira(idUsuario) {
  const database = getDb();
  const stmt = database.prepare(
    'SELECT ativos FROM carteiras WHERE idUsuario = ?'
  );
  const row = stmt.get(String(idUsuario));
  return row ? JSON.parse(row.ativos) : null;
}

function limparHistorico(idUsuario) {
  const database = getDb();
  const stmt = database.prepare('DELETE FROM mensagens WHERE idUsuario = ?');
  stmt.run(String(idUsuario));
}

module.exports = {
  getDb,
  salvarMensagem,
  buscarHistorico,
  salvarCarteira,
  buscarCarteira,
  limparHistorico,
};
