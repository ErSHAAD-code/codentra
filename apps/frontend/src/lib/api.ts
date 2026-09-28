const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

/** Expose the base API URL for callers that build their own fetch (e.g. SSE streams) */
export function getApiUrl(): string {
  return API_URL;
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const isFormData = options.body instanceof FormData;
  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include', // sends the Auth.js session cookie so SessionGuard can authenticate
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });
}

export async function apiJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await apiFetch(path, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    let msg = body?.message || body?.error || `Request failed: ${response.status}`;
    if (typeof msg === 'object') {
      if (Array.isArray(msg)) {
        msg = msg.join(', ');
      } else {
        msg = msg.message || msg.error || JSON.stringify(msg);
      }
    }
    throw new Error(String(msg));
  }
  return response.json();
}

export async function apiJsonSafe<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await apiFetch(path, options);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      let msg = body?.message || body?.error || `Request failed: ${response.status}`;
      if (typeof msg === 'object') {
        if (Array.isArray(msg)) {
          msg = msg.join(', ');
        } else {
          msg = msg.message || msg.error || JSON.stringify(msg);
        }
      }
      return { data: null, error: String(msg) };
    }
    const data = await response.json();
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Network error' };
  }
}
