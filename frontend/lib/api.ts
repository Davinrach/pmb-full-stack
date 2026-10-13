const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
export const API_HOST = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export interface UserSession {
  id: number;
  nama_lengkap: string;
  email: string;
  no_hp: string;
  nik: string;
  role: 'calon_mahasiswa' | 'admin_pmb' | 'super_admin';
  pendaftar_id?: number;
  status_pendaftaran?: string;
  nomor_pendaftaran?: string;
  foto_profil?: string;
}

export function getFileUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_HOST}${cleanPath}`;
}

export const authStorage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('pmb_auth_token');
  },
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pmb_auth_token', token);
      window.dispatchEvent(new CustomEvent('auth-changed'));
    }
  },
  getUser: (): UserSession | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem('pmb_user_data');
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setUser: (user: UserSession) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pmb_user_data', JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: user }));
    }
  },
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pmb_auth_token');
      localStorage.removeItem('pmb_user_data');
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: null }));
    }
  },
};

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data: T; message?: string; meta?: any }> {
  const token = authStorage.getToken();

  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    cache: 'no-store',
    ...options,
    headers,
  });

  const resJson = await response.json().catch(() => ({}));

  if (!response.ok || resJson.success === false) {
    if (response.status === 401) {
      // Auto clear stale or expired token
      authStorage.clear();
    }
    const errorMsg =
      resJson?.error?.message ||
      resJson?.message ||
      `Terjadi kesalahan pada server (Status: ${response.status})`;
    const method = options.method || 'GET';
    if (typeof window !== 'undefined') {
      console.warn(`[API ${method} ${endpoint}] Status ${response.status}: ${errorMsg}`, resJson);
    }
    const err = new Error(errorMsg) as any;
    err.status = response.status;
    err.code = resJson?.error?.code;
    err.data = resJson?.data;
    err.endpoint = endpoint;
    err.method = method;
    err.resJson = resJson;
    throw err;
  }

  return resJson;
}

export const api = {
  get: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),
  upload: <T = any>(endpoint: string, formData: FormData) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: formData,
    }),
};
