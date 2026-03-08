"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  FlaskConical,
  Play,
  Plus,
  TerminalSquare,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type {
  ApiIntegrationMethod,
  DashboardProject,
  ProjectApiIntegration,
  ProjectConfigPayload,
  ProjectConfigSimulationLogEntry,
  ProjectConfigSimulationModalState,
  ProjectConfigSimulationResult,
} from "@/domain/dashboard/types";
import { getNavItems } from "@/lib/api/builder-nav";
import type { NavItem } from "@/domain/builder/types";

interface ProjectConfigPanelProps {
  project: DashboardProject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveConfig: (projectId: string, config: ProjectConfigPayload) => Promise<boolean>;
  onRunSimulation: (projectId: string, secretKey: string) => Promise<ProjectConfigSimulationResult[]>;
  onPublishProject: (project: DashboardProject) => Promise<boolean>;
}

const METHOD_OPTIONS: ApiIntegrationMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

function createIntegrationId(): string {
  console.log("Debug flow: createIntegrationId fired");
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `integration-${Date.now()}`;
}

function createSimulationLogEntry(
  level: ProjectConfigSimulationLogEntry["level"],
  message: string,
  detail?: string
): ProjectConfigSimulationLogEntry {
  console.log("Debug flow: createSimulationLogEntry fired", { level, message });
  return {
    id: createIntegrationId(),
    level,
    message,
    detail,
    timestamp: new Date().toISOString(),
  };
}

function createEmptySimulationModalState(): ProjectConfigSimulationModalState {
  console.log("Debug flow: createEmptySimulationModalState fired");
  return {
    open: false,
    integrationId: null,
    integrationLabel: "",
    method: "GET",
    url: "",
    status: "idle",
    logs: [],
    result: null,
  };
}

