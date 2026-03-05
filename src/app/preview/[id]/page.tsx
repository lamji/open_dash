import DashboardPreview from "@/presentation/builder/DashboardPreview";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PreviewPage({ params }: Props) {
  const { id } = await params;
  return <DashboardPreview id={id} />;
}
