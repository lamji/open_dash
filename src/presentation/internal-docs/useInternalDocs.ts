"use client";

import { Position } from "@xyflow/react";
import { useCallback, useMemo, useState } from "react";
import type { InternalDocFlow, InternalDocInfoCard, InternalDocOverviewPoint, InternalDocSection, InternalDocSourceItem, WorkflowEdge, WorkflowNode, WorkflowNodeData } from "@/domain/internal-docs/types";

function createWorkflowNode(
  id: string,
  x: number,
  y: number,
  title: string,
  body: string,
  chip: string,
  accent: WorkflowNodeData["accent"]
): WorkflowNode {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: createWorkflowNode fired", { id });
  }
  return {
    id,
    position: { x, y },
    type: "workflowCard",
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    data: { title, body, chip, status: "Completed", accent },
  };
}

function createFlowSteps(flowId: string, texts: readonly string[]) {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: createFlowSteps fired", { flowId, stepCount: texts.length });
  }
  return texts.map((text, index) => ({ id: `${flowId}-step-${index + 1}`, text }));
}

function createWorkflowNodes(
  seeds: ReadonlyArray<
    readonly [string, number, number, string, string, string, WorkflowNodeData["accent"]]
  >
) {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: createWorkflowNodes fired", { nodeCount: seeds.length });
  }
  return seeds.map(([id, x, y, title, body, chip, accent]) =>
    createWorkflowNode(id, x, y, title, body, chip, accent)
  );
}

function createInternalDocFlow(config: {
  id: string;
  navTitle: string;
  anchor: string;
  title: string;
  headingTestId: string;
  chartTitle: string;
  chartTestId: string;
  description: string;
  stepTexts: readonly string[];
  nodeSeeds: ReadonlyArray<
    readonly [string, number, number, string, string, string, WorkflowNodeData["accent"]]
  >;
  edges: WorkflowEdge[];
}): InternalDocFlow {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: createInternalDocFlow fired", { flowId: config.id });
  }
  return {
    id: config.id,
    navTitle: config.navTitle,
    anchor: config.anchor,
    title: config.title,
    headingTestId: config.headingTestId,
    chartTitle: config.chartTitle,
    chartTestId: config.chartTestId,
    description: config.description,
    steps: createFlowSteps(config.id, config.stepTexts),
    nodes: createWorkflowNodes(config.nodeSeeds),
    edges: config.edges,
  };
}

