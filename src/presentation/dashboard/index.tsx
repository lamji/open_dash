"use client";

import React, { useState } from "react";
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
  LayoutDashboard,
  BarChart3,
  Settings,
  MessageSquare,
  CheckCircle2,
  Circle,
  Clock,
  Bug,
  ListTodo,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      <DialogContent className="bg-white">
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
            className="bg-blue-600 text-white hover:bg-blue-700"
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
      <DialogContent className="bg-white">
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
            className="bg-blue-600 text-white hover:bg-blue-700"
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
      <AlertDialogContent className="bg-white">
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

/* ─── Project Sheet Sidebar ─────────────────────────── */

function ProjectSheet({
  project,
  open,
  onClose,
  onEdit,
  onTogglePublish,
  onViewLive,
  onOpenBuilder,
}: {
  project: DashboardProject | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onTogglePublish: () => void;
  onViewLive: () => void;
  onOpenBuilder: () => void;
}) {
  const [newTask, setNewTask] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newBug, setNewBug] = useState({ title: "", description: "", severity: "medium" });

  // Mock data
  const mockTasks = [
    { id: 1, title: "Setup authentication system", status: "done", priority: "high" },
    { id: 2, title: "Design dashboard layout", status: "done", priority: "medium" },
    { id: 3, title: "Implement API endpoints", status: "in-progress", priority: "high" },
    { id: 4, title: "Add data visualization", status: "in-progress", priority: "medium" },
    { id: 5, title: "Write documentation", status: "todo", priority: "low" },
  ];

  const mockComments = [
    { id: 1, author: "Sarah Chen", text: "Great progress on the API integration!", timestamp: "2h ago" },
    { id: 2, author: "Mike Johnson", text: "Need to review the authentication flow", timestamp: "5h ago" },
  ];

  const mockBugs = [
    { id: 1, title: "Login button not responsive", severity: "high", status: "open", description: "Button doesn't work on mobile devices" },
    { id: 2, title: "Chart data not loading", severity: "medium", status: "in-progress", description: "API timeout issue" },
  ];

  if (!project) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[600px] overflow-y-auto sm:max-w-[600px] p-6" data-test-id="dashboard-project-sheet">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-xl font-bold text-blue-900">{project.name}</SheetTitle>
              <p className="mt-1 text-sm text-blue-600">{project.description || "No description"}</p>
            </div>
            <Badge className={project.published ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}>
              {project.published ? "Active" : "Draft"}
            </Badge>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-test-id="sheet-tab-overview">
              <FileText size={16} className="mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tasks" data-test-id="sheet-tab-tasks">
              <ListTodo size={16} className="mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="comments" data-test-id="sheet-tab-comments">
              <MessageSquare size={16} className="mr-2" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="bugs" data-test-id="sheet-tab-bugs">
              <Bug size={16} className="mr-2" />
              Bugs
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-blue-900">Project Name</Label>
                <p className="mt-1 text-sm text-blue-700">{project.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-blue-900">Description</Label>
                <p className="mt-1 text-sm text-blue-700">{project.description || "No description provided"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-blue-900">Status</Label>
                <p className="mt-1 text-sm text-blue-700">{project.published ? "Active" : "Draft"}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={onOpenBuilder}
                  data-test-id="sheet-open-builder"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <FolderOpen size={16} className="mr-2" />
                  Open Builder
                </Button>
                <Button
                  onClick={onViewLive}
                  variant="outline"
                  data-test-id="sheet-view-live"
                  className="flex-1"
                >
                  <Eye size={16} className="mr-2" />
                  View Live
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={onEdit}
                  variant="outline"
                  data-test-id="sheet-edit-project"
                  className="flex-1"
                >
                  <Pencil size={16} className="mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={onTogglePublish}
                  variant="outline"
                  data-test-id="sheet-toggle-publish"
                  className="flex-1"
                >
                  <Globe size={16} className="mr-2" />
                  {project.published ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new task..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  data-test-id="sheet-task-input"
                  className="flex-1"
                />
                <Button
                  onClick={() => setNewTask("")}
                  data-test-id="sheet-task-add"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus size={16} />
                </Button>
              </div>
              <div className="space-y-2">
                {mockTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 rounded-lg border border-blue-100 bg-white p-3">
                    {task.status === "done" ? (
                      <CheckCircle2 size={18} className="text-green-600" />
                    ) : task.status === "in-progress" ? (
                      <Clock size={18} className="text-orange-600" />
                    ) : (
                      <Circle size={18} className="text-blue-400" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${task.status === "done" ? "text-blue-600 line-through" : "text-blue-900"}`}>
                        {task.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Select defaultValue={task.status}>
                          <SelectTrigger className="h-7 w-32 text-xs" data-test-id={`task-status-${task.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                        <Badge variant="outline" className="text-xs">
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  data-test-id="sheet-comment-input"
                  className="min-h-[80px]"
                />
                <Button
                  onClick={() => setNewComment("")}
                  data-test-id="sheet-comment-add"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus size={16} className="mr-2" />
                  Add Comment
                </Button>
              </div>
              <div className="space-y-3">
                {mockComments.map((comment) => (
                  <div key={comment.id} className="rounded-lg border border-blue-100 bg-white p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                        {comment.author.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-blue-900">{comment.author}</span>
                          <span className="text-xs text-blue-500">{comment.timestamp}</span>
                        </div>
                        <p className="mt-1 text-sm text-blue-700">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Bugs Tab */}
          <TabsContent value="bugs" className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
                <Input
                  placeholder="Bug title..."
                  value={newBug.title}
                  onChange={(e) => setNewBug({ ...newBug, title: e.target.value })}
                  data-test-id="sheet-bug-title-input"
                />
                <Textarea
                  placeholder="Bug description..."
                  value={newBug.description}
                  onChange={(e) => setNewBug({ ...newBug, description: e.target.value })}
                  data-test-id="sheet-bug-description-input"
                  className="min-h-[60px]"
                />
                <div className="flex gap-2">
                  <Select value={newBug.severity} onValueChange={(v) => setNewBug({ ...newBug, severity: v })}>
                    <SelectTrigger className="w-32" data-test-id="sheet-bug-severity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => setNewBug({ title: "", description: "", severity: "medium" })}
                    data-test-id="sheet-bug-add"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus size={16} className="mr-2" />
                    File Bug
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {mockBugs.map((bug) => (
                  <div key={bug.id} className="rounded-lg border border-blue-100 bg-white p-3">
                    <div className="flex items-start gap-3">
                      <Bug size={18} className={bug.severity === "high" || bug.severity === "critical" ? "text-red-600" : "text-orange-600"} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">{bug.title}</p>
                        <p className="mt-1 text-xs text-blue-600">{bug.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline" className={bug.severity === "high" || bug.severity === "critical" ? "border-red-300 text-red-700" : "border-orange-300 text-orange-700"}>
                            {bug.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {bug.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Dashboard Page ─────────────────────────────────── */

export default function DashboardPage() {
  const dashboard = useDashboard();
  const {
    selectedProject,
    sheetOpen,
    handleLogout,
    handleOpenBuilder,
    handleViewLive,
    handleRowClick,
    handleCloseSheet,
  } = dashboard;

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-blue-200 bg-white">
        <div className="flex h-16 items-center gap-3 border-b border-blue-200 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-sm font-bold text-white">O</span>
          </div>
          <span className="text-lg font-bold text-blue-900">OpenDash</span>
        </div>
        
        <nav className="space-y-1 p-4">
          <button
            data-test-id="dashboard-nav-home"
            className="flex w-full items-center gap-3 rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-900"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button
            data-test-id="dashboard-nav-projects"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            <FolderOpen size={18} />
            Projects
          </button>
          <button
            data-test-id="dashboard-nav-analytics"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            <BarChart3 size={18} />
            Analytics
          </button>
          <button
            data-test-id="dashboard-nav-settings"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            <Settings size={18} />
            Settings
          </button>
        </nav>
        
        <div className="absolute bottom-0 w-64 border-t border-blue-200 p-4">
          <Button
            variant="ghost"
            data-test-id="dashboard-logout"
            onClick={handleLogout}
            className="w-full justify-start text-sm text-blue-700 hover:bg-blue-50 hover:text-blue-900"
          >
            <LogOut size={16} className="mr-2" />
            Log Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="border-b border-blue-200 bg-white">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <h1 className="text-xl font-bold text-blue-900">Dashboard</h1>
            </div>
            <Button
              data-test-id="dashboard-create-btn"
              onClick={() => dashboard.setShowCreateDialog(true)}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus size={16} className="mr-2" />
              New Project
            </Button>
          </div>
        </header>

        <div className="p-8">
          {/* Projects Section */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-blue-900">Projects</h2>
            <p className="mt-1 text-sm text-blue-600">
              Manage your project tasks, comments, and progress
            </p>
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
              <p className="mt-4 text-sm text-gray-400">
                Use the <span className="font-medium text-blue-600">+ New Project</span> button above to get started
              </p>
            </Card>
          )}

        {/* Project Table */}
        {!dashboard.loading &&
          !dashboard.error &&
          dashboard.projects.length > 0 && (
            <div className="rounded-lg border border-blue-200 bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="border-blue-100 bg-blue-50">
                    <TableHead className="font-semibold text-blue-900">Project Name</TableHead>
                    <TableHead className="font-semibold text-blue-900">Description</TableHead>
                    <TableHead className="font-semibold text-blue-900">Status</TableHead>
                    <TableHead className="w-[100px] font-semibold text-blue-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboard.projects.map((project) => (
                    <TableRow
                      key={project.id}
                      className="cursor-pointer border-blue-100 hover:bg-blue-50"
                      onClick={() => handleRowClick(project)}
                      data-test-id={`dashboard-project-row-${project.id}`}
                    >
                      <TableCell className="font-medium text-blue-900">
                        {project.name}
                      </TableCell>
                      <TableCell className="text-blue-700">
                        {project.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            project.published
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                          }
                        >
                          {project.published ? "Active" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-test-id={`dashboard-project-menu-${project.id}`}
                              className="h-8 w-8 text-blue-400 hover:text-blue-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              data-test-id={`dashboard-project-edit-${project.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                dashboard.setEditingProject(project);
                              }}
                            >
                              <Pencil size={14} className="mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              data-test-id={`dashboard-project-builder-${project.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenBuilder(project);
                              }}
                            >
                              <FolderOpen size={14} className="mr-2" />
                              Open Builder
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              data-test-id={`dashboard-project-preview-${project.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewLive(project);
                              }}
                            >
                              <Eye size={14} className="mr-2" />
                              View Live
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              data-test-id={`dashboard-project-publish-${project.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                dashboard.togglePublish(project);
                              }}
                            >
                              <Globe size={14} className="mr-2" />
                              {project.published ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              data-test-id={`dashboard-project-delete-${project.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                dashboard.setDeletingProject(project);
                              }}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 size={14} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
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

      {/* Project Sheet Sidebar */}
      <ProjectSheet
        project={selectedProject}
        open={sheetOpen}
        onClose={handleCloseSheet}
        onEdit={() => {
          if (selectedProject) {
            dashboard.setEditingProject(selectedProject);
            handleCloseSheet();
          }
        }}
        onTogglePublish={() => {
          if (selectedProject) {
            dashboard.togglePublish(selectedProject);
          }
        }}
        onViewLive={() => {
          if (selectedProject) {
            handleViewLive(selectedProject);
          }
        }}
        onOpenBuilder={() => {
          if (selectedProject) {
            handleOpenBuilder(selectedProject);
          }
        }}
      />
    </div>
  );
}
