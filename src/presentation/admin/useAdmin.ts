import { create } from "zustand";
import type {
  DashboardStore,
  SidebarItemData,
  PageComponentData,
  HeaderComponentData,
  ChatMessageData,
  LogoConfig,
  HeaderConfig,
} from "@/domain/admin/types";
import {
  fetchSidebarApi,
  fetchPageApi,
  fetchConfigApi,
  fetchHeaderComponentsApi,
  sendAiMessageApi,
} from "@/lib/admin-api";

export const useAdminStore = create<DashboardStore>((set, get) => ({
  projectId: null,
  sidebarItems: [],
  activePage: null,
  pageComponents: [],
  headerComponents: [],
  logo: null,
  header: null,
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
    try {
      const pid = get().projectId;
      if (!pid) return;
      const value = await fetchConfigApi(key, pid);
      if (!value) return;
      if (key === "logo") set({ logo: value as LogoConfig });
      if (key === "header") set({ header: value as HeaderConfig });
      if (key === "primaryColor") {
        // Apply primary color to CSS variable
        const color = (value as { color: string }).color;
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--primary', color);
        }
      }
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

    const userMsg: ChatMessageData = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({
      chatMessages: [...s.chatMessages, userMsg],
      isAiThinking: true,
    }));

    try {
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

      const assistantMsg: ChatMessageData = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message || "Done.",
        actions: data.actions,
        createdAt: new Date().toISOString(),
      };
      set((s) => ({
        chatMessages: [...s.chatMessages, assistantMsg],
      }));

      await store.loadSidebar();
      store.pushHeaderHistory();
      await store.loadHeaderComponents();
      if (store.activePage) {
        await store.loadPage(store.activePage);
      }
      await store.loadConfig("logo");
      await store.loadConfig("header");
      await store.loadConfig("primaryColor");

      set({ isAiThinking: false });
    } catch (err) {
      console.error("AI chat error:", err);
      const errMsg: ChatMessageData = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Something went wrong. Please try again.",
        createdAt: new Date().toISOString(),
      };
      set((s) => ({
        chatMessages: [...s.chatMessages, errMsg],
        isAiThinking: false,
      }));
    }
  },
}));
