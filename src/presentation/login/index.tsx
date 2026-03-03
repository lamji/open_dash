"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LayoutDashboard, Loader2 } from "lucide-react";
import { useLogin } from "./useLogin";

export default function LoginPage() {
  const { form, errors, isSubmitting, setField, handleSubmit } = useLogin();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Top bar */}
      <div className="flex h-14 items-center px-6">
        <Link
          href="/"
          className="flex items-center gap-2"
          data-test-id="login-logo"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900">
            <LayoutDashboard size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">OpenDash</span>
        </Link>
      </div>

      {/* Form */}
      <div className="flex flex-1 items-center justify-center px-4">
        <Card className="w-full max-w-sm border-gray-200 shadow-sm">
          <CardHeader className="space-y-1 pb-4 pt-6 text-center">
            <h1 className="text-xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500">
              Log in to your OpenDash account
            </p>
          </CardHeader>
          <CardContent className="pb-6">
            <form onSubmit={onSubmit} className="space-y-4">
              {errors.general && (
                <div
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                  data-test-id="login-error"
                >
                  {errors.general}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  disabled={isSubmitting}
                  data-test-id="login-email-input"
                  className="h-10 border-gray-300 focus-visible:ring-gray-400"
                />
                {errors.email && (
                  <p className="text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  disabled={isSubmitting}
                  data-test-id="login-password-input"
                  className="h-10 border-gray-300 focus-visible:ring-gray-400"
                />
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                data-test-id="login-submit-btn"
                className="h-10 w-full bg-gray-900 font-medium text-white hover:bg-gray-800"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-gray-900 underline-offset-4 hover:underline"
                data-test-id="login-signup-link"
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
