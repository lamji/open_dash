import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loginApi } from "@/lib/auth-api";
import { z } from "zod";
import type { LoginFormData, LoginFormErrors, LoginState } from "@/domain/auth/types";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
});

export function useLogin(): LoginState {
  console.debug("[auth] useLogin:init");
  const router = useRouter();
  const [form, setForm] = useState<LoginFormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = useCallback((field: keyof LoginFormData, value: string) => {
    console.debug("[auth] useLogin.setField", { field });
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  }, []);

  const validate = useCallback((): LoginFormErrors => {
    console.debug("[auth] useLogin.validate");
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
    console.debug("[auth] useLogin.handleSubmit");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.alert(Object.values(validationErrors).find(Boolean) || "Please fix the highlighted fields.");
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const data = await loginApi(form.email, form.password);

      if (!data.ok) {
        const message = data.error || "Login failed";
        setErrors({ general: message });
        window.alert(message);
        return;
      }

      router.push(data.redirectUrl || "/dashboard");
    } catch {
      const message = "Network error. Please try again.";
      setErrors({ general: message });
      window.alert(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, validate, router]);

  return { form, errors, isSubmitting, setField, handleSubmit };
}
