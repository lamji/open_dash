import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BuilderShell from "@/presentation/builder";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface BuilderPageProps {
  searchParams: Promise<{ projectId?: string }>;
}

export default async function BuilderPage({ searchParams }: BuilderPageProps) {
  console.log("Debug flow: BuilderPage fired with", { searchParams: await searchParams });

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  const sessionData = await validateSession(sessionToken);

  if (!sessionData) {
    redirect("/login");
  }

  const params = await searchParams;
  const projectId = params.projectId;

  if (!projectId) {
    console.log("Debug flow: BuilderPage - no projectId, redirecting to /dashboard");
    redirect("/dashboard");
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: sessionData.user.id },
  });

  if (!project) {
    console.log("Debug flow: BuilderPage - project not found or access denied, redirecting to /dashboard");
    redirect("/dashboard");
  }

  console.log("Debug flow: BuilderPage - authentication and project validation passed", { projectId, userId: sessionData.user.id });

  return (
    <Suspense>
      <BuilderShell />
    </Suspense>
  );
}
