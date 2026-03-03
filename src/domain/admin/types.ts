// ─── Sidebar ───────────────────────────────────────────────
export interface SidebarItemData {
  id: string;
  label: string;
  icon: string;
  slug: string;
  order: number;
  parentId: string | null;
  children?: SidebarItemData[];
}

// ─── Page & Components ─────────────────────────────────────
export interface PageComponentData {
  id: string;
  pageId: string;
  parentId?: string | null;
  type: string;
  config: Record<string, unknown>;
  order: number;
  children?: PageComponentData[];
}

export interface PageData {
  id: string;
  sidebarItemId: string;
  components: PageComponentData[];
}

// ─── Component Config Schemas ──────────────────────────────
export interface TextConfig {
  content: string;
  variant?: "heading" | "paragraph" | "code";
}

export interface TableStatusOption {
  value: string;
  label: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export interface TableActionItem {
  id: string;
  label: string;
  icon?: string;
  variant?: "default" | "destructive";
}

export interface TableColumnConfig {
  accessorKey: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  columnType?: "text" | "status" | "actions";
  statusOptions?: TableStatusOption[];
  actions?: TableActionItem[];
}

export interface TableConfig {
  title?: string;
  columns: TableColumnConfig[];
  data: Record<string, unknown>[];
  pagination?: { enabled: boolean; pageSize: number };
  searchable?: boolean;
}

export interface AnalyticsCardConfig {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: string;
  description?: string;
}

export interface AnalyticsCardsConfig {
  columns?: number;
  cards: AnalyticsCardConfig[];
}

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface ChartBarEntry {
  dataKey: string;
  label: string;
  color: string;
}

export interface BarChartConfig {
  title?: string;
  xKey: string;
  bars: ChartBarEntry[];
  data: ChartDataPoint[];
}

export interface LineChartConfig {
  title?: string;
  xKey: string;
  lines: { dataKey: string; label: string; color: string }[];
  data: ChartDataPoint[];
}

export interface ContainerConfig {
  display?: "flex" | "grid";
  direction?: "row" | "column";
  gap?: number;
  wrap?: boolean;
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  columns?: number;
  className?: string;
}

export interface EditableInputConfig {
  label?: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  fieldKey: string;
}

export interface FilterMenuConfig {
  label?: string;
  filters: { id: string; label: string; checked: boolean }[];
  icon?: string;
}

// ─── UI Primitive Configs ──────────────────────────────────
export interface ButtonConfig {
  label: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  icon?: string;
  iconPosition?: "left" | "right";
  onAction?: "alert" | "link" | "custom" | "fetch";
  alertMessage?: string;
  href?: string;
  customId?: string;
  fetchUrl?: string;
  fetchMethod?: "GET" | "POST" | "PUT" | "DELETE";
  collectInputIds?: string[];
  className?: string;
}

export interface InputConfig {
  type?: "text" | "email" | "number" | "tel" | "url" | "search" | "date" | "time";
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  label?: string;
}

export interface BadgeConfig {
  text: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

export interface CardConfig {
  title?: string;
  description?: string;
  content?: string;
  footer?: string;
  className?: string;
}

export interface SeparatorConfig {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export interface LabelConfig {
  text: string;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}

export interface TextareaConfig {
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
  label?: string;
}

export interface CheckboxConfig {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface SwitchConfig {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface TooltipConfig {
  content: string;
  children: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export interface AvatarConfig {
  src?: string;
  alt?: string;
  fallback: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export interface AccordionConfig {
  type?: "single" | "multiple";
  items: { value: string; trigger: string; content: string }[];
  collapsible?: boolean;
  defaultValue?: string | string[];
  className?: string;
}

export interface AlertConfig {
  title?: string;
  description: string;
  variant?: "default" | "destructive";
  icon?: string;
  className?: string;
}

export interface AlertDialogConfig {
  title: string;
  description: string;
  cancelText?: string;
  actionText: string;
  actionVariant?: "default" | "destructive";
  triggerText?: string;
  className?: string;
}

export interface AspectRatioConfig {
  ratio: number;
  children?: string;
  className?: string;
}

export interface BreadcrumbConfig {
  items: { label: string; href?: string }[];
  separator?: string;
  className?: string;
}

export interface CalendarConfig {
  mode?: "single" | "multiple" | "range";
  selected?: string | string[];
  disabled?: boolean;
  className?: string;
}

export interface CarouselConfig {
  items: { content: string; image?: string }[];
  autoplay?: boolean;
  interval?: number;
  className?: string;
}

export interface ChartConfig {
  type: "bar" | "line" | "pie" | "area";
  data: Record<string, unknown>[];
  xKey?: string;
  yKey?: string;
  className?: string;
}

export interface CollapsibleConfig {
  title: string;
  content: string;
  defaultOpen?: boolean;
  className?: string;
}

export interface ComboboxConfig {
  items: { value: string; label: string }[];
  placeholder?: string;
  emptyText?: string;
  searchPlaceholder?: string;
  className?: string;
}

export interface CommandConfig {
  items: { value: string; label: string; icon?: string }[];
  placeholder?: string;
  emptyText?: string;
  className?: string;
}

export interface ContextMenuConfig {
  items: { label: string; icon?: string; shortcut?: string; separator?: boolean }[];
  triggerText: string;
  className?: string;
}

export interface DataTableConfig {
  columns: { key: string; header: string; sortable?: boolean }[];
  data: Record<string, unknown>[];
  pagination?: boolean;
  search?: boolean;
  className?: string;
}

export interface DatePickerConfig {
  mode?: "single" | "range";
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export interface DialogConfig {
  title: string;
  description?: string;
  content: string;
  footer?: string;
  triggerText?: string;
  className?: string;
}

export interface DrawerConfig {
  title: string;
  description?: string;
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  triggerText?: string;
  className?: string;
}

export interface DropdownMenuConfig {
  items: { label: string; icon?: string; shortcut?: string; separator?: boolean }[];
  triggerText: string;
  triggerVariant?: "default" | "outline" | "ghost";
  className?: string;
}

export interface HoverCardConfig {
  trigger: string;
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export interface InputGroupConfig {
  inputs: { type?: string; placeholder?: string; value?: string }[];
  label?: string;
  className?: string;
}

export interface InputOTPConfig {
  length: number;
  value?: string;
  disabled?: boolean;
  className?: string;
}

export interface KbdConfig {
  keys: string[];
  className?: string;
}

export interface MenubarConfig {
  menus: { label: string; items: { label: string; shortcut?: string }[] }[];
  className?: string;
}

export interface NavigationMenuConfig {
  items: { label: string; href?: string; children?: { label: string; href: string; description?: string }[] }[];
  className?: string;
}

export interface PaginationConfig {
  total: number;
  pageSize?: number;
  currentPage?: number;
  showFirstLast?: boolean;
  className?: string;
}

export interface PopoverConfig {
  trigger: string;
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
}

export interface ProgressConfig {
  value: number;
  max?: number;
  showLabel?: boolean;
  className?: string;
}

export interface RadioGroupConfig {
  items: { value: string; label: string }[];
  defaultValue?: string;
  disabled?: boolean;
  className?: string;
}

export interface ResizableConfig {
  panels: { defaultSize?: number; minSize?: number; content: string }[];
  direction?: "horizontal" | "vertical";
  className?: string;
}

export interface ScrollAreaConfig {
  content: string;
  height?: string;
  className?: string;
}

export interface SelectConfig {
  items: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
  className?: string;
}

export interface SheetConfig {
  title: string;
  description?: string;
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  triggerText?: string;
  className?: string;
}

export interface SidebarConfig {
  items: { label: string; icon?: string; href?: string; children?: { label: string; href: string }[] }[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

export interface SkeletonConfig {
  variant?: "text" | "circular" | "rectangular";
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

export interface SliderConfig {
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number | number[];
  disabled?: boolean;
  className?: string;
}

export interface SonnerConfig {
  message: string;
  description?: string;
  type?: "default" | "success" | "error" | "warning" | "info";
  action?: { label: string; onClick?: string };
  className?: string;
}

export interface SpinnerConfig {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export interface TablePrimitiveConfig {
  headers: string[];
  rows: string[][];
  caption?: string;
  className?: string;
}

export interface TabsConfig {
  tabs: { value: string; label: string; content: string }[];
  defaultValue?: string;
  className?: string;
}

export interface ToastConfig {
  title?: string;
  description: string;
  variant?: "default" | "destructive";
  action?: { label: string; onClick?: string };
  className?: string;
}

export interface ToggleConfig {
  pressed?: boolean;
  disabled?: boolean;
  icon?: string;
  label?: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export interface ToggleGroupConfig {
  type?: "single" | "multiple";
  items: { value: string; label?: string; icon?: string }[];
  defaultValue?: string | string[];
  disabled?: boolean;
  className?: string;
}

export interface TypographyConfig {
  variant: "h1" | "h2" | "h3" | "h4" | "p" | "blockquote" | "code" | "lead" | "large" | "small" | "muted";
  text: string;
  className?: string;
}

// ─── HTML Element Configs ──────────────────────────────────
export interface DivConfig {
  children?: string;
  html?: string;
  className?: string;
  style?: Record<string, string>;
}

export interface ParagraphConfig {
  text?: string;
  html?: string;
  className?: string;
}

export interface HeadingConfig {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text?: string;
  html?: string;
  className?: string;
}

export interface SpanConfig {
  text: string;
  className?: string;
}

export interface SectionConfig {
  children?: string;
  html?: string;
  className?: string;
}

export interface HeaderElementConfig {
  children?: string;
  className?: string;
}

export interface FooterConfig {
  children?: string;
  className?: string;
}

export interface ArticleConfig {
  children?: string;
  className?: string;
}

export interface NavConfig {
  children?: string;
  className?: string;
}

export interface ListConfig {
  items: string[];
  ordered?: boolean;
  className?: string;
}

export interface ImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export type ComponentConfig =
  | TextConfig
  | TableConfig
  | AnalyticsCardsConfig
  | BarChartConfig
  | LineChartConfig
  | EditableInputConfig
  | FilterMenuConfig
  | ButtonConfig
  | InputConfig
  | BadgeConfig
  | CardConfig
  | SeparatorConfig
  | LabelConfig
  | TextareaConfig
  | CheckboxConfig
  | SwitchConfig
  | TooltipConfig
  | AvatarConfig
  | AccordionConfig
  | AlertConfig
  | AlertDialogConfig
  | AspectRatioConfig
  | BreadcrumbConfig
  | CalendarConfig
  | CarouselConfig
  | ChartConfig
  | CollapsibleConfig
  | ComboboxConfig
  | CommandConfig
  | ContextMenuConfig
  | DataTableConfig
  | DatePickerConfig
  | DialogConfig
  | DrawerConfig
  | DropdownMenuConfig
  | HoverCardConfig
  | InputGroupConfig
  | InputOTPConfig
  | KbdConfig
  | MenubarConfig
  | NavigationMenuConfig
  | PaginationConfig
  | PopoverConfig
  | ProgressConfig
  | RadioGroupConfig
  | ResizableConfig
  | ScrollAreaConfig
  | SelectConfig
  | SheetConfig
  | SidebarConfig
  | SkeletonConfig
  | SliderConfig
  | SonnerConfig
  | SpinnerConfig
  | TablePrimitiveConfig
  | TabsConfig
  | ToastConfig
  | ToggleConfig
  | ToggleGroupConfig
  | TypographyConfig
  | DivConfig
  | ParagraphConfig
  | HeadingConfig
  | SpanConfig
  | SectionConfig
  | HeaderElementConfig
  | FooterConfig
  | ArticleConfig
  | NavConfig
  | ListConfig
  | ImageConfig;

// ─── Header Components ─────────────────────────────────────
export type HeaderComponentType = string;

export interface HeaderComponentData {
  id: string;
  type: HeaderComponentType;
  position: number;
  config: Record<string, unknown>;
}

export interface GenericHeaderMenuItem {
  id: string;
  label: string;
  action: "view" | "alert" | "logout" | "link" | "custom";
  viewType?: string;
  alertMessage?: string;
  href?: string;
  tooltipId?: string;
}

export interface GenericHeaderConfig {
  icon?: string;
  label?: string;
  showLabel?: boolean;
  badge?: number;
  hasDropdown?: boolean;
  menuItems?: GenericHeaderMenuItem[];
  className?: string;
  dropdownClassName?: string;
}

export interface SearchConfig {
  placeholder?: string;
  width?: string;
  showIcon?: boolean;
  iconPosition?: "left" | "right";
  align?: "start" | "end";
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
}

export interface NotificationConfig {
  count?: number;
  items?: { id: string; title: string; description: string; time: string; read: boolean }[];
  showViewAll?: boolean;
  className?: string;
  dropdownClassName?: string;
  itemClassName?: string;
}

export interface ProfileMenuItem {
  id: string;
  label: string;
  type: "builtin" | "custom";
  viewType?: string;
  action?: "logout" | "view";
}

export interface ProfileConfig {
  name?: string;
  avatar?: string;
  role?: string;
  showDropdown?: boolean;
  menuItems?: ProfileMenuItem[];
  className?: string;
  dropdownClassName?: string;
  avatarClassName?: string;
}

export interface MessageConfig {
  count?: number;
  items?: { id: string; from: string; text: string; time: string; avatar?: string; read: boolean }[];
  showViewAll?: boolean;
  className?: string;
  dropdownClassName?: string;
  itemClassName?: string;
}

// ─── App Config ────────────────────────────────────────────
export interface LogoConfig {
  text?: string;
  icon?: string;
  imageUrl?: string;
}

export interface HeaderConfig {
  title: string;
  subtitle?: string;
}

export interface ThemeConfig {
  primaryColor?: string;
  accentColor?: string;
  mode?: "dark" | "light";
}

export type AppConfigValue = LogoConfig | HeaderConfig | ThemeConfig;

// ─── AI Chat ───────────────────────────────────────────────
export interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: AIAction[];
  createdAt: string;
}

export interface AIAction {
  type:
    | "create_sidebar_item"
    | "update_sidebar_item"
    | "delete_sidebar_item"
    | "set_page_components"
    | "add_page_component"
    | "update_page_component"
    | "delete_page_component"
    | "update_config"
    | "add_header_component"
    | "update_header_component"
    | "remove_header_component"
    | "reorder_header_components"
    | "set_primary_color"
    | "inject_styles"
    | "move_page_component"
    | "reorder_page_components"
    | "add_child_component";
  payload: Record<string, unknown>;
}

export interface AIResponse {
  actions: AIAction[];
  message: string;
}

export interface AIExecutionResult {
  action: string;
  success: boolean;
  id?: string;
  error?: string;
}

// ─── Store ─────────────────────────────────────────────────
export interface DashboardStore {
  projectId: string | null;
  sidebarItems: SidebarItemData[];
  activePage: string | null;
  pageComponents: PageComponentData[];
  headerComponents: HeaderComponentData[];
  logo: LogoConfig | null;
  header: HeaderConfig | null;
  isChatOpen: boolean;
  chatMessages: ChatMessageData[];
  isAiThinking: boolean;
  isSidebarCollapsed: boolean;
  devMode: boolean;
  showNotificationView: boolean;
  activeProfileView: string | null;
  activeView: string | null;
  headerHistory: HeaderComponentData[][];

  setProjectId: (id: string) => void;
  setActivePage: (slug: string) => void;
  setSidebarItems: (items: SidebarItemData[]) => void;
  setPageComponents: (components: PageComponentData[]) => void;
  setHeaderComponents: (components: HeaderComponentData[]) => void;
  setLogo: (logo: LogoConfig) => void;
  setHeader: (header: HeaderConfig) => void;
  toggleChat: () => void;
  toggleSidebar: () => void;
  hydrateDevMode: () => void;
  toggleDevMode: () => void;
  toggleNotificationView: () => void;
  setActiveProfileView: (viewType: string | null) => void;
  setActiveView: (viewType: string | null) => void;
  pushHeaderHistory: () => void;
  revertHeaderChange: () => void;
  addChatMessage: (msg: ChatMessageData) => void;
  setAiThinking: (v: boolean) => void;

  loadSidebar: () => Promise<void>;
  loadPage: (slug: string) => Promise<void>;
  loadConfig: (key: string) => Promise<void>;
  loadHeaderComponents: () => Promise<void>;
  sendAiMessage: (message: string, retryAttempt?: number) => Promise<void>;
}
