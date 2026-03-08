import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { emitProjectsCacheInvalidation } from "@/lib/socket-server";
import { encryptProjectConfigValue } from "@/lib/project-config-crypto";
import type { ProjectApiIntegration, ProjectConfigPayload } from "@/domain/dashboard/types";

const BUILDER_LAYOUT_CONFIG_KEY = "builder_layout_state";
const PROJECT_ADVANCED_CONFIG_KEY = "project_advanced_config";

interface BuilderLayoutState {
  draftLayoutId?: string | null;
  publishedLayoutId?: string | null;
  lastPublishedAt?: string | null;
}

interface StoredProjectAdvancedConfig {
  loginRequired: boolean;
  encryptedUserSecretKey?: string;
  customServiceUrlEncrypted?: string;
  loginEndpointEncrypted?: string;
  apiIntegrations: ProjectApiIntegration[];
}

async function getAuthenticatedUser() {
  console.log("Debug flow: getAuthenticatedUser fired");
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const result = await validateSession(token);
  return result?.user ?? null;
}

function slugify(text: string): string {
  console.log("Debug flow: slugify fired", { inputLength: text.length });
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50);
}

function parseBuilderLayoutState(rawValue: string): BuilderLayoutState {
  console.log("Debug flow: parseBuilderLayoutState fired", { rawValueLength: rawValue.length });
  try {
    return JSON.parse(rawValue) as BuilderLayoutState;
  } catch (err) {
    console.error("Debug flow: parseBuilderLayoutState parse error", err);
    return {};
  }
}

function normalizeIntegrations(input: unknown): ProjectApiIntegration[] {
  console.log("Debug flow: normalizeIntegrations fired");
  if (!Array.isArray(input)) {
    return [];
  }
  return input
    .filter((item): item is ProjectApiIntegration => {
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
    .map((item) => ({
      id: item.id,
      navigationId: item.navigationId,
      navigationLabel: item.navigationLabel,
      method: item.method,
      url: typeof item.url === "string" ? item.url.trim() : undefined,
      encryptedUrl: typeof item.encryptedUrl === "string" ? item.encryptedUrl : undefined,
    }));
}

function parseAdvancedProjectConfig(rawValue: string): StoredProjectAdvancedConfig {
  console.log("Debug flow: parseAdvancedProjectConfig fired", { rawValueLength: rawValue.length });
  try {
    const parsed = JSON.parse(rawValue) as {
      loginRequired?: unknown;
      encryptedUserSecretKey?: unknown;
      customServiceUrlEncrypted?: unknown;
      loginEndpointEncrypted?: unknown;
      apiIntegrations?: unknown;
    };
    return {
      loginRequired: Boolean(parsed.loginRequired),
      encryptedUserSecretKey:
        typeof parsed.encryptedUserSecretKey === "string" && parsed.encryptedUserSecretKey.length > 0
          ? parsed.encryptedUserSecretKey
          : undefined,
      customServiceUrlEncrypted:
        typeof parsed.customServiceUrlEncrypted === "string" && parsed.customServiceUrlEncrypted.length > 0
          ? parsed.customServiceUrlEncrypted
          : undefined,
      loginEndpointEncrypted:
        typeof parsed.loginEndpointEncrypted === "string" && parsed.loginEndpointEncrypted.length > 0
          ? parsed.loginEndpointEncrypted
          : undefined,
      apiIntegrations: normalizeIntegrations(parsed.apiIntegrations),
    };
  } catch (err) {
    console.error("Debug flow: parseAdvancedProjectConfig parse error", err);
    return {
      loginRequired: false,
      apiIntegrations: [],
    };
  }
}

function toProjectResponse(
  project: {
    id: string;
    name: string;
    slug: string;
    description: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
  },
  layoutConfig: BuilderLayoutState | undefined,
  advancedConfig: StoredProjectAdvancedConfig | undefined
) {
  console.log("Debug flow: toProjectResponse fired", { projectId: project.id });
  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    description: project.description,
    published: project.published,
    liveLayoutId: layoutConfig?.publishedLayoutId ?? null,
    loginRequired: Boolean(advancedConfig?.loginRequired),
    hasUserSecretKey: Boolean(advancedConfig?.encryptedUserSecretKey),
    hasCustomServiceUrl: Boolean(advancedConfig?.customServiceUrlEncrypted),
    hasLoginEndpoint: Boolean(advancedConfig?.loginEndpointEncrypted),
    encryptedCustomServiceUrl: advancedConfig?.customServiceUrlEncrypted ?? null,
    encryptedLoginEndpoint: advancedConfig?.loginEndpointEncrypted ?? null,
    apiIntegrations: advancedConfig?.apiIntegrations ?? [],
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export async function GET() {
  console.log("Debug flow: GET /api/projects fired");
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      published: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const projectIds = projects.map((project) => project.id);
  const projectConfigs =
    projectIds.length === 0
      ? []
      : await prisma.appConfig.findMany({
          where: {
            projectId: { in: projectIds },
            key: { in: [BUILDER_LAYOUT_CONFIG_KEY, PROJECT_ADVANCED_CONFIG_KEY] },
          },
        });

  const layoutConfigMap = new Map<string, BuilderLayoutState>();
  const advancedConfigMap = new Map<string, StoredProjectAdvancedConfig>();

  projectConfigs.forEach((config) => {
    if (config.key === BUILDER_LAYOUT_CONFIG_KEY) {
      layoutConfigMap.set(config.projectId, parseBuilderLayoutState(config.value));
    }
    if (config.key === PROJECT_ADVANCED_CONFIG_KEY) {
      advancedConfigMap.set(config.projectId, parseAdvancedProjectConfig(config.value));
    }
  });

  return NextResponse.json({
    ok: true,
    projects: projects.map((project) =>
      toProjectResponse(project, layoutConfigMap.get(project.id), advancedConfigMap.get(project.id))
    ),
  });
}

export async function POST(request: NextRequest) {
  console.log("Debug flow: POST /api/projects fired");
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description } = body;

  if (!name || typeof name !== "string" || name.trim().length < 1) {
    return NextResponse.json({ ok: false, error: "Project name is required" }, { status: 400 });
  }

  const baseSlug = slugify(name);
  const suffix = Math.random().toString(36).substring(2, 8);
  const slug = `${baseSlug}-${suffix}`;

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: name.trim(),
      slug,
      description: description?.trim() ?? "",
    },
  });
  emitProjectsCacheInvalidation();

  return NextResponse.json({
    ok: true,
    project: toProjectResponse(project, undefined, {
      loginRequired: false,
      apiIntegrations: [],
    }),
  });
}

