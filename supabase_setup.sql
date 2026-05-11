-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Create Organizations Table (If not managed by TypeORM)
-- CREATE TABLE orgs (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   name TEXT NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- 2. Enable RLS on all tables
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Policy for Contracts: Users can only see contracts for their organization
CREATE POLICY "Contracts isolation by org_id" ON contracts
  USING (org_id = (current_setting('app.current_org_id')::uuid));

-- Policy for Matters: Users can only see matters for their organization
CREATE POLICY "Matters isolation by org_id" ON matters
  USING (org_id = (current_setting('app.current_org_id')::uuid));

-- Policy for Alerts: Users can only see alerts for their organization
CREATE POLICY "Alerts isolation by org_id" ON alerts
  USING (org_id = (current_setting('app.current_org_id')::uuid));

-- 4. Function to set current org (for use with our backend)
-- In our NestJS app, we'll run: SET LOCAL app.current_org_id = '...'; 
-- inside a transaction to enforce these policies.

-- 5. Full-Text Search Index
CREATE INDEX IF NOT EXISTS contracts_title_idx ON contracts USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS contracts_counterparty_idx ON contracts USING gin(to_tsvector('english', counterparty_name));

-- 6. Vector Index for Semantic Search (Future)
-- CREATE INDEX ON contracts USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
