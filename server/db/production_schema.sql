-- ============================================================================
-- Neuro AI Development — Production PostgreSQL / Supabase Backend Schema
-- Version: 2.0.0
-- Target: PostgreSQL 15+ / Supabase
-- Features:
--   - Normalized 14-table relational model across Core Platform & Academy
--   - Strict CHECK constraints, unique constraints, and foreign keys
--   - Automated updated_at triggers & auth.users -> public.users provisioning
--   - Least-privilege Row Level Security (RLS) policies + Security Definer RPC
--   - Performance B-tree & partial indexes for high-throughput lookups
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 0. Extensions
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- ----------------------------------------------------------------------------
-- 1. Trigger Utilities
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. Core Identity & RBAC Tables
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'Scholar',
  country TEXT NOT NULL DEFAULT 'South Africa',
  photo_url TEXT,
  role TEXT NOT NULL DEFAULT 'learner'
    CHECK (role IN ('learner', 'instructor', 'admin', 'super_admin')),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Helper functions declared after public.users exists
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT LOWER(COALESCE(auth.jwt() ->> 'email', ''));
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE (u.id = auth.uid() OR LOWER(u.email::TEXT) = public.current_user_email())
      AND u.role = 'super_admin'
  )
  OR public.current_user_email() IN (
    'simao@neuroaidevelopment.co.za',
    'simao@neurogrowthlabs.co.za',
    'lusimadio12@gmail.com'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_super_admin()
  OR EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'super_admin')
  );
$$;

-- Sync new Supabase Auth signups automatically into public.users
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT := 'learner';
  v_email TEXT := LOWER(COALESCE(NEW.email, ''));
BEGIN
  IF v_email IN (
    'simao@neuroaidevelopment.co.za',
    'simao@neurogrowthlabs.co.za',
    'lusimadio12@gmail.com'
  ) THEN
    v_role := 'super_admin';
  END IF;

  INSERT INTO public.users (id, email, display_name, country, role, registered_at)
  VALUES (
    NEW.id,
    v_email,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''), SPLIT_PART(v_email, '@', 1), 'Learner'),
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'country', ''), 'South Africa'),
    v_role,
    COALESCE((NEW.raw_user_meta_data ->> 'registered_at')::TIMESTAMPTZ, NOW())
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), public.users.display_name),
        updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_created();

