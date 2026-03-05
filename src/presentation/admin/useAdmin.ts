import { create } from "zustand";
import type {
  DashboardStore,
  SidebarItemData,
  PageComponentData,
  HeaderComponentData,
  ChatMessageData,
  LogoConfig,
  HeaderConfig,
  AIAction,
} from "@/domain/admin/types";
import {
  fetchSidebarApi,
  fetchPageApi,
  fetchConfigApi,
  fetchHeaderComponentsApi,
  sendAiMessageApi,
} from "@/lib/admin-api";
import { createDebugFlow } from "@/domain/trace/types";

export const useAdminStore = create<DashboardStore>((set, get) => ({
  projectId: null,
  sidebarItems: [],
  activePage: null,
  pageComponents: [],
  headerComponents: [],
  logo: null,
  header: null,
  htmlContent: null,
  isChatOpen: false,
  chatMessages: [],
  isAiThinking: false,
  isSidebarCollapsed: false,
  devMode: false,
  showNotificationView: false,
  activeProfileView: null,
  activeView: null,
  headerHistory: [],

  setProjectId: (id: string) => set({ projectId: id }),
  setActivePage: (slug: string) => set({ activePage: slug }),
  setSidebarItems: (items: SidebarItemData[]) => set({ sidebarItems: items }),
  setPageComponents: (components: PageComponentData[]) =>
    set({ pageComponents: components }),
  setHeaderComponents: (components: HeaderComponentData[]) =>
    set({ headerComponents: components }),
  setLogo: (logo: LogoConfig) => set({ logo }),
  setHeader: (header: HeaderConfig) => set({ header }),
  toggleChat: () => set((s) => ({ isChatOpen: !s.isChatOpen })),
  toggleSidebar: () =>
    set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
  hydrateDevMode: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('open-dash-dev-mode');
      if (stored === 'true') set({ devMode: true });
    }
  },
  toggleDevMode: () => {
    const newValue = !get().devMode;
    set({ devMode: newValue });
    if (typeof window !== 'undefined') {
      localStorage.setItem('open-dash-dev-mode', String(newValue));
    }
  },
  toggleNotificationView: () =>
    set((s) => ({ showNotificationView: !s.showNotificationView })),
  setActiveProfileView: (viewType: string | null) =>
    set({ activeProfileView: viewType }),
  setActiveView: (viewType: string | null) =>
    set({ activeView: viewType }),
  pushHeaderHistory: () => {
    const current = get().headerComponents;
    set((s) => ({
      headerHistory: [...s.headerHistory.slice(-19), JSON.parse(JSON.stringify(current))],
    }));
  },
  revertHeaderChange: () => {
    const history = get().headerHistory;
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    set({
      headerComponents: previous,
      headerHistory: history.slice(0, -1),
    });
  },
  addChatMessage: (msg: ChatMessageData) =>
    set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  setAiThinking: (v: boolean) => set({ isAiThinking: v }),

  loadSidebar: async () => {
    try {
      const pid = get().projectId;
      if (!pid) return;
      const items = await fetchSidebarApi(pid);
      set({ sidebarItems: items });

      if (!get().activePage && items.length > 0) {
        const first = items[0];
        set({ activePage: first.slug });
        get().loadPage(first.slug);
      }
    } catch (err) {
      console.error("Failed to load sidebar:", err);
    }
  },

  loadPage: async (slug: string) => {
    try {
      const pid = get().projectId;
      if (!pid) return;
      set({ activePage: slug });
      const components = await fetchPageApi(slug, pid);
      set({ pageComponents: components });
    } catch (err) {
      console.error("Failed to load page:", err);
    }
  },

  loadConfig: async (key: string) => {
    console.log(`Debug flow: loadConfig fired with`, { key, projectId: get().projectId });
    
    try {
      const pid = get().projectId;
      if (!pid) return;
      const value = await fetchConfigApi(key, pid);
      
      console.log(`Debug flow: loadConfig API response`, { key, hasValue: !!value });
      
      // Explicitly clear state when value is null (data was deleted)
      if (!value) {
        if (key === "logo") set({ logo: undefined });
        if (key === "header") set({ header: undefined });
        if (key === "page_html_content") set({ htmlContent: undefined });
        return;
      }
      
      if (key === "logo") set({ logo: value as LogoConfig });
      if (key === "header") set({ header: value as HeaderConfig });
      if (key === "page_html_content") set({ htmlContent: value as string });
      if (key === "primaryColor") {
        // Apply primary color to CSS variable
        const color = (value as { color: string }).color;
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--primary', color);
        }
      }
      
      console.log(`Debug flow: loadConfig state updated`, { key, valueType: typeof value });
    } catch (err) {
      console.error("Failed to load config:", err);
    }
  },

  loadHeaderComponents: async () => {
    try {
      const pid = get().projectId;
      if (!pid) return;
      const components = await fetchHeaderComponentsApi(pid);
      set({ headerComponents: components });
    } catch (err) {
      console.error("Failed to load header components:", err);
    }
  },

  sendAiMessage: async (message: string) => {
    const store = get();
    
    // Create debug flow context with projectId
    const debugFlow = createDebugFlow({
      projectId: store.projectId || undefined,
    });

    console.log("Debug flow", {
      flowId: debugFlow.flowId,
      step: "user_input_received",
      timestamp: new Date().toISOString(),
      data: {
        message: message.substring(0, 100) + (message.length > 100 ? "..." : ""),
        messageLength: message.length,
        projectId: debugFlow.projectId,
        activePage: store.activePage,
        currentComponentsCount: store.pageComponents.length,
      },
      projectId: debugFlow.projectId,
    });

    const userMsg: ChatMessageData = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };
    
    console.log("Debug flow", {
      flowId: debugFlow.flowId,
      step: "user_message_created",
      timestamp: new Date().toISOString(),
      data: {
        messageId: userMsg.id,
        role: userMsg.role,
        contentLength: userMsg.content.length,
      },
      projectId: debugFlow.projectId,
    });

    // Add user message to UI
    set((s) => ({
      chatMessages: [...s.chatMessages, userMsg],
      isAiThinking: true,
    }));

    console.log("Debug flow", {
      flowId: debugFlow.flowId,
      step: "user_message_added_to_ui",
      timestamp: new Date().toISOString(),
      data: {
        isAiThinking: true,
        totalMessages: store.chatMessages.length + 1,
      },
      projectId: debugFlow.projectId,
    });

    try {
      console.log("Debug flow", {
        flowId: debugFlow.flowId,
        step: "api_call_initiated",
        timestamp: new Date().toISOString(),
        data: {
          endpoint: "/api/ai/chat",
          payloadSize: JSON.stringify({
            message,
            projectId: store.projectId,
            state: {
              sidebarItems: store.sidebarItems.length,
              activePage: store.activePage,
              pageComponents: store.pageComponents.length,
              headerComponents: store.headerComponents.length,
            },
            history: store.chatMessages.slice(-20).map((m) => ({
              role: m.role,
              contentLength: m.content.length,
            })),
          }).length,
        },
        projectId: debugFlow.projectId,
      });

      const data = await sendAiMessageApi({
        message,
        projectId: store.projectId!,
        state: {
          sidebarItems: store.sidebarItems,
          activePage: store.activePage,
          pageComponents: store.pageComponents,
          headerComponents: store.headerComponents,
        },
        history: store.chatMessages.slice(-20).map((m) => ({
          role: m.role,
          content: m.actions && m.actions.length > 0
            ? `${m.content}\n[ACTIONS EXECUTED: ${m.actions.map((a) => `${a.type}(${JSON.stringify(a.payload)})`).join(", ")}]`
            : m.content,
        })),
      });

      console.log("Debug flow", {
        flowId: debugFlow.flowId,
        step: "api_response_received",
        timestamp: new Date().toISOString(),
        data: {
          responseMessage: data.message?.substring(0, 100) + (data.message?.length > 100 ? "..." : ""),
          actionsCount: data.actions?.length || 0,
          actions: data.actions?.map((a: AIAction) => ({ type: a.type, payloadKeys: Object.keys(a.payload || {}) })),
        },
        projectId: debugFlow.projectId,
      });

      const assistantMsg: ChatMessageData = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message || "Done.",
        actions: data.actions,
        createdAt: new Date().toISOString(),
      };

      console.log("Debug flow", {
        flowId: debugFlow.flowId,
        step: "assistant_message_created",
        timestamp: new Date().toISOString(),
        data: {
          messageId: assistantMsg.id,
          contentLength: assistantMsg.content.length,
          hasActions: !!(assistantMsg.actions && assistantMsg.actions.length > 0),
        },
        projectId: debugFlow.projectId,
      });

      // NOW update UI state with assistant message
      set((s) => ({
        chatMessages: [...s.chatMessages, assistantMsg],
      }));

      console.log("Debug flow", {
        flowId: debugFlow.flowId,
        step: "ui_state_updated",
        timestamp: new Date().toISOString(),
        data: {
          assistantMessageAdded: true,
          totalMessages: store.chatMessages.length + 2,
        },
        projectId: debugFlow.projectId,
      });

      console.log("Debug flow", {
        flowId: debugFlow.flowId,
        step: "data_refresh_started",
        timestamp: new Date().toISOString(),
        data: {
          refreshOperations: [
            "loadSidebar",
            "loadHeaderComponents", 
            "loadPage",
            "loadConfig(logo)",
            "loadConfig(header)",
            "loadConfig(primaryColor)",
            "loadConfig(page_html_content)"
          ],
        },
        projectId: debugFlow.projectId,
      });

      await store.loadSidebar();
      store.pushHeaderHistory();
      await store.loadHeaderComponents();
      const currentActivePage = get().activePage;
      if (currentActivePage) {
        await store.loadPage(currentActivePage);
      }
      await store.loadConfig("logo");
      await store.loadConfig("header");
      await store.loadConfig("primaryColor");
      await store.loadConfig("page_html_content");

      console.log("Debug flow", {
        flowId: debugFlow.flowId,
        step: "data_refresh_completed",
        timestamp: new Date().toISOString(),
        data: {
          finalSidebarItems: get().sidebarItems.length,
          finalHeaderComponents: get().headerComponents.length,
          finalPageComponents: get().pageComponents.length,
        },
        projectId: debugFlow.projectId,
      });

      set({ isAiThinking: false });

      console.log("Debug flow", {
        flowId: debugFlow.flowId,
        step: "flow_completed_successfully",
        timestamp: new Date().toISOString(),
        data: {
          duration: new Date().toISOString(),
          finalState: {
            isAiThinking: false,
            totalMessages: store.chatMessages.length + 2,
          },
        },
        projectId: debugFlow.projectId,
      });

    } catch (err) {
      console.log("Debug flow", {
        flowId: debugFlow.flowId,
        step: "flow_error_occurred",
        timestamp: new Date().toISOString(),
        level: "error",
        data: {
          error: err instanceof Error ? {
            message: err.message,
            stack: err.stack,
            name: err.name,
          } : err,
          errorType: typeof err,
        },
        projectId: debugFlow.projectId,
      });

      console.error("AI chat error:", err);
      const errMsg: ChatMessageData = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Something went wrong. Please try again.",
        createdAt: new Date().toISOString(),
      };
      
      console.log("Debug flow", {
        flowId: debugFlow.flowId,
        step: "error_message_created",
        timestamp: new Date().toISOString(),
        data: {
          errorMessageId: errMsg.id,
          errorMessage: errMsg.content,
        },
        projectId: debugFlow.projectId,
      });

      set((s) => ({
        chatMessages: [...s.chatMessages, errMsg],
        isAiThinking: false,
      }));

      console.log("Debug flow", {
        flowId: debugFlow.flowId,
        step: "flow_completed_with_error",
        timestamp: new Date().toISOString(),
        level: "error",
        data: {
          finalState: {
            isAiThinking: false,
            totalMessages: store.chatMessages.length + 2,
            hasError: true,
          },
        },
        projectId: debugFlow.projectId,
      });
    }
  },
}));
