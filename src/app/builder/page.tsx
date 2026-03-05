import { Suspense } from "react";
import BuilderShell from "@/presentation/builder";

export default function BuilderPage() {
  return (
    <Suspense>
      <BuilderShell />
    </Suspense>
  );
}
