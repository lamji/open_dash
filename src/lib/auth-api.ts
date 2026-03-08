import type { AuthResponse } from "@/domain/auth/types";
import type {
  ProjectApiResponse,
  CreateProjectInput,
  UpdateProjectInput,
  DashboardWidget,
  WidgetCreatorResult,
  ProjectConfigSimulationResult,
} from "@/domain/dashboard/types";

async function parseApiJson<T extends { ok: boolean; error?: string }>(
  res: Response,
  fallback: T,
  endpointLabel: string
): Promise<T> {
  console.log(`Debug flow: parseApiJson fired with`, { endpointLabel, status: res.status });
  const rawBody = await res.text();
  if (!rawBody.trim()) {
    return {
      ...fallback,
      ok: false,
      error: res.ok
        ? `Empty response body from ${endpointLabel}`
        : `Request to ${endpointLabel} failed with status ${res.status}`,
    };
  }
  try {
    const parsed = JSON.parse(rawBody) as T;
    if (!res.ok && !parsed.error) {
      return {
        ...fallback,
        ...parsed,
        ok: false,
        error: `Request to ${endpointLabel} failed with status ${res.status}`,
      };
    }
    return parsed;
  } catch {
    return {
      ...fallback,
      ok: false,
      error: res.ok
        ? `Invalid JSON response from ${endpointLabel}`
        : `Request to ${endpointLabel} failed with invalid JSON (${res.status})`,
    };
  }
}

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  console.log(`Debug flow: loginApi fired`);
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", email, password }),
  });
  return parseApiJson<AuthResponse>(res, { ok: false }, "/api/auth");
}

export async function signupApi(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): Promise<AuthResponse> {
  console.log(`Debug flow: signupApi fired`);
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "signup", name, email, password, confirmPassword }),
  });
  return parseApiJson<AuthResponse>(res, { ok: false }, "/api/auth");
}

export async function logoutApi(): Promise<AuthResponse> {
  console.log(`Debug flow: logoutApi fired`);
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "logout" }),
  });
  return parseApiJson<AuthResponse>(res, { ok: false }, "/api/auth");
}

// ─── Project CRUD API Helpers ────────────────────────────

export async function fetchProjectsApi(): Promise<ProjectApiResponse> {
  console.log(`Debug flow: fetchProjectsApi fired`);
  const res = await fetch("/api/projects");
  return parseApiJson<ProjectApiResponse>(res, { ok: false }, "/api/projects");
}

export async function createProjectApi(input: CreateProjectInput): Promise<ProjectApiResponse> {
  console.log(`Debug flow: createProjectApi fired`);
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseApiJson<ProjectApiResponse>(res, { ok: false }, "/api/projects");
}

export async function updateProjectApi(input: UpdateProjectInput): Promise<ProjectApiResponse> {
  console.log(`Debug flow: updateProjectApi fired`);
  const res = await fetch("/api/projects", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseApiJson<ProjectApiResponse>(res, { ok: false }, "/api/projects");
}

export async function deleteProjectApi(id: string): Promise<ProjectApiResponse> {
  console.log(`Debug flow: deleteProjectApi fired`);
  const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
  return parseApiJson<ProjectApiResponse>(res, { ok: false }, "/api/projects");
}

export async function simulateProjectIntegrationsApi(projectId: string, secretKey: string): Promise<{
  ok: boolean;
  results?: ProjectConfigSimulationResult[];
  error?: string;
}> {
  console.log("Debug flow: simulateProjectIntegrationsApi fired", { projectId });
  const res = await fetch("/api/projects/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, secretKey }),
  });
  return parseApiJson<{ ok: boolean; results?: ProjectConfigSimulationResult[]; error?: string }>(
    res,
    { ok: false, results: [] },
    "/api/projects/simulate"
  );
}

function parseWidgetData(jsxCode: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(jsxCode);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Ignore malformed widget payloads and keep the dashboard usable.
  }

  return {};
}

export async function fetchDashboardWidgetsApi(): Promise<DashboardWidget[]> {
  console.log(`Debug flow: fetchDashboardWidgetsApi fired`);
  const res = await fetch("/api/widgets");
  const data = await parseApiJson<{ ok: boolean; widgets?: Record<string, unknown>[]; error?: string }>(
    res,
    { ok: false, widgets: [] },
    "/api/widgets"
  );
  const widgets = Array.isArray(data.widgets) ? data.widgets : [];

  return widgets.map((widget) => ({
    id: String(widget.id),
    slug: String(widget.slug ?? ""),
    title: String(widget.title ?? "Untitled widget"),
    description: String(widget.description ?? ""),
    category: String(widget.category ?? "custom"),
    widgetData: parseWidgetData(String(widget.jsxCode ?? "{}")),
    createdAt: String(widget.createdAt ?? ""),
    updatedAt: String(widget.updatedAt ?? ""),
  }));
}

export async function generateWidgetCreatorApi(
  message: string,
  projectId: string
): Promise<{ ok: boolean; result?: WidgetCreatorResult; error?: string }> {
  console.log(`Debug flow: generateWidgetCreatorApi fired`, { projectId, messageLength: message.length });
  const res = await fetch(`/api/ai/widget?projectId=${projectId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const rawBody = await res.text();
  if (!rawBody.trim()) {
    return { ok: false, error: "Empty response from /api/ai/widget" };
  }

  try {
    const parsed = JSON.parse(rawBody) as WidgetCreatorResult & { error?: string };
    if (!res.ok) {
      return { ok: false, error: parsed.error ?? "Failed to generate widget" };
    }
    return {
      ok: true,
      result: {
        message: parsed.message,
        role: parsed.role,
        timestamp: parsed.timestamp,
      },
    };
  } catch {
    return { ok: false, error: "Invalid JSON response from /api/ai/widget" };
  }
}
