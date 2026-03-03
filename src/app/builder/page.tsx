import { Suspense } from "react";
import HomePage from "@/presentation/home";

export default function BuilderPage() {
  return (
    <Suspense>
      <HomePage />
    </Suspense>
  );
}
