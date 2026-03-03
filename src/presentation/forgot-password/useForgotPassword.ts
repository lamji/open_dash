import { useState, useCallback } from "react";

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Placeholder: In production, this would call an API endpoint
    // For now, always show success to prevent email enumeration
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSuccess(true);
    setIsSubmitting(false);
  }, [email]);

  return { email, setEmail, error, success, isSubmitting, handleSubmit };
}
