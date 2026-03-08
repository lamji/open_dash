export interface DashboardProject {
  id: string;
  name: string;
  slug: string;
  description: string;
  published: boolean;
  liveLayoutId?: string | null;
  loginRequired?: boolean;
  hasCustomServiceUrl?: boolean;
  hasLoginEndpoint?: boolean;
  hasUserSecretKey?: boolean;
  encryptedCustomServiceUrl?: string | null;
  encryptedLoginEndpoint?: string | null;
  apiIntegrations?: ProjectApiIntegration[];
  createdAt: string;
  updatedAt: string;
}

export type ApiIntegrationMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ProjectApiIntegration {
  id: string;
  navigationId: string;
  navigationLabel: string;
  method: ApiIntegrationMethod;
  url?: string;
  encryptedUrl?: string;
}

export interface ProjectConfigPayload {
  loginRequired: boolean;
  customServiceUrl?: string;
  customServiceUrlEncrypted?: string;
  loginEndpoint?: string;
  loginEndpointEncrypted?: string;
  secretKey?: string;
  apiIntegrationsEncrypted?: ProjectApiIntegration[];
  clearCustomServiceUrl?: boolean;
  clearLoginEndpoint?: boolean;
  apiIntegrations: ProjectApiIntegration[];
}

export interface ProjectConfigSimulationResult {
  integrationId: string;
  navigationLabel: string;
  method: ApiIntegrationMethod;
  url: string;
  passed: boolean;
  statusCode: number;
  response: unknown;
}

export type ProjectConfigSimulationLogLevel = "info" | "success" | "error";

export interface ProjectConfigSimulationLogEntry {
  id: string;
  level: ProjectConfigSimulationLogLevel;
  message: string;
  detail?: string;
  timestamp: string;
}

export interface ProjectConfigSimulationModalState {
  open: boolean;
  integrationId: string | null;
  integrationLabel: string;
  method: ApiIntegrationMethod;
  url: string;
  status: "idle" | "running" | "success" | "error";
  logs: ProjectConfigSimulationLogEntry[];
  result: ProjectConfigSimulationResult | null;
}

export interface DashboardWidget {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  widgetData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type DashboardSection = "dashboard" | "widgets";

export interface WidgetCreatorResult {
  message: string;
  role: "assistant";
  timestamp: string;
}

export interface CustomWidgetRecord {
  id: string;
  widgetId: string;
  title: string;
  description: string;
  category: import("@/domain/widgets/types").WidgetCategory;
  widgetData: Record<string, unknown>;
  prompt: string;
  createdAt: string;
}

export interface CustomWidgetsConfig {
  widgets: CustomWidgetRecord[];
}

export interface WidgetCreatorSectionProps {
  hasProjects: boolean;
  activeProjectName: string | null;
  sessionId: string;
  widgets: CustomWidgetRecord[];
  prompt: string;
  loading: boolean;
  error: string | null;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  onCreateProject: () => void;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  id: string;
  name?: string;
  description?: string;
  published?: boolean;
  config?: ProjectConfigPayload;
}

export interface ProjectApiResponse {
  ok: boolean;
  project?: DashboardProject;
  projects?: DashboardProject[];
  error?: string;
}

export interface DashboardState {
  projects: DashboardProject[];
  widgets: DashboardWidget[];
  loading: boolean;
  widgetsLoading: boolean;
  error: string | null;
  widgetsError: string | null;
  showCreateDialog: boolean;
  editingProject: DashboardProject | null;
  deletingProject: DashboardProject | null;
}
