"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import type {
  DashboardProject,
  CreateProjectInput,
  UpdateProjectInput,
  DashboardState,
  DashboardSection,
  CustomWidgetRecord,
  ProjectConfigPayload,
  ProjectConfigSimulationResult,
} from "@/domain/dashboard/types";
import {
  fetchProjectsApi as loadProjectsApi,
  fetchDashboardWidgetsApi as loadDashboardWidgetsApi,
  createProjectApi,
  updateProjectApi,
  deleteProjectApi,
  logoutApi,
  simulateProjectIntegrationsApi,
} from "@/lib/auth-api";
import { generateAndStoreCustomWidget, getCustomWidgets } from "@/lib/api/custom-widgets";
import { bootstrapSocketServer } from "@/lib/api/builder-runtime";
import { PROJECTS_CACHE_INVALIDATE_EVENT } from "@/domain/cache/types";

const DASHBOARD_PROJECTS_QUERY_KEY = ["dashboard-projects"] as const;
const DASHBOARD_PROJECTS_VAULT_KEY = "open-dash:vault:dashboard-projects:v1";
const DASHBOARD_PROJECTS_STALE_TIME_MS = 30_000;

function loadProjectsVault(): DashboardProject[] | undefined {
  console.log(`Debug flow: loadProjectsVault fired`);
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const raw = window.localStorage.getItem(DASHBOARD_PROJECTS_VAULT_KEY);
    if (!raw) {
      return undefined;
    }
    const parsed = JSON.parse(raw) as DashboardProject[];
    return Array.isArray(parsed) ? parsed : undefined;
  } catch (error) {
    console.error(`Debug flow: loadProjectsVault failed`, error);
    return undefined;
  }
}

function saveProjectsVault(projects: DashboardProject[]): void {
  console.log(`Debug flow: saveProjectsVault fired`, { count: projects.length });
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(DASHBOARD_PROJECTS_VAULT_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error(`Debug flow: saveProjectsVault failed`, error);
  }
}

function createWidgetCreatorToken(): string {
  console.log(`Debug flow: createWidgetCreatorToken fired`);
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `widget-${Date.now()}`;
}

