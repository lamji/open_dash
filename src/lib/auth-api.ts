import type { AuthResponse } from "@/domain/auth/types";
import type {
  ProjectApiResponse,
  CreateProjectInput,
  UpdateProjectInput,
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
      error: `Empty response body from ${endpointLabel}`,
    };
  }
  try {
    return JSON.parse(rawBody) as T;
  } catch {
    return {
      ...fallback,
      ok: false,
      error: `Invalid JSON response from ${endpointLabel}`,
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
