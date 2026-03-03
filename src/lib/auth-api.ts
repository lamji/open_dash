import type { AuthResponse } from "@/domain/auth/types";
import type {
  ProjectApiResponse,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/domain/dashboard/types";

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", email, password }),
  });
  return res.json();
}

export async function signupApi(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): Promise<AuthResponse> {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "signup", name, email, password, confirmPassword }),
  });
  return res.json();
}

export async function logoutApi(): Promise<AuthResponse> {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "logout" }),
  });
  return res.json();
}

// ─── Project CRUD API Helpers ────────────────────────────

export async function fetchProjectsApi(): Promise<ProjectApiResponse> {
  const res = await fetch("/api/projects");
  return res.json();
}

export async function createProjectApi(input: CreateProjectInput): Promise<ProjectApiResponse> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function updateProjectApi(input: UpdateProjectInput): Promise<ProjectApiResponse> {
  const res = await fetch("/api/projects", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function deleteProjectApi(id: string): Promise<ProjectApiResponse> {
  const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
  return res.json();
}