async function deriveEncryptionKey(secretKey: string): Promise<CryptoKey> {
  console.log("Debug flow: deriveEncryptionKey fired");
  const encoder = new TextEncoder();
  const secretBytes = encoder.encode(secretKey);
  const digest = await crypto.subtle.digest("SHA-256", secretBytes);
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function encryptWithUserSecret(value: string, secretKey: string): Promise<string> {
  console.log("Debug flow: encryptWithUserSecret fired", { valueLength: value.length });
  const key = await deriveEncryptionKey(secretKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoder.encode(value)
    )
  );
  const authTag = encrypted.slice(encrypted.length - 16);
  const cipherText = encrypted.slice(0, encrypted.length - 16);
  const toHex = (input: Uint8Array): string =>
    Array.from(input, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${toHex(iv)}:${toHex(authTag)}:${toHex(cipherText)}`;
}

export function useDashboard() {
  console.log(`Debug flow: useDashboard fired`);
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<DashboardProject | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [projectConfigPanelProject, setProjectConfigPanelProject] = useState<DashboardProject | null>(null);
  const [projectConfigPanelOpen, setProjectConfigPanelOpen] = useState(false);
  const [widgetCreatorPrompt, setWidgetCreatorPrompt] = useState("");
  const [widgetCreatorLoading, setWidgetCreatorLoading] = useState(false);
  const [widgetCreatorError, setWidgetCreatorError] = useState<string | null>(null);
  const [customWidgets, setCustomWidgets] = useState<CustomWidgetRecord[]>([]);
  const [state, setState] = useState<DashboardState>({
    projects: [],
    widgets: [],
    loading: true,
    widgetsLoading: true,
    error: null,
    widgetsError: null,
    showCreateDialog: false,
    editingProject: null,
    deletingProject: null,
  });
  const currentSection: DashboardSection = pathname === "/widget_creator" ? "widgets" : "dashboard";
  const widgetCreatorSessionId = pathname === "/widget_creator" && typeof window !== "undefined"
    ? (new URLSearchParams(window.location.search).get("id") ?? "")
    : "";

  const projectsQuery = useQuery<DashboardProject[]>({
    queryKey: DASHBOARD_PROJECTS_QUERY_KEY,
    queryFn: async () => {
      console.log(`Debug flow: dashboard projects queryFn fired`);
      const result = await loadProjectsApi();
      if (!result.ok || !result.projects) {
        throw new Error(result.error ?? "Failed to load projects");
      }
      saveProjectsVault(result.projects);
      return result.projects;
    },
    staleTime: DASHBOARD_PROJECTS_STALE_TIME_MS,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
  });

  useEffect(() => {
    console.log(`Debug flow: dashboard projects vault hydrate effect fired`);
    const vaultProjects = loadProjectsVault();
    if (!vaultProjects || vaultProjects.length === 0) {
      return;
    }
    queryClient.setQueryData<DashboardProject[]>(DASHBOARD_PROJECTS_QUERY_KEY, (current) => {
      if (current && current.length > 0) {
        return current;
      }
      return vaultProjects;
    });
  }, [queryClient]);

  const projects = projectsQuery.data ?? [];
  const loading = projects.length === 0 && (projectsQuery.isLoading || projectsQuery.isFetching);
  const error = projects.length === 0 && projectsQuery.isError
    ? (projectsQuery.error instanceof Error ? projectsQuery.error.message : "Failed to load projects")
    : null;
  const latestProject =
    projects.length > 0
      ? [...projects].sort(
          (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
        )[0] ?? null
      : null;

  const loadProjects = useCallback(async () => {
    console.log(`Debug flow: loadProjects fired`);
    await queryClient.invalidateQueries({ queryKey: DASHBOARD_PROJECTS_QUERY_KEY });
  }, [queryClient]);

  const updateProjectsCache = useCallback((updater: (projects: DashboardProject[]) => DashboardProject[]) => {
    console.log(`Debug flow: updateProjectsCache fired`);
    queryClient.setQueryData<DashboardProject[]>(DASHBOARD_PROJECTS_QUERY_KEY, (current) => {
      const safeCurrent = current ?? [];
      const nextProjects = updater(safeCurrent);
      saveProjectsVault(nextProjects);
      return nextProjects;
    });
  }, [queryClient]);

  const syncProjectReferences = useCallback((updatedProject: DashboardProject) => {
    console.log("Debug flow: syncProjectReferences fired", { projectId: updatedProject.id });
    setSelectedProject((current) => (current?.id === updatedProject.id ? updatedProject : current));
    setProjectConfigPanelProject((current) => (current?.id === updatedProject.id ? updatedProject : current));
  }, []);

  useEffect(() => {
    console.log(`Debug flow: dashboard projects socket effect fired`);
    let isDisposed = false;
    let socket: ReturnType<typeof io> | null = null;

    const initializeProjectsSocket = async () => {
      console.log(`Debug flow: initializeProjectsSocket fired`);
      try {
        await bootstrapSocketServer();
      } catch (error) {
        console.error(`Debug flow: initializeProjectsSocket bootstrap failed`, error);
        return;
      }

      if (isDisposed) {
        return;
      }

      socket = io({
        path: "/api/socket/io",
        addTrailingSlash: false,
      });

      socket.on(PROJECTS_CACHE_INVALIDATE_EVENT, () => {
        console.log(`Debug flow: dashboard projects socket invalidate event fired`);
        void queryClient.invalidateQueries({ queryKey: DASHBOARD_PROJECTS_QUERY_KEY });
      });
    };

    void initializeProjectsSocket();

    return () => {
      isDisposed = true;
      socket?.close();
    };
  }, [queryClient]);

  useEffect(() => {
    console.log(`Debug flow: customWidgets effect fired`, { latestProjectId: latestProject?.id });
    if (!latestProject?.id) {
      return;
    }

    let cancelled = false;
    void getCustomWidgets(latestProject.id)
      .then((widgets) => {
        if (!cancelled) {
          setCustomWidgets(widgets);
        }
      })
      .catch((error) => {
        console.error(`Debug flow: customWidgets effect failed`, error);
        if (!cancelled) {
          setCustomWidgets([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [latestProject?.id]);

  useEffect(() => {
    console.log(`Debug flow: dashboard widgets bootstrap effect fired`);
    let cancelled = false;

    loadDashboardWidgetsApi()
      .then((widgets) => {
        if (cancelled) {
          return;
        }

        setState((s) => ({
          ...s,
          widgets,
          widgetsLoading: false,
        }));
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setState((s) => ({
          ...s,
          widgetsError: "Failed to load widgets",
          widgetsLoading: false,
        }));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const loadWidgets = useCallback(async () => {
    setState((s) => ({ ...s, widgetsLoading: true, widgetsError: null }));

    try {
      const widgets = await loadDashboardWidgetsApi();
      setState((s) => ({
        ...s,
        widgets,
        widgetsLoading: false,
      }));
    } catch {
      setState((s) => ({
        ...s,
        widgetsError: "Failed to load widgets",
        widgetsLoading: false,
      }));
    }
  }, []);

  const createProject = useCallback(async (input: CreateProjectInput) => {
    console.log(`Debug flow: createProject fired`);
    const result = await createProjectApi(input);
    if (result.ok && result.project) {
      updateProjectsCache((projects) => [result.project!, ...projects]);
      setState((s) => ({
        ...s,
        showCreateDialog: false,
      }));
      return true;
    }
    return false;
  }, [updateProjectsCache]);

  const updateProject = useCallback(async (input: UpdateProjectInput) => {
    console.log(`Debug flow: updateProject fired`);
    const result = await updateProjectApi(input);
    if (result.ok && result.project) {
      updateProjectsCache((projects) =>
        projects.map((project) => (project.id === input.id ? result.project! : project))
      );
      syncProjectReferences(result.project);
      setState((s) => ({
        ...s,
        editingProject: null,
      }));
      return true;
    }
    return false;
  }, [syncProjectReferences, updateProjectsCache]);

  const togglePublish = useCallback(async (project: DashboardProject) => {
    console.log(`Debug flow: togglePublish fired`, { projectId: project.id });
    const result = await updateProjectApi({
      id: project.id,
      published: !project.published,
    });
    if (result.ok && result.project) {
      updateProjectsCache((projects) =>
        projects.map((item) => (item.id === project.id ? result.project! : item))
      );
      syncProjectReferences(result.project);
    }
  }, [syncProjectReferences, updateProjectsCache]);

  const deleteProject = useCallback(async (id: string) => {
    console.log(`Debug flow: deleteProject fired`, { id });
    const result = await deleteProjectApi(id);
    if (result.ok) {
      updateProjectsCache((projects) => projects.filter((project) => project.id !== id));
      setState((s) => ({
        ...s,
        deletingProject: null,
      }));
      return true;
    }
    return false;
  }, [updateProjectsCache]);

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
    const builderUrl = `/builder?projectId=${project.id}`;
    if (typeof window !== "undefined") {
      const openedWindow = window.open(builderUrl, "_blank", "noopener,noreferrer");
      if (openedWindow) {
        return;
      }
    }
    router.push(builderUrl);
  }, [router]);

  const handleViewLive = useCallback((project: DashboardProject) => {
    console.log(`Debug flow: handleViewLive fired with`, { projectId: project.id });
    router.push(`/builder?projectId=${project.id}&preview=true`);
  }, [router]);

  const handleOpenDashboard = useCallback(() => {
    console.log(`Debug flow: handleOpenDashboard fired`);
    router.push("/dashboard");
  }, [router]);

  const handleOpenWidgets = useCallback(() => {
    console.log(`Debug flow: handleOpenWidgets fired`, { projectCount: projects.length });
    if (projects.length === 0) {
      setState((s) => ({ ...s, showCreateDialog: true }));
      return;
    }
    const token = widgetCreatorSessionId || createWidgetCreatorToken();
    router.push(`/widget_creator?id=${token}`);
  }, [projects.length, router, widgetCreatorSessionId]);

  const handleWidgetCreatorPromptChange = useCallback((value: string) => {
    console.log(`Debug flow: handleWidgetCreatorPromptChange fired`, { valueLength: value.length });
    setWidgetCreatorPrompt(value);
    setWidgetCreatorError(null);
  }, []);

  const handleGenerateWidgetCreator = useCallback(async () => {
    console.log(`Debug flow: handleGenerateWidgetCreator fired`, {
      hasProject: !!latestProject,
      promptLength: widgetCreatorPrompt.length,
      sessionId: widgetCreatorSessionId,
    });
    if (!latestProject) {
      setState((s) => ({ ...s, showCreateDialog: true }));
      return;
    }

    if (!widgetCreatorPrompt.trim()) {
      setWidgetCreatorError("Describe the widget you want to create.");
      return;
    }

    setWidgetCreatorLoading(true);
    setWidgetCreatorError(null);
    const result = await generateAndStoreCustomWidget(latestProject.id, widgetCreatorPrompt.trim());
    if (!result.ok || !result.widgets) {
      setWidgetCreatorError(result.error ?? "Failed to generate widget.");
      setWidgetCreatorLoading(false);
      return;
    }

    setCustomWidgets(result.widgets);
    setWidgetCreatorPrompt("");
    setWidgetCreatorLoading(false);
  }, [latestProject, widgetCreatorPrompt, widgetCreatorSessionId]);

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

  const handleOpenProjectConfigPanel = useCallback((project: DashboardProject) => {
    console.log("Debug flow: handleOpenProjectConfigPanel fired", { projectId: project.id });
    setProjectConfigPanelProject(project);
    setProjectConfigPanelOpen(true);
  }, []);

  const handleCloseProjectConfigPanel = useCallback(() => {
    console.log("Debug flow: handleCloseProjectConfigPanel fired");
    setProjectConfigPanelOpen(false);
    setProjectConfigPanelProject(null);
  }, []);

  const saveProjectConfig = useCallback(
    async (projectId: string, config: ProjectConfigPayload): Promise<boolean> => {
      console.log("Debug flow: saveProjectConfig fired", { projectId });
      const secretKey = config.secretKey?.trim();
      if (!secretKey) {
        return false;
      }
      const encryptedLoginEndpoint =
        config.clearLoginEndpoint || !config.loginEndpoint?.trim()
          ? undefined
          : await encryptWithUserSecret(config.loginEndpoint.trim(), secretKey);
      const encryptedIntegrations = await Promise.all(
        config.apiIntegrations.map(async (integration) => ({
          ...integration,
          encryptedUrl: integration.url?.trim()
            ? await encryptWithUserSecret(integration.url.trim(), secretKey)
            : undefined,
          url: undefined,
        }))
      );
      const result = await updateProjectApi({
        id: projectId,
        config: {
          ...config,
          loginEndpointEncrypted: encryptedLoginEndpoint,
          apiIntegrationsEncrypted: encryptedIntegrations,
        },
      });
      if (!result.ok || !result.project) {
        return false;
      }
      updateProjectsCache((projects) =>
        projects.map((project) => (project.id === projectId ? result.project! : project))
      );
      syncProjectReferences(result.project);
      return true;
    },
    [syncProjectReferences, updateProjectsCache]
  );

  const runProjectConfigSimulation = useCallback(
    async (projectId: string, secretKey: string): Promise<ProjectConfigSimulationResult[]> => {
      console.log("Debug flow: runProjectConfigSimulation fired", { projectId });
      const result = await simulateProjectIntegrationsApi(projectId, secretKey);
      if (!result.ok || !result.results) {
        return [];
      }
      return result.results;
    },
    []
  );

  const publishProject = useCallback(
    async (project: DashboardProject): Promise<boolean> => {
      console.log("Debug flow: publishProject fired", { projectId: project.id });
      const result = await updateProjectApi({
        id: project.id,
        published: true,
      });
      if (!result.ok || !result.project) {
        return false;
      }
      updateProjectsCache((projects) =>
        projects.map((item) => (item.id === project.id ? result.project! : item))
      );
      syncProjectReferences(result.project);
      return true;
    },
    [syncProjectReferences, updateProjectsCache]
  );

  return {
    ...state,
    projects,
    loading,
    error,
    selectedProject,
    sheetOpen,
    projectConfigPanelProject,
    projectConfigPanelOpen,
    currentSection,
    latestProject,
    widgetCreatorSessionId,
    customWidgets,
    widgetCreatorPrompt,
    widgetCreatorLoading,
    widgetCreatorError,
    loadProjects,
    loadWidgets,
    createProject,
    updateProject,
    togglePublish,
    deleteProject,
    setShowCreateDialog,
    setEditingProject,
    setDeletingProject,
    handleLogout,
    handleOpenDashboard,
    handleOpenBuilder,
    handleViewLive,
    handleOpenWidgets,
    handleWidgetCreatorPromptChange,
    handleGenerateWidgetCreator,
    handleRowClick,
    handleCloseSheet,
    handleOpenProjectConfigPanel,
    handleCloseProjectConfigPanel,
    saveProjectConfig,
    runProjectConfigSimulation,
    publishProject,
  };
}
