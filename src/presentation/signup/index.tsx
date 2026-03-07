"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LayoutDashboard, Loader2, Eye, EyeOff, Sparkles, Check, Layers, LayoutGrid, Code2 } from "lucide-react";
import { motion } from "framer-motion";
import { useSignup } from "./useSignup";

const FEATURES = [
  { icon: <LayoutGrid size={16} />, label: "Visual block builder with 4 grid layouts" },
  { icon: <Layers size={16} />, label: "50+ production-ready widget variants" },
  { icon: <Sparkles size={16} />, label: "AI styling with /styles, /data, /config" },
  { icon: <Code2 size={16} />, label: "Built-in CSS, JSON & JS code editor" },
];

export default function SignupPage() {
  console.debug("[auth] SignupPage:render");
  const { form, errors, isSubmitting, setField, handleSubmit } = useSignup();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const onSubmit = (e: React.FormEvent) => {
    console.debug("[auth] SignupPage:onSubmit");
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="flex min-h-screen bg-[#09090b]">

      {/* ─── Left: Visual Panel ─────────────────────────── */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500/20 via-fuchsia-500/10 to-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-[300px] w-[400px] rounded-full bg-gradient-to-l from-fuchsia-600/10 to-transparent blur-3xl" />

        <div className="relative z-10 w-full max-w-md px-12">
          {/* AI panel mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/80 shadow-2xl backdrop-blur-sm">
              {/* AI panel header */}
              <div className="bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-white" />
                  <span className="text-sm font-semibold text-white">AI Builder Assistant</span>
                </div>
                <p className="mt-0.5 text-[10px] text-white/60">2-Column Grid · col 1 · Revenue Chart</p>
              </div>

              {/* Chat messages */}
              <div className="space-y-2.5 p-4">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="ml-6 rounded-xl bg-blue-600 px-3.5 py-2 text-xs text-white"
                >
                  /styles make the chart taller with a gradient background
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 }}
                  className="mr-6 rounded-xl bg-zinc-800 px-3.5 py-2 font-mono text-xs text-emerald-400"
                >
                  min-height: 320px;{"\n"}background: linear-gradient(135deg, #1e1b4b 0%, #09090b 100%);{"\n"}border-radius: 16px;
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 1.3 }}
                  className="ml-6 rounded-xl bg-blue-600 px-3.5 py-2 text-xs text-white"
                >
                  /data change title to &quot;Q4 Revenue&quot; and add December data
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 1.7 }}
                  className="mr-6 rounded-xl bg-zinc-800 px-3.5 py-2 text-xs text-zinc-300"
                >
                  <Check size={10} className="mb-0.5 mr-1 inline text-emerald-400" />
                  Updated widget data: title → &quot;Q4 Revenue&quot;, added Dec entry.
                </motion.div>
              </div>

              {/* Input bar */}
              <div className="border-t border-white/[0.06] px-4 py-2.5">
                <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-zinc-600">
                  <span>/styles, /data, /config, /help...</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature list below mockup */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 2.0 }}
            className="mt-8 space-y-3"
          >
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 2.1 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                  {feat.icon}
                </div>
                <span className="text-sm text-zinc-400">{feat.label}</span>
              </motion.div>
            ))}
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
            data-test-id="signup-logo"
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
              <h1 className="text-2xl font-bold text-white">
                Create your account
              </h1>
              <p className="text-sm text-zinc-500">
                Start building dashboards for free
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {errors.general && (
                <div
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
                  data-test-id="signup-error"
                >
                  {errors.general}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium text-zinc-300">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  disabled={isSubmitting}
                  data-test-id="signup-name-input"
                  className="h-10 border-white/[0.08] bg-zinc-900 text-white placeholder:text-zinc-600 focus-visible:border-white/[0.08] focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {errors.name && (
                  <p className="text-xs text-red-400">{errors.name}</p>
                )}
              </div>

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
                  data-test-id="signup-email-input"
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
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    disabled={isSubmitting}
                    data-test-id="signup-password-input"
                    className="h-10 border-white/[0.08] bg-zinc-900 pr-10 text-white placeholder:text-zinc-600 focus-visible:border-white/[0.08] focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    data-test-id="signup-password-toggle"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-zinc-300"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={(e) => setField("confirmPassword", e.target.value)}
                    disabled={isSubmitting}
                    data-test-id="signup-confirm-password-input"
                    className="h-10 border-white/[0.08] bg-zinc-900 pr-10 text-white placeholder:text-zinc-600 focus-visible:border-white/[0.08] focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    data-test-id="signup-confirm-password-toggle"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-400">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                data-test-id="signup-submit-btn"
                className="h-10 w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold text-white hover:from-violet-600 hover:to-fuchsia-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-violet-400 hover:text-violet-300 transition-colors"
                data-test-id="signup-login-link"
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
