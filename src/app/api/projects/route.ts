import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/auth";

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const result = await validateSession(token);
  return result?.user ?? null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50);
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  const builderLayoutConfigs = await prisma.appConfig.findMany({
    where: {
      projectId: { in: projects.map((project) => project.id) },
      key: "builder_layout_state",
    },
  });
  const layoutConfigMap = new Map<string, { publishedLayoutId?: string | null }>();
  builderLayoutConfigs.forEach((config) => {
    try {
      layoutConfigMap.set(
        config.projectId,
        JSON.parse(config.value) as { publishedLayoutId?: string | null }
      );
    } catch (err) {
      console.error("Debug flow: GET /api/projects config parse error", err);
    }
  });

  return NextResponse.json({
    ok: true,
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      published: p.published,
      liveLayoutId: layoutConfigMap.get(p.id)?.publishedLayoutId ?? null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
  });
}

export async function POST(request: NextRequest) {
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

  return NextResponse.json({
    ok: true,
    project: {
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      published: project.published,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    },
  });
}

export async function PUT(request: NextRequest) {
  console.log(`Debug flow: PUT /api/projects fired`);
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, description, published } = body;
  console.log(`Debug flow: PUT /api/projects params`, { id, published });

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
            key: "builder_layout_state",
            projectId: id,
          },
        },
      });
      const parsedLayoutConfig = builderLayoutConfig
        ? JSON.parse(builderLayoutConfig.value) as {
            draftLayoutId?: string | null;
            publishedLayoutId?: string | null;
            lastPublishedAt?: string | null;
          }
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
            key: "builder_layout_state",
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
          key: "builder_layout_state",
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

  const project = await prisma.project.update({
    where: { id },
    data,
  });
  const builderLayoutConfig = await prisma.appConfig.findUnique({
    where: {
      key_projectId: {
        key: "builder_layout_state",
        projectId: id,
      },
    },
  });
  let liveLayoutId: string | null = null;
  if (builderLayoutConfig) {
    try {
      liveLayoutId = (JSON.parse(builderLayoutConfig.value) as { publishedLayoutId?: string | null }).publishedLayoutId ?? null;
    } catch (err) {
      console.error("Debug flow: PUT /api/projects config parse error", err);
    }
  }

  return NextResponse.json({
    ok: true,
    project: {
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      published: project.published,
      liveLayoutId,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    },
  });
}

export async function DELETE(request: NextRequest) {
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

  return NextResponse.json({ ok: true });
}
