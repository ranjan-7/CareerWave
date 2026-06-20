const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function apiFetch(path: string, options: RequestInit = {}) {
  // If the path already has a protocol (http/https), use it as is
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;

  const headers = new Headers(options.headers);
  
  // Set Content-Type to application/json by default if we have a body and it is not FormData
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const mergedOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Crucial to allow cross-site cookies in production
  };

  return fetch(url, mergedOptions);
}
