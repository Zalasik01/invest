-- =============================================
-- SQL para criar tabelas no Supabase
-- Execute no SQL Editor: supabase.com/dashboard → SQL Editor
-- =============================================

-- Tabela de usuários (registro automático ao usar o bot)
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  username TEXT,
  email TEXT,
  telefone TEXT,
  idioma TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  ultimo_acesso TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de mensagens (histórico de conversas)
CREATE TABLE IF NOT EXISTS mensagens (
  id_mensagem BIGSERIAL PRIMARY KEY,
  id_usuario TEXT NOT NULL REFERENCES usuarios(id_usuario),
  papel TEXT NOT NULL CHECK (papel IN ('user', 'model')),
  conteudo TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de carteiras (ativos do usuário)
CREATE TABLE IF NOT EXISTS carteiras (
  id_carteira BIGSERIAL PRIMARY KEY,
  id_usuario TEXT NOT NULL UNIQUE REFERENCES usuarios(id_usuario),
  ativos TEXT NOT NULL,
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_mensagens_usuario ON mensagens (id_usuario);
CREATE INDEX IF NOT EXISTS idx_carteiras_usuario ON carteiras (id_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios (username);

-- RLS (Row Level Security) - permitir acesso via service role key
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE carteiras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir tudo via service role" ON usuarios;
DROP POLICY IF EXISTS "Permitir tudo via service role" ON mensagens;
DROP POLICY IF EXISTS "Permitir tudo via service role" ON carteiras;

CREATE POLICY "Permitir tudo via service role" ON usuarios FOR ALL USING (true);
CREATE POLICY "Permitir tudo via service role" ON mensagens FOR ALL USING (true);
CREATE POLICY "Permitir tudo via service role" ON carteiras FOR ALL USING (true);
