"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LayoutDashboard, Loader2, Eye, EyeOff, Sparkles, LayoutGrid, Plus, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { useLogin } from "./useLogin";

export default function LoginPage() {
  console.debug("[auth] LoginPage:render");
  const { form, errors, isSubmitting, isPublishedMode, setField, handleSubmit } = useLogin();
  const [showPassword, setShowPassword] = React.useState(false);

  const onSubmit = (e: React.FormEvent) => {
    console.debug("[auth] LoginPage:onSubmit");
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="flex min-h-screen bg-[#09090b]">

      {/* ─── Left: Visual Panel ─────────────────────────── */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500/20 via-fuchsia-500/10 to-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-0 h-[300px] w-[400px] rounded-full bg-gradient-to-r from-violet-600/10 to-transparent blur-3xl" />

        <div className="relative z-10 px-12">
          {/* Builder mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/80 shadow-2xl backdrop-blur-sm">
              {/* Window chrome */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                </div>
                <span className="text-[10px] text-zinc-600">OpenDash Builder</span>
                <div className="w-12" />
              </div>

              <div className="flex min-h-[240px]">
                {/* Mini sidebar */}
                <div className="w-28 shrink-0 border-r border-white/[0.06] p-2.5">
                  <div className="mb-2.5 flex items-center gap-1.5">
                    <div className="flex h-4 w-4 items-center justify-center rounded bg-blue-600">
                      <LayoutGrid size={8} className="text-white" />
                    </div>
                    <span className="text-[9px] font-bold text-zinc-400">OpenDash</span>
                  </div>
                  <p className="mb-1.5 text-[7px] font-semibold uppercase tracking-wider text-zinc-600">Nav</p>
                  {["Dashboard", "Analytics", "Users"].map((item) => (
                    <div key={item} className="mb-0.5 flex items-center gap-1 rounded px-1.5 py-1 text-[9px] text-zinc-500">
                      <div className="h-1 w-1 rounded-full bg-blue-400" />
                      {item}
                    </div>
                  ))}
                </div>

                {/* Canvas */}
                <div className="flex-1 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[8px] font-mono text-zinc-500">2-Column Grid</span>
                    <div className="flex gap-0.5">
                      <div className="rounded bg-white/5 p-0.5"><Sparkles size={8} className="text-violet-400" /></div>
                      <div className="rounded bg-white/5 p-0.5"><Pencil size={8} className="text-zinc-600" /></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Chart slot */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="rounded-lg border border-white/[0.06] bg-zinc-800/50 p-2"
                    >
                      <span className="text-[8px] font-semibold text-zinc-500">Revenue</span>
                      <div className="mt-1 flex h-12 items-end gap-0.5">
                        {[30, 50, 35, 70, 45, 80, 55].map((h, j) => (
                          <div key={j} className="flex-1 rounded-t bg-gradient-to-t from-violet-500 to-fuchsia-400" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </motion.div>
                    {/* Empty slot */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 p-2"
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5 rounded border border-dashed border-zinc-600 px-1.5 py-1 text-[8px] text-zinc-500">
                          <Plus size={8} /> Widget
                        </div>
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500">
                          <Sparkles size={8} className="text-white" />
                        </div>
                      </div>
                    </motion.div>
                    {/* Full-width table */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                      className="col-span-2 rounded-lg border border-white/[0.06] bg-zinc-800/50 p-2"
                    >
                      <span className="text-[8px] font-semibold text-zinc-500">Users Table</span>
                      <div className="mt-1 space-y-0.5">
                        {["Alex Smith — Admin", "Jin Park — Editor", "Maya Lee — Viewer"].map((row) => (
                          <div key={row} className="text-[7px] text-zinc-500">{row}</div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tagline below mockup */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="mt-8 text-center"
          >
            <h2 className="text-xl font-bold text-white">Pick layouts. Drop widgets.</h2>
            <p className="mt-2 text-sm text-zinc-500">Build production dashboards with AI-powered styling and 50+ components.</p>
          </motion.div>
        </div>
      </div>

      {/* ─── Right: Form Panel ──────────────────────────── */}
      <div className="flex w-full flex-col lg:w-1/2">
        {/* Top bar */}
        <div className="flex h-14 items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2"
            data-test-id="login-logo"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <LayoutDashboard size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">OpenDash</span>
          </Link>
        </div>

        {/* Form */}
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="w-full max-w-sm">
            <div className="space-y-1.5 pb-8">
              <h1 className="text-2xl font-bold text-white">Welcome back</h1>
              <p className="text-sm text-zinc-500">
                {isPublishedMode
                  ? "Log in to access this published dashboard"
                  : "Log in to your OpenDash account"}
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              {errors.general && (
                <div
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
                  data-test-id="login-error"
                >
                  {errors.general}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-zinc-300">
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
                  className="h-10 border-white/[0.08] bg-zinc-900 text-white placeholder:text-zinc-600 focus-visible:border-white/[0.08] focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-zinc-300">
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
                    className="h-10 border-white/[0.08] bg-zinc-900 pr-10 text-white placeholder:text-zinc-600 focus-visible:border-white/[0.08] focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    data-test-id="login-password-toggle"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password}</p>
                )}
                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-zinc-500 hover:text-violet-400 transition-colors"
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
                className="h-10 w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold text-white hover:from-violet-600 hover:to-fuchsia-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    {isPublishedMode ? "Verifying access..." : "Logging in..."}
                  </>
                ) : (
                  "Log In"
                )}
              </Button>
            </form>

            {!isPublishedMode && (
              <p className="mt-8 text-center text-sm text-zinc-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-violet-400 hover:text-violet-300 transition-colors"
                  data-test-id="login-signup-link"
                >
                  Sign up
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
