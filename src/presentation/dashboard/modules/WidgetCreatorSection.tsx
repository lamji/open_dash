"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { WidgetCreatorSectionProps } from "@/domain/dashboard/types";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import Slider from "react-slick";
import type { Settings } from "react-slick";

export function WidgetCreatorSection({
  hasProjects,
  activeProjectName,
  sessionId,
  widgets,
  prompt,
  loading,
  error,
  onPromptChange,
  onGenerate,
  onCreateProject,
}: WidgetCreatorSectionProps) {
  const sliderSettings: Settings = {
    dots: true,
    arrows: false,
    infinite: widgets.length > 1,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {!hasProjects ? (
        <Card className="rounded-3xl border border-dashed border-white/10 bg-[#0f172a] p-8 shadow-none">
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
              <Wand2 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Create a project first</h3>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                The widget creator needs a project context before it can generate and save custom widget ideas.
              </p>
            </div>
            <Button
              data-test-id="widget-creator-create-project"
              onClick={onCreateProject}
              className="h-10 rounded-xl bg-cyan-400 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
            >
              Create Project
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="rounded-3xl border border-white/10 bg-[#0b1224] p-6 shadow-none">
            <div className="mb-5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="rounded-md border border-white/10 px-2.5 py-1 text-slate-300">Private Custom Widgets</span>
              <span className="rounded-md border border-white/10 px-2.5 py-1">Session {sessionId || "pending"}</span>
              <span className="rounded-md border border-white/10 px-2.5 py-1">{activeProjectName ?? "No project selected"}</span>
            </div>
            {widgets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#111827] px-5 py-10 text-center">
                <p className="text-base font-medium text-slate-100">No private widgets yet</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Generate a widget below and it will appear here for this user&apos;s project only.
                </p>
              </div>
            ) : (
              <div className="widget-creator-slider" data-test-id="widget-creator-slider">
                <Slider {...sliderSettings}>
                  {widgets.map((widget) => (
                    <div key={widget.id} className="px-2">
                      <Card className="min-h-[220px] rounded-2xl border border-white/10 bg-[#111827] p-5 shadow-none">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Badge variant="outline" className="border-white/15 text-slate-300">
                              {widget.category}
                            </Badge>
                            <h3 className="mt-3 text-lg font-medium text-slate-100">{widget.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-400">{widget.description}</p>
                          </div>
                        </div>
                        <div className="mt-4 rounded-xl border border-white/10 bg-[#0f172a] px-3 py-3">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Prompt</p>
                          <p className="mt-2 text-sm text-slate-300">{widget.prompt}</p>
                        </div>
                      </Card>
                    </div>
                  ))}
                </Slider>
              </div>
            )}
          </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(320px,1fr)]">
          <Card className="rounded-3xl border border-white/10 bg-[#0b1224] p-6 shadow-none">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#111827] text-slate-300">
                <Sparkles size={18} />
              </span>
              <div>
                <h3 className="text-lg font-medium text-slate-100">Prompt your widget</h3>
                <p className="text-sm text-slate-400">Be specific about layout, actions, states, and data.</p>
              </div>
            </div>
            <Textarea
              data-test-id="widget-creator-prompt"
              value={prompt}
              onChange={(event) => onPromptChange(event.target.value)}
              placeholder="Create a compact pricing widget with monthly and yearly tabs, highlighted plan badges, and a primary CTA."
              className="min-h-[220px] rounded-2xl border-white/10 bg-[#111827] text-sm text-slate-100 placeholder:text-slate-500"
            />
            {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
            <div className="mt-4 flex justify-end">
              <Button
                data-test-id="widget-creator-generate"
                onClick={onGenerate}
                disabled={loading}
                className="h-10 rounded-xl bg-cyan-400 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
              >
                {loading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Sparkles size={16} className="mr-2" />}
                Generate Widget
              </Button>
            </div>
          </Card>

          <Card className="rounded-3xl border border-white/10 bg-[#0b1224] p-6 shadow-none">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-slate-100">Saved widgets</h3>
              <p className="text-sm text-slate-400">These are the widgets this project can reuse from the builder&apos;s custom section.</p>
            </div>
            <div className="space-y-3">
              {widgets.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#111827] px-4 py-6 text-sm text-slate-400">
                  No custom widgets saved yet.
                </div>
              ) : (
                widgets.slice(0, 5).map((widget) => (
                  <div key={widget.id} className="rounded-2xl border border-white/10 bg-[#111827] px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-100">{widget.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{widget.category}</p>
                      </div>
                      <Badge variant="outline" className="border-white/15 text-slate-300">
                        Private
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{widget.description}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
        </div>
      )}
      <style jsx global>{`
        .widget-creator-slider .slick-list {
          margin: 0 -8px;
        }
        .widget-creator-slider .slick-track {
          display: flex;
        }
        .widget-creator-slider .slick-slide > div {
          height: 100%;
        }
        .widget-creator-slider .slick-dots {
          bottom: -30px;
        }
        .widget-creator-slider .slick-dots li button:before {
          color: rgba(103, 232, 249, 0.65);
        }
      `}</style>
    </div>
  );
}