function stringifySimulationValue(value: unknown): string {
  console.log("Debug flow: stringifySimulationValue fired");
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function ProjectConfigPanel({
  project,
  open,
  onOpenChange,
  onSaveConfig,
  onRunSimulation,
  onPublishProject,
}: ProjectConfigPanelProps) {
  console.log("Debug flow: ProjectConfigPanel fired", { open, projectId: project?.id });
  const [loginRequired, setLoginRequired] = useState(false);
  const [loginEndpoint, setLoginEndpoint] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showLoginEndpoint, setShowLoginEndpoint] = useState(false);
  const [loginEndpointSaved, setLoginEndpointSaved] = useState(false);
  const [apiIntegrations, setApiIntegrations] = useState<ProjectApiIntegration[]>([]);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [selectedNavigationId, setSelectedNavigationId] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [testResults, setTestResults] = useState<ProjectConfigSimulationResult[]>([]);
  const [simulationModal, setSimulationModal] = useState<ProjectConfigSimulationModalState>(
    createEmptySimulationModalState
  );
  const [error, setError] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    console.log("Debug flow: ProjectConfigPanel project sync useEffect fired", { projectId: project?.id });
    if (!project) {
      return;
    }
    setLoginRequired(Boolean(project.loginRequired));
    setLoginEndpoint("");
    setLoginEndpointSaved(Boolean(project.hasLoginEndpoint));
    setSecretKey("");
    setShowSecretKey(false);
    setApiIntegrations(
      (project.apiIntegrations ?? []).map((integration) => ({
        ...integration,
        url: integration.url ?? "",
      }))
    );
    setShowLoginEndpoint(false);
    setTestResults([]);
    setSimulationModal(createEmptySimulationModalState());
    setError(null);
  }, [project]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    console.log("Debug flow: ProjectConfigPanel decrypt useEffect fired", {
      projectId: project?.id,
      hasSecretKey: Boolean(secretKey),
    });
    if (!project || !secretKey.trim()) {
      return;
    }
    let cancelled = false;
    const runDecrypt = async () => {
      const key = secretKey.trim();
      const decryptPayload = async (payload: string): Promise<string> => {
        const [ivHex, authTagHex, contentHex] = payload.split(":");
        if (!ivHex || !authTagHex || !contentHex) {
          throw new Error("Invalid encrypted payload");
        }
        const fromHex = (value: string): Uint8Array => {
          const bytes = new Uint8Array(value.length / 2);
          for (let idx = 0; idx < bytes.length; idx += 1) {
            bytes[idx] = Number.parseInt(value.substring(idx * 2, idx * 2 + 2), 16);
          }
          return bytes;
        };
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
        const cryptoKey = await crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["decrypt"]);
        const iv = fromHex(ivHex);
        const authTag = fromHex(authTagHex);
        const cipher = fromHex(contentHex);
        const merged = new Uint8Array(cipher.length + authTag.length);
        merged.set(cipher, 0);
        merged.set(authTag, cipher.length);
        const mergedBuffer = merged.buffer.slice(
          merged.byteOffset,
          merged.byteOffset + merged.byteLength
        ) as ArrayBuffer;
        const decrypted = await crypto.subtle.decrypt(
          { name: "AES-GCM", iv: iv as unknown as BufferSource },
          cryptoKey,
          mergedBuffer as unknown as BufferSource
        );
        return new TextDecoder().decode(decrypted);
      };
      try {
        const decryptedLoginEndpoint = project.encryptedLoginEndpoint
          ? await decryptPayload(project.encryptedLoginEndpoint)
          : "";
        const decryptedIntegrations = await Promise.all(
          (project.apiIntegrations ?? []).map(async (integration) => ({
            ...integration,
            url: integration.encryptedUrl ? await decryptPayload(integration.encryptedUrl) : (integration.url ?? ""),
          }))
        );
        if (cancelled) {
          return;
        }
        setLoginEndpoint(decryptedLoginEndpoint);
        setApiIntegrations(decryptedIntegrations);
      } catch (decryptError) {
        console.error("Debug flow: ProjectConfigPanel decrypt useEffect error", decryptError);
        if (cancelled) {
          return;
        }
        setError("Unable to decrypt saved endpoints. Check your secret key.");
      }
    };
    void runDecrypt();
    return () => {
      cancelled = true;
    };
  }, [project, secretKey]);

  useEffect(() => {
    console.log("Debug flow: ProjectConfigPanel nav load useEffect fired", { open, projectId: project?.id });
    if (!open || !project?.id) {
      return;
    }
    let cancelled = false;
    void getNavItems(project.id).then((result) => {
      if (cancelled) {
        return;
      }
      if (result.ok && result.items) {
        const items = result.items;
        setNavItems(items);
        if (items[0]?.id) {
          setSelectedNavigationId((current) => current || items[0].id);
        }
      } else {
        setNavItems([]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, project?.id]);

  const selectedNavigation = useMemo(
    () => navItems.find((item) => item.id === selectedNavigationId) ?? null,
    [navItems, selectedNavigationId]
  );

  const saveConfig = async (clearLoginEndpoint = false) => {
    console.log("Debug flow: ProjectConfigPanel saveConfig fired", { clearLoginEndpoint });
    if (!project?.id) {
      return;
    }
    setSaving(true);
    setError(null);
    const ok = await onSaveConfig(project.id, {
      loginRequired,
      loginEndpoint,
      secretKey,
      clearLoginEndpoint,
      apiIntegrations,
    });
    setSaving(false);
    if (!ok) {
      setError("Failed to save project config.");
      return;
    }
    if (clearLoginEndpoint) {
      setLoginEndpoint("");
      setLoginEndpointSaved(false);
      return;
    }
    if (loginEndpoint.trim()) {
      setLoginEndpointSaved(true);
    }
  };

  const addIntegration = () => {
    console.log("Debug flow: ProjectConfigPanel addIntegration fired", { selectedNavigationId });
    if (!selectedNavigation) {
      setError("Select a navigation before adding API integration.");
      toast.error("Select a navigation before adding API integration.");
      return;
    }
    toast.success(`Added API integration for ${selectedNavigation.label}.`);
    setApiIntegrations((current) => [
      ...current,
      {
        id: createIntegrationId(),
        navigationId: selectedNavigation.id,
        navigationLabel: selectedNavigation.label,
        method: "GET",
        url: "",
      },
    ]);
  };

  const updateIntegration = (id: string, patch: Partial<ProjectApiIntegration>) => {
    console.log("Debug flow: ProjectConfigPanel updateIntegration fired", { id });
    setApiIntegrations((current) =>
      current.map((integration) => (integration.id === id ? { ...integration, ...patch } : integration))
    );
  };

  const removeIntegration = (id: string) => {
    console.log("Debug flow: ProjectConfigPanel removeIntegration fired", { id });
    setApiIntegrations((current) => current.filter((integration) => integration.id !== id));
  };

  const runSimulation = async (targetIntegration?: ProjectApiIntegration) => {
    console.log("Debug flow: ProjectConfigPanel runSimulation fired", {
      targetIntegrationId: targetIntegration?.id,
    });
    if (!project?.id) {
      return;
    }
    setTesting(true);
    setError(null);
    const key = secretKey.trim();
    if (!key) {
      setTesting(false);
      setError("Secret key is required to run simulation.");
      toast.error("Secret key is required to run simulation.");
      return;
    }

    if (targetIntegration) {
      setSimulationModal({
        open: true,
        integrationId: targetIntegration.id,
        integrationLabel: targetIntegration.navigationLabel,
        method: targetIntegration.method,
        url: targetIntegration.url ?? "",
        status: "running",
        result: null,
        logs: [
          createSimulationLogEntry(
            "info",
            "Preparing endpoint simulation",
            `${targetIntegration.method} ${targetIntegration.url || "(empty url)"}`
          ),
          createSimulationLogEntry(
            "info",
            "Dispatching simulation request",
            "OpenDash is sending the selected endpoint through the existing project simulation flow."
          ),
        ],
      });
    }

    const results = await onRunSimulation(project.id, key);
    setTesting(false);
    setTestResults(results);

    if (!targetIntegration) {
      const passedCount = results.filter((result) => result.passed).length;
      toast.success(`Simulation finished. ${passedCount}/${results.length} endpoints passed.`);
      return;
    }

    const matchedResult =
      results.find((result) => result.integrationId === targetIntegration.id) ?? null;

    if (!matchedResult) {
      setSimulationModal((current) => ({
        ...current,
        status: "error",
        result: null,
        logs: [
          ...current.logs,
          createSimulationLogEntry(
            "error",
            "Simulation returned no result",
            "The selected endpoint did not produce a response entry."
          ),
        ],
      }));
      toast.error(`No simulation result was returned for ${targetIntegration.navigationLabel}.`);
      return;
    }

    const responseDetail = stringifySimulationValue(matchedResult.response);
    setSimulationModal((current) => ({
      ...current,
      status: matchedResult.passed ? "success" : "error",
      result: matchedResult,
      logs: [
        ...current.logs,
        createSimulationLogEntry(
          matchedResult.passed ? "success" : "error",
          `Received ${matchedResult.statusCode} from endpoint`,
          `${matchedResult.method} ${matchedResult.url}`
        ),
        createSimulationLogEntry(
          matchedResult.passed ? "success" : "error",
          matchedResult.passed ? "Simulation completed successfully" : "Simulation failed",
          responseDetail
        ),
      ],
    }));

    if (matchedResult.passed) {
      toast.success(`${targetIntegration.navigationLabel} responded successfully.`);
      return;
    }

    toast.error(`${targetIntegration.navigationLabel} simulation failed.`);
  };

  const publish = async () => {
    console.log("Debug flow: ProjectConfigPanel publish fired", { projectId: project?.id });
    if (!project) {
      return;
    }
    setPublishing(true);
    setError(null);
    const ok = await onPublishProject(project);
    setPublishing(false);
    if (!ok) {
      setError("Failed to publish this project. Save a builder draft first.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[500px] overflow-y-auto border-l border-white/10 bg-[#0b1120] p-[25px] text-slate-100 sm:max-w-[500px]"
        data-test-id="project-config-panel"
      >
        <SheetHeader>
          <SheetTitle className="text-white">Project Config</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="project-login-required" className="text-slate-200">
                Require Login
              </Label>
              <Switch
                id="project-login-required"
                checked={loginRequired}
                onCheckedChange={setLoginRequired}
                data-test-id="project-config-login-toggle"
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              If enabled, users must log in before viewing published dashboard preview.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-secret-key" className="text-slate-200">
              Secret Key
            </Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  id="project-secret-key"
                  type={showSecretKey ? "text" : "password"}
                  value={secretKey}
                  onChange={(event) => setSecretKey(event.target.value)}
                  placeholder="Enter your own secret key"
                  data-test-id="project-config-secret-key-input"
                  className="border-white/10 bg-white/5 pr-10 text-slate-100 placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey((value) => !value)}
                  data-test-id="project-config-secret-key-toggle-visibility"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showSecretKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              This key encrypts your endpoint values. It is encrypted before database storage.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-login-endpoint" className="text-slate-200">
              Login Endpoint URL
            </Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  id="project-login-endpoint"
                  type={showLoginEndpoint ? "text" : "password"}
                  value={loginEndpoint}
                  onChange={(event) => {
                    setLoginEndpoint(event.target.value);
                    setLoginEndpointSaved(false);
                  }}
                  placeholder="https://api.example.com/login"
                  data-test-id="project-config-login-endpoint-input"
                  className="border-white/10 bg-white/5 pr-10 text-slate-100 placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginEndpoint((value) => !value)}
                  data-test-id="project-config-login-endpoint-toggle-visibility"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showLoginEndpoint ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Button
                type="button"
                variant={loginEndpointSaved ? "outline" : "default"}
                onClick={() => {
                  if (loginEndpointSaved) {
                    void saveConfig(true);
                    return;
                  }
                  void saveConfig(false);
                }}
                disabled={saving || !secretKey.trim() || (!loginEndpointSaved && !loginEndpoint.trim())}
                data-test-id="project-config-login-endpoint-save-clear"
                className={
                  loginEndpointSaved
                    ? "min-w-20 border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                    : "min-w-20 bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                }
              >
                {saving ? "Saving..." : loginEndpointSaved ? "Clear" : "Save"}
              </Button>
            </div>
            <p className="text-xs text-slate-400">
              Published dashboard login uses this encrypted endpoint.
            </p>
          </div>

          <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">API URL Per Side Navigation</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addIntegration}
                data-test-id="project-config-add-integration"
                className="h-8 border-white/10 bg-white/5 px-2 text-slate-200 hover:bg-white/10 hover:text-white"
              >
                <Plus size={14} />
              </Button>
            </div>

            <Select value={selectedNavigationId} onValueChange={setSelectedNavigationId}>
              <SelectTrigger
                data-test-id="project-config-navigation-select"
                className="border-white/10 bg-[#111827] text-slate-200"
              >
                <SelectValue placeholder="Select navigation" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#0f172a] text-slate-100">
                {navItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {apiIntegrations.length === 0 ? (
              <p className="text-xs text-slate-400" data-test-id="project-config-empty-integrations">
                Empty. Click + to add new API integration.
              </p>
            ) : (
              <div className="space-y-3">
                {apiIntegrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="space-y-2 rounded-lg border border-white/10 bg-[#0f172a] p-3"
                    data-test-id={`project-config-integration-${integration.id}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge className="border-0 bg-indigo-500/20 text-indigo-200">
                        {integration.navigationLabel}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => void runSimulation(integration)}
                          disabled={testing || !integration.url?.trim()}
                          data-test-id={`project-config-test-integration-${integration.id}`}
                          className="h-7 w-7 text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200"
                        >
                          <Play size={14} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeIntegration(integration.id)}
                          data-test-id={`project-config-remove-integration-${integration.id}`}
                          className="h-7 w-7 text-red-300 hover:bg-red-500/10 hover:text-red-200"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-[96px_1fr] gap-2">
                      <Select
                        value={integration.method}
                        onValueChange={(value) =>
                          updateIntegration(integration.id, { method: value as ApiIntegrationMethod })
                        }
                      >
                        <SelectTrigger
                          data-test-id={`project-config-method-${integration.id}`}
                          className="border-white/10 bg-[#111827] text-slate-200"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-[#0f172a] text-slate-100">
                          {METHOD_OPTIONS.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={integration.url}
                        onChange={(event) => updateIntegration(integration.id, { url: event.target.value })}
                        placeholder="/endpoint or https://..."
                        data-test-id={`project-config-url-${integration.id}`}
                        className="border-white/10 bg-[#111827] text-slate-100 placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="button"
            onClick={() => void saveConfig(false)}
            disabled={saving || !secretKey.trim()}
            data-test-id="project-config-save-all"
            className="w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300"
          >
            {saving ? "Saving..." : "Save Config"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => void runSimulation()}
            disabled={testing}
            data-test-id="project-config-run-test"
            className="w-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white"
          >
            <FlaskConical size={14} className="mr-2" />
            {testing ? "Running simulation..." : "Test API Simulation"}
          </Button>

          {testResults.length > 0 && (
            <div className="space-y-3">
              {testResults.map((result) => (
                <div
                  key={result.integrationId}
                  className="rounded-lg border border-white/10 bg-[#0f172a] p-3"
                  data-test-id={`project-config-test-result-${result.integrationId}`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <Badge className={result.passed ? "border-0 bg-emerald-500/20 text-emerald-200" : "border-0 bg-red-500/20 text-red-200"}>
                      {result.passed ? "Passed" : "Failed"}
                    </Badge>
                    <span className="text-xs text-slate-400">{result.method} {result.statusCode}</span>
                  </div>
                  <p className="text-xs text-slate-300">{result.navigationLabel}</p>
                  <p className="mb-2 break-all text-[11px] text-slate-500">{result.url}</p>
                  <pre className="max-h-36 overflow-auto rounded bg-black/30 p-2 text-[11px] text-slate-200">
                    {JSON.stringify(result.response, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}

          <Button
            type="button"
            onClick={() => void publish()}
            disabled={publishing || project?.published}
            data-test-id="project-config-publish"
            className="w-full bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-60"
          >
            {publishing ? "Publishing..." : project?.published ? "Published" : "Publish"}
          </Button>

          {error && (
            <p className="text-xs text-red-300" data-test-id="project-config-error">
              {error}
            </p>
          )}
        </div>
      </SheetContent>

      <Dialog
        open={simulationModal.open}
        onOpenChange={(nextOpen) =>
          setSimulationModal((current) => ({
            ...current,
            open: nextOpen,
          }))
        }
      >
        <DialogContent
          className="border-white/10 bg-[#08111f] text-slate-100 sm:max-w-2xl"
          data-test-id="project-config-simulation-modal"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-100">
              <TerminalSquare size={16} />
              API Test Console
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {simulationModal.integrationLabel
                ? `${simulationModal.integrationLabel} • ${simulationModal.method} ${simulationModal.url || "(empty url)"}`
                : "Run an endpoint test to inspect the request flow."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</p>
                <p className="mt-1 text-sm text-slate-200">
                  {simulationModal.status === "running" && "Running"}
                  {simulationModal.status === "success" && "Success"}
                  {simulationModal.status === "error" && "Failed"}
                  {simulationModal.status === "idle" && "Idle"}
                </p>
              </div>
              {simulationModal.status === "success" ? (
                <CheckCircle2 className="text-emerald-300" size={18} />
              ) : simulationModal.status === "error" ? (
                <XCircle className="text-red-300" size={18} />
              ) : (
                <FlaskConical className="text-cyan-300" size={18} />
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-[#050b16] p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Request Log
                </p>
                <span className="text-[11px] text-slate-500">
                  {simulationModal.logs.length} event
                  {simulationModal.logs.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="max-h-[320px] space-y-3 overflow-auto font-mono text-[11px]">
                {simulationModal.logs.length === 0 ? (
                  <p className="text-slate-500">No logs yet.</p>
                ) : (
                  simulationModal.logs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-lg border border-white/5 bg-white/[0.03] p-3"
                      data-test-id={`project-config-simulation-log-${log.id}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={
                            log.level === "success"
                              ? "text-emerald-300"
                              : log.level === "error"
                                ? "text-red-300"
                                : "text-cyan-300"
                          }
                        >
                          [{log.level.toUpperCase()}]
                        </span>
                        <span className="text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mt-2 text-slate-100">{log.message}</p>
                      {log.detail && (
                        <pre className="mt-2 overflow-auto whitespace-pre-wrap break-all text-slate-400">
                          {log.detail}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {simulationModal.result && (
              <div
                className="rounded-xl border border-white/10 bg-[#050b16] p-3"
                data-test-id="project-config-simulation-response"
              >
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                  Response Payload
                </p>
                <pre className="max-h-52 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-black/30 p-3 font-mono text-[11px] text-slate-200">
                  {stringifySimulationValue(simulationModal.result.response)}
                </pre>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSimulationModal((current) => ({ ...current, open: false }))}
                data-test-id="project-config-simulation-close"
                className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
