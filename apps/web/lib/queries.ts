import {
  getMe,
  getUsage,
  getWorkspaceDashboard,
  listConversationMessages,
  listConversations,
  listDocuments,
  listWorkspaces
} from "@/lib/api";

const CACHE_STALE_MS = 60_000;

export const queryKeys = {
  me: ["me"] as const,
  workspaces: ["workspaces"] as const,
  workspaceDashboard: (workspaceId: string) => ["workspace-dashboard", workspaceId] as const,
  documents: (workspaceId: string) => ["documents", workspaceId] as const,
  usage: (workspaceId: string) => ["usage", workspaceId] as const,
  conversations: (workspaceId: string) => ["conversations", workspaceId] as const,
  conversationMessages: (workspaceId: string, conversationId: string | null) =>
    ["conversation-messages", workspaceId, conversationId] as const
};

export const meQuery = () => ({
  queryKey: queryKeys.me,
  queryFn: getMe,
  staleTime: CACHE_STALE_MS
});

export const workspacesQuery = () => ({
  queryKey: queryKeys.workspaces,
  queryFn: listWorkspaces,
  staleTime: CACHE_STALE_MS
});

export const workspaceDashboardQuery = (workspaceId: string) => ({
  queryKey: queryKeys.workspaceDashboard(workspaceId),
  queryFn: () => getWorkspaceDashboard(workspaceId),
  staleTime: CACHE_STALE_MS
});

export const documentsQuery = (workspaceId: string) => ({
  queryKey: queryKeys.documents(workspaceId),
  queryFn: () => listDocuments(workspaceId),
  staleTime: CACHE_STALE_MS
});

export const usageQuery = (workspaceId: string) => ({
  queryKey: queryKeys.usage(workspaceId),
  queryFn: () => getUsage(workspaceId),
  staleTime: CACHE_STALE_MS
});

export const conversationsQuery = (workspaceId: string) => ({
  queryKey: queryKeys.conversations(workspaceId),
  queryFn: () => listConversations(workspaceId),
  staleTime: CACHE_STALE_MS
});

export const conversationMessagesQuery = (workspaceId: string, conversationId: string) => ({
  queryKey: queryKeys.conversationMessages(workspaceId, conversationId),
  queryFn: () => listConversationMessages(workspaceId, conversationId),
  staleTime: CACHE_STALE_MS
});
