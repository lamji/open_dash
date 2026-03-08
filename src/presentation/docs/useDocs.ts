"use client";

import { useState, useCallback } from "react";
import type { DocSection, DocsState, DocTutorialSection } from "@/domain/docs/types";

export const DOC_SECTIONS: DocSection[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    slug: "dashboard",
    icon: "LayoutDashboard",
    children: [
      { id: "dash-overview", title: "Overview", anchor: "dashboard-overview" },
      { id: "dash-projects", title: "Project Management", anchor: "dashboard-projects" },
      { id: "dash-sidebar", title: "Sidebar Navigation", anchor: "dashboard-sidebar" },
      { id: "dash-sheet", title: "Project Detail Sheet", anchor: "dashboard-sheet" },
      { id: "dash-api", title: "API Security", anchor: "dashboard-api" },
    ],
  },
  {
    id: "builder",
    title: "Builder",
    slug: "builder",
    icon: "Hammer",
    children: [
      { id: "build-overview", title: "Overview", anchor: "builder-overview" },
      { id: "build-layouts", title: "Layout System", anchor: "builder-layouts" },
      { id: "build-widgets", title: "Widget Library", anchor: "builder-widgets" },
      { id: "build-ai", title: "AI Chat Panel", anchor: "builder-ai" },
      { id: "build-code", title: "Code Editor", anchor: "builder-code" },
      { id: "build-nav", title: "Navigation Pages", anchor: "builder-nav" },
      { id: "build-save", title: "Save & Autosave", anchor: "builder-save" },
      { id: "build-preview", title: "Preview & Publish", anchor: "builder-preview" },
    ],
  },
];

export const DASHBOARD_API_SECURITY_TUTORIAL: DocTutorialSection = {
  intro:
    "Use Project Config when your published dashboard needs a remote login check or protected API URLs. The important rule is order: enter your secret key first, then save any endpoint you want OpenDash to protect.",
  steps: [
    {
      title: "1. Enter your own secret key",
      description:
        "Add a secret key in the right-side Project Config panel before saving a Login Endpoint URL, Custom Service URL, or per-navigation API URL. OpenDash uses that key to encrypt each endpoint value before it is persisted.",
    },
    {
      title: "2. Save the protected endpoints",
      description:
        "When you save the Login Endpoint URL, Custom Service URL, or integration URLs, OpenDash stores encrypted versions of those values instead of plaintext project config fields.",
    },
    {
      title: "3. Turn on Require Login for published access",
      description:
        "Enable the login toggle if viewers must authenticate before opening the published preview. When this is on, OpenDash protects the published layout rather than exposing it directly.",
    },
    {
      title: "4. Published viewers are routed through /login",
      description:
        "Unauthenticated requests to /preview/:id are redirected to /login?next=/preview/:id. After the remote login endpoint confirms access, OpenDash issues a short-lived published-access cookie for that specific layout.",
    },
  ],
  securityNotes: [
    {
      title: "Endpoints are encrypted at rest",
      description:
        "Login endpoint, custom service URL, and per-navigation integration URLs are encrypted before they are saved, so they are not stored as readable plaintext in the database.",
    },
    {
      title: "Your secret key is also protected",
      description:
        "The secret key itself is encrypted again before it is stored in project_advanced_config. That means OpenDash does not keep the key as raw plaintext in that config record either.",
    },
    {
      title: "Decryption happens only when needed",
      description:
        "OpenDash decrypts endpoint values only at runtime for tasks that require them, such as published login verification or API simulation. The normal saved project record keeps the encrypted form.",
    },
    {
      title: "Published access is session-scoped",
      description:
        "A successful published login does not unlock every dashboard. OpenDash creates a short-lived cookie tied to the current project/layout pair, which is then checked before allowing access to that preview.",
    },
  ],
};

export function useDocs() {
  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: useDocs fired");
  }

  const [state, setState] = useState<DocsState>({
    activeSection: "dashboard",
    activeSubSection: "dashboard-overview",
    searchQuery: "",
  });

  const normalizedQuery = state.searchQuery.trim().toLowerCase();

  const filteredSections = DOC_SECTIONS.map((section) => {
    const sectionMatches = section.title.toLowerCase().includes(normalizedQuery);
    const children = sectionMatches
      ? section.children
      : section.children.filter((child) =>
          child.title.toLowerCase().includes(normalizedQuery)
        );

    return {
      ...section,
      children,
    };
  }).filter(
    (section) => normalizedQuery.length === 0 || section.children.length > 0
  );

  const activeSection =
    filteredSections.find((section) => section.id === state.activeSection)?.id ??
    filteredSections[0]?.id ??
    "";

  const activeSubSection =
    filteredSections
      .find((section) => section.id === activeSection)
      ?.children.find((child) => child.anchor === state.activeSubSection)?.anchor ??
    filteredSections.find((section) => section.id === activeSection)?.children[0]
      ?.anchor ??
    "";

  const setActiveSection = useCallback((activeSection: string) => {
    const section = DOC_SECTIONS.find((s) => s.id === activeSection);
    setState((s) => ({
      ...s,
      activeSection,
      activeSubSection: section?.children[0]?.anchor ?? "",
    }));
  }, []);

  const setActiveSubSection = useCallback((activeSubSection: string) => {
    setState((s) => ({ ...s, activeSubSection }));
  }, []);

  const setSearchQuery = useCallback((searchQuery: string) => {
    setState((s) => ({ ...s, searchQuery }));
  }, []);

  return {
    ...state,
    activeSection,
    activeSubSection,
    dashboardApiSecurityTutorial: DASHBOARD_API_SECURITY_TUTORIAL,
    sections: filteredSections,
    setActiveSection,
    setActiveSubSection,
    setSearchQuery,
  };
}
