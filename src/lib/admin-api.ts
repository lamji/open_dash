import type {
  SidebarItemData,
  PageComponentData,
  HeaderComponentData,
  ChatMessageData,
} from "@/domain/admin/types";

export async function fetchSidebarApi(projectId: string): Promise<SidebarItemData[]> {
  const res = await fetch(`/api/sidebar?projectId=${projectId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchPageApi(slug: string, projectId: string): Promise<PageComponentData[]> {
  const res = await fetch(`/api/pages/${slug}?projectId=${projectId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchConfigApi(key: string, projectId: string): Promise<unknown> {
  const res = await fetch(`/api/config/${key}?projectId=${projectId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchHeaderComponentsApi(projectId: string): Promise<HeaderComponentData[]> {
  const res = await fetch(`/api/header-components?projectId=${projectId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function sendAiMessageApi(payload: {
  message: string;
  projectId: string;
  state: {
    sidebarItems: SidebarItemData[];
    activePage: string | null;
    pageComponents: PageComponentData[];
    headerComponents: HeaderComponentData[];
  };
  history: { role: string; content: string }[];
}): Promise<{
  message: string;
  actions?: ChatMessageData["actions"];
  error?: string;
}> {
  const projectId = payload.projectId;
  const res = await fetch(`/api/ai/chat?projectId=${projectId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    return { message: `Error: ${errText}` };
  }

  return res.json();
}
