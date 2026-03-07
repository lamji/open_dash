import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signupApi } from "@/lib/auth-api";
import { z } from "zod";
import type { SignupFormData, SignupFormErrors, SignupState } from "@/domain/auth/types";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export function useSignup(): SignupState {
  console.debug("[auth] useSignup:init");
  const router = useRouter();
  const [form, setForm] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = useCallback(
    (field: keyof SignupFormData, value: string) => {
      console.debug("[auth] useSignup.setField", { field });
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
    },
    []
  );

  const validate = useCallback((): SignupFormErrors => {
    console.debug("[auth] useSignup.validate");
    const result = signupSchema.safeParse(form);

    if (result.success) {
      return {};
    }

    const errs: SignupFormErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof SignupFormErrors | undefined;
      if (field && !errs[field]) {
        errs[field] = issue.message;
      }
    }

    return errs;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    console.debug("[auth] useSignup.handleSubmit");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.alert(Object.values(validationErrors).find(Boolean) || "Please fix the highlighted fields.");
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const data = await signupApi(
        form.name,
        form.email,
        form.password,
        form.confirmPassword
      );

      if (!data.ok) {
        const message = data.error || "Signup failed";
        setErrors({ general: message });
        window.alert(message);
        return;
      }

      router.push(data.redirectUrl || "/auth/login");
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
