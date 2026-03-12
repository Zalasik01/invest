-- =============================================
-- SQL para criar tabelas no Supabase (Versão com nextval e Start 1)
-- Execute no SQL Editor: supabase.com/dashboard → SQL Editor
-- =============================================

-- APAGA TUDO ANTES PARA NÃO DAR ERRO DE COLUNA FALTANDO
DROP TABLE IF EXISTS carteiras, mensagens, usuarios CASCADE;
DROP SEQUENCE IF EXISTS usuarios_id_seq, mensagens_id_seq, carteiras_id_seq CASCADE;


-- 1. Criar Sequences explícitas começando do 1
CREATE SEQUENCE IF NOT EXISTS usuarios_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS mensagens_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS carteiras_id_seq START 1;

-- 2. Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario BIGINT PRIMARY KEY DEFAULT nextval('usuarios_id_seq'),
  id_telegram TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  username TEXT,
  email TEXT,
  telefone TEXT,
  idioma TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  ultimo_acesso TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de mensagens
CREATE TABLE IF NOT EXISTS mensagens (
  id_mensagem BIGINT PRIMARY KEY DEFAULT nextval('mensagens_id_seq'),
  id_usuario BIGINT NOT NULL REFERENCES usuarios(id_usuario),
  papel TEXT NOT NULL CHECK (papel IN ('user', 'model')),
  conteudo TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de carteiras
CREATE TABLE IF NOT EXISTS carteiras (
  id_carteira BIGINT PRIMARY KEY DEFAULT nextval('carteiras_id_seq'),
  id_usuario BIGINT NOT NULL UNIQUE REFERENCES usuarios(id_usuario),
  ativos TEXT NOT NULL,
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_mensagens_usuario ON mensagens (id_usuario);
CREATE INDEX IF NOT EXISTS idx_carteiras_usuario ON carteiras (id_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_telegram ON usuarios (id_telegram);
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios (username);

-- 6. RLS (Row Level Security)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE carteiras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir tudo via service role" ON usuarios;
DROP POLICY IF EXISTS "Permitir tudo via service role" ON mensagens;
DROP POLICY IF EXISTS "Permitir tudo via service role" ON carteiras;

CREATE POLICY "Permitir tudo via service role" ON usuarios FOR ALL USING (true);
CREATE POLICY "Permitir tudo via service role" ON mensagens FOR ALL USING (true);
CREATE POLICY "Permitir tudo via service role" ON carteiras FOR ALL USING (true);
