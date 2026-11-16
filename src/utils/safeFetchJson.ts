export type SafeFetchResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; isHtmlFallback: boolean; error: string };

export async function safeFetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<SafeFetchResult<T>> {
  const res = await fetch(input, init);
  const contentType = res.headers.get('content-type') || '';
  const rawText = await res.text();
  const trimmed = rawText.trimStart();

  const looksLikeHtml =
    contentType.includes('text/html') ||
    trimmed.startsWith('<!doctype') ||
    trimmed.startsWith('<!DOCTYPE') ||
    trimmed.startsWith('<html') ||
    trimmed.startsWith('<');

  if (looksLikeHtml) {
    return {
      ok: false,
      status: res.status,
      isHtmlFallback: true,
      error: 'API endpoint returned HTML instead of JSON.',
    };
  }

  let parsed: unknown = null;
  if (trimmed.length > 0) {
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return {
        ok: false,
        status: res.status,
        isHtmlFallback: false,
        error: `Invalid JSON payload received from server (${res.status}).`,
      };
    }
  }

  if (!res.ok) {
    const errMessage =
      typeof parsed === 'object' &&
      parsed !== null &&
      'error' in parsed &&
      typeof (parsed as { error?: unknown }).error === 'string'
        ? (parsed as { error: string }).error
        : `Request failed with status ${res.status}.`;
    return {
      ok: false,
      status: res.status,
      isHtmlFallback: false,
      error: errMessage,
    };
  }

  return {
    ok: true,
    status: res.status,
    data: (parsed ?? {}) as T,
  };
}
