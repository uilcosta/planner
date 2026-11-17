-- supabase/migrations/001_enable_rls.sql
-- Enable RLS on all tables
-- Create policies: auth.uid() = user_id for all tables
-- Special policies for users table

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE caixinhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- Template policy for all tables with user_id (except users)
-- Users can only access their own data
CREATE POLICY "Users can only access own categories" ON categories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access own institutions" ON institutions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access own accounts" ON accounts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access own planned_items" ON planned_items
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access own caixinhas" ON caixinhas
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access own contributions" ON contributions
  FOR ALL USING (auth.uid() = user_id);

-- Special policies for users table
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (for sign up)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);