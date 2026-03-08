import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createDecipheriv, createHash } from "crypto";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ProjectApiIntegration, ProjectConfigSimulationResult } from "@/domain/dashboard/types";

interface StoredProjectAdvancedConfig {
  loginRequired: boolean;
  encryptedUserSecretKey?: string;
  customServiceUrlEncrypted?: string;
  apiIntegrations: ProjectApiIntegration[];
}

async function getAuthenticatedUser() {
  console.log("Debug flow: simulate getAuthenticatedUser fired");
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const result = await validateSession(token);
  return result?.user ?? null;
}

function parseAdvancedProjectConfig(rawValue: string): StoredProjectAdvancedConfig {
  console.log("Debug flow: simulate parseAdvancedProjectConfig fired", { rawValueLength: rawValue.length });
  try {
    const parsed = JSON.parse(rawValue) as {
      loginRequired?: unknown;
      encryptedUserSecretKey?: unknown;
      customServiceUrlEncrypted?: unknown;
      apiIntegrations?: unknown;
    };
    const apiIntegrations = Array.isArray(parsed.apiIntegrations)
      ? parsed.apiIntegrations.filter((item): item is ProjectApiIntegration => {
          if (!item || typeof item !== "object") {
            return false;
          }
          const candidate = item as Record<string, unknown>;
          return (
            typeof candidate.id === "string" &&
            typeof candidate.navigationId === "string" &&
            typeof candidate.navigationLabel === "string" &&
            typeof candidate.method === "string" &&
            (typeof candidate.url === "string" || typeof candidate.encryptedUrl === "string")
          );
        })
      : [];
    return {
      loginRequired: Boolean(parsed.loginRequired),
      encryptedUserSecretKey:
        typeof parsed.encryptedUserSecretKey === "string" ? parsed.encryptedUserSecretKey : undefined,
      customServiceUrlEncrypted:
        typeof parsed.customServiceUrlEncrypted === "string" ? parsed.customServiceUrlEncrypted : undefined,
      apiIntegrations,
    };
  } catch (err) {
    console.error("Debug flow: simulate parseAdvancedProjectConfig parse error", err);
    return { loginRequired: false, apiIntegrations: [] };
  }
}

function decryptWithUserSecret(payload: string, secretKey: string): string {
  console.log("Debug flow: decryptWithUserSecret fired", { payloadLength: payload.length });
  const [ivHex, authTagHex, contentHex] = payload.split(":");
  if (!ivHex || !authTagHex || !contentHex) {
    throw new Error("Invalid encrypted payload format");
  }
  const key = createHash("sha256").update(secretKey).digest();
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(contentHex, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
}

function buildRequestUrl(baseUrl: string | null, endpointUrl: string): string {
  console.log("Debug flow: buildRequestUrl fired", { baseUrl, endpointUrl });
  const trimmedEndpoint = endpointUrl.trim();
  if (/^https?:\/\//i.test(trimmedEndpoint)) {
    return trimmedEndpoint;
  }
  if (!baseUrl) {
    return trimmedEndpoint;
  }
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = trimmedEndpoint.startsWith("/") ? trimmedEndpoint : `/${trimmedEndpoint}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function runSimulationForIntegration(
  integration: ProjectApiIntegration,
  baseUrl: string | null,
  secretKey: string
): Promise<ProjectConfigSimulationResult> {
  console.log("Debug flow: runSimulationForIntegration fired", { integrationId: integration.id });
  const decryptedUrl = integration.encryptedUrl
    ? decryptWithUserSecret(integration.encryptedUrl, secretKey)
    : integration.url ?? "";
  const finalUrl = buildRequestUrl(baseUrl, decryptedUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(finalUrl, {
      method: integration.method,
      signal: controller.signal,
      headers: {
        Accept: "application/json, text/plain;q=0.9,*/*;q=0.8",
      },
    });
    const rawText = await response.text();
    let parsedResponse: unknown = rawText;
    try {
      parsedResponse = rawText ? JSON.parse(rawText) : null;
    } catch {
      parsedResponse = rawText;
    }
    return {
      integrationId: integration.id,
      navigationLabel: integration.navigationLabel,
      method: integration.method,
      url: finalUrl,
      passed: response.ok,
      statusCode: response.status,
      response: parsedResponse,
    };
  } catch (err) {
    return {
      integrationId: integration.id,
      navigationLabel: integration.navigationLabel,
      method: integration.method,
      url: finalUrl,
      passed: false,
      statusCode: 0,
      response: {
        error: err instanceof Error ? err.message : "Unknown simulation error",
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  console.log("Debug flow: POST /api/projects/simulate fired");
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { projectId?: string; secretKey?: string };
  if (!body.projectId) {
    return NextResponse.json({ ok: false, error: "Project ID is required" }, { status: 400 });
  }
  if (!body.secretKey || body.secretKey.trim().length === 0) {
    return NextResponse.json({ ok: false, error: "Secret key is required for simulation." }, { status: 400 });
  }

  const project = await prisma.project.findFirst({
    where: { id: body.projectId, userId: user.id },
    select: { id: true },
  });
  if (!project) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  const config = await prisma.appConfig.findUnique({
    where: {
      key_projectId: {
        key: "project_advanced_config",
        projectId: project.id,
      },
    },
  });
  if (!config) {
    return NextResponse.json({ ok: true, results: [] });
  }

  const parsedConfig = parseAdvancedProjectConfig(config.value);
  let baseUrl: string | null = null;
  if (parsedConfig.customServiceUrlEncrypted) {
    try {
      baseUrl = decryptWithUserSecret(parsedConfig.customServiceUrlEncrypted, body.secretKey.trim());
    } catch (err) {
      console.error("Debug flow: POST /api/projects/simulate decrypt error", err);
    }
  }

  const results = await Promise.all(
    parsedConfig.apiIntegrations.map((integration) =>
      runSimulationForIntegration(integration, baseUrl, body.secretKey!.trim())
    )
  );

  return NextResponse.json({ ok: true, results });
}
