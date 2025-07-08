-- Estender tabelas do LobeChat com suporte multi-tenant
-- Este arquivo mostra como adicionar tenant_id nas tabelas existentes do LobeChat

-- Tabela de mensagens (já existe no LobeChat)
ALTER TABLE messages 
ADD COLUMN organization_id UUID NOT NULL,
ADD CONSTRAINT fk_messages_organization 
  FOREIGN KEY (organization_id) 
  REFERENCES organizations(id) 
  ON DELETE CASCADE;

CREATE INDEX idx_messages_org_id ON messages(organization_id, created_at DESC);

-- Tabela de sessões/conversas
ALTER TABLE sessions
ADD COLUMN organization_id UUID NOT NULL,
ADD CONSTRAINT fk_sessions_organization 
  FOREIGN KEY (organization_id) 
  REFERENCES organizations(id) 
  ON DELETE CASCADE;

CREATE INDEX idx_sessions_org_id ON sessions(organization_id, updated_at DESC);

-- Tabela de arquivos
ALTER TABLE files
ADD COLUMN organization_id UUID NOT NULL,
ADD CONSTRAINT fk_files_organization 
  FOREIGN KEY (organization_id) 
  REFERENCES organizations(id) 
  ON DELETE CASCADE;

CREATE INDEX idx_files_org_id ON files(organization_id);

-- Tabela de conhecimento (knowledge base)
ALTER TABLE knowledge_base
ADD COLUMN organization_id UUID NOT NULL,
ADD CONSTRAINT fk_knowledge_organization 
  FOREIGN KEY (organization_id) 
  REFERENCES organizations(id) 
  ON DELETE CASCADE;

CREATE INDEX idx_knowledge_org_id ON knowledge_base(organization_id);

-- Tabela de plugins/ferramentas
ALTER TABLE tools
ADD COLUMN organization_id UUID,
ADD COLUMN is_global BOOLEAN DEFAULT false;

CREATE INDEX idx_tools_org_id ON tools(organization_id);

-- Função para RLS (Row Level Security)
CREATE OR REPLACE FUNCTION get_current_organization_id() 
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_organization_id')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar RLS nas tabelas
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY org_isolation_messages ON messages
  FOR ALL
  USING (organization_id = get_current_organization_id());

CREATE POLICY org_isolation_sessions ON sessions
  FOR ALL
  USING (organization_id = get_current_organization_id());

CREATE POLICY org_isolation_files ON files
  FOR ALL
  USING (organization_id = get_current_organization_id());

CREATE POLICY org_isolation_knowledge ON knowledge_base
  FOR ALL
  USING (organization_id = get_current_organization_id());