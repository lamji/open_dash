"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LayoutDashboard, Loader2, Eye, EyeOff } from "lucide-react";
import { useLogin } from "./useLogin";

export default function LoginPage() {
  const { form, errors, isSubmitting, setField, handleSubmit } = useLogin();
  const [showPassword, setShowPassword] = React.useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Top bar */}
      <div className="flex h-14 items-center px-6">
        <Link
          href="/"
          className="flex items-center gap-2"
          data-test-id="login-logo"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
            <LayoutDashboard size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-blue-900">OpenDash</span>
        </Link>
      </div>

      {/* Form */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="space-y-1 pb-6 text-center">
            <h1 className="text-2xl font-bold text-blue-900">Welcome back</h1>
            <p className="text-sm text-blue-600">
              Log in to your OpenDash account
            </p>
          </div>
          <div>
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
                <Label htmlFor="email" className="text-sm font-medium text-blue-900">
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
                  className="h-10 border-blue-300 bg-white focus-visible:ring-blue-400"
                />
                {errors.email && (
                  <p className="text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-blue-900">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    disabled={isSubmitting}
                    data-test-id="login-password-input"
                    className="h-10 border-blue-300 bg-white pr-10 focus-visible:ring-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600"
                    data-test-id="login-password-toggle"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password}</p>
                )}
                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    data-test-id="login-forgot-password-link"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                data-test-id="login-submit-btn"
                className="h-10 w-full bg-blue-600 font-medium text-white hover:bg-blue-700"
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

            <p className="mt-6 text-center text-sm text-blue-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-blue-900 underline-offset-4 hover:underline"
                data-test-id="login-signup-link"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
