type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, resetMs: windowMs };
  }
  if (current.count >= maxRequests) {
    return { allowed: false, resetMs: current.resetAt - now };
  }
  current.count += 1;
  return { allowed: true, resetMs: current.resetAt - now };
}
