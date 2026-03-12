-- =============================================
-- SQL para criar tabelas no Supabase
-- Execute no SQL Editor: supabase.com/dashboard → SQL Editor
-- =============================================

-- Tabela de mensagens (histórico de conversas)
CREATE TABLE IF NOT EXISTS mensagens (
  id_mensagem BIGSERIAL PRIMARY KEY,
  id_usuario TEXT NOT NULL,
  papel TEXT NOT NULL CHECK (papel IN ('user', 'model')),
  conteudo TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de carteiras (ativos do usuário)
CREATE TABLE IF NOT EXISTS carteiras (
  id_carteira BIGSERIAL PRIMARY KEY,
  id_usuario TEXT NOT NULL UNIQUE,
  ativos TEXT NOT NULL,
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_mensagens_usuario ON mensagens (id_usuario);
CREATE INDEX IF NOT EXISTS idx_carteiras_usuario ON carteiras (id_usuario);

-- RLS (Row Level Security) - permitir acesso via service role key
ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE carteiras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir tudo via service role" ON mensagens FOR ALL USING (true);
CREATE POLICY "Permitir tudo via service role" ON carteiras FOR ALL USING (true);
