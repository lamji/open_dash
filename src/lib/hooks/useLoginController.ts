import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { loginApi } from "@/lib/auth-api";
import { publishedLoginApi } from "@/lib/api/published-login";
import type { LoginFormData, LoginFormErrors, LoginState } from "@/domain/auth/types";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
});

function isTransportLevelLoginError(message: string): boolean {
  console.log("Debug flow: isTransportLevelLoginError fired", { message });
  return (
    message.includes("Empty response body from /api/auth") ||
    message.includes("Invalid JSON response from /api/auth") ||
    message.includes("Request to /api/auth failed") ||
    message.includes("Request to /api/auth/login failed") ||
    message === "Network error. Please try again."
  );
}

export function useLoginController(): LoginState {
  console.log("Debug flow: useLoginController fired");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<LoginFormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nextPath = searchParams?.get("next") || "";
  const previewMatch = /^\/preview\/([^/?#]+)/.exec(nextPath);
  const publishedLayoutId = previewMatch?.[1] ?? "";
  const isPublishedMode = Boolean(publishedLayoutId);

  const setField = useCallback((field: keyof LoginFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  }, []);

  const validate = useCallback((): LoginFormErrors => {
    const result = loginSchema.safeParse(form);
    if (result.success) {
      return {};
    }
    const errs: LoginFormErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof LoginFormErrors | undefined;
      if (field && !errs[field]) {
        errs[field] = issue.message;
      }
    }
    return errs;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    console.log("Debug flow: useLoginController handleSubmit fired", {
      isPublishedMode,
      hasEmail: Boolean(form.email),
      nextPath,
    });
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error(
        Object.values(validationErrors).find(Boolean) || "Please fix the highlighted fields."
      );
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      const data = isPublishedMode
        ? await publishedLoginApi(publishedLayoutId, nextPath, form.email, form.password)
        : await loginApi(form.email, form.password);
      if (!data.ok) {
        const message = data.error || "Login failed";
        if (isTransportLevelLoginError(message)) {
          setErrors({});
          toast.error("Login service returned an invalid response. Please try again.");
          return;
        }
        setErrors({ general: message });
        toast.error(message);
        return;
      }
      router.push(data.redirectUrl || (isPublishedMode ? nextPath || "/" : "/dashboard"));
    } catch {
      const message = "Network error. Please try again.";
      setErrors({});
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, isPublishedMode, nextPath, publishedLayoutId, router, validate]);

  return { form, errors, isSubmitting, isPublishedMode, setField, handleSubmit };
}