export async function PUT(request: NextRequest) {
  console.log("Debug flow: PUT /api/projects fired");
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, description, published, config } = body as {
    id?: string;
    name?: string;
    description?: string;
    published?: boolean;
    config?: ProjectConfigPayload;
  };
  console.log("Debug flow: PUT /api/projects params", { id, published, hasConfig: !!config });

  if (!id) {
    return NextResponse.json({ ok: false, error: "Project ID is required" }, { status: 400 });
  }

  const existing = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name.trim();
  if (description !== undefined) data.description = description.trim();

  if (published !== undefined) {
    if (published === true) {
      const builderLayoutConfig = await prisma.appConfig.findUnique({
        where: {
          key_projectId: {
            key: BUILDER_LAYOUT_CONFIG_KEY,
            projectId: id,
          },
        },
      });
      const parsedLayoutConfig = builderLayoutConfig
        ? parseBuilderLayoutState(builderLayoutConfig.value)
        : null;
      const draftLayoutId = parsedLayoutConfig?.draftLayoutId ?? null;

      if (!draftLayoutId) {
        return NextResponse.json(
          { ok: false, error: "Cannot publish a project without a saved builder draft." },
          { status: 400 }
        );
      }

      await prisma.appConfig.upsert({
        where: {
          key_projectId: {
            key: BUILDER_LAYOUT_CONFIG_KEY,
            projectId: id,
          },
        },
        update: {
          value: JSON.stringify({
            draftLayoutId,
            publishedLayoutId: draftLayoutId,
            lastPublishedAt: new Date().toISOString(),
          }),
        },
        create: {
          key: BUILDER_LAYOUT_CONFIG_KEY,
          projectId: id,
          value: JSON.stringify({
            draftLayoutId,
            publishedLayoutId: draftLayoutId,
            lastPublishedAt: new Date().toISOString(),
          }),
        },
      });
    }
    data.published = published;
  }

  if (config) {
    const existingAdvancedConfig = await prisma.appConfig.findUnique({
      where: {
        key_projectId: {
          key: PROJECT_ADVANCED_CONFIG_KEY,
          projectId: id,
        },
      },
    });

    const parsedExistingAdvancedConfig = existingAdvancedConfig
      ? parseAdvancedProjectConfig(existingAdvancedConfig.value)
      : { loginRequired: false, apiIntegrations: [] };

    const nextEncryptedSecretKey = typeof config.secretKey === "string" && config.secretKey.trim().length > 0
      ? encryptProjectConfigValue(config.secretKey.trim())
      : parsedExistingAdvancedConfig.encryptedUserSecretKey;

    const nextEncryptedUrl = config.clearCustomServiceUrl
      ? undefined
      : typeof config.customServiceUrlEncrypted === "string" && config.customServiceUrlEncrypted.trim().length > 0
        ? config.customServiceUrlEncrypted.trim()
        : parsedExistingAdvancedConfig.customServiceUrlEncrypted;
    const nextEncryptedLoginEndpoint = config.clearLoginEndpoint
      ? undefined
      : typeof config.loginEndpointEncrypted === "string" && config.loginEndpointEncrypted.trim().length > 0
        ? config.loginEndpointEncrypted.trim()
        : parsedExistingAdvancedConfig.loginEndpointEncrypted;

    const nextEncryptedIntegrations =
      Array.isArray(config.apiIntegrationsEncrypted) && config.apiIntegrationsEncrypted.length > 0
        ? normalizeIntegrations(config.apiIntegrationsEncrypted).map((integration) => ({
            ...integration,
            url: undefined,
          }))
        : parsedExistingAdvancedConfig.apiIntegrations;

    await prisma.appConfig.upsert({
      where: {
        key_projectId: {
          key: PROJECT_ADVANCED_CONFIG_KEY,
          projectId: id,
        },
      },
      update: {
        value: JSON.stringify({
          loginRequired: Boolean(config.loginRequired),
          encryptedUserSecretKey: nextEncryptedSecretKey,
          customServiceUrlEncrypted: nextEncryptedUrl,
          loginEndpointEncrypted: nextEncryptedLoginEndpoint,
          apiIntegrations: nextEncryptedIntegrations,
        } satisfies StoredProjectAdvancedConfig),
      },
      create: {
        key: PROJECT_ADVANCED_CONFIG_KEY,
        projectId: id,
        value: JSON.stringify({
          loginRequired: Boolean(config.loginRequired),
          encryptedUserSecretKey: nextEncryptedSecretKey,
          customServiceUrlEncrypted: nextEncryptedUrl,
          loginEndpointEncrypted: nextEncryptedLoginEndpoint,
          apiIntegrations: nextEncryptedIntegrations,
        } satisfies StoredProjectAdvancedConfig),
      },
    });
  }

  const project = await prisma.project.update({
    where: { id },
    data,
  });

  emitProjectsCacheInvalidation();

  const [builderLayoutConfig, advancedConfig] = await Promise.all([
    prisma.appConfig.findUnique({
      where: {
        key_projectId: {
          key: BUILDER_LAYOUT_CONFIG_KEY,
          projectId: id,
        },
      },
    }),
    prisma.appConfig.findUnique({
      where: {
        key_projectId: {
          key: PROJECT_ADVANCED_CONFIG_KEY,
          projectId: id,
        },
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    project: toProjectResponse(
      project,
      builderLayoutConfig ? parseBuilderLayoutState(builderLayoutConfig.value) : undefined,
      advancedConfig ? parseAdvancedProjectConfig(advancedConfig.value) : undefined
    ),
  });
}

export async function DELETE(request: NextRequest) {
  console.log("Debug flow: DELETE /api/projects fired");
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ ok: false, error: "Project ID is required" }, { status: 400 });
  }

  const existing = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  await prisma.project.delete({ where: { id } });
  emitProjectsCacheInvalidation();

  return NextResponse.json({ ok: true });
}
