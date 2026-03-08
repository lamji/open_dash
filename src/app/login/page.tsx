import { Suspense } from "react";
import LoginPage from "@/presentation/login";

export default function GlobalLoginRoute() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}
