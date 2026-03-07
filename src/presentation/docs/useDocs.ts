"use client";

import { useState, useCallback } from "react";
import type { DocSection, DocsState } from "@/domain/docs/types";

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
      { id: "dash-api", title: "API Layer", anchor: "dashboard-api" },
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
    sections: filteredSections,
    setActiveSection,
    setActiveSubSection,
    setSearchQuery,
  };
}
