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

  fetchSidebar: async () => {
    try {
      const items = await fetchSidebarApi();
      set({ sidebarItems: items });

      if (!get().activePage && items.length > 0) {
        const first = items[0];
        set({ activePage: first.slug });
        get().fetchPage(first.slug);
      }
    } catch (err) {
      console.error("Failed to fetch sidebar:", err);
    }
  },

  fetchPage: async (slug: string) => {
    try {
      set({ activePage: slug });
      const components = await fetchPageApi(slug);
      set({ pageComponents: components });
    } catch (err) {
      console.error("Failed to fetch page:", err);
    }
  },

  fetchConfig: async (key: string) => {
    try {
      const value = await fetchConfigApi(key);
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
      console.error("Failed to fetch config:", err);
    }
  },

  fetchHeaderComponents: async () => {
    try {
      const components = await fetchHeaderComponentsApi();
      set({ headerComponents: components });
    } catch (err) {
      console.error("Failed to fetch header components:", err);
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

      await store.fetchSidebar();
      store.pushHeaderHistory();
      await store.fetchHeaderComponents();
      if (store.activePage) {
        await store.fetchPage(store.activePage);
      }
      await store.fetchConfig("logo");
      await store.fetchConfig("header");
      await store.fetchConfig("primaryColor");

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
