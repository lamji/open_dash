import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loginApi } from "@/lib/auth-api";
import type { LoginFormData, LoginFormErrors, LoginState } from "@/domain/auth/types";

export function useLogin(): LoginState {
  const router = useRouter();
  const [form, setForm] = useState<LoginFormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = useCallback((field: keyof LoginFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  }, []);

  const validate = useCallback((): LoginFormErrors => {
    const errs: LoginFormErrors = {};
    if (!form.email) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Invalid email format";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters";
    return errs;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const data = await loginApi(form.email, form.password);

      if (!data.ok) {
        setErrors({ general: data.error || "Login failed" });
        return;
      }

      router.push(data.redirectUrl || "/dashboard");
    } catch {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, validate, router]);

  return { form, errors, isSubmitting, setField, handleSubmit };
}
