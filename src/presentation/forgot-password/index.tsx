"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LayoutDashboard, Loader2 } from "lucide-react";
import { useForgotPassword } from "./useForgotPassword";

export default function ForgotPasswordPage() {
  const { email, setEmail, error, success, isSubmitting, handleSubmit } =
    useForgotPassword();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex h-14 items-center px-6">
        <Link
          href="/"
          className="flex items-center gap-2"
          data-test-id="forgot-password-logo"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900">
            <LayoutDashboard size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">OpenDash</span>
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-4">
        <Card className="w-full max-w-sm border-gray-200 shadow-sm">
          <CardHeader className="space-y-1 pb-4 pt-6 text-center">
            <h1 className="text-xl font-bold text-gray-900">
              Reset your password
            </h1>
            <p className="text-sm text-gray-500">
              Enter your email and we will send you a reset link
            </p>
          </CardHeader>
          <CardContent className="pb-6">
            {success ? (
              <div
                className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
                data-test-id="forgot-password-success"
              >
                If an account exists with that email, you will receive a reset
                link shortly.
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                {error && (
                  <div
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                    data-test-id="forgot-password-error"
                  >
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    data-test-id="forgot-password-email-input"
                    className="h-10 border-gray-300 focus-visible:ring-gray-400"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  data-test-id="forgot-password-submit-btn"
                  className="h-10 w-full bg-gray-900 font-medium text-white hover:bg-gray-800"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-gray-500">
              Remember your password?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-gray-900 underline-offset-4 hover:underline"
                data-test-id="forgot-password-login-link"
              >
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
