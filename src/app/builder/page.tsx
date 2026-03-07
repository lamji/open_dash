import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BuilderShell from "@/presentation/builder";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface BuilderPageProps {
  searchParams: Promise<{ projectId?: string; preview?: string }> | { projectId?: string; preview?: string };
}

export default async function BuilderPage({ searchParams }: BuilderPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  console.log("Debug flow: BuilderPage fired with", { searchParams: resolvedSearchParams });

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  let sessionData: Awaited<ReturnType<typeof validateSession>> | null = null;
  try {
    sessionData = await validateSession(sessionToken);
  } catch (err) {
    console.error("Debug flow: BuilderPage validateSession error", err);
    redirect("/login");
  }

  if (!sessionData) {
    redirect("/login");
  }

  const projectId = resolvedSearchParams.projectId;
  const previewParam = resolvedSearchParams.preview;

  if (!projectId) {
    console.log("Debug flow: BuilderPage - no projectId, redirecting to /dashboard");
    redirect("/dashboard");
  }

  let project: Awaited<ReturnType<typeof prisma.project.findFirst>> | null = null;
  try {
    project = await prisma.project.findFirst({
      where: { id: projectId, userId: sessionData.user.id },
    });
  } catch (err) {
    console.error("Debug flow: BuilderPage project lookup error", { projectId, err });
    redirect("/dashboard");
  }

  if (!project) {
    console.log("Debug flow: BuilderPage - project not found or access denied, redirecting to /dashboard");
    redirect("/dashboard");
  }

  if (previewParam === "true") {
    console.log("Debug flow: BuilderPage preview redirect flow fired", { projectId });
    const builderLayoutConfig = await prisma.appConfig.findUnique({
      where: {
        key_projectId: {
          key: "builder_layout_state",
          projectId,
        },
      },
    });
    let publishedLayoutId: string | null = null;
    let draftLayoutId: string | null = null;
    if (builderLayoutConfig) {
      try {
        const parsedConfig = JSON.parse(builderLayoutConfig.value) as {
          draftLayoutId?: string | null;
          publishedLayoutId?: string | null;
        };
        publishedLayoutId = parsedConfig.publishedLayoutId ?? null;
        draftLayoutId = parsedConfig.draftLayoutId ?? null;
      } catch (err) {
        console.error("Debug flow: BuilderPage preview config parse error", err);
      }
    }
    const targetLayoutId = project.published
      ? publishedLayoutId
      : draftLayoutId;
    if (!targetLayoutId) {
      redirect("/dashboard");
    }
    redirect(`/preview/${targetLayoutId}`);
  }

  console.log("Debug flow: BuilderPage - authentication and project validation passed", { projectId, userId: sessionData.user.id });

  return (
    <Suspense>
      <BuilderShell />
    </Suspense>
  );
}