const INTERNAL_DOC_FLOWS: readonly InternalDocFlow[] = [
  createInternalDocFlow({
    id: "standard",
    navTitle: "Standard App Login",
    anchor: "internal-login-standard",
    title: "Standard App Login",
    headingTestId: "internal-docs-standard",
    chartTitle: "Regular User Login Flow",
    chartTestId: "internal-docs-standard-flowchart",
    description: "This flow is for an actual OpenDash user signing into the product. The destination is the main authenticated app.",
    stepTexts: [
      "`/auth/login` or `/login` renders `LoginPage`.",
      "The form submit starts in `src/presentation/login/index.tsx`.",
      "`useLoginController.handleSubmit()` validates input and chooses `loginApi()` when preview mode is false.",
      "`loginApi()` sends `POST /api/auth` with the login action payload.",
      "`POST /api/auth` dispatches to `handleLogin()`.",
      "`handleLogin()` verifies the user and calls `createSession(user.id)`.",
      "The response sets `Set-Cookie: open-dash-session` and returns the dashboard redirect URL.",
      "The client pushes the user to `/dashboard`.",
    ],
    nodeSeeds: [
      ["click-login", 290, 20, "User Clicks Login Button", "The product user submits the regular /auth/login or /login form, which triggers useLoginController.handleSubmit().", "Entry", "cyan"],
      ["validate", 290, 250, "Validate Input With Zod", "handleSubmit() calls validate(), and validate() runs loginSchema.safeParse(form) for email and password rules.", "Validation", "violet"],
      ["validation-branch", 290, 480, "Validation Passed?", "If validationErrors exists, the flow stops with field errors and a toast. If valid, the regular login request continues.", "Decision", "slate"],
      ["invalid", -60, 780, "Show Errors And Stop", "setErrors(validationErrors) stores field feedback and toast.error(...) tells the user to fix the highlighted inputs.", "Fail Path", "slate"],
      ["login-api", 650, 780, "Call loginApi(email, password)", "Because isPublishedMode is false, handleSubmit() chooses loginApi(form.email, form.password) for the standard user flow.", "Function Call", "cyan"],
      ["server-auth", 650, 1120, "POST /api/auth -> handleLogin()", "loginApi() hits POST /api/auth, which dispatches to handleLogin() and then createSession(user.id) on success.", "Server Auth", "emerald"],
      ["dashboard", 650, 1460, "Success -> router.push('/dashboard')", "The server returns the redirect target, and the client sends the authenticated product user into /dashboard.", "Success", "emerald"],
    ],
    edges: [
      { id: "e-click-validate", source: "click-login", target: "validate" },
      { id: "e-validate-branch", source: "validate", target: "validation-branch" },
      { id: "e-branch-invalid", source: "validation-branch", target: "invalid", label: "No" },
      { id: "e-branch-login-api", source: "validation-branch", target: "login-api", label: "Yes" },
      { id: "e-login-api-server-auth", source: "login-api", target: "server-auth" },
      { id: "e-server-auth-dashboard", source: "server-auth", target: "dashboard" },
    ],
  }),
  createInternalDocFlow({
    id: "preview",
    navTitle: "Published Preview Login",
    anchor: "internal-login-preview",
    title: "Published Preview Login",
    headingTestId: "internal-docs-preview",
    chartTitle: "Published Dashboard Viewer Login Flow",
    chartTestId: "internal-docs-preview-flowchart",
    description: "This flow is for people visiting a shared dashboard link. It is not the product-user login. It exists only when a published dashboard requires login before the viewer can see the shared preview.",
    stepTexts: [
      "`src/app/preview/[id]/page.tsx` checks for published access.",
      "If no preview cookie and no builder session exist, it redirects to `/login?next=/preview/:id`.",
      "The same `LoginPage` is rendered.",
      "`useLoginController.handleSubmit()` detects preview mode from the `next` query param.",
      "The controller calls `publishedLoginApi(layoutId, nextPath, email, password)`.",
      "`publishedLoginApi()` sends `POST /api/login`.",
      "The API route validates config, posts to the remote login endpoint, and sets the published-access cookie.",
      "The client routes the user back to `/preview/:id`.",
    ],
    nodeSeeds: [
      ["preview", 310, 20, "Shared Preview Link", "A viewer opens /preview/:id from a published dashboard share link, not the core product login.", "Entry", "cyan"],
      ["gate", 310, 210, "Access Check", "preview/[id]/page.tsx checks for preview access or an existing builder session before rendering.", "Condition", "violet"],
      ["login-page", 20, 420, "Viewer Login Required", "Missing access redirects the viewer to /login?next=/preview/:id for the published dashboard flow.", "Branch: No", "slate"],
      ["granted", 600, 420, "Open Preview Directly", "Existing preview access skips the extra login screen and goes straight to the shared dashboard.", "Branch: Yes", "emerald"],
      ["published-api", 20, 620, "Published Login API", "The viewer flow calls publishedLoginApi(), which sends POST /api/login for remote verification.", "Auth", "cyan"],
      ["published-cookie", 20, 820, "Preview Access Cookie", "The server sets the preview-access cookie for that published layout instead of open-dash-session.", "Cookie", "emerald"],
      ["published-return", 20, 1020, "Return To Preview", "The viewer is routed back to the original next path, usually /preview/:id.", "Route", "slate"],
    ],
    edges: [
      { id: "e-preview-gate", source: "preview", target: "gate" },
      { id: "e-gate-granted", source: "gate", target: "granted", label: "already allowed" },
      { id: "e-gate-login-page", source: "gate", target: "login-page", label: "needs login" },
      { id: "e-login-page-published-api", source: "login-page", target: "published-api" },
      { id: "e-published-api-cookie", source: "published-api", target: "published-cookie" },
      { id: "e-cookie-return", source: "published-cookie", target: "published-return" },
    ],
  }),
];

const INTERNAL_DOC_OVERVIEW_POINTS: readonly InternalDocOverviewPoint[] = [
  { id: "regular", label: "Regular login", text: "This is for actual OpenDash users who want access to the app and dashboard." },
  { id: "published", label: "Published login", text: "This is for people opening a shared dashboard URL, not for the core app dashboard." },
  { id: "outcome", label: "Different outcomes", text: "One flow creates `open-dash-session`, while the other creates preview access for a specific shared layout." },
];

