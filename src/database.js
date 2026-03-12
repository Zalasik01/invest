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

module.exports = {
  getDb,
  salvarMensagem,
  buscarHistorico,
  salvarCarteira,
  buscarCarteira,
  limparHistorico,
};