-- ----------------------------------------------------------------------------
-- 3. Public Intake, Partnership & Communication Tables
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id BIGSERIAL PRIMARY KEY,
  email CITEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  source TEXT NOT NULL DEFAULT 'footer_newsletter',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.partner_applications (
  id BIGSERIAL PRIMARY KEY,
  company TEXT NOT NULL CHECK (char_length(trim(company)) >= 2),
  type TEXT,
  country TEXT,
  interest TEXT,
  objectives TEXT,
  email CITEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'Pending', 'approved', 'Approved', 'rejected', 'Rejected', 'in_review')),
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_partner_applications_updated_at ON public.partner_applications;
CREATE TRIGGER trg_partner_applications_updated_at
  BEFORE UPDATE ON public.partner_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) >= 2),
  organization TEXT,
  email CITEXT NOT NULL,
  team_scale TEXT,
  goal TEXT,
  message TEXT NOT NULL CHECK (char_length(trim(message)) >= 1),
  inquiry_type TEXT NOT NULL DEFAULT 'General Inquiries',
  status TEXT NOT NULL DEFAULT 'unread'
    CHECK (status IN ('unread', 'read', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_contact_submissions_updated_at ON public.contact_submissions;
CREATE TRIGGER trg_contact_submissions_updated_at
  BEFORE UPDATE ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. AI Assistant Session & Telemetry Tables
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_chat_sessions_updated_at ON public.chat_sessions;
CREATE TRIGGER trg_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'ai', 'system')),
  text TEXT NOT NULL CHECK (char_length(text) <= 10000),
  system_prompt_context TEXT CHECK (system_prompt_context IS NULL OR char_length(system_prompt_context) <= 10000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'search', 'maps', 'research')),
  query TEXT NOT NULL CHECK (char_length(query) <= 5000),
  result TEXT NOT NULL CHECK (char_length(result) <= 100000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_analyses_updated_at ON public.analyses;
CREATE TRIGGER trg_analyses_updated_at
  BEFORE UPDATE ON public.analyses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 5. Webinar & Executive Capacity Program Tables
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.webinars (
  id BIGSERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  track TEXT NOT NULL DEFAULT 'Free Webinar'
    CHECK (track IN ('Free Webinar', 'Paid Program', 'Enterprise Integration', 'Public Infrastructure')),
  duration TEXT NOT NULL DEFAULT '1h 30m',
  focus TEXT NOT NULL,
  team TEXT NOT NULL DEFAULT '2 Speakers + 1 Moderator',
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_webinars_date_focus UNIQUE (date, focus)
);

DROP TRIGGER IF EXISTS trg_webinars_updated_at ON public.webinars;
CREATE TRIGGER trg_webinars_updated_at
  BEFORE UPDATE ON public.webinars
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.webinar_registrations (
  id BIGSERIAL PRIMARY KEY,
  webinar_id BIGINT REFERENCES public.webinars(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) >= 2),
  email CITEXT NOT NULL,
  organization TEXT,
  title TEXT,
  country TEXT,
  interest_sector TEXT NOT NULL DEFAULT 'Fintech Infrastructure',
  comments TEXT,
  track TEXT NOT NULL DEFAULT 'Free Webinar',
  status TEXT NOT NULL DEFAULT 'registered'
    CHECK (status IN ('registered', 'confirmed', 'attended', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_webinar_registrations_updated_at ON public.webinar_registrations;
CREATE TRIGGER trg_webinar_registrations_updated_at
  BEFORE UPDATE ON public.webinar_registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 6. Sovereign Academy Learning, Credentials & Audit Tables
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_email CITEXT NOT NULL,
  user_name TEXT NOT NULL,
  course_id TEXT NOT NULL,
  course_title TEXT NOT NULL,
  progress NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_lectures JSONB NOT NULL DEFAULT '[]'::jsonb,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_enrollment_user_course UNIQUE (user_id, course_id)
);

DROP TRIGGER IF EXISTS trg_course_enrollments_updated_at ON public.course_enrollments;
CREATE TRIGGER trg_course_enrollments_updated_at
  BEFORE UPDATE ON public.course_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id TEXT UNIQUE NOT NULL,
  verification_code TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_email CITEXT NOT NULL,
  course_id TEXT NOT NULL,
  course_title TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT uq_certificate_user_course UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.paper_downloads (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email CITEXT NOT NULL,
  paper_id TEXT NOT NULL,
  paper_title TEXT NOT NULL,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email CITEXT,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  headline TEXT NOT NULL CHECK (char_length(trim(headline)) >= 3),
  review_text TEXT NOT NULL CHECK (char_length(trim(review_text)) >= 10),
  role_tag TEXT,
  organization TEXT,
  verified_learner BOOLEAN NOT NULL DEFAULT TRUE,
  helpful_count INTEGER NOT NULL DEFAULT 0 CHECK (helpful_count >= 0),
  recommendation BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_course_reviews_updated_at ON public.course_reviews;
CREATE TRIGGER trg_course_reviews_updated_at
  BEFORE UPDATE ON public.course_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_email CITEXT NOT NULL,
  user_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('enrollment', 'certificate', 'webinar', 'system')),
  subject TEXT NOT NULL,
  course_id TEXT,
  course_code TEXT,
  course_title TEXT,
  status TEXT NOT NULL DEFAULT 'delivered' CHECK (status IN ('delivered', 'simulated', 'failed')),
  provider TEXT NOT NULL DEFAULT 'sendgrid-api',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. Performance Indexes
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_created ON public.subscriptions (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partner_apps_status_created ON public.partner_applications (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status_created ON public.contact_submissions (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created ON public.chat_messages (session_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_analyses_user_created ON public.analyses (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webinars_published_created ON public.webinars (is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webinar_regs_track_created ON public.webinar_registrations (track, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON public.course_enrollments (user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_code ON public.certificates (verification_code) WHERE revoked = FALSE;
CREATE INDEX IF NOT EXISTS idx_paper_downloads_paper_time ON public.paper_downloads (paper_id, downloaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_course_reviews_course_created ON public.course_reviews (course_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_notifications_user_sent ON public.email_notifications (user_id, sent_at DESC);

-- ----------------------------------------------------------------------------
-- 8. Row Level Security (RLS) & Least-Privilege Policies
-- ----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webinar_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "users_select_own_or_admin" ON public.users;
CREATE POLICY "users_select_own_or_admin" ON public.users
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "users_insert_self" ON public.users;
CREATE POLICY "users_insert_self" ON public.users
  FOR INSERT WITH CHECK (
    auth.uid() = id
    AND (role = 'learner' OR public.is_super_admin())
  );

DROP POLICY IF EXISTS "users_update_self_or_admin" ON public.users;
CREATE POLICY "users_update_self_or_admin" ON public.users
  FOR UPDATE USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (
    (auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid()))
    OR public.is_super_admin()
  );

-- Subscriptions policies (public subscribe insert; admin manage)
DROP POLICY IF EXISTS "subscriptions_public_insert" ON public.subscriptions;
CREATE POLICY "subscriptions_public_insert" ON public.subscriptions
  FOR INSERT WITH CHECK (email IS NOT NULL AND status = 'active');

DROP POLICY IF EXISTS "subscriptions_admin_all" ON public.subscriptions;
CREATE POLICY "subscriptions_admin_all" ON public.subscriptions
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Partner Applications policies (public submit insert; admin review/manage)
DROP POLICY IF EXISTS "partners_public_insert" ON public.partner_applications;
CREATE POLICY "partners_public_insert" ON public.partner_applications
  FOR INSERT WITH CHECK (status = 'pending');

DROP POLICY IF EXISTS "partners_admin_all" ON public.partner_applications;
CREATE POLICY "partners_admin_all" ON public.partner_applications
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Contact Submissions policies (public submit insert; admin triage/manage)
DROP POLICY IF EXISTS "contacts_public_insert" ON public.contact_submissions;
CREATE POLICY "contacts_public_insert" ON public.contact_submissions
  FOR INSERT WITH CHECK (status = 'unread');

DROP POLICY IF EXISTS "contacts_admin_all" ON public.contact_submissions;
CREATE POLICY "contacts_admin_all" ON public.contact_submissions
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Chat Sessions & Messages
DROP POLICY IF EXISTS "chat_sessions_owner_or_admin" ON public.chat_sessions;
CREATE POLICY "chat_sessions_owner_or_admin" ON public.chat_sessions
  FOR ALL USING (user_id IS NULL OR auth.uid() = user_id OR public.is_admin())
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "chat_messages_insert_public" ON public.chat_messages;
CREATE POLICY "chat_messages_insert_public" ON public.chat_messages
  FOR INSERT WITH CHECK (role IN ('user', 'ai', 'system'));

DROP POLICY IF EXISTS "chat_messages_select_owner_or_admin" ON public.chat_messages;
CREATE POLICY "chat_messages_select_owner_or_admin" ON public.chat_messages
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id OR public.is_admin());

-- Analyses
DROP POLICY IF EXISTS "analyses_owner_or_admin" ON public.analyses;
CREATE POLICY "analyses_owner_or_admin" ON public.analyses
  FOR ALL USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Webinars (public read published; admin write)
DROP POLICY IF EXISTS "webinars_public_read" ON public.webinars;
CREATE POLICY "webinars_public_read" ON public.webinars
  FOR SELECT USING (is_published = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "webinars_admin_write" ON public.webinars;
CREATE POLICY "webinars_admin_write" ON public.webinars
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Webinar Registrations (public register insert; admin read/manage)
DROP POLICY IF EXISTS "webinar_regs_public_insert" ON public.webinar_registrations;
CREATE POLICY "webinar_regs_public_insert" ON public.webinar_registrations
  FOR INSERT WITH CHECK (status = 'registered');

DROP POLICY IF EXISTS "webinar_regs_admin_all" ON public.webinar_registrations;
CREATE POLICY "webinar_regs_admin_all" ON public.webinar_registrations
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Course Enrollments
DROP POLICY IF EXISTS "enrollments_owner_or_admin" ON public.course_enrollments;
CREATE POLICY "enrollments_owner_or_admin" ON public.course_enrollments
  FOR ALL USING (auth.uid()::TEXT = user_id OR public.is_admin())
  WITH CHECK (auth.uid()::TEXT = user_id OR public.is_admin());

-- Certificates (owner or admin read; verification done via non-PII RPC below)
DROP POLICY IF EXISTS "certificates_owner_or_admin" ON public.certificates;
CREATE POLICY "certificates_owner_or_admin" ON public.certificates
  FOR SELECT USING (auth.uid()::TEXT = user_id OR public.is_admin());

DROP POLICY IF EXISTS "certificates_owner_insert" ON public.certificates;
CREATE POLICY "certificates_owner_insert" ON public.certificates
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id OR public.is_admin());

-- Paper Downloads
DROP POLICY IF EXISTS "paper_downloads_owner_or_admin" ON public.paper_downloads;
CREATE POLICY "paper_downloads_owner_or_admin" ON public.paper_downloads
  FOR ALL USING (auth.uid()::TEXT = user_id OR public.is_admin())
  WITH CHECK (auth.uid()::TEXT = user_id OR public.is_admin());

-- Course Reviews (public read; authenticated owner create/edit/delete)
DROP POLICY IF EXISTS "course_reviews_public_read" ON public.course_reviews;
CREATE POLICY "course_reviews_public_read" ON public.course_reviews
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "course_reviews_owner_write" ON public.course_reviews;
CREATE POLICY "course_reviews_owner_write" ON public.course_reviews
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id OR public.is_admin());

DROP POLICY IF EXISTS "course_reviews_owner_update" ON public.course_reviews;
CREATE POLICY "course_reviews_owner_update" ON public.course_reviews
  FOR UPDATE USING (auth.uid()::TEXT = user_id OR public.is_admin());

DROP POLICY IF EXISTS "course_reviews_owner_delete" ON public.course_reviews;
CREATE POLICY "course_reviews_owner_delete" ON public.course_reviews
  FOR DELETE USING (auth.uid()::TEXT = user_id OR public.is_admin());

-- Email Notifications
DROP POLICY IF EXISTS "email_notifications_owner_or_admin" ON public.email_notifications;
CREATE POLICY "email_notifications_owner_or_admin" ON public.email_notifications
  FOR ALL USING (auth.uid()::TEXT = user_id OR public.is_admin())
  WITH CHECK (auth.uid()::TEXT = user_id OR public.is_admin());

-- ----------------------------------------------------------------------------
-- 9. Public Non-PII Certificate Verification RPC
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verify_certificate(p_code TEXT)
RETURNS TABLE (
  certificate_id TEXT,
  verification_code TEXT,
  recipient_name TEXT,
  course_id TEXT,
  course_title TEXT,
  issued_at TIMESTAMPTZ,
  is_valid BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.certificate_id,
    c.verification_code,
    c.recipient_name,
    c.course_id,
    c.course_title,
    c.issued_at,
    (NOT c.revoked) AS is_valid
  FROM public.certificates c
  WHERE UPPER(c.verification_code) = UPPER(TRIM(p_code))
     OR UPPER(c.certificate_id) = UPPER(TRIM(p_code))
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.verify_certificate(TEXT) TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 10. Idempotent Initial Webinar Seed Data
-- ----------------------------------------------------------------------------
INSERT INTO public.webinars (date, track, duration, focus, team)
VALUES
  ('Wednesday, 15 July 2026', 'Free Webinar', '1h 30m', 'Fintech Infrastructure', '2 Speakers + 1 Moderator'),
  ('Wednesday, 22 July 2026', 'Paid Program', '2h 00m', 'Fintech Infrastructure', '1 Facilitator + 1 Trainer'),
  ('Wednesday, 12 August 2026', 'Free Webinar', '1h 30m', 'Pan-African Infrastructure', '2 Speakers + 1 Moderator')
ON CONFLICT ON CONSTRAINT uq_webinars_date_focus DO NOTHING;

COMMIT;