const INTERNAL_DOC_ROUTING_CARDS: readonly InternalDocInfoCard[] = [
  { id: "standard-routing", title: "Standard Login", bullets: ["Cookie: `open-dash-session`", "Set by `buildSessionCookie(token)` in `src/lib/auth.ts`", "Redirect target: `/dashboard`", "Middleware recognizes this session and protects `/builder`, `/dashboard`, and `/admin`."] },
  { id: "preview-routing", title: "Preview Login", bullets: ["Cookie: published preview access cookie", "Set by `buildPublishedAccessCookie(...)` inside `POST /api/login`", "Redirect target: original `next` path, usually `/preview/:id`", "This does not create a normal `open-dash-session`."] },
];

const INTERNAL_DOC_SOURCE_ITEMS: readonly InternalDocSourceItem[] = [
  "`src/app/auth/login/page.tsx` and `src/app/login/page.tsx` render the shared login page.",
  "`src/presentation/login/index.tsx` starts the submit flow.",
  "`src/lib/hooks/useLoginController.ts` reads preview mode from the `next` query parameter.",
  "`src/lib/hooks/useLoginController.ts` performs validation and dispatches to the correct API.",
  "`src/lib/auth-api.ts` calls `POST /api/auth` for standard login.",
  "`src/app/api/auth/route.ts` handles standard login dispatch and session creation.",
  "`src/lib/auth.ts` creates sessions and builds the `open-dash-session` cookie.",
  "`src/middleware.ts` redirects authenticated users and guards protected standard app pages.",
  "`src/lib/api/published-login.ts` calls `POST /api/login` for preview login.",
  "`src/app/api/login/route.ts` performs published preview login verification.",
  "`src/app/preview/[id]/page.tsx` enforces preview access and redirects to `/login?next=/preview/:id`.",
].map((text, index) => ({ id: `source-${index + 1}`, text }));

const INTERNAL_DOC_SECTIONS: readonly InternalDocSection[] = [
  {
    id: "login-flow",
    title: "Login Flow",
    icon: "Shield",
    children: [
      { id: "overview", title: "Overview", anchor: "internal-login-overview" },
      ...INTERNAL_DOC_FLOWS.map((flow) => ({ id: flow.id, title: flow.navTitle, anchor: flow.anchor })),
      { id: "routing", title: "Cookies And Routing", anchor: "internal-login-routing" },
      { id: "sources", title: "Source Map", anchor: "internal-login-sources" },
    ],
  },
];

export function useInternalDocs() {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: useInternalDocs fired");
  }

  const [activeSection, setActiveSection] = useState("login-flow");
  const [activeSubSection, setActiveSubSection] = useState("internal-login-overview");
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const sections = useMemo(() => {
    return INTERNAL_DOC_SECTIONS.map((section) => {
      const sectionMatches = section.title.toLowerCase().includes(normalizedQuery);
      const children = sectionMatches ? [...section.children] : section.children.filter((child) => child.title.toLowerCase().includes(normalizedQuery));
      return { ...section, children };
    }).filter((section) => normalizedQuery.length === 0 || section.children.length > 0);
  }, [normalizedQuery]);

  const selectSection = useCallback((sectionId: string) => {
    const section = INTERNAL_DOC_SECTIONS.find((item) => item.id === sectionId);
    setActiveSection(sectionId);
    setActiveSubSection(section?.children[0]?.anchor ?? "");
  }, []);

  const selectSubSection = useCallback((sectionId: string, anchor: string) => {
    setActiveSection(sectionId);
    setActiveSubSection(anchor);
  }, []);

  return {
    activeSection,
    activeSubSection,
    flows: INTERNAL_DOC_FLOWS,
    overviewPoints: INTERNAL_DOC_OVERVIEW_POINTS,
    routingCards: INTERNAL_DOC_ROUTING_CARDS,
    searchQuery,
    sections,
    sourceItems: INTERNAL_DOC_SOURCE_ITEMS,
    setSearchQuery,
    setActiveSection: selectSection,
    setActiveSubSection: selectSubSection,
  };
}
