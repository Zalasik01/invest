const { createClient } = require('@supabase/supabase-js');

let supabase;

function getDb() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;

    if (!url || !key) {
      console.error('❌ SUPABASE_URL ou SUPABASE_KEY não definidos no .env');
      process.exit(1);
    }

    supabase = createClient(url, key);
    console.log('✅ Supabase conectado');
  }
  return supabase;
}

async function salvarMensagem(idUsuario, papel, conteudo) {
  const db = getDb();
  const { error } = await db
    .from('mensagens')
    .insert({ id_usuario: String(idUsuario), papel, conteudo });

  if (error) console.error('Erro ao salvar mensagem:', error.message);
}

async function buscarHistorico(idUsuario, limite = 20) {
  const db = getDb();
  const { data, error } = await db
    .from('mensagens')
    .select('papel, conteudo')
    .eq('id_usuario', String(idUsuario))
    .order('id_mensagem', { ascending: false })
    .limit(limite);

  if (error) {
    console.error('Erro ao buscar histórico:', error.message);
    return [];
  }

  return (data || []).reverse();
}

async function salvarCarteira(idUsuario, ativos) {
  const db = getDb();
  const { error } = await db
    .from('carteiras')
    .upsert(
      { id_usuario: String(idUsuario), ativos: JSON.stringify(ativos) },
      { onConflict: 'id_usuario' }
    );

  if (error) console.error('Erro ao salvar carteira:', error.message);
}

async function buscarCarteira(idUsuario) {
  const db = getDb();
  const { data, error } = await db
    .from('carteiras')
    .select('ativos')
    .eq('id_usuario', String(idUsuario))
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar carteira:', error.message);
    return null;
  }

  return data ? JSON.parse(data.ativos) : null;
}

async function limparHistorico(idUsuario) {
  const db = getDb();
  const { error } = await db
    .from('mensagens')
    .delete()
    .eq('id_usuario', String(idUsuario));

  if (error) console.error('Erro ao limpar histórico:', error.message);
}

/**
 * Registra ou atualiza usuário automaticamente com dados do Telegram.
 * Chamado a cada interação — cria se não existe, atualiza nome/username se mudou.
 */
async function registrarUsuario(dadosTelegram) {
  const db = getDb();
  const { id, first_name, last_name, username, language_code } = dadosTelegram;

  const nomeCompleto = [first_name, last_name].filter(Boolean).join(' ');

  const { error } = await db
    .from('usuarios')
    .upsert(
      {
        id_usuario: String(id),
        nome: nomeCompleto,
        username: username || null,
        idioma: language_code || null,
        ultimo_acesso: new Date().toISOString(),
      },
      { onConflict: 'id_usuario' }
    );

  if (error) console.error('Erro ao registrar usuário:', error.message);
}

/**
 * Busca dados do usuário pelo ID do Telegram.
 */
async function buscarUsuario(idUsuario) {
  const db = getDb();
  const { data, error } = await db
    .from('usuarios')
    .select('*')
    .eq('id_usuario', String(idUsuario))
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar usuário:', error.message);
    return null;
  }

  return data || null;
}

/**
 * Atualiza email e/ou telefone do usuário.
 */
async function atualizarContatoUsuario(idUsuario, { email, telefone }) {
  const db = getDb();
  const atualizacao = {};
  if (email !== undefined) atualizacao.email = email;
  if (telefone !== undefined) atualizacao.telefone = telefone;

  const { error } = await db
    .from('usuarios')
    .update(atualizacao)
    .eq('id_usuario', String(idUsuario));

  if (error) console.error('Erro ao atualizar contato:', error.message);
}

module.exports = {
  getDb,
  salvarMensagem,
  buscarHistorico,
  salvarCarteira,
  buscarCarteira,
  limparHistorico,
  registrarUsuario,
  buscarUsuario,
  atualizarContatoUsuario,
};
