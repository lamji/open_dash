import { Suspense } from "react";
import LoginPage from "@/presentation/login";

export default function LoginRoute() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}
