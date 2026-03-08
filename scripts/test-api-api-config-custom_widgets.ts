#!/usr/bin/env tsx

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

interface AuthResponse {
  ok: boolean;
  error?: string;
}

function buildJsonHeaders(cookie?: string): HeadersInit {
  console.log("Debug flow: buildJsonHeaders (custom_widgets test) fired", { hasCookie: Boolean(cookie) });
  return {
    "Content-Type": "application/json",
    ...(cookie ? { Cookie: cookie } : {}),
  };
}

async function signupAndLogin(): Promise<string> {
  console.log("Debug flow: signupAndLogin (custom_widgets test) fired");
  const email = `custom-widgets-test-${Date.now()}@example.com`;
  const password = "password1234";

  const signupResponse = await fetch(`${BASE_URL}/api/auth`, {
    method: "POST",
    headers: buildJsonHeaders(),
    body: JSON.stringify({
      action: "signup",
      name: "Custom Widgets Test",
      email,
      password,
      confirmPassword: password,
    }),
  });
  const signupData = (await signupResponse.json()) as AuthResponse;
  if (!signupData.ok) {
    throw new Error(`Signup failed: ${signupData.error ?? "unknown error"}`);
  }

  const loginResponse = await fetch(`${BASE_URL}/api/auth`, {
    method: "POST",
    headers: buildJsonHeaders(),
    body: JSON.stringify({
      action: "login",
      email,
      password,
    }),
  });
  const loginData = (await loginResponse.json()) as AuthResponse;
  if (!loginData.ok) {
    throw new Error(`Login failed: ${loginData.error ?? "unknown error"}`);
  }

  const cookie = loginResponse.headers.get("set-cookie");
  if (!cookie) {
    throw new Error("Login failed: missing session cookie");
  }

  return cookie.split(";")[0];
}

async function createProject(cookie: string): Promise<string> {
  console.log("Debug flow: createProject (custom_widgets test) fired");
  const createProjectResponse = await fetch(`${BASE_URL}/api/projects`, {
    method: "POST",
    headers: buildJsonHeaders(cookie),
    body: JSON.stringify({
      name: "Custom Widgets Config Test",
      description: "Project created by custom widgets config API test",
    }),
  });
  const createProjectData = (await createProjectResponse.json()) as {
    ok: boolean;
    project?: { id: string };
    error?: string;
  };
  if (!createProjectData.ok || !createProjectData.project?.id) {
    throw new Error(`Project creation failed: ${createProjectData.error ?? "unknown error"}`);
  }
  return createProjectData.project.id;
}

async function runCustomWidgetsConfigTest() {
  console.log("Debug flow: runCustomWidgetsConfigTest fired");
  const cookie = await signupAndLogin();
  const projectId = await createProject(cookie);

  const initialGetResponse = await fetch(`${BASE_URL}/api/config/custom_widgets?projectId=${projectId}`, {
    method: "GET",
    headers: buildJsonHeaders(cookie),
  });
  const initialGetData = (await initialGetResponse.json()) as { widgets?: unknown[] } | null;
  if (!initialGetResponse.ok) {
    throw new Error(`Initial GET failed with status ${initialGetResponse.status}`);
  }
  if (initialGetData !== null && !Array.isArray(initialGetData.widgets)) {
    throw new Error("Initial GET returned an unexpected payload");
  }

  const widgetPayload = {
    widgets: [
      {
        id: `widget-${Date.now()}`,
        widgetId: "custom-kpi-test",
        title: "Custom KPI",
        description: "Custom widget from test",
        category: "stats",
        widgetData: { value: "42", label: "Answer" },
        prompt: "create a custom kpi widget",
        createdAt: new Date().toISOString(),
      },
    ],
  };

  const putResponse = await fetch(`${BASE_URL}/api/config/custom_widgets?projectId=${projectId}`, {
    method: "PUT",
    headers: buildJsonHeaders(cookie),
    body: JSON.stringify(widgetPayload),
  });
  const putData = (await putResponse.json()) as { ok?: boolean; error?: string };
  if (!putResponse.ok || !putData.ok) {
    throw new Error(`PUT failed: ${putData.error ?? `status ${putResponse.status}`}`);
  }

  const finalGetResponse = await fetch(`${BASE_URL}/api/config/custom_widgets?projectId=${projectId}`, {
    method: "GET",
    headers: buildJsonHeaders(cookie),
  });
  const finalGetData = (await finalGetResponse.json()) as { widgets?: Array<{ title?: string }> };
  if (!finalGetResponse.ok) {
    throw new Error(`Final GET failed with status ${finalGetResponse.status}`);
  }
  if (!Array.isArray(finalGetData.widgets) || finalGetData.widgets[0]?.title !== "Custom KPI") {
    throw new Error("Final GET did not return the saved custom widgets payload");
  }

  console.log("Custom widgets config API test passed");
}

void runCustomWidgetsConfigTest().catch((error) => {
  console.error("Custom widgets config API test failed");
  console.error(error);
  process.exit(1);
});
