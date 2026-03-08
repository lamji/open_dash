export async function publishedLoginApi(
  layoutId: string,
  next: string,
  email: string,
  password: string
): Promise<{ ok: boolean; redirectUrl?: string; error?: string }> {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ layoutId, next, email, password }),
  });
  const rawBody = await response.text();
  if (!rawBody.trim()) {
    return { ok: false, error: "Empty response from /api/login" };
  }

  try {
    return JSON.parse(rawBody) as { ok: boolean; redirectUrl?: string; error?: string };
  } catch {
    return { ok: false, error: "Invalid JSON response from /api/login" };
  }
}
