"use client";

import { DASHBOARD_API_SECURITY_TUTORIAL } from "@/presentation/docs/useDocs";

export function DashboardDocs() {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: DashboardDocs fired");
  }

  return (
    <div className="space-y-16">
      <section id="dashboard-overview">
        <h2 className="text-2xl font-bold tracking-tight" data-test-id="docs-dash-overview">
          Dashboard Overview
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          The dashboard is your starting point after signing in. It is the place
          where you create projects, reopen work in progress, check which pages
          are already shareable, and jump back into editing whenever something
          needs refinement.
        </p>

        <div className="mt-6 rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            What You Can Do Here
          </h4>
          <div className="mt-3 space-y-2 text-sm text-zinc-400">
            <p>
              <strong className="text-zinc-200">Create projects:</strong> Start a
              new dashboard workspace with a clear name and short description.
            </p>
            <p>
              <strong className="text-zinc-200">Track status:</strong> See at a
              glance which dashboards are active and which are still drafts.
            </p>
            <p>
              <strong className="text-zinc-200">Return to editing fast:</strong>{" "}
              Open the builder directly from the project card when you need changes.
            </p>
          </div>
        </div>
      </section>

      <section id="dashboard-projects">
        <h2 className="text-2xl font-bold tracking-tight" data-test-id="docs-dash-projects">
          Project Management
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Each project represents one dashboard workspace. Keep the project name
          specific enough that teammates can tell its purpose before opening it.
        </p>

        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
            <h4 className="text-sm font-semibold text-zinc-200">Recommended Flow</h4>
            <ul className="mt-2 space-y-1.5 text-sm text-zinc-400">
              <li>
                <strong className="text-zinc-200">Create:</strong> Make a project
                when you are starting a new dashboard for a team, report, or client.
              </li>
              <li>
                <strong className="text-zinc-200">Edit details:</strong> Update the
                title and description when the dashboard scope changes.
              </li>
              <li>
                <strong className="text-zinc-200">Open Builder:</strong> Use this
                when you want to change layout, widgets, styling, or data.
              </li>
              <li>
                <strong className="text-zinc-200">Publish or unpublish:</strong>{" "}
                Switch status only when the dashboard is ready for viewers or needs
                to go back into draft mode.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
            <h4 className="text-sm font-semibold text-zinc-200">Project Cards</h4>
            <p className="mt-2 text-sm text-zinc-400">
              Each card gives you the project title, summary, current status, and
              the actions you are most likely to need next: edit, preview, reopen,
              or remove an outdated workspace.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
            <h4 className="text-sm font-semibold text-zinc-200">Status Summary</h4>
            <p className="mt-2 text-sm text-zinc-400">
              The totals at the top help you scan how many dashboards you have in
              progress, how many are already published, and where attention is still needed.
            </p>
          </div>
        </div>
      </section>

      <section id="dashboard-sidebar">
        <h2 className="text-2xl font-bold tracking-tight" data-test-id="docs-dash-sidebar">
          Sidebar Navigation
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Use the sidebar to move through your workspace quickly. It is the fastest
          way to get back to the dashboard, review project lists, and exit the
          authenticated area when you are done.
        </p>
      </section>

      <section id="dashboard-sheet">
        <h2 className="text-2xl font-bold tracking-tight" data-test-id="docs-dash-sheet">
          Project Detail Sheet
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          The project detail view gives you more context than the card alone. It
          is useful when the dashboard is being reviewed by a team instead of one person.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            {
              tab: "Overview",
              desc: "Quick actions, current status, and the fastest path back into editing or preview.",
            },
            {
              tab: "Tasks",
              desc: "A lightweight place to track follow-up work for the dashboard.",
            },
            {
              tab: "Comments",
              desc: "Notes and context for teammates reviewing the project.",
            },
            {
              tab: "Bugs",
              desc: "A simple place to record issues found during testing or review.",
            },
          ].map((item) => (
            <div
              key={item.tab}
              className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4"
            >
              <h4 className="text-sm font-semibold text-zinc-200">
                {item.tab}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="dashboard-api">
        <h2 className="text-2xl font-bold tracking-tight" data-test-id="docs-dash-api">
          API Security In Project Panel
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          {DASHBOARD_API_SECURITY_TUTORIAL.intro}
        </p>
        <div className="mt-6 rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
          <h4 className="text-sm font-semibold text-zinc-200">How To Set It Up</h4>
          <div className="mt-3 space-y-3 text-sm text-zinc-400">
            {DASHBOARD_API_SECURITY_TUTORIAL.steps.map((step) => (
              <div key={step.title}>
                <p className="font-medium text-zinc-200">{step.title}</p>
                <p className="mt-1 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
          <h4 className="text-sm font-semibold text-zinc-200">Why This Is Safer</h4>
          <div className="mt-3 space-y-3 text-sm text-zinc-400">
            {DASHBOARD_API_SECURITY_TUTORIAL.securityNotes.map((note) => (
              <div key={note.title}>
                <p className="font-medium text-zinc-200">{note.title}</p>
                <p className="mt-1 leading-relaxed">{note.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
