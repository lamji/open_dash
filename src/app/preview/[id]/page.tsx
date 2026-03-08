import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardPreview from "@/presentation/builder/DashboardPreview";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import {
  getPublishedProjectAccessConfig,
  PUBLISHED_DASHBOARD_COOKIE_NAME,
  validatePublishedAccessToken,
} from "@/lib/published-dashboard-auth";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PreviewPage({ params }: Props) {
  console.log("Debug flow: PreviewPage fired");
  const { id } = await params;
  const accessConfig = await getPublishedProjectAccessConfig(id);
  const loginRequired = Boolean(accessConfig?.loginRequired);

  if (loginRequired && accessConfig) {
    const cookieStore = await cookies();
    const publishedToken = cookieStore.get(PUBLISHED_DASHBOARD_COOKIE_NAME)?.value;
    const hasPublishedAccess =
      !!publishedToken &&
      validatePublishedAccessToken(publishedToken, accessConfig.projectId, id);
    if (!hasPublishedAccess) {
      const builderToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
      const builderSession = builderToken ? await validateSession(builderToken) : null;
      if (!builderSession?.user) {
        redirect(`/login?next=/preview/${id}`);
      }
    }
  }

  return <DashboardPreview id={id} />;
}
