"use client";

export function BuilderDocs() {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: BuilderDocs fired");
  }

  return (
    <div className="space-y-16">
      <section id="builder-overview">
        <h2 className="text-2xl font-bold tracking-tight" data-test-id="docs-build-overview">
          Builder Overview
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          The builder is where you assemble the dashboard itself. You choose a
          layout, place widgets into slots, refine the visuals, and save a version
          that your team can preview or publish.
        </p>

        <div className="mt-6 rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Typical Builder Workflow
          </h4>
          <div className="mt-3 space-y-2 text-sm text-zinc-400">
            <p>
              <strong className="text-zinc-200">1. Pick a layout:</strong> Start
              with the column structure that best fits the information you need to show.
            </p>
            <p>
              <strong className="text-zinc-200">2. Fill empty slots:</strong>{" "}
              Add charts, cards, tables, inputs, or navigation elements where they help the most.
            </p>
            <p>
              <strong className="text-zinc-200">3. Refine styling and data:</strong>{" "}
              Use AI or the editor when the default widget is close but not finished.
            </p>
            <p>
              <strong className="text-zinc-200">4. Save and preview:</strong> Check
              the dashboard in a cleaner view before deciding to publish it.
            </p>
          </div>
        </div>
      </section>

      <section id="builder-layouts">
        <h2 className="text-2xl font-bold tracking-tight" data-test-id="docs-build-layouts">
          Layout System
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Layouts control how information is grouped on the page. Start simple,
          then add more columns only when the dashboard needs denser comparison.
        </p>

        <div className="mt-6 space-y-3">
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
            <h4 className="text-sm font-semibold text-zinc-200">When to Use Each Layout</h4>
            <ul className="mt-2 space-y-1 text-sm text-zinc-400">
              <li><strong className="text-zinc-200">Single column:</strong> Best for one hero chart, a title area, or a wide table.</li>
              <li><strong className="text-zinc-200">Two columns:</strong> Good for side-by-side comparison such as chart plus table.</li>
              <li><strong className="text-zinc-200">Three columns:</strong> Useful for KPI rows or a balanced multi-panel view.</li>
              <li><strong className="text-zinc-200">Four columns:</strong> Best for compact metric cards and dense overviews.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
            <h4 className="text-sm font-semibold text-zinc-200">Practical Advice</h4>
            <p className="mt-2 text-sm text-zinc-400">
              Use the simplest structure that still makes the reading order clear.
              If a dashboard feels crowded, reduce columns before you start changing
              colors or spacing.
            </p>
          </div>
        </div>
      </section>

      <section id="builder-widgets">
        <h2 className="text-2xl font-bold tracking-tight" data-test-id="docs-build-widgets">
          Widget Library
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Widgets are the building blocks of your dashboard. Use them to surface
          metrics, structure content, collect input, or guide navigation.
        </p>
        <ol className="mt-3 ml-4 list-decimal space-y-1 text-sm text-zinc-400">
          <li>Click an empty slot to open the widget picker.</li>
          <li>Choose the category that matches the job: chart, table, card, form control, or supporting UI.</li>
          <li>Pick the variant that is closest to your final layout, then customize from there.</li>
        </ol>

        <div className="mt-6 rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
          <h4 className="text-sm font-semibold text-zinc-200">Selection Tips</h4>
          <ul className="mt-2 space-y-1 text-sm text-zinc-400">
            <li>Use charts when the takeaway is trend or comparison.</li>
            <li>Use tables when people need exact values or row-level scanning.</li>
            <li>Use KPI cards when the dashboard needs quick top-line numbers.</li>
            <li>Use inputs and selectors only when viewers need to interact with the page.</li>
          </ul>
        </div>
      </section>

      <section id="builder-ai">
        <h2 className="text-2xl font-bold tracking-tight" data-test-id="docs-build-ai">
          AI Chat Panel
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          The AI panel helps you refine a selected part of the dashboard without
          rebuilding it by hand. It is most useful when you already know what you
          want to change.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            {
              cmd: "/styles",
              desc: "Change how a block or widget looks, such as spacing, borders, color, or emphasis.",
              example: "/styles add a subtle shadow with rounded corners",
            },
            {
              cmd: "/data",
              desc: "Update labels, values, rows, or other content used by the current widget.",
              example: "/data update chart labels to Q1-Q4 revenue",
            },
            {
              cmd: "/config",
              desc: "Adjust widget settings such as chart type, visibility, pagination, or accents.",
              example: "/config change accent color to emerald",
            },
          ].map((item) => (
            <div
              key={item.cmd}
              className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4"
            >
              <code className="text-sm font-bold text-violet-300">
                {item.cmd}
              </code>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                {item.desc}
              </p>
              <p className="mt-2 rounded bg-white/5 px-2 py-1 text-xs text-zinc-500">
                {item.example}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
          <h4 className="text-sm font-semibold text-zinc-200">How to Prompt Better</h4>
          <p className="mt-2 text-sm text-zinc-400">
            Mention the target widget, the exact change, and the intended outcome.
            Prompts like &ldquo;make the revenue chart easier to scan on mobile&rdquo;
            work better than vague requests like &ldquo;improve this&rdquo;.
          </p>
        </div>
      </section>

      <section id="builder-code">
        <h2 className="text-2xl font-bold tracking-tight" data-test-id="docs-build-code">
          Code Editor
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Use the editor when you need tighter control than the visual tools or
          AI panel can provide.
        </p>
        <div className="mt-4 space-y-3">
          {[
            {
              tab: "CSS",
              desc: "Fine-tune spacing, sizing, backgrounds, borders, and layout behavior for the selected area.",
            },
            {
              tab: "Data",
              desc: "Adjust labels, values, rows, and other content that drives the current widget.",
            },
            {
              tab: "Function",
              desc: "Use this when a widget needs dynamic behavior or computed logic beyond the basic configuration.",
            },
          ].map((item) => (
            <div
              key={item.tab}
              className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4"
            >
              <h4 className="text-sm font-semibold text-zinc-200">
                {item.tab} Tab
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="builder-nav">
        <h2 className="text-2xl font-bold tracking-tight" data-test-id="docs-build-nav">
          Navigation Pages
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Use navigation pages when one dashboard is trying to hold too much at
          once. Splitting content into named pages keeps each view easier to scan
          and easier to present.
        </p>
      </section>

      <section id="builder-save">
        <h2 className="text-2xl font-bold tracking-tight" data-test-id="docs-build-save">
          Save &amp; Autosave
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          OpenDash saves your work so you can move quickly without worrying about
          losing a draft.
        </p>
        <ul className="mt-3 ml-4 list-disc space-y-1 text-sm text-zinc-400">
          <li>Manual save is best when you want a deliberate checkpoint before sharing.</li>
          <li>Autosave helps protect recent edits while you are still experimenting.</li>
          <li>Use clear names when saving so teammates can tell stable versions from rough drafts.</li>
        </ul>
      </section>

      <section id="builder-preview">
        <h2 className="text-2xl font-bold tracking-tight" data-test-id="docs-build-preview">
          Preview &amp; Publish
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Preview mode lets you review the dashboard without the editing chrome.
          Use it before publishing so you are judging the same experience your
          audience will actually see.
        </p>
        <p className="mt-3 text-sm text-zinc-400">
          Publish only after checking spacing, labels, empty states, and mobile
          readability. A dashboard that works in edit mode can still feel rough
          when viewed as a finished page.
        </p>
      </section>
    </div>
  );
}
