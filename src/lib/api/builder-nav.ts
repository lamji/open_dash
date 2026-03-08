import type { NavItem } from "@/domain/builder/types";
import { showSecurityAlert, showSuccessAlert, detectFKConstraintError } from "@/lib/security-alerts";

interface CreateNavItemResponse {
  ok: boolean;
  item?: NavItem;
  error?: string;
  errorCode?: string;
}

interface GetNavItemsResponse {
  ok: boolean;
  items?: NavItem[];
  error?: string;
}

export async function createNavItem(
  label: string,
  projectId: string
): Promise<CreateNavItemResponse> {
  console.log(`Debug flow: createNavItem fired with`, { label, projectId });
  try {
    const res = await fetch(`/api/sidebar?projectId=${projectId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    const data = await parseBuilderNavResponse<CreateNavItemResponse>(res, "Failed to create nav item");
    console.log(`Debug flow: createNavItem response`, { ok: data.ok, id: data.item?.id, errorCode: data.errorCode });
    
    // Check for FK constraint violation (security breach attempt)
    if (!data.ok && data.errorCode === "FK_CONSTRAINT_VIOLATION") {
      console.log(`Debug flow: createNavItem FK constraint violation detected`);
      showSecurityAlert({
        message: "Unauthorized access attempt detected. Invalid project ID. You have been logged out for security.",
        autoLogout: true,
        redirectTo: "/auth/login",
      });
      return data;
    }
    
    // Check for FK error in error message as fallback
    if (!data.ok && data.error && detectFKConstraintError(data.error)) {
      console.log(`Debug flow: createNavItem FK error detected in message`);
      showSecurityAlert({
        message: "Unauthorized access attempt detected. You have been logged out for security.",
        autoLogout: true,
        redirectTo: "/auth/login",
      });
      return data;
    }
    
    // Show success message for successful creation
    if (data.ok && data.item) {
      showSuccessAlert(`Navigation item "${label}" created successfully`);
    }
    
    return data;
  } catch (err) {
    console.error(`Debug flow: createNavItem error`, err);
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getNavItems(projectId: string): Promise<GetNavItemsResponse> {
  console.log(`Debug flow: getNavItems fired with`, { projectId });
  try {
    const res = await fetch(`/api/sidebar?projectId=${projectId}&forceRefresh=1`, {
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const items = (await res.json()) as NavItem[];
    console.log(`Debug flow: getNavItems loaded`, { count: items.length });
    return { ok: true, items };
  } catch (err) {
    console.error(`Debug flow: getNavItems error`, err);
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

interface DeleteNavItemResponse {
  ok: boolean;
  error?: string;
}

async function parseBuilderNavResponse<T extends { ok: boolean; error?: string }>(
  res: Response,
  fallbackError: string
): Promise<T> {
  console.log(`Debug flow: parseBuilderNavResponse fired with`, {
    status: res.status,
    ok: res.ok,
    contentType: res.headers.get("content-type"),
  });
  const rawBody = await res.text();
  if (!rawBody.trim()) {
    console.warn(`Debug flow: parseBuilderNavResponse empty body`, { status: res.status });
    return {
      ok: false,
      error: `${fallbackError} (HTTP ${res.status}: empty response body)`,
    } as T;
  }

  try {
    const parsed = JSON.parse(rawBody) as T;
    if (!res.ok && (!parsed.error || parsed.error.trim().length === 0)) {
      return {
        ...parsed,
        ok: false,
        error: `${fallbackError} (HTTP ${res.status})`,
      };
    }
    return parsed;
  } catch (err) {
    console.error(`Debug flow: parseBuilderNavResponse JSON parse error`, err);
    return {
      ok: false,
      error: `${fallbackError} (HTTP ${res.status}: invalid JSON response)`,
    } as T;
  }
}

export async function deleteNavItem(
  itemId: string,
  projectId: string
): Promise<DeleteNavItemResponse> {
  console.log(`Debug flow: deleteNavItem fired with`, { itemId, projectId });
  try {
    const res = await fetch(`/api/sidebar/${itemId}?projectId=${projectId}`, {
      method: "DELETE",
    });
    const data = await parseBuilderNavResponse<DeleteNavItemResponse>(res, "Failed to delete nav item");
    console.log(`Debug flow: deleteNavItem response`, { ok: data.ok });
    
    if (data.ok) {
      showSuccessAlert("Navigation item deleted successfully");
    }
    
    return data;
  } catch (err) {
    console.error(`Debug flow: deleteNavItem error`, err);
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
