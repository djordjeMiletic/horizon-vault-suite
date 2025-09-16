import axios, { AxiosHeaders, InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false, // može da ostane, iako za header-model nije obavezno
});

// ---- Demo session (email/role) storage + interceptor ----
type DemoSession = { email?: string; role?: string };

const DEMO_KEY = 'hv_demo_session';
let demoSession: DemoSession = loadDemoSession();

function loadDemoSession(): DemoSession {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setDemoSession(session: DemoSession | null) {
  demoSession = session ?? {};
  try {
    if (session) localStorage.setItem(DEMO_KEY, JSON.stringify(session));
    else localStorage.removeItem(DEMO_KEY);
  } catch {}
}

// ✅ interceptor sa ispravnim tipom i headers.set(...)
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // osiguraj da je headers tipa AxiosHeaders
  if (!config.headers || !(config.headers instanceof AxiosHeaders)) {
    config.headers = new AxiosHeaders(config.headers);
  }

  if (demoSession?.email) {
    const h = config.headers as AxiosHeaders;
    h.set('X-User-Email', demoSession.email);
    h.set('X-User-Role', demoSession.role ?? 'Client');
  }
  return config;
});

// Global error interceptor (može da ostane isti)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
