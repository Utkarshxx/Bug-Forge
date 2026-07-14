const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
type ApiResponse<T> = { success: boolean; message: string; data: T };
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  let response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (response.status === 401 && path !== '/auth/refresh' && path !== '/auth/login') {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshResponse.ok) {
          const refreshBody = (await refreshResponse.json()) as ApiResponse<{ accessToken: string }>;
          const newAccessToken = refreshBody.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);
          response = await fetch(`${baseUrl}${path}`, {
            ...init,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${newAccessToken}`,
              ...init.headers,
            },
          });
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } catch {
        // Ignore refresh error and let original 401 throw
      }
    }
  }
  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok) throw new Error(body.message);
  return body.data;
}
