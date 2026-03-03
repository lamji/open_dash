import type {
  SidebarItemData,
  PageComponentData,
  HeaderComponentData,
  ChatMessageData,
} from "@/domain/admin/types";

export async function fetchSidebarApi(): Promise<SidebarItemData[]> {
  const res = await fetch("/api/sidebar");
  if (!res.ok) return [];
  return res.json();
}

export async function fetchPageApi(slug: string): Promise<PageComponentData[]> {
  const res = await fetch(`/api/pages/${slug}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchConfigApi(key: string): Promise<unknown> {
  const res = await fetch(`/api/config/${key}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchHeaderComponentsApi(): Promise<HeaderComponentData[]> {
  const res = await fetch("/api/header-components");
  if (!res.ok) return [];
  return res.json();
}

export async function sendAiMessageApi(payload: {
  message: string;
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
  const res = await fetch("/api/ai/chat", {
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
