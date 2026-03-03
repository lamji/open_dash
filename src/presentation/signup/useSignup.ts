import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signupApi } from "@/lib/auth-api";
import type { SignupFormData, SignupFormErrors, SignupState } from "@/domain/auth/types";

export function useSignup(): SignupState {
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
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
    },
    []
  );

  const validate = useCallback((): SignupFormErrors => {
    const errs: SignupFormErrors = {};
    if (!form.name) errs.name = "Name is required";
    else if (form.name.length < 2)
      errs.name = "Name must be at least 2 characters";
    if (!form.email) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Invalid email format";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (!form.confirmPassword)
      errs.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
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
      const data = await signupApi(
        form.name,
        form.email,
        form.password,
        form.confirmPassword
      );

      if (!data.ok) {
        setErrors({ general: data.error || "Signup failed" });
        return;
      }

      router.push(data.redirectUrl || "/auth/login");
    } catch {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, validate, router]);

  return { form, errors, isSubmitting, setField, handleSubmit };
}
