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
      <DialogContent className="border-white/10 bg-[#0f172a] text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-white">New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="project-name" className="text-slate-300">Project Name</Label>
            <Input
              id="project-name"
              data-test-id="dashboard-create-name"
              placeholder="My Dashboard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description" className="text-slate-300">Description (optional)</Label>
            <Input
              id="project-description"
              data-test-id="dashboard-create-description"
              placeholder="A brief description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            data-test-id="dashboard-create-cancel"
            onClick={() => onOpenChange(false)}
            className="border-white/15 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            data-test-id="dashboard-create-submit"
            disabled={!name.trim() || submitting}
            onClick={handleSubmit}
            className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"
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
      <DialogContent className="border-white/10 bg-[#0f172a] text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-slate-300">Project Name</Label>
            <Input
              id="edit-name"
              data-test-id="dashboard-edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-slate-300">Description</Label>
            <Input
              id="edit-description"
              data-test-id="dashboard-edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            data-test-id="dashboard-edit-cancel"
            onClick={onClose}
            className="border-white/15 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            data-test-id="dashboard-edit-submit"
            disabled={!name.trim() || submitting}
            onClick={handleSubmit}
            className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"
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
      <AlertDialogContent className="border-white/10 bg-[#0f172a] text-slate-100">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Delete Project</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            Are you sure you want to delete &ldquo;{project?.name}&rdquo;? This
            action cannot be undone and all project data will be permanently
            removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            data-test-id="dashboard-delete-cancel"
            onClick={onClose}
            className="border-white/15 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            data-test-id="dashboard-delete-confirm"
            disabled={deleting}
            onClick={handleDelete}
            className="bg-red-500 text-white hover:bg-red-400"
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
      <SheetContent className="w-[600px] overflow-y-auto border-l border-white/10 bg-[#0b1120] p-6 text-slate-100 sm:max-w-[600px]" data-test-id="dashboard-project-sheet">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-xl font-bold text-white">{project.name}</SheetTitle>
              <p className="mt-1 text-sm text-slate-400">{project.description || "No description"}</p>
            </div>
            <Badge className={project.published ? "border-0 bg-emerald-500/15 text-emerald-300" : "border-0 bg-amber-500/15 text-amber-300"}>
              {project.published ? "Active" : "Draft"}
            </Badge>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-4 border border-white/10 bg-white/5">
            <TabsTrigger value="overview" data-test-id="sheet-tab-overview" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-200">
              <FileText size={16} className="mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tasks" data-test-id="sheet-tab-tasks" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-200">
              <ListTodo size={16} className="mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="comments" data-test-id="sheet-tab-comments" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-200">
              <MessageSquare size={16} className="mr-2" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="bugs" data-test-id="sheet-tab-bugs" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-200">
              <Bug size={16} className="mr-2" />
              Bugs
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-300">Project Name</Label>
                <p className="mt-1 text-sm text-slate-100">{project.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-300">Description</Label>
                <p className="mt-1 text-sm text-slate-100">{project.description || "No description provided"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-300">Status</Label>
                <p className="mt-1 text-sm text-slate-100">{project.published ? "Active" : "Draft"}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={onOpenBuilder}
                  data-test-id="sheet-open-builder"
                  className="flex-1 bg-indigo-500 text-white hover:bg-indigo-400"
                >
                  <FolderOpen size={16} className="mr-2" />
                  Open Builder
                </Button>
                <Button
                  onClick={onViewLive}
                  variant="outline"
                  data-test-id="sheet-view-live"
                  className="flex-1 border-white/15 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white"
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
                  className="flex-1 border-white/15 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white"
                >
                  <Pencil size={16} className="mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={onTogglePublish}
                  variant="outline"
                  data-test-id="sheet-toggle-publish"
                  className="flex-1 border-white/15 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white"
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
                  className="flex-1 border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
                />
                <Button
                  onClick={() => setNewTask("")}
                  data-test-id="sheet-task-add"
                  className="bg-indigo-500 text-white hover:bg-indigo-400"
                >
                  <Plus size={16} />
                </Button>
              </div>
              <div className="space-y-2">
                {mockTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    {task.status === "done" ? (
                      <CheckCircle2 size={18} className="text-green-600" />
                    ) : task.status === "in-progress" ? (
                      <Clock size={18} className="text-orange-600" />
                    ) : (
                      <Circle size={18} className="text-slate-500" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${task.status === "done" ? "text-slate-500 line-through" : "text-slate-100"}`}>
                        {task.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Select defaultValue={task.status}>
                          <SelectTrigger className="h-7 w-32 border-white/10 bg-[#111827] text-xs text-slate-200" data-test-id={`task-status-${task.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-white/10 bg-[#0f172a] text-slate-100">
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                        <Badge variant="outline" className="border-white/10 text-xs text-slate-300">
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
                  className="min-h-[80px] border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
                />
                <Button
                  onClick={() => setNewComment("")}
                  data-test-id="sheet-comment-add"
                  className="bg-indigo-500 text-white hover:bg-indigo-400"
                >
                  <Plus size={16} className="mr-2" />
                  Add Comment
                </Button>
              </div>
              <div className="space-y-3">
                {mockComments.map((comment) => (
                  <div key={comment.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-xs font-semibold text-indigo-200">
                        {comment.author.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-100">{comment.author}</span>
                          <span className="text-xs text-slate-500">{comment.timestamp}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-300">{comment.text}</p>
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
              <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
                <Input
                  placeholder="Bug title..."
                  value={newBug.title}
                  onChange={(e) => setNewBug({ ...newBug, title: e.target.value })}
                  data-test-id="sheet-bug-title-input"
                  className="border-white/10 bg-[#111827] text-slate-100 placeholder:text-slate-500"
                />
                <Textarea
                  placeholder="Bug description..."
                  value={newBug.description}
                  onChange={(e) => setNewBug({ ...newBug, description: e.target.value })}
                  data-test-id="sheet-bug-description-input"
                  className="min-h-[60px] border-white/10 bg-[#111827] text-slate-100 placeholder:text-slate-500"
                />
                <div className="flex gap-2">
                  <Select value={newBug.severity} onValueChange={(v) => setNewBug({ ...newBug, severity: v })}>
                    <SelectTrigger className="w-32 border-white/10 bg-[#111827] text-slate-200" data-test-id="sheet-bug-severity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#0f172a] text-slate-100">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => setNewBug({ title: "", description: "", severity: "medium" })}
                    data-test-id="sheet-bug-add"
                    className="bg-indigo-500 text-white hover:bg-indigo-400"
                  >
                    <Plus size={16} className="mr-2" />
                    File Bug
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {mockBugs.map((bug) => (
                  <div key={bug.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-start gap-3">
                      <Bug size={18} className={bug.severity === "high" || bug.severity === "critical" ? "text-red-600" : "text-orange-600"} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-100">{bug.title}</p>
                        <p className="mt-1 text-xs text-slate-400">{bug.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline" className={bug.severity === "high" || bug.severity === "critical" ? "border-red-500/30 text-red-300" : "border-orange-500/30 text-orange-300"}>
                            {bug.severity}
                          </Badge>
                          <Badge variant="outline" className="border-white/10 text-xs text-slate-300">
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

/* ─── Stat Card ──────────────────────────────────────── */

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: number; icon: React.ElementType; accent: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.35)] transition-shadow hover:shadow-[0_20px_70px_rgba(79,70,229,0.22)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-lg ${accent}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </div>
  );
}

/* ─── Project Card ───────────────────────────────────── */

function ProjectCard({
  project,
  onRowClick,
  onEdit,
  onOpenBuilder,
  onViewLive,
  onTogglePublish,
  onDelete,
}: {
  project: DashboardProject;
  onRowClick: () => void;
  onEdit: () => void;
  onOpenBuilder: () => void;
  onViewLive: () => void;
  onTogglePublish: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="group cursor-pointer rounded-2xl border border-white/10 bg-[#0f172a] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.35)] transition-all hover:border-indigo-400/30 hover:shadow-[0_20px_80px_rgba(79,70,229,0.18)]"
      onClick={onRowClick}
      data-test-id={`dashboard-project-row-${project.id}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 text-xs font-bold text-slate-950 shadow-sm">
              {project.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-white transition-colors group-hover:text-cyan-300">
                {project.name}
              </h3>
              <p className="truncate text-xs text-slate-500">
                {project.description || "No description"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pl-3">
          <Badge
            className={
              project.published
                ? "border-0 bg-emerald-500/15 text-emerald-300 text-xs font-medium shadow-none"
                : "border-0 bg-amber-500/15 text-amber-300 text-xs font-medium shadow-none"
            }
          >
            {project.published ? "Active" : "Draft"}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-test-id={`dashboard-project-menu-${project.id}`}
                className="h-8 w-8 text-slate-500 opacity-0 transition-opacity hover:bg-white/10 hover:text-white group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 border-white/10 bg-[#0f172a] text-slate-100">
              <DropdownMenuItem
                data-test-id={`dashboard-project-edit-${project.id}`}
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="focus:bg-white/10 focus:text-white"
              >
                <Pencil size={14} className="mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                data-test-id={`dashboard-project-builder-${project.id}`}
                onClick={(e) => { e.stopPropagation(); onOpenBuilder(); }}
                className="focus:bg-white/10 focus:text-white"
              >
                <FolderOpen size={14} className="mr-2" />
                Open Builder
              </DropdownMenuItem>
              <DropdownMenuItem
                data-test-id={`dashboard-project-preview-${project.id}`}
                onClick={(e) => { e.stopPropagation(); onViewLive(); }}
                className="focus:bg-white/10 focus:text-white"
              >
                <Eye size={14} className="mr-2" />
                View Live
              </DropdownMenuItem>
              <DropdownMenuItem
                data-test-id={`dashboard-project-publish-${project.id}`}
                onClick={(e) => { e.stopPropagation(); onTogglePublish(); }}
                className="focus:bg-white/10 focus:text-white"
              >
                <Globe size={14} className="mr-2" />
                {project.published ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuItem
                data-test-id={`dashboard-project-delete-${project.id}`}
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-red-400 focus:bg-red-500/10 focus:text-red-300"
              >
                <Trash2 size={14} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button
          size="sm"
          data-test-id={`dashboard-project-builder-card-${project.id}`}
          onClick={(e) => { e.stopPropagation(); onOpenBuilder(); }}
          className="h-8 rounded-lg bg-cyan-400 px-3 text-xs font-medium text-slate-950 shadow-sm hover:bg-cyan-300"
        >
          <FolderOpen size={13} className="mr-1.5" />
          Open Builder
        </Button>
        <Button
          size="sm"
          variant="outline"
          data-test-id={`dashboard-project-preview-card-${project.id}`}
          onClick={(e) => { e.stopPropagation(); onViewLive(); }}
          className="h-8 rounded-lg border-white/10 bg-white/5 px-3 text-xs font-medium text-slate-200 hover:bg-white/10"
        >
          <Eye size={13} className="mr-1.5" />
          Preview
        </Button>
      </div>
    </div>
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

  const totalProjects = dashboard.projects.length;
  const activeProjects = dashboard.projects.filter((p) => p.published).length;
  const draftProjects = totalProjects - activeProjects;

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-[220px] flex-col border-r border-white/10 bg-[#020817]">
        <div className="flex h-14 items-center gap-2.5 px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-sm">
            <span className="text-[11px] font-bold text-slate-950">O</span>
          </div>
          <span className="text-[15px] font-bold tracking-tight text-white">OpenDash</span>
        </div>

        <nav className="mt-2 flex-1 space-y-0.5 px-3">
          <button
            data-test-id="dashboard-nav-home"
            className="flex w-full items-center gap-2.5 rounded-xl bg-cyan-400/10 px-3 py-2 text-[13px] font-semibold text-cyan-300 transition-colors"
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>
          <button
            data-test-id="dashboard-nav-projects"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <FolderOpen size={16} />
            Projects
          </button>
          <button
            data-test-id="dashboard-nav-analytics"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <BarChart3 size={16} />
            Analytics
          </button>
          <button
            data-test-id="dashboard-nav-settings"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Settings size={16} />
            Settings
          </button>
        </nav>

        <div className="border-t border-white/10 p-3">
          <Button
            variant="ghost"
            data-test-id="dashboard-logout"
            onClick={handleLogout}
            className="h-9 w-full justify-start rounded-xl px-3 text-[13px] font-medium text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <LogOut size={15} className="mr-2" />
            Log Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[220px] flex-1">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#020617]/85 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between px-8">
            <h1 className="text-[15px] font-bold tracking-tight text-white">Dashboard</h1>
            <Button
              data-test-id="dashboard-create-btn"
              onClick={() => dashboard.setShowCreateDialog(true)}
              className="h-9 rounded-xl bg-cyan-400 px-4 text-[13px] font-semibold text-slate-950 shadow-sm transition-colors hover:bg-cyan-300"
            >
              <Plus size={15} className="mr-1.5" />
              New Project
            </Button>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-8 py-6">
          {/* Stat Cards */}
          {!dashboard.loading && !dashboard.error && (
            <div className="mb-8 grid grid-cols-3 gap-4">
              <StatCard label="Total Projects" value={totalProjects} icon={FolderOpen} accent="bg-indigo-500" />
              <StatCard label="Active" value={activeProjects} icon={Globe} accent="bg-emerald-500" />
              <StatCard label="Drafts" value={draftProjects} icon={Pencil} accent="bg-amber-500" />
            </div>
          )}

          {/* Section header */}
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Projects</h2>
              <p className="mt-0.5 text-[13px] text-slate-500">
                Manage your dashboards, tasks and progress
              </p>
            </div>
          </div>

          {/* Loading State */}
          {dashboard.loading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={22} className="animate-spin text-indigo-400" />
            </div>
          )}

          {/* Error State */}
          {dashboard.error && !dashboard.loading && (
            <Card className="border-red-500/20 bg-red-500/10 p-8 text-center shadow-none">
              <p className="text-sm font-medium text-red-300">{dashboard.error}</p>
              <Button
                variant="outline"
                data-test-id="dashboard-retry"
                onClick={dashboard.loadProjects}
                className="mt-4 rounded-xl border-white/15 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white"
              >
                Try Again
              </Button>
            </Card>
          )}

          {/* Empty State */}
          {!dashboard.loading &&
            !dashboard.error &&
            dashboard.projects.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-[#0f172a] py-16">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
                  <FolderOpen size={24} className="text-slate-500" />
                </div>
                <h2 className="text-base font-semibold text-white">No projects yet</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Create your first project to start building with AI
                </p>
                <Button
                  data-test-id="dashboard-empty-create"
                  onClick={() => dashboard.setShowCreateDialog(true)}
                  className="mt-6 h-9 rounded-xl bg-cyan-400 px-5 text-[13px] font-semibold text-slate-950 hover:bg-cyan-300"
                >
                  <Plus size={15} className="mr-1.5" />
                  New Project
                </Button>
              </div>
            )}

          {/* Project Cards Grid */}
          {!dashboard.loading &&
            !dashboard.error &&
            dashboard.projects.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {dashboard.projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onRowClick={() => handleRowClick(project)}
                    onEdit={() => dashboard.setEditingProject(project)}
                    onOpenBuilder={() => handleOpenBuilder(project)}
                    onViewLive={() => handleViewLive(project)}
                    onTogglePublish={() => dashboard.togglePublish(project)}
                    onDelete={() => dashboard.setDeletingProject(project)}
                  />
                ))}
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
