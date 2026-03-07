"use client";

import { Eye, LayoutGrid, Pencil, Plus, Save, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanding } from "../useLanding";

const NAV_ITEMS = ["Overview", "Analytics", "Users"];

export function BuilderShowcase() {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: BuilderShowcase fired");
  }

  const { activeDemo, activePhase, builderSteps } = useLanding();
  const chartPulse = activeDemo >= 3;
  const widgetInserted = activeDemo >= 2;
  const publishReady = activeDemo === 4;

  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }} className="relative mx-auto mt-20 max-w-4xl">
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/10 to-white/[0.02]" />
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/80 shadow-2xl backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-x-10 top-20 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
        <div className="pointer-events-none absolute right-20 top-24 h-24 w-24 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-zinc-700" />
            <div className="h-3 w-3 rounded-full bg-zinc-700" />
            <div className="h-3 w-3 rounded-full bg-zinc-700" />
          </div>
          <div className="flex items-center gap-2">
            {builderSteps.map((step, index) => (
              <motion.div
                key={step.label}
                animate={{
                  borderColor: activeDemo === index + 1 ? "rgba(139, 92, 246, 0.4)" : "rgba(255,255,255,0)",
                  backgroundColor: activeDemo === index + 1 ? "rgba(139, 92, 246, 0.18)" : "rgba(255,255,255,0)",
                  color: activeDemo === index + 1 ? "rgb(216 180 254)" : "rgb(82 82 91)",
                }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>{step.label}</span>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5">
              <Eye size={10} className="text-zinc-500" />
              <span className="text-[10px] text-zinc-500">Preview</span>
            </div>
            <motion.div
              animate={{
                backgroundColor: publishReady ? "rgba(16, 185, 129, 0.18)" : "rgba(139, 92, 246, 0.2)",
                scale: publishReady ? [1, 1.06, 1] : 1,
              }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-1 rounded-md px-2 py-0.5"
            >
              <Save size={10} className={publishReady ? "text-emerald-400" : "text-violet-400"} />
              <span className={publishReady ? "text-[10px] text-emerald-300" : "text-[10px] text-violet-400"}>{publishReady ? "Published" : "Save"}</span>
            </motion.div>
          </div>
        </div>

        <div className="flex min-h-[320px]">
          <div className="w-36 shrink-0 border-r border-white/[0.06] p-3">
            <div className="mb-3 flex items-center gap-1.5">
              <motion.div
                animate={{ rotate: activeDemo === 1 ? [0, -6, 6, 0] : 0 }}
                transition={{ duration: 0.5 }}
                className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-600"
              >
                <LayoutGrid size={10} className="text-white" />
              </motion.div>
              <span className="text-[10px] font-bold text-zinc-300">OpenDash</span>
            </div>
            <p className="mb-2 text-[8px] font-semibold uppercase tracking-wider text-zinc-600">Navigation</p>
            {NAV_ITEMS.map((item, index) => (
              <motion.div
                key={item}
                animate={{
                  x: activeDemo === 1 && index === 1 ? [0, 3, 0] : 0,
                  backgroundColor: activeDemo >= 1 && index === 1 ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0)",
                  color: activeDemo >= 1 && index === 1 ? "rgb(226 232 240)" : "rgb(161 161 170)",
                }}
                transition={{ duration: 0.45 }}
                className="mb-1 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px]"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                {item}
              </motion.div>
            ))}
            <motion.div
              animate={{ borderColor: activeDemo === 1 ? "rgba(59, 130, 246, 0.45)" : "rgba(63,63,70,1)" }}
              className="mt-2 flex items-center gap-1 rounded-md border border-dashed px-2 py-1.5 text-[10px] text-zinc-600"
            >
              <Plus size={10} /> Add nav item
            </motion.div>
          </div>

          <div className="relative flex-1 overflow-hidden p-4">
            <AnimatePresence>
              {activeDemo === 2 ? (
                <motion.div
                  key="widget-travel"
                  initial={{ opacity: 0, x: -100, y: 28, rotate: -8 }}
                  animate={{ opacity: [0, 1, 1, 0], x: [0, 70, 145, 190], y: [0, -6, 12, 12], rotate: [0, 5, 0, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.15, times: [0, 0.25, 0.75, 1] }}
                  className="pointer-events-none absolute left-10 top-[104px] z-20 w-24 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[9px] text-cyan-200 shadow-lg shadow-cyan-500/10"
                >
                  Table Widget
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-zinc-500">{activePhase.layoutLabel}</span>
                <motion.span
                  key={activePhase.statusPill}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-zinc-400"
                >
                  {activePhase.statusPill}
                </motion.span>
              </div>
              <div className="flex items-center gap-1">
                <motion.div
                  animate={{ scale: chartPulse ? [1, 1.12, 1] : 1 }}
                  transition={{ duration: 0.45 }}
                  className="rounded bg-white/5 p-1"
                >
                  <Sparkles size={10} className="text-violet-400" />
                </motion.div>
                <div className="rounded bg-white/5 p-1">
                  <Pencil size={10} className="text-zinc-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.06] bg-zinc-800/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-zinc-400">Revenue Chart</span>
                  <span className="text-[9px] text-violet-300">{activePhase.chartNote}</span>
                </div>
                <div className="flex h-24 items-end gap-1">
                  {activePhase.chartBars.map((height, index) => (
                    <motion.div
                      key={`${activeDemo}-${index}`}
                      animate={{
                        height: `${height}%`,
                        opacity: chartPulse && index >= 5 ? [0.55, 1, 0.7] : widgetInserted ? 0.88 : 0.72,
                        filter: chartPulse && index === 7 ? "brightness(1.35)" : "brightness(1)",
                      }}
                      transition={{ duration: 0.55, delay: index * 0.03 }}
                      className="flex-1 rounded-t bg-gradient-to-t from-violet-500 via-fuchsia-500 to-cyan-300"
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-zinc-800/20 p-3">
                <AnimatePresence mode="wait">
                  {widgetInserted ? (
                    <motion.div
                      key="filled-slot"
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: 8 }}
                      transition={{ duration: 0.35 }}
                      className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-cyan-100">{activePhase.slotTitle}</span>
                        <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[8px] uppercase tracking-[0.16em] text-cyan-300">
                          inserted
                        </span>
                      </div>
                      <div className="mt-3 space-y-1.5">
                        {activePhase.slotRows.map((row, index) => (
                          <motion.div
                            key={`${row}-${activeDemo}`}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.25, delay: index * 0.08 }}
                            className="flex items-center justify-between rounded-lg bg-black/20 px-2 py-1.5 text-[9px] text-zinc-300"
                          >
                            <span>{row}</span>
                            <span className="text-cyan-300">live</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty-slot"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex h-full min-h-[112px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-700"
                    >
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <motion.div
                          animate={{ borderColor: activeDemo === 1 ? "rgba(99,102,241,0.45)" : "rgba(82,82,91,1)" }}
                          className="flex items-center gap-1 rounded-lg border border-dashed px-2.5 py-1.5 text-[10px] text-zinc-500"
                        >
                          <Plus size={10} /> Add Widget
                        </motion.div>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500">
                          <Sparkles size={10} className="text-white" />
                        </div>
                      </div>
                      <span className="mt-2 text-[9px] text-zinc-600">Click to browse 50+ widgets or generate with AI</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="col-span-2 rounded-xl border border-white/[0.06] bg-zinc-800/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-zinc-400">User Table</span>
                  <span className="text-[9px] text-zinc-500">{activePhase.tableCaption}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex gap-3 border-b border-white/[0.04] pb-1 text-[9px] font-semibold text-zinc-500">
                    <span className="w-20">Name</span>
                    <span className="w-28">Email</span>
                    <span className="w-14">Role</span>
                    <span>Status</span>
                  </div>
                  {activePhase.tableRows.map((row, index) => (
                    <motion.div
                      key={`${row.email}-${activeDemo}`}
                      animate={{
                        x: activeDemo === 3 && index === 0 ? [0, 4, 0] : 0,
                        opacity: publishReady ? [0.65, 1, 0.85] : 1,
                      }}
                      transition={{ duration: 0.45, delay: index * 0.05 }}
                      className="flex gap-3 py-0.5 text-[9px] text-zinc-500"
                    >
                      <span className="w-20 text-zinc-300">{row.name}</span>
                      <span className="w-28">{row.email}</span>
                      <span className="w-14">{row.role}</span>
                      <span className={row.status === "Active" ? "text-emerald-400" : row.status === "Published" ? "text-cyan-300" : "text-amber-400"}>{row.status}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="w-44 shrink-0 border-l border-white/[0.06] flex flex-col">
            <div className="bg-gradient-to-r from-violet-600 to-blue-600 px-3 py-2">
              <div className="flex items-center gap-1.5">
                <Sparkles size={10} className="text-white" />
                <span className="text-[10px] font-semibold text-white">AI Assistant</span>
              </div>
              <p className="text-[8px] text-white/60">{activePhase.panelLabel}</p>
            </div>
            <div className="flex-1 overflow-hidden p-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePhase.command}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28 }}
                  className="space-y-2"
                >
                  <div className="rounded-lg bg-blue-600 px-2 py-1.5 text-[9px] text-white">{activePhase.command}</div>
                  <div className="rounded-lg bg-zinc-800 px-2 py-1.5 text-[9px] font-mono text-emerald-400">{activePhase.response}</div>
                  <div className="rounded-lg bg-blue-600/80 px-2 py-1.5 text-[9px] text-white">{activePhase.followUp}</div>
                  <div className="rounded-lg bg-zinc-800 px-2 py-1.5 text-[9px] text-zinc-300">{activePhase.followUpResponse}</div>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="border-t border-white/[0.06] p-2">
              <div className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1.5 text-[9px] text-zinc-600">
                <span>{activePhase.promptHint}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
