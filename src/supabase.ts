import { createClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://jyvwrdibocdiicaurfrj.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5dndyZGlib2NkaWljYXVyZnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2MjM4NjQsImV4cCI6MjA5OTE5OTg2NH0.jZFyS08mVOkv0slI3iv1eSY6JtAGeo4pwjPSqmS2Kfk';

function normalizeSupabaseUrl(raw?: string): string {
  if (!raw) return FALLBACK_SUPABASE_URL;
  const candidate = raw.trim().replace(/^['"]|['"]$/g, '');
  if (!candidate) return FALLBACK_SUPABASE_URL;
  try {
    let parsed = new URL(candidate);
    if (parsed.hostname.endsWith('google.com') && parsed.pathname === '/url') {
      const inner = parsed.searchParams.get('q') || parsed.searchParams.get('url');
      if (inner) {
        parsed = new URL(inner);
      }
    }
    if (parsed.protocol === 'https:' && !parsed.hostname.endsWith('google.com')) {
      return parsed.origin;
    }
  } catch {
    // Ignore malformed secret URL
  }
  return FALLBACK_SUPABASE_URL;
}

function normalizeAnonKey(raw?: string): string {
  if (!raw) return FALLBACK_SUPABASE_ANON_KEY;
  const trimmed = raw.trim().replace(/^['"]|['"]$/g, '');
  return trimmed.startsWith('eyJ') ? trimmed : FALLBACK_SUPABASE_ANON_KEY;
}

// Read from environment variables, safely unwrapping redirect links or whitespace
const SUPABASE_URL = normalizeSupabaseUrl((import.meta as any).env?.VITE_SUPABASE_URL);
const SUPABASE_ANON_KEY = normalizeAnonKey((import.meta as any).env?.VITE_SUPABASE_ANON_KEY);

let proxyStatus: 'unknown' | 'available' | 'unavailable' = 'unknown';

const resilientSupabaseFetch: typeof fetch = async (input, init) => {
  const rawUrl =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

  if (typeof window !== 'undefined' && rawUrl.startsWith(SUPABASE_URL) && proxyStatus !== 'unavailable') {
    const suffix = rawUrl.slice(SUPABASE_URL.length);
    const proxyUrl = `/api/supabase${suffix.startsWith('/') ? suffix : `/${suffix}`}`;

    let requestInit: RequestInit | undefined = init;
    if (input instanceof Request) {
      const clonedBody =
        init?.body !== undefined
          ? init.body
          : input.method !== 'GET' && input.method !== 'HEAD'
            ? await input.clone().arrayBuffer()
            : undefined;
      requestInit = {
        method: init?.method || input.method,
        headers: init?.headers || input.headers,
        body: clonedBody,
        signal: init?.signal || input.signal,
      };
    }

    try {
      const proxyRes = await fetch(proxyUrl, requestInit);
      const contentType = proxyRes.headers.get('content-type') || '';
      if (proxyRes.headers.get('x-supabase-proxy') === '1' || !contentType.includes('text/html')) {
        proxyStatus = 'available';
        return proxyRes;
      }
      // Static preview fallback returned SPA HTML instead of proxy JSON
      proxyStatus = 'unavailable';
    } catch {
      proxyStatus = 'unavailable';
    }
  }

  return fetch(input, init);
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: {
    fetch: resilientSupabaseFetch,
  },
});
