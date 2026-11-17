export function buildStableVerificationId(
  courseCode: string,
  email?: string,
  overrideCode?: string
): string {
  if (overrideCode) return overrideCode;
  const seed = `${courseCode}:${(email || 'sample').trim().toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const suffix = String(100000 + (hash % 900000));
  return `NGL-CERT-${courseCode}-2026-${suffix}`;
}

export function resolveCourseFromParams<T extends { id: string; code: string }>(
  courses: T[],
  courseId?: string,
  code?: string
): T {
  if (courseId) {
    const byId = courses.find((c) => c.id === courseId);
    if (byId) return byId;
  }
  if (code) {
    const decoded = decodeURIComponent(code).toUpperCase();
    const byCode = courses.find(
      (c) =>
        decoded.includes(c.code.toUpperCase()) ||
        decoded.includes(c.code.replace(/\s+/g, '').toUpperCase()) ||
        decoded === c.id.toUpperCase()
    );
    if (byCode) return byCode;
  }
  return courses[0];
}
