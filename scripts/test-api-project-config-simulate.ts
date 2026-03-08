#!/usr/bin/env tsx

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

interface AuthResponse {
  ok: boolean;
  error?: string;
}

function buildJsonHeaders(cookie?: string): HeadersInit {
  console.log("Debug flow: buildJsonHeaders fired", { hasCookie: Boolean(cookie) });
  return {
    "Content-Type": "application/json",
    ...(cookie ? { Cookie: cookie } : {}),
  };
}

async function signupAndLogin(): Promise<string> {
  console.log("Debug flow: signupAndLogin fired");
  const email = `project-config-test-${Date.now()}@example.com`;
  const password = "password1234";

  const signupResponse = await fetch(`${BASE_URL}/api/auth`, {
    method: "POST",
    headers: buildJsonHeaders(),
    body: JSON.stringify({
      action: "signup",
      name: "Project Config Test",
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

  const cookie = loginResponse.headers.get("set-cookie");
  if (!cookie) {
    throw new Error("Login failed: missing session cookie");
  }
  const loginData = (await loginResponse.json()) as AuthResponse;
  if (!loginData.ok) {
    throw new Error(`Login failed: ${loginData.error ?? "unknown error"}`);
  }

  return cookie.split(";")[0];
}

async function runProjectConfigSimulationTest() {
  console.log("Debug flow: runProjectConfigSimulationTest fired");
  const cookie = await signupAndLogin();

  const createProjectResponse = await fetch(`${BASE_URL}/api/projects`, {
    method: "POST",
    headers: buildJsonHeaders(cookie),
    body: JSON.stringify({
      name: "Project Config Simulation Test",
      description: "Project created by API test script",
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

  const projectId = createProjectData.project.id;
  console.log(`Created project: ${projectId}`);

  const configureResponse = await fetch(`${BASE_URL}/api/projects`, {
    method: "PUT",
    headers: buildJsonHeaders(cookie),
    body: JSON.stringify({
      id: projectId,
      config: {
        loginRequired: false,
        customServiceUrl: "https://httpbin.org",
        apiIntegrations: [
          {
            id: `integration-${Date.now()}`,
            navigationId: "nav-test",
            navigationLabel: "Test Navigation",
            method: "GET",
            url: "/get",
          },
        ],
      },
    }),
  });
  const configureData = (await configureResponse.json()) as { ok: boolean; error?: string };
  if (!configureData.ok) {
    throw new Error(`Project config save failed: ${configureData.error ?? "unknown error"}`);
  }

  const simulateResponse = await fetch(`${BASE_URL}/api/projects/simulate`, {
    method: "POST",
    headers: buildJsonHeaders(cookie),
    body: JSON.stringify({
      projectId,
    }),
  });
  const simulateData = (await simulateResponse.json()) as {
    ok: boolean;
    results?: unknown[];
    error?: string;
  };
  if (!simulateData.ok) {
    throw new Error(`Simulation failed: ${simulateData.error ?? "unknown error"}`);
  }

  console.log("Simulation results:");
  console.log(JSON.stringify(simulateData.results ?? [], null, 2));
}

void runProjectConfigSimulationTest().catch((error) => {
  console.error("Project config simulation test failed");
  console.error(error);
  process.exit(1);
});
