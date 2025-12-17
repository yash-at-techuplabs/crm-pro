-- CRM Pro Database Schema
-- Comprehensive CRM with contacts, leads, deals, tasks, and analytics

-- Enable necessary extensions


-- ============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  job_title TEXT,
  department TEXT,
  timezone TEXT DEFAULT 'UTC',
  notification_preferences JSONB DEFAULT '{"email": true, "push": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMPANIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  industry TEXT,
  size TEXT CHECK (size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
  website TEXT,
  phone TEXT,
  email TEXT,
  address JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  logo_url TEXT,
  annual_revenue DECIMAL(15, 2),
  founded_year INTEGER,
  linkedin_url TEXT,
  twitter_url TEXT,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}'::jsonb,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTACTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  job_title TEXT,
  department TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  lead_source TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'do_not_contact')),
  address JSONB DEFAULT '{}'::jsonb,
  linkedin_url TEXT,
  twitter_url TEXT,
  avatar_url TEXT,
  birth_date DATE,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}'::jsonb,
  last_contacted_at TIMESTAMPTZ,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PIPELINES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pipelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PIPELINE STAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  position INTEGER NOT NULL,
  is_won BOOLEAN DEFAULT FALSE,
  is_lost BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company_name TEXT,
  job_title TEXT,
  lead_source TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted')),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  description TEXT,
  website TEXT,
  address JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}'::jsonb,
  converted_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  converted_deal_id UUID,
  converted_at TIMESTAMPTZ,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DEALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  value DECIMAL(15, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE SET NULL,
  stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  expected_close_date DATE,
  actual_close_date DATE,
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
  loss_reason TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}'::jsonb,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for converted_deal_id
ALTER TABLE leads ADD CONSTRAINT leads_converted_deal_fkey 
  FOREIGN KEY (converted_deal_id) REFERENCES deals(id) ON DELETE SET NULL;

-- ============================================
-- ACTIVITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note', 'task', 'other')),
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  outcome TEXT,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EMAIL TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT,
  is_shared BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6366f1',
  description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  changes JSONB,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_owner ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);

CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

CREATE INDEX IF NOT EXISTS idx_leads_owner ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

CREATE INDEX IF NOT EXISTS idx_deals_pipeline ON deals(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_company ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_owner ON deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);

CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_deal ON activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_activities_assigned ON activities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_notes_contact ON notes(contact_id);
CREATE INDEX IF NOT EXISTS idx_notes_deal ON notes(deal_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_pipelines_updated_at BEFORE UPDATE ON pipelines FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_pipeline_stages_updated_at BEFORE UPDATE ON pipeline_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Deal stage change probability update
CREATE OR REPLACE FUNCTION update_deal_probability()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stage_id IS DISTINCT FROM OLD.stage_id THEN
    SELECT probability INTO NEW.probability
    FROM pipeline_stages WHERE id = NEW.stage_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deal_probability_on_stage_change
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_deal_probability();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Companies policies
CREATE POLICY "Users can view all companies" ON companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create companies" ON companies FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update companies" ON companies FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete companies" ON companies FOR DELETE TO authenticated USING (auth.uid() = created_by OR auth.uid() = owner_id);

-- Contacts policies
CREATE POLICY "Users can view all contacts" ON contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create contacts" ON contacts FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update contacts" ON contacts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete contacts" ON contacts FOR DELETE TO authenticated USING (auth.uid() = created_by OR auth.uid() = owner_id);

-- Leads policies
CREATE POLICY "Users can view all leads" ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create leads" ON leads FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update leads" ON leads FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete leads" ON leads FOR DELETE TO authenticated USING (auth.uid() = created_by OR auth.uid() = owner_id);

-- Deals policies
CREATE POLICY "Users can view all deals" ON deals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create deals" ON deals FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update deals" ON deals FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete deals" ON deals FOR DELETE TO authenticated USING (auth.uid() = created_by OR auth.uid() = owner_id);

-- Pipelines policies
CREATE POLICY "Users can view all pipelines" ON pipelines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create pipelines" ON pipelines FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update pipelines" ON pipelines FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete pipelines" ON pipelines FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Pipeline stages policies
CREATE POLICY "Users can view all stages" ON pipeline_stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage stages" ON pipeline_stages FOR ALL TO authenticated USING (true);

-- Activities policies
CREATE POLICY "Users can view all activities" ON activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create activities" ON activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update activities" ON activities FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete activities" ON activities FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Tasks policies
CREATE POLICY "Users can view all tasks" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create tasks" ON tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update tasks" ON tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete tasks" ON tasks FOR DELETE TO authenticated USING (auth.uid() = created_by OR auth.uid() = assigned_to);

-- Notes policies
CREATE POLICY "Users can view all notes" ON notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create notes" ON notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own notes" ON notes FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own notes" ON notes FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Email templates policies
CREATE POLICY "Users can view shared or own templates" ON email_templates FOR SELECT TO authenticated 
  USING (is_shared = true OR auth.uid() = created_by);
CREATE POLICY "Users can create templates" ON email_templates FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own templates" ON email_templates FOR UPDATE TO authenticated 
  USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own templates" ON email_templates FOR DELETE TO authenticated 
  USING (auth.uid() = created_by);

-- Tags policies
CREATE POLICY "Users can view all tags" ON tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create tags" ON tags FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update tags" ON tags FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete tags" ON tags FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Audit logs policies
CREATE POLICY "Users can view audit logs" ON audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create audit logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================
-- SEED DATA: Default Pipeline
-- ============================================
INSERT INTO pipelines (id, name, description, is_default) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Sales Pipeline', 'Default sales pipeline', true)
ON CONFLICT DO NOTHING;

INSERT INTO pipeline_stages (pipeline_id, name, color, probability, position, is_won, is_lost) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Lead', '#94a3b8', 10, 1, false, false),
  ('00000000-0000-0000-0000-000000000001', 'Qualified', '#3b82f6', 25, 2, false, false),
  ('00000000-0000-0000-0000-000000000001', 'Proposal', '#8b5cf6', 50, 3, false, false),
  ('00000000-0000-0000-0000-000000000001', 'Negotiation', '#f59e0b', 75, 4, false, false),
  ('00000000-0000-0000-0000-000000000001', 'Closed Won', '#22c55e', 100, 5, true, false),
  ('00000000-0000-0000-0000-000000000001', 'Closed Lost', '#ef4444', 0, 6, false, true)
ON CONFLICT DO NOTHING;

-- Default tags
INSERT INTO tags (name, color, description) VALUES 
  ('VIP', '#eab308', 'High-value customer'),
  ('Enterprise', '#8b5cf6', 'Enterprise-level account'),
  ('SMB', '#3b82f6', 'Small-medium business'),
  ('Hot Lead', '#ef4444', 'High priority lead'),
  ('Partner', '#22c55e', 'Partner relationship'),
  ('Renewal', '#f97316', 'Up for renewal')
ON CONFLICT DO NOTHING;

