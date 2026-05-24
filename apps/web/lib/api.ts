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

export type DocumentRecord = {
  id: string;
  workspace_id: string;
  uploaded_by_id?: string | null;
  original_filename: string;
  file_type: string;
  mime_type?: string | null;
  file_size_bytes: number;
  file_hash: string;
  status: "uploaded" | "processing" | "indexed" | "failed" | "deleted";
  error_message?: string | null;
  chunk_count: number;
  last_indexed_at?: string | null;
  created_at: string;
};

export type DocumentChunk = {
  id: string;
  workspace_id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  page_number?: number | null;
  token_count: number;
  chunk_metadata: Record<string, unknown>;
  created_at: string;
};

export type DocumentDetail = DocumentRecord & {
  chunks: DocumentChunk[];
};

export type Citation = {
  document_id: string;
  document_name: string;
  chunk_id: string;
  chunk_index: number;
  page_number?: number | null;
  rrf_score: number;
  preview: string;
  vector_rank?: number | null;
  keyword_rank?: number | null;
};

export type ChatFinal = {
  answer: string;
  citations: Citation[];
  debug: Citation[];
  provider: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  credits_used: number;
  latency_ms: number;
  trace_id?: string | null;
};

export type UsageLog = {
  id: string;
  operation_type: string;
  provider?: string | null;
  model?: string | null;
  status: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  credits_deducted: number;
  latency_ms?: number | null;
  error_message?: string | null;
  langfuse_trace_id?: string | null;
  created_at: string;
};

export type CreditTransaction = {
  id: string;
  transaction_type: string;
  amount: number;
  balance_after: number;
  created_at: string;
};

export type UsageSummary = {
  credits: number;
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
  total_credits_used: number;
  logs: UsageLog[];
  transactions: CreditTransaction[];
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

export async function apiStream(path: string, body: unknown, onToken: (token: string) => void): Promise<ChatFinal> {
  const token = getAccessToken();
  const headers = new Headers();
  headers.set("Accept", "text/event-stream");
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });
  if (!response.ok || !response.body) {
    throw new Error(`Stream failed with ${response.status}`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let final: ChatFinal | null = null;
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const event of events) {
      const line = event.split("\n").find((part) => part.startsWith("data: "));
      if (!line) {
        continue;
      }
      const payload = JSON.parse(line.slice(6)) as { type: string; value: unknown };
      if (payload.type === "token" && typeof payload.value === "string") {
        onToken(payload.value);
      }
      if (payload.type === "final") {
        final = payload.value as ChatFinal;
      }
    }
  }
  if (!final) {
    throw new Error("Stream ended before final response");
  }
  return final;
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

export function listDocuments(workspaceId: string) {
  return apiRequest<DocumentRecord[]>(`/api/v1/workspaces/${workspaceId}/documents`);
}

export function uploadDocument(workspaceId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest<DocumentRecord>(`/api/v1/workspaces/${workspaceId}/documents/upload`, {
    method: "POST",
    body: formData
  });
}

export function getDocument(workspaceId: string, documentId: string) {
  return apiRequest<DocumentDetail>(`/api/v1/workspaces/${workspaceId}/documents/${documentId}`);
}

export function reindexDocument(workspaceId: string, documentId: string) {
  return apiRequest<DocumentRecord>(`/api/v1/workspaces/${workspaceId}/documents/${documentId}/reindex`, {
    method: "POST"
  });
}

export function deleteDocument(workspaceId: string, documentId: string) {
  return apiRequest<DocumentRecord>(`/api/v1/workspaces/${workspaceId}/documents/${documentId}`, {
    method: "DELETE"
  });
}

export function streamChat(
  workspaceId: string,
  question: string,
  documentIds: string[],
  onToken: (token: string) => void
) {
  return apiStream(`/api/v1/workspaces/${workspaceId}/chat/stream`, { question, document_ids: documentIds }, onToken);
}

export function getUsage(workspaceId: string) {
  return apiRequest<UsageSummary>(`/api/v1/workspaces/${workspaceId}/usage`);
}
