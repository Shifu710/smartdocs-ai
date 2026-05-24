export type User = {
  id: string;
  email: string;
  full_name?: string | null;
  role: "platform_admin" | "user";
  is_guest: boolean;
  created_at: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
};

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  credits: number;
  role: "owner" | "admin" | "member" | "viewer";
  settings: Record<string, number>;
  created_at: string;
};

export type WorkspaceDashboard = {
  workspace: Workspace;
  member_count: number;
  document_count: number;
  indexed_document_count: number;
  recent_usage_count: number;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === "production" ? "/_/api" : "http://localhost:8000");
const ACCESS_TOKEN_KEY = "smartdocs.accessToken";
const REFRESH_TOKEN_KEY = "smartdocs.refreshToken";
const USER_KEY = "smartdocs.user";

export function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }
  const value = window.localStorage.getItem(USER_KEY);
  return value ? (JSON.parse(value) as User) : null;
}

export function storeSession(session: TokenResponse) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, session.access_token);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function clearSession() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let detail = `Request failed with ${response.status}`;
    try {
      const errorBody = (await response.json()) as { detail?: string };
      detail = errorBody.detail ?? detail;
    } catch {
      // Keep the status-based message when the API does not return JSON.
    }
    throw new Error(detail);
  }

  return (await response.json()) as T;
}

export function login(email: string, password: string) {
  return apiRequest<TokenResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function register(email: string, password: string, full_name?: string) {
  return apiRequest<TokenResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name })
  });
}

export function guestLogin() {
  return apiRequest<TokenResponse>("/api/v1/auth/guest", { method: "POST" });
}

export function getMe() {
  return apiRequest<User>("/api/v1/auth/me");
}

export function listWorkspaces() {
  return apiRequest<Workspace[]>("/api/v1/workspaces");
}

export function createWorkspace(name: string) {
  return apiRequest<Workspace>("/api/v1/workspaces", {
    method: "POST",
    body: JSON.stringify({ name })
  });
}

export function getWorkspaceDashboard(workspaceId: string) {
  return apiRequest<WorkspaceDashboard>(`/api/v1/workspaces/${workspaceId}/dashboard`);
}
