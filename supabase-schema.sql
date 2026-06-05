-- TABELA: visitantes
CREATE TABLE IF NOT EXISTS visitantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_completo TEXT NOT NULL,
    idade INTEGER,
    telefone TEXT NOT NULL,
    sexo TEXT,
    pedido_oracao TEXT,
    observacao TEXT,
    equipe TEXT,
    pastor_responsavel TEXT,
    consolidador TEXT,
    culto TEXT,
    status TEXT NOT NULL DEFAULT 'Novo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABELA: acompanhamentos
CREATE TABLE IF NOT EXISTS acompanhamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitante_id UUID REFERENCES visitantes(id) ON DELETE CASCADE,
    observacao TEXT,
    status TEXT,
    data_acompanhamento TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABELA: equipes
CREATE TABLE IF NOT EXISTS equipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cor_principal TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABELA: pastores
CREATE TABLE IF NOT EXISTS pastores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABELA: cultos
CREATE TABLE IF NOT EXISTS cultos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    dia TEXT,
    horario TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TABELA: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID,
    nome TEXT,
    email TEXT,
    perfil TEXT,
    equipe TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE visitantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE acompanhamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastores ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE SEGURANÇA (RLS POLICIES)

-- 1. Visitantes
-- Permissão pública de escrita (formulário sem login)
CREATE POLICY "Permitir inserção pública de visitantes" 
ON visitantes FOR INSERT 
TO public 
WITH CHECK (true);

-- Permissão administrativa para usuários autenticados (ver, editar, deletar)
CREATE POLICY "Permitir leitura para usuários logados" 
ON visitantes FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Permitir atualização para usuários logados" 
ON visitantes FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir deleção para usuários logados" 
ON visitantes FOR DELETE 
TO authenticated 
USING (true);

-- 2. Acompanhamentos
CREATE POLICY "Gerenciar acompanhamentos para usuários logados"
ON acompanhamentos FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Auxiliares (Leitura pública para formulário se precisar, escrita autenticada)
CREATE POLICY "Leitura pública de equipes" ON equipes FOR SELECT TO public USING (true);
CREATE POLICY "Gerenciar equipes para administradores" ON equipes FOR ALL TO authenticated USING (true);

CREATE POLICY "Leitura pública de pastores" ON pastores FOR SELECT TO public USING (true);
CREATE POLICY "Gerenciar pastores para administradores" ON pastores FOR ALL TO authenticated USING (true);

CREATE POLICY "Leitura pública de cultos" ON cultos FOR SELECT TO public USING (true);
CREATE POLICY "Gerenciar cultos para administradores" ON cultos FOR ALL TO authenticated USING (true);

CREATE POLICY "Leitura pública de usuarios" ON usuarios FOR SELECT TO public USING (true);
CREATE POLICY "Gerenciar usuarios para administradores" ON usuarios FOR ALL TO authenticated USING (true);

-- Popular dados iniciais de exemplo se necessário
INSERT INTO equipes (nome, cor_principal) VALUES
('Equipe da Esperança', '#3b82f6'),
('Equipe da Fé', '#10b981'),
('Equipe de Jovens', '#8b5cf6'),
('Equipe Restaurar', '#f59e0b')
ON CONFLICT DO NOTHING;

INSERT INTO pastores (nome) VALUES
('Pr. Márcio Oliveira'),
('Pr. Carlos Santos'),
('Pr. Lucas Ferreira')
ON CONFLICT DO NOTHING;

INSERT INTO cultos (nome, dia, horario) VALUES
('Sábado 19h', 'Sábado', '19:00'),
('Terça-feira 19h30', 'Terça-feira', '19:30'),
('Domingo 10h', 'Domingo', '10:00'),
('Domingo 17h', 'Domingo', '17:00'),
('Domingo 19h', 'Domingo', '19:00')
ON CONFLICT DO NOTHING;
