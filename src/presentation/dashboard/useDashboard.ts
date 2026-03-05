"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type {
  DashboardProject,
  CreateProjectInput,
  UpdateProjectInput,
  DashboardState,
} from "@/domain/dashboard/types";
import {
  fetchProjectsApi,
  createProjectApi,
  updateProjectApi,
  deleteProjectApi,
  logoutApi,
} from "@/lib/auth-api";

export function useDashboard() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<DashboardProject | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [state, setState] = useState<DashboardState>({
    projects: [],
    loading: true,
    error: null,
    showCreateDialog: false,
    editingProject: null,
    deletingProject: null,
  });

  const loadProjects = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const result = await fetchProjectsApi();
    if (result.ok && result.projects) {
      setState((s) => ({ ...s, projects: result.projects!, loading: false }));
    } else {
      setState((s) => ({
        ...s,
        error: result.error ?? "Failed to load projects",
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchProjectsApi().then((result) => {
      if (cancelled) return;
      if (result.ok && result.projects) {
        setState((s) => ({ ...s, projects: result.projects!, loading: false }));
      } else {
        setState((s) => ({
          ...s,
          error: result.error ?? "Failed to load projects",
          loading: false,
        }));
      }
    });
    return () => { cancelled = true; };
  }, []);

  const createProject = useCallback(async (input: CreateProjectInput) => {
    const result = await createProjectApi(input);
    if (result.ok && result.project) {
      setState((s) => ({
        ...s,
        projects: [result.project!, ...s.projects],
        showCreateDialog: false,
      }));
      return true;
    }
    return false;
  }, []);

  const updateProject = useCallback(async (input: UpdateProjectInput) => {
    const result = await updateProjectApi(input);
    if (result.ok && result.project) {
      setState((s) => ({
        ...s,
        projects: s.projects.map((p) =>
          p.id === input.id ? result.project! : p
        ),
        editingProject: null,
      }));
      return true;
    }
    return false;
  }, []);

  const togglePublish = useCallback(async (project: DashboardProject) => {
    const result = await updateProjectApi({
      id: project.id,
      published: !project.published,
    });
    if (result.ok && result.project) {
      setState((s) => ({
        ...s,
        projects: s.projects.map((p) =>
          p.id === project.id ? result.project! : p
        ),
      }));
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    const result = await deleteProjectApi(id);
    if (result.ok) {
      setState((s) => ({
        ...s,
        projects: s.projects.filter((p) => p.id !== id),
        deletingProject: null,
      }));
      return true;
    }
    return false;
  }, []);

  const setShowCreateDialog = (show: boolean) =>
    setState((s) => ({ ...s, showCreateDialog: show }));

  const setEditingProject = (project: DashboardProject | null) =>
    setState((s) => ({ ...s, editingProject: project }));

  const setDeletingProject = (project: DashboardProject | null) =>
    setState((s) => ({ ...s, deletingProject: project }));

  const handleLogout = useCallback(async () => {
    console.log(`Debug flow: handleLogout fired`);
    await logoutApi();
    router.push("/");
  }, [router]);

  const handleOpenBuilder = useCallback((project: DashboardProject) => {
    console.log(`Debug flow: handleOpenBuilder fired with`, { projectId: project.id });
    router.push(`/builder?projectId=${project.id}`);
  }, [router]);

  const handleViewLive = useCallback((project: DashboardProject) => {
    console.log(`Debug flow: handleViewLive fired with`, { projectId: project.id });
    router.push(`/builder?projectId=${project.id}&preview=true`);
  }, [router]);

  const handleRowClick = useCallback((project: DashboardProject) => {
    console.log(`Debug flow: handleRowClick fired with`, { projectId: project.id });
    setSelectedProject(project);
    setSheetOpen(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    console.log(`Debug flow: handleCloseSheet fired`);
    setSheetOpen(false);
    setSelectedProject(null);
  }, []);

  return {
    ...state,
    selectedProject,
    sheetOpen,
    loadProjects,
    createProject,
    updateProject,
    togglePublish,
    deleteProject,
    setShowCreateDialog,
    setEditingProject,
    setDeletingProject,
    handleLogout,
    handleOpenBuilder,
    handleViewLive,
    handleRowClick,
    handleCloseSheet,
  };
}
