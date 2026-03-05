"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="flex h-14 items-center px-6">
        <Link
          href="/"
          className="flex items-center gap-2"
          data-test-id="forgot-password-logo"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
            <LayoutDashboard size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-blue-900">OpenDash</span>
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="space-y-1 pb-6 text-center">
            <h1 className="text-2xl font-bold text-blue-900">
              Reset your password
            </h1>
            <p className="text-sm text-blue-600">
              Enter your email and we will send you a reset link
            </p>
          </div>
          <div>
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
                    className="text-sm font-medium text-blue-900"
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
                    className="h-10 border-blue-300 bg-white focus-visible:ring-blue-400"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  data-test-id="forgot-password-submit-btn"
                  className="h-10 w-full bg-blue-600 font-medium text-white hover:bg-blue-700"
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

            <p className="mt-6 text-center text-sm text-blue-600">
              Remember your password?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-blue-900 underline-offset-4 hover:underline"
                data-test-id="forgot-password-login-link"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
