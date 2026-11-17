import fs from 'node:fs';
import path from 'node:path';
import { Router, type Request, type Response } from 'express';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://jyvwrdibocdiicaurfrj.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5dndyZGlib2NkaWljYXVyZnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2MjM4NjQsImV4cCI6MjA5OTE5OTg2NH0.jZFyS08mVOkv0slI3iv1eSY6JtAGeo4pwjPSqmS2Kfk';

const SUPER_ADMIN_EMAILS = new Set([
  'simao@neuroaidevelopment.co.za',
  'simao@neurogrowthlabs.co.za',
  'lusimadio12@gmail.com',
]);

function resolveSupabaseUrl(): string {
  const raw = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const cleaned = raw.trim().replace(/^['"]|['"]$/g, '');
  if (!cleaned) return FALLBACK_SUPABASE_URL;
  try {
    const parsed = new URL(cleaned);
    if (parsed.protocol === 'https:' && !parsed.hostname.endsWith('google.com')) {
      return parsed.origin;
    }
  } catch {
    // Use fallback canonical URL
  }
  return FALLBACK_SUPABASE_URL;
}

function hasServiceRoleKey(): boolean {
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim().replace(/^['"]|['"]$/g, '');
  return key.startsWith('eyJ');
}

function getBearerToken(req: Request): string {
  const authHeader = req.headers.authorization || '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
}

function getSqlClient(userToken?: string): SupabaseClient {
  const url = resolveSupabaseUrl();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim().replace(/^['"]|['"]$/g, '');
  const anonKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim().replace(/^['"]|['"]$/g, '');
  const key = serviceKey.startsWith('eyJ')
    ? serviceKey
    : anonKey.startsWith('eyJ')
      ? anonKey
      : FALLBACK_SUPABASE_ANON_KEY;

  const headers: Record<string, string> = {};
  if (!serviceKey.startsWith('eyJ') && userToken) {
    headers.Authorization = `Bearer ${userToken}`;
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    ...(Object.keys(headers).length > 0 ? { global: { headers } } : {}),
  });
}

function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function cleanText(value: unknown, maxLen = 4000): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function normalizeId(rawId: string): string | number {
  const numeric = Number(rawId);
  if (Number.isInteger(numeric) && String(numeric) === rawId) {
    return numeric;
  }
  return rawId;
}

async function requireAuthenticatedUser(req: Request, res: Response) {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Bearer authorization token is required.' });
    return null;
  }
  const client = getSqlClient();
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired authorization session.' });
    return null;
  }
  return { user: data.user, token };
}

async function requireAdminAuth(req: Request, res: Response): Promise<string | null> {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Bearer authorization token is required for admin SQL operations.' });
    return null;
  }

  const client = getSqlClient();
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired authorization session.' });
    return null;
  }

  const email = (data.user.email || '').trim().toLowerCase();
  if (SUPER_ADMIN_EMAILS.has(email)) {
    return token;
  }

  const scopedClient = getSqlClient(token);
  const { data: userRow } = await scopedClient
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (userRow?.role === 'admin' || userRow?.role === 'super_admin') {
    return token;
  }

  res.status(403).json({ error: 'Super Admin or Admin privileges are required.' });
  return null;
}

function loadSchemaSql(): string {
  const schemaPath = path.resolve(process.cwd(), 'server', 'db', 'production_schema.sql');
  return fs.readFileSync(schemaPath, 'utf-8');
}

export const sqlBackendRouter = Router();

// 1. SQL Backend Health & Capability Probe
sqlBackendRouter.get('/health', async (_req, res) => {
  const client = getSqlClient();
  const hasServiceRole = hasServiceRoleKey();
  try {
    const { error } = await client.from('webinars').select('id', { head: true, count: 'exact' });
    res.json({
      status: error ? 'degraded' : 'ok',
      engine: 'postgresql-supabase',
      serviceRoleConfigured: hasServiceRole,
      schemaReachable: !error,
      detail: error ? error.message : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      engine: 'postgresql-supabase',
      serviceRoleConfigured: hasServiceRole,
      schemaReachable: false,
      detail: err instanceof Error ? err.message : 'Database connection check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// 2. Canonical SQL Schema Inspection Endpoint
sqlBackendRouter.get('/schema', (_req, res) => {
  try {
    const sql = loadSchemaSql();
    res.json({
      version: '2.0.0',
      tables: [
        'users',
        'subscriptions',
        'partner_applications',
        'contact_submissions',
        'chat_sessions',
        'chat_messages',
        'analyses',
        'webinars',
        'webinar_registrations',
        'course_enrollments',
        'certificates',
        'paper_downloads',
        'course_reviews',
        'email_notifications',
      ],
      sql,
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Unable to read production SQL schema file.',
    });
  }
});

// 3. Subscriptions
sqlBackendRouter.post('/subscriptions', async (req, res) => {
  const email = req.body?.email;
  if (!isValidEmail(email)) {
    res.status(400).json({ error: 'A valid email address is required.' });
    return;
  }

  const client = getSqlClient();
  const normalizedEmail = email.trim().toLowerCase();
  const source = cleanText(req.body?.source, 100) || 'footer_newsletter';

  if (hasServiceRoleKey()) {
    const { data, error } = await client
      .from('subscriptions')
      .upsert(
        { email: normalizedEmail, status: 'active', source },
        { onConflict: 'email' }
      )
      .select()
      .maybeSingle();

    if (error) {
      res.status(502).json({ error: error.message });
      return;
    }
    res.status(201).json({ subscription: data });
    return;
  }

  // Least-privilege anon RLS only permits INSERT (not SELECT or UPDATE)
  const { error } = await client.from('subscriptions').insert({
    email: normalizedEmail,
    status: 'active',
    source,
  });

  if (error) {
    if (error.code === '23505') {
      res.status(200).json({
        subscription: { email: normalizedEmail, status: 'active', source },
        alreadySubscribed: true,
      });
      return;
    }
    res.status(502).json({ error: error.message });
    return;
  }

  res.status(201).json({
    subscription: { email: normalizedEmail, status: 'active', source },
  });
});

sqlBackendRouter.get('/subscriptions', async (req, res) => {
  const token = await requireAdminAuth(req, res);
  if (!token) return;
  const client = getSqlClient(token);
  const { data, error } = await client
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  res.json({ data: data || [] });
});

sqlBackendRouter.delete('/subscriptions/:id', async (req, res) => {
  const token = await requireAdminAuth(req, res);
  if (!token) return;
  const client = getSqlClient(token);
  const { error } = await client
    .from('subscriptions')
    .delete()
    .eq('id', normalizeId(req.params.id));

  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  res.json({ deleted: true });
});

// 4. Contact Submissions
sqlBackendRouter.post('/contact-submissions', async (req, res) => {
  const fullName = cleanText(req.body?.fullName ?? req.body?.full_name, 200);
  const email = req.body?.email;
  const message = cleanText(req.body?.message, 5000);

  if (fullName.length < 2) {
    res.status(400).json({ error: 'Full name is required.' });
    return;
  }
  if (!isValidEmail(email)) {
    res.status(400).json({ error: 'Valid email address is required.' });
    return;
  }
  if (message.length < 1) {
    res.status(400).json({ error: 'Message body is required.' });
    return;
  }

  const client = getSqlClient();
  const payload = {
    full_name: fullName,
    organization: cleanText(req.body?.organization, 200) || null,
    email: email.trim().toLowerCase(),
    team_scale: cleanText(req.body?.teamScale ?? req.body?.team_scale, 120) || null,
    goal: cleanText(req.body?.goal, 500) || null,
    message,
    inquiry_type: cleanText(req.body?.inquiryType ?? req.body?.inquiry_type, 120) || 'General Inquiries',
    status: 'unread' as const,
  };

  if (hasServiceRoleKey()) {
    const { data, error } = await client
      .from('contact_submissions')
      .insert(payload)
      .select()
      .maybeSingle();

    if (error) {
      res.status(502).json({ error: error.message });
      return;
    }
    res.status(201).json({ submission: data });
    return;
  }

  const { error } = await client.from('contact_submissions').insert(payload);
  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  res.status(201).json({ submission: payload });
});

sqlBackendRouter.get('/contact-submissions', async (req, res) => {
  const token = await requireAdminAuth(req, res);
  if (!token) return;
  const client = getSqlClient(token);
  const { data, error } = await client
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  res.json({ data: data || [] });
});

sqlBackendRouter.patch('/contact-submissions/:id', async (req, res) => {
  const token = await requireAdminAuth(req, res);
  if (!token) return;
  const status = cleanText(req.body?.status, 24);
  if (!['unread', 'read', 'archived'].includes(status)) {
    res.status(400).json({ error: 'Status must be unread, read, or archived.' });
    return;
  }

  const client = getSqlClient(token);
  const { data, error } = await client
    .from('contact_submissions')
    .update({ status })
    .eq('id', normalizeId(req.params.id))
    .select()
    .maybeSingle();

  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  res.json({ submission: data });
});

sqlBackendRouter.delete('/contact-submissions/:id', async (req, res) => {
  const token = await requireAdminAuth(req, res);
  if (!token) return;
  const client = getSqlClient(token);
  const { error } = await client
    .from('contact_submissions')
    .delete()
    .eq('id', normalizeId(req.params.id));

  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  res.json({ deleted: true });
});

// 5. Partner Applications
sqlBackendRouter.post('/partner-applications', async (req, res) => {
  const company = cleanText(req.body?.company ?? req.body?.orgName, 200);
  const email = req.body?.email;
  if (company.length < 2) {
    res.status(400).json({ error: 'Organization name is required.' });
    return;
  }
  if (!isValidEmail(email)) {
    res.status(400).json({ error: 'A valid executive contact email is required.' });
    return;
  }

  const client = getSqlClient();
  const payload = {
    company,
    type: cleanText(req.body?.type ?? req.body?.orgType, 100) || null,
    country: cleanText(req.body?.country, 120) || null,
    interest: cleanText(req.body?.interest ?? req.body?.domainStack, 200) || null,
    objectives: cleanText(req.body?.objectives ?? req.body?.collabGoal, 4000) || null,
    email: email.trim().toLowerCase(),
    status: 'pending' as const,
  };

  if (hasServiceRoleKey()) {
    const { data, error } = await client
      .from('partner_applications')
      .insert(payload)
      .select()
      .maybeSingle();

    if (error) {
      res.status(502).json({ error: error.message });
      return;
    }
    res.status(201).json({ application: data });
    return;
  }

  const { error } = await client.from('partner_applications').insert(payload);
  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  res.status(201).json({ application: payload });
});

sqlBackendRouter.get('/partner-applications', async (req, res) => {
  const token = await requireAdminAuth(req, res);
  if (!token) return;
  const client = getSqlClient(token);
  const { data, error } = await client
    .from('partner_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  res.json({ data: data || [] });
});

sqlBackendRouter.patch('/partner-applications/:id', async (req, res) => {
  const token = await requireAdminAuth(req, res);
  if (!token) return;
  const status = cleanText(req.body?.status, 32);
  if (!['pending', 'Pending', 'approved', 'Approved', 'rejected', 'Rejected', 'in_review'].includes(status)) {
    res.status(400).json({ error: 'Unsupported partner status value.' });
    return;
  }

  const client = getSqlClient(token);
  const { data, error } = await client
    .from('partner_applications')
    .update({ status })
    .eq('id', normalizeId(req.params.id))
    .select()
    .maybeSingle();

  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  res.json({ application: data });
});

sqlBackendRouter.delete('/partner-applications/:id', async (req, res) => {
  const token = await requireAdminAuth(req, res);
  if (!token) return;
  const client = getSqlClient(token);
  const { error } = await client
    .from('partner_applications')
    .delete()
    .eq('id', normalizeId(req.params.id));

  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  res.json({ deleted: true });
});

// 6. Webinars & Registrations
sqlBackendRouter.get('/webinars', async (_req, res) => {
  const client = getSqlClient();
  const { data, error } = await client
    .from('webinars')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  res.json({ data: data || [] });
});

sqlBackendRouter.post('/webinars', async (req, res) => {
  const token = await requireAdminAuth(req, res);
  if (!token) return;
  const date = cleanText(req.body?.date, 120);
  const focus = cleanText(req.body?.focus, 200);
  if (!date || !focus) {
    res.status(400).json({ error: 'Webinar date and thematic focus are required.' });
    return;
  }

  const client = getSqlClient(token);
  const { data, error } = await client
    .from('webinars')
    .insert({
      date,
      track: cleanText(req.body?.track, 80) || 'Free Webinar',
      duration: cleanText(req.body?.duration, 60) || '1h 30m',
      focus,
      team: cleanText(req.body?.team, 120) || '2 Speakers + 1 Moderator',
      is_published: true,
    })
    .select()
    .maybeSingle();

  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  res.status(201).json({ webinar: data });
});

sqlBackendRouter.delete('/webinars/:id', async (req, res) => {
  const token = await requireAdminAuth(req, res);
  if (!token) return;
  const client = getSqlClient(token);
  const { error } = await client
    .from('webinars')
    .delete()
    .eq('id', normalizeId(req.params.id));

  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  res.json({ deleted: true });
});

sqlBackendRouter.post('/webinar-registrations', async (req, res) => {
  const fullName = cleanText(req.body?.fullName ?? req.body?.full_name, 200);
  const email = req.body?.email;
  if (fullName.length < 2) {
    res.status(400).json({ error: 'Full name is required.' });
    return;
  }
  if (!isValidEmail(email)) {
    res.status(400).json({ error: 'Valid email address is required.' });
    return;
  }

  const client = getSqlClient();
  const payload = {
    full_name: fullName,
    email: email.trim().toLowerCase(),
    organization: cleanText(req.body?.organization, 200) || null,
    title: cleanText(req.body?.title, 150) || null,
    country: cleanText(req.body?.country, 120) || null,
    interest_sector: cleanText(req.body?.interestSector ?? req.body?.interest_sector, 160) || 'Fintech Infrastructure',
    comments: cleanText(req.body?.comments, 2000) || null,
    track: cleanText(req.body?.track, 80) || 'Free Webinar',
    status: 'registered' as const,
  };

  if (hasServiceRoleKey()) {
    const { data, error } = await client
      .from('webinar_registrations')
      .insert(payload)
      .select()
      .maybeSingle();

    if (error) {
      res.status(502).json({ error: error.message });
      return;
    }
    res.status(201).json({ registration: data });
    return;
  }

  const { error } = await client.from('webinar_registrations').insert(payload);
  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  res.status(201).json({ registration: payload });
});

sqlBackendRouter.get('/webinar-registrations', async (req, res) => {
  const token = await requireAdminAuth(req, res);
  if (!token) return;
  const client = getSqlClient(token);
  const { data, error } = await client
    .from('webinar_registrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  res.json({ data: data || [] });
});

// 7. Academy Certificate Verification (Public Non-PII RPC) & Reviews
sqlBackendRouter.get('/academy/certificates/verify/:code', async (req, res) => {
  const code = cleanText(req.params.code, 100);
  if (!code) {
    res.status(400).json({ error: 'Verification code is required.' });
    return;
  }

  const client = getSqlClient();
  const { data, error } = await client.rpc('verify_certificate', { p_code: code });
  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  const match = Array.isArray(data) ? data[0] : data;
  if (!match) {
    res.status(404).json({ verified: false, error: 'Certificate credential not found.' });
    return;
  }
  res.json({ verified: Boolean(match.is_valid), credential: match });
});

sqlBackendRouter.get('/academy/reviews', async (req, res) => {
  const courseId = cleanText(req.query.courseId, 120);
  const client = getSqlClient();
  let query = client
    .from('course_reviews')
    .select('id, course_id, user_name, rating, headline, review_text, role_tag, organization, verified_learner, helpful_count, recommendation, created_at')
    .order('created_at', { ascending: false });

  if (courseId) {
    query = query.eq('course_id', courseId);
  }

  const { data, error } = await query;
  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  res.json({ data: data || [] });
});

// 8. Authenticated Academy Persistence Routes (Enrollments, Reviews, Certificates, Downloads, Notifications)
sqlBackendRouter.post('/academy/reviews', async (req, res) => {
  const auth = await requireAuthenticatedUser(req, res);
  if (!auth) return;

  const courseId = cleanText(req.body?.courseId ?? req.body?.course_id, 120);
  const headline = cleanText(req.body?.headline, 200);
  const reviewText = cleanText(req.body?.reviewText ?? req.body?.review_text, 4000);
  const rating = Number(req.body?.rating);

  if (!courseId || headline.length < 3 || reviewText.length < 10 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    res.status(400).json({ error: 'Valid courseId, rating (1-5), headline (min 3 chars), and reviewText (min 10 chars) are required.' });
    return;
  }

  const client = getSqlClient(auth.token);
  const { data, error } = await client
    .from('course_reviews')
    .insert({
      course_id: courseId,
      user_id: auth.user.id,
      user_name: cleanText(req.body?.userName ?? req.body?.user_name, 160) || auth.user.email?.split('@')[0] || 'Verified Scholar',
      user_email: auth.user.email?.toLowerCase() || null,
      rating,
      headline,
      review_text: reviewText,
      role_tag: cleanText(req.body?.roleTag ?? req.body?.role_tag, 120) || 'Verified Learner',
      organization: cleanText(req.body?.organization, 160) || 'Sovereign Academy Scholar',
      verified_learner: true,
      helpful_count: 0,
      recommendation: req.body?.recommendation !== false,
    })
    .select()
    .maybeSingle();

  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  res.status(201).json({ review: data });
});

sqlBackendRouter.get('/academy/enrollments', async (req, res) => {
  const auth = await requireAuthenticatedUser(req, res);
  if (!auth) return;

  const client = getSqlClient(auth.token);
  const { data, error } = await client
    .from('course_enrollments')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  res.json({ data: data || [] });
});

sqlBackendRouter.post('/academy/enrollments', async (req, res) => {
  const auth = await requireAuthenticatedUser(req, res);
  if (!auth) return;

  const courseId = cleanText(req.body?.courseId ?? req.body?.course_id, 120);
  const courseTitle = cleanText(req.body?.courseTitle ?? req.body?.course_title, 300);
  if (!courseId || !courseTitle) {
    res.status(400).json({ error: 'courseId and courseTitle are required.' });
    return;
  }

  const progressRaw = Number(req.body?.progress ?? 0);
  const progress = Number.isFinite(progressRaw) ? Math.min(100, Math.max(0, Number(progressRaw.toFixed(2)))) : 0;
  const completedLectures = Array.isArray(req.body?.completedLectures ?? req.body?.completed_lectures)
    ? (req.body?.completedLectures ?? req.body?.completed_lectures).slice(0, 200)
    : [];

  const client = getSqlClient(auth.token);
  const { data, error } = await client
    .from('course_enrollments')
    .upsert(
      {
        user_id: auth.user.id,
        user_email: (auth.user.email || 'scholar@neuroaidevelopment.co.za').toLowerCase(),
        user_name: cleanText(req.body?.userName ?? req.body?.user_name, 160) || auth.user.email?.split('@')[0] || 'Scholar',
        course_id: courseId,
        course_title: courseTitle,
        progress,
        completed: Boolean(req.body?.completed) || progress >= 100,
        completed_lectures: completedLectures,
      },
      { onConflict: 'user_id,course_id' }
    )
    .select()
    .maybeSingle();

  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  res.status(200).json({ enrollment: data });
});

sqlBackendRouter.post('/academy/certificates', async (req, res) => {
  const auth = await requireAuthenticatedUser(req, res);
  if (!auth) return;

  const courseId = cleanText(req.body?.courseId ?? req.body?.course_id, 120);
  const courseTitle = cleanText(req.body?.courseTitle ?? req.body?.course_title, 300);
  const certificateId = cleanText(req.body?.certificateId ?? req.body?.certificate_id, 120);
  const verificationCode = cleanText(req.body?.verificationCode ?? req.body?.verification_code, 120);

  if (!courseId || !courseTitle || !certificateId || !verificationCode) {
    res.status(400).json({ error: 'courseId, courseTitle, certificateId, and verificationCode are required.' });
    return;
  }

  const client = getSqlClient(auth.token);
  const { data, error } = await client
    .from('certificates')
    .upsert(
      {
        certificate_id: certificateId,
        verification_code: verificationCode,
        user_id: auth.user.id,
        recipient_name: cleanText(req.body?.recipientName ?? req.body?.recipient_name, 200) || auth.user.email?.split('@')[0] || 'Scholar',
        recipient_email: (auth.user.email || 'scholar@neuroaidevelopment.co.za').toLowerCase(),
        course_id: courseId,
        course_title: courseTitle,
        revoked: false,
      },
      { onConflict: 'user_id,course_id' }
    )
    .select()
    .maybeSingle();

  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  res.status(201).json({ certificate: data });
});

sqlBackendRouter.post('/academy/paper-downloads', async (req, res) => {
  const auth = await requireAuthenticatedUser(req, res);
  if (!auth) return;

  const paperId = cleanText(req.body?.paperId ?? req.body?.paper_id, 160);
  const paperTitle = cleanText(req.body?.paperTitle ?? req.body?.paper_title, 300);
  if (!paperId || !paperTitle) {
    res.status(400).json({ error: 'paperId and paperTitle are required.' });
    return;
  }

  const client = getSqlClient(auth.token);
  const { error } = await client.from('paper_downloads').insert({
    user_id: auth.user.id,
    user_email: (auth.user.email || 'scholar@neuroaidevelopment.co.za').toLowerCase(),
    paper_id: paperId,
    paper_title: paperTitle,
  });

  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  res.status(201).json({ logged: true });
});

sqlBackendRouter.post('/academy/notifications', async (req, res) => {
  const auth = await requireAuthenticatedUser(req, res);
  if (!auth) return;

  const type = cleanText(req.body?.type, 40);
  const subject = cleanText(req.body?.subject, 300);
  if (!['enrollment', 'certificate', 'webinar', 'system'].includes(type) || !subject) {
    res.status(400).json({ error: 'Valid notification type and subject are required.' });
    return;
  }

  const client = getSqlClient(auth.token);
  const { error } = await client.from('email_notifications').insert({
    user_id: auth.user.id,
    user_email: (auth.user.email || 'scholar@neuroaidevelopment.co.za').toLowerCase(),
    user_name: cleanText(req.body?.userName ?? req.body?.user_name, 160) || 'Scholar',
    type,
    subject,
    course_id: cleanText(req.body?.courseId ?? req.body?.course_id, 120) || null,
    course_code: cleanText(req.body?.courseCode ?? req.body?.course_code, 80) || null,
    course_title: cleanText(req.body?.courseTitle ?? req.body?.course_title, 300) || null,
    status: cleanText(req.body?.status, 32) || 'simulated',
    provider: cleanText(req.body?.provider, 80) || 'sendgrid-api',
  });

  if (error) {
    res.status(502).json({ error: error.message });
    return;
  }
  res.status(201).json({ logged: true });
});
