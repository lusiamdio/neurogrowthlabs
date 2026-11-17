import { supabase } from '../supabase';
import { safeFetchJson } from '../utils/safeFetchJson';

export async function getActiveAccessToken(): Promise<string | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch {
    return null;
  }
}

export async function postNewsletterSubscription(email: string, source = 'footer_newsletter'): Promise<{ ok: boolean }> {
  const cleanEmail = email.trim().toLowerCase();
  const res = await safeFetchJson<{ subscription?: unknown; alreadySubscribed?: boolean }>(
    '/api/v1/sql/subscriptions',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, source }),
    }
  );

  if (res.ok) {
    return { ok: true };
  }

  // Direct Supabase fallback if Express route unavailable
  const { error } = await supabase.from('subscriptions').insert({
    email: cleanEmail,
    status: 'active',
    source,
  });
  if (error && error.code !== '23505') {
    throw error;
  }
  return { ok: true };
}

export async function postContactSubmission(payload: {
  fullName: string;
  organization?: string;
  email: string;
  teamScale?: string;
  goal?: string;
  message: string;
  inquiryType?: string;
}): Promise<{ ok: boolean }> {
  const res = await safeFetchJson('/api/v1/sql/contact-submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    return { ok: true };
  }

  const { error } = await supabase.from('contact_submissions').insert({
    full_name: payload.fullName,
    organization: payload.organization || null,
    email: payload.email.trim().toLowerCase(),
    team_scale: payload.teamScale || null,
    goal: payload.goal || null,
    message: payload.message,
    inquiry_type: payload.inquiryType || 'General Inquiries',
    status: 'unread',
  });
  if (error) throw error;
  return { ok: true };
}

export async function postPartnerApplication(payload: {
  company: string;
  type?: string;
  country?: string;
  interest?: string;
  objectives?: string;
  email: string;
}): Promise<{ ok: boolean }> {
  const res = await safeFetchJson('/api/v1/sql/partner-applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    return { ok: true };
  }

  const { error } = await supabase.from('partner_applications').insert({
    company: payload.company,
    type: payload.type || null,
    country: payload.country || null,
    interest: payload.interest || null,
    objectives: payload.objectives || null,
    email: payload.email.trim().toLowerCase(),
    status: 'pending',
  });
  if (error) throw error;
  return { ok: true };
}

export async function fetchPublishedWebinars(): Promise<any[]> {
  const res = await safeFetchJson<{ data?: any[] }>('/api/v1/sql/webinars');
  if (res.ok && Array.isArray(res.data?.data)) {
    return res.data.data;
  }

  const { data, error } = await supabase
    .from('webinars')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function postWebinarRegistration(payload: {
  fullName: string;
  email: string;
  organization?: string;
  title?: string;
  country?: string;
  interestSector?: string;
  comments?: string;
  track: string;
}): Promise<{ ok: boolean }> {
  const res = await safeFetchJson('/api/v1/sql/webinar-registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    return { ok: true };
  }

  const { error } = await supabase.from('webinar_registrations').insert({
    full_name: payload.fullName,
    email: payload.email.trim().toLowerCase(),
    organization: payload.organization || null,
    title: payload.title || null,
    country: payload.country || null,
    interest_sector: payload.interestSector || 'Fintech Infrastructure',
    comments: payload.comments || null,
    track: payload.track,
    status: 'registered',
  });
  if (error) throw error;
  return { ok: true };
}

export async function verifyCertificateInRegistry(code: string): Promise<{
  verified: boolean;
  credential?: {
    certificate_id: string;
    verification_code: string;
    recipient_name: string;
    course_id: string;
    course_title: string;
    issued_at: string;
    is_valid: boolean;
  };
} | null> {
  if (!code.trim()) return null;

  const res = await safeFetchJson<{ verified: boolean; credential?: any }>(
    `/api/v1/sql/academy/certificates/verify/${encodeURIComponent(code.trim())}`
  );
  if (res.ok && res.data?.credential) {
    return res.data;
  }

  try {
    const { data, error } = await supabase.rpc('verify_certificate', { p_code: code.trim() });
    if (error) return null;
    const match = Array.isArray(data) ? data[0] : data;
    if (!match) return null;
    return { verified: Boolean(match.is_valid), credential: match };
  } catch {
    return null;
  }
}

export async function syncCourseEnrollmentToSql(payload: {
  courseId: string;
  courseTitle: string;
  userName?: string;
  progress: number;
  completed?: boolean;
  completedLectures: string[];
}): Promise<void> {
  const token = await getActiveAccessToken();
  if (!token) return;

  await safeFetchJson('/api/v1/sql/academy/enrollments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function fetchUserEnrollmentsFromSql(): Promise<any[]> {
  const token = await getActiveAccessToken();
  if (!token) return [];

  const res = await safeFetchJson<{ data?: any[] }>('/api/v1/sql/academy/enrollments', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.ok && Array.isArray(res.data?.data)) {
    return res.data.data;
  }
  return [];
}

export async function syncCertificateToSql(payload: {
  courseId: string;
  courseTitle: string;
  certificateId: string;
  verificationCode: string;
  recipientName?: string;
}): Promise<void> {
  const token = await getActiveAccessToken();
  if (!token) return;

  await safeFetchJson('/api/v1/sql/academy/certificates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function logPaperDownloadToSql(paperId: string, paperTitle: string): Promise<void> {
  const token = await getActiveAccessToken();
  if (!token) return;

  await safeFetchJson('/api/v1/sql/academy/paper-downloads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ paperId, paperTitle }),
  });
}

export async function logEmailNotificationToSql(payload: {
  type: 'enrollment' | 'certificate' | 'webinar' | 'system';
  subject: string;
  userName?: string;
  courseId?: string;
  courseCode?: string;
  courseTitle?: string;
  status: 'delivered' | 'simulated' | 'failed';
  provider: string;
}): Promise<void> {
  const token = await getActiveAccessToken();
  if (!token) return;

  await safeFetchJson('/api/v1/sql/academy/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}
