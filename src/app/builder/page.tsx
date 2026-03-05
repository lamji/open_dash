import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BuilderShell from "@/presentation/builder";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/auth";

export default async function BuilderPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  const sessionData = await validateSession(sessionToken);

  if (!sessionData) {
    redirect("/login");
  }

  return (
    <Suspense>
      <BuilderShell />
    </Suspense>
  );
}
