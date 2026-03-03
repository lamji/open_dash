"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Globe,
  Eye,
  MoreVertical,
  Loader2,
  FolderOpen,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  DashboardProject,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/domain/dashboard/types";
import { useDashboard } from "./useDashboard";
import { logoutApi } from "@/lib/auth-api";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ─── Create Project Dialog ──────────────────────────── */

function CreateProjectDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: CreateProjectInput) => Promise<boolean>;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    const ok = await onCreate({ name: name.trim(), description: description.trim() });
    setSubmitting(false);
    if (ok) {
      setName("");
      setDescription("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              data-test-id="dashboard-create-name"
              placeholder="My Dashboard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Description (optional)</Label>
            <Input
              id="project-description"
              data-test-id="dashboard-create-description"
              placeholder="A brief description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            data-test-id="dashboard-create-cancel"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            data-test-id="dashboard-create-submit"
            disabled={!name.trim() || submitting}
            onClick={handleSubmit}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            {submitting && <Loader2 size={14} className="mr-2 animate-spin" />}
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Edit Project Dialog ────────────────────────────── */

function EditProjectDialog({
  project,
  onClose,
  onUpdate,
}: {
  project: DashboardProject | null;
  onClose: () => void;
  onUpdate: (input: UpdateProjectInput) => Promise<boolean>;
}) {
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
    }
  }, [project]);

  const handleSubmit = async () => {
    if (!project || !name.trim()) return;
    setSubmitting(true);
    const ok = await onUpdate({
      id: project.id,
      name: name.trim(),
      description: description.trim(),
    });
    setSubmitting(false);
    if (ok) onClose();
  };

  return (
    <Dialog open={!!project} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Project Name</Label>
            <Input
              id="edit-name"
              data-test-id="dashboard-edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              data-test-id="dashboard-edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            data-test-id="dashboard-edit-cancel"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            data-test-id="dashboard-edit-submit"
            disabled={!name.trim() || submitting}
            onClick={handleSubmit}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            {submitting && <Loader2 size={14} className="mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Delete Confirmation Dialog ─────────────────────── */

function DeleteProjectDialog({
  project,
  onClose,
  onDelete,
}: {
  project: DashboardProject | null;
  onClose: () => void;
  onDelete: (id: string) => Promise<boolean>;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!project) return;
    setDeleting(true);
    await onDelete(project.id);
    setDeleting(false);
  };

  return (
    <AlertDialog open={!!project} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &ldquo;{project?.name}&rdquo;? This
            action cannot be undone and all project data will be permanently
            removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            data-test-id="dashboard-delete-cancel"
            onClick={onClose}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            data-test-id="dashboard-delete-confirm"
            disabled={deleting}
            onClick={handleDelete}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {deleting && <Loader2 size={14} className="mr-2 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ─── Project Card ───────────────────────────────────── */

function ProjectCard({
  project,
  onEdit,
  onDelete,
  onTogglePublish,
  onViewLive,
  onOpenBuilder,
}: {
  project: DashboardProject;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
  onViewLive: () => void;
  onOpenBuilder: () => void;
}) {
  return (
    <Card className="group border-gray-200 p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-gray-900">
              {project.name}
            </h3>
            <Badge
              className={
                project.published
                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-100"
              }
            >
              {project.published ? "Published" : "Draft"}
            </Badge>
          </div>
          {project.description && (
            <p className="mt-1 truncate text-sm text-gray-500">
              {project.description}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            Updated {formatDate(project.updatedAt)}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              data-test-id={`dashboard-project-menu-${project.id}`}
              className="h-8 w-8 shrink-0 text-gray-400 hover:text-gray-600"
            >
              <MoreVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              data-test-id={`dashboard-project-edit-${project.id}`}
              onClick={onEdit}
            >
              <Pencil size={14} className="mr-2" />
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem
              data-test-id={`dashboard-project-builder-${project.id}`}
              onClick={onOpenBuilder}
            >
              <FolderOpen size={14} className="mr-2" />
              Open Builder
            </DropdownMenuItem>
            <DropdownMenuItem
              data-test-id={`dashboard-project-preview-${project.id}`}
              onClick={onViewLive}
            >
              <Eye size={14} className="mr-2" />
              View Live
            </DropdownMenuItem>
            <DropdownMenuItem
              data-test-id={`dashboard-project-publish-${project.id}`}
              onClick={onTogglePublish}
            >
              <Globe size={14} className="mr-2" />
              {project.published ? "Unpublish" : "Publish"}
            </DropdownMenuItem>
            <DropdownMenuItem
              data-test-id={`dashboard-project-delete-${project.id}`}
              onClick={onDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 size={14} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          data-test-id={`dashboard-project-open-${project.id}`}
          onClick={onOpenBuilder}
          className="flex-1 text-xs"
        >
          <FolderOpen size={14} className="mr-1.5" />
          Open Builder
        </Button>
        <Button
          size="sm"
          data-test-id={`dashboard-project-view-${project.id}`}
          onClick={onViewLive}
          className="flex-1 bg-gray-900 text-xs text-white hover:bg-gray-800"
        >
          <Eye size={14} className="mr-1.5" />
          View Live
        </Button>
      </div>
    </Card>
  );
}

/* ─── Dashboard Page ─────────────────────────────────── */

export default function DashboardPage() {
  const router = useRouter();
  const dashboard = useDashboard();

  const handleLogout = async () => {
    await logoutApi();
    router.push("/");
  };

  const handleOpenBuilder = (project: DashboardProject) => {
    router.push(`/builder?projectId=${project.id}`);
  };

  const handleViewLive = (project: DashboardProject) => {
    router.push(`/builder?projectId=${project.id}&preview=true`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
              <span className="text-sm font-bold text-white">O</span>
            </div>
            <span className="text-lg font-bold text-gray-900">OpenDash</span>
          </div>
          <Button
            variant="ghost"
            data-test-id="dashboard-logout"
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            <LogOut size={16} className="mr-2" />
            Log Out
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Title Bar */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your dashboards and applications
            </p>
          </div>
          <Button
            data-test-id="dashboard-create-btn"
            onClick={() => dashboard.setShowCreateDialog(true)}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            <Plus size={16} className="mr-2" />
            New Project
          </Button>
        </div>

        {/* Loading State */}
        {dashboard.loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        )}

        {/* Error State */}
        {dashboard.error && !dashboard.loading && (
          <Card className="border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm font-medium text-red-700">{dashboard.error}</p>
            <Button
              variant="outline"
              data-test-id="dashboard-retry"
              onClick={dashboard.loadProjects}
              className="mt-4"
            >
              Try Again
            </Button>
          </Card>
        )}

        {/* Empty State */}
        {!dashboard.loading &&
          !dashboard.error &&
          dashboard.projects.length === 0 && (
            <Card className="border-dashed border-gray-300 p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <FolderOpen size={24} className="text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                No projects yet
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Create your first project to get started building with AI
              </p>
              <Button
                data-test-id="dashboard-empty-create"
                onClick={() => dashboard.setShowCreateDialog(true)}
                className="mt-6 bg-gray-900 text-white hover:bg-gray-800"
              >
                <Plus size={16} className="mr-2" />
                Create First Project
              </Button>
            </Card>
          )}

        {/* Project Grid */}
        {!dashboard.loading &&
          !dashboard.error &&
          dashboard.projects.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dashboard.projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={() => dashboard.setEditingProject(project)}
                  onDelete={() => dashboard.setDeletingProject(project)}
                  onTogglePublish={() => dashboard.togglePublish(project)}
                  onViewLive={() => handleViewLive(project)}
                  onOpenBuilder={() => handleOpenBuilder(project)}
                />
              ))}
            </div>
          )}
      </main>

      {/* Dialogs */}
      <CreateProjectDialog
        open={dashboard.showCreateDialog}
        onOpenChange={dashboard.setShowCreateDialog}
        onCreate={dashboard.createProject}
      />
      <EditProjectDialog
        project={dashboard.editingProject}
        onClose={() => dashboard.setEditingProject(null)}
        onUpdate={dashboard.updateProject}
      />
      <DeleteProjectDialog
        project={dashboard.deletingProject}
        onClose={() => dashboard.setDeletingProject(null)}
        onDelete={dashboard.deleteProject}
      />
    </div>
  );
}
