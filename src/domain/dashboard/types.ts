export interface DashboardProject {
  id: string;
  name: string;
  slug: string;
  description: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
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
}

export interface ProjectApiResponse {
  ok: boolean;
  project?: DashboardProject;
  projects?: DashboardProject[];
  error?: string;
}

export interface DashboardState {
  projects: DashboardProject[];
  loading: boolean;
  error: string | null;
  showCreateDialog: boolean;
  editingProject: DashboardProject | null;
  deletingProject: DashboardProject | null;
}
