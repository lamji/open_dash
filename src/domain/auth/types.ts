// ─── Login ──────────────────────────────────────────────────
export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// ─── Signup ─────────────────────────────────────────────────
export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignupFormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

// ─── Auth API ───────────────────────────────────────────────
export interface AuthResponse {
  ok: boolean;
  error?: string;
  user?: UserData;
  redirectUrl?: string;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// ─── Session ────────────────────────────────────────────────
export interface SessionData {
  id: string;
  token: string;
  userId: string;
  expiresAt: string;
}

export interface ValidatedSession {
  user: UserData;
  session: SessionData;
}

// ─── Project ────────────────────────────────────────────────
export interface ProjectData {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Login Hook State ───────────────────────────────────────
export interface LoginState {
  form: LoginFormData;
  errors: LoginFormErrors;
  isSubmitting: boolean;
  setField: (field: keyof LoginFormData, value: string) => void;
  handleSubmit: () => Promise<void>;
}

// ─── Signup Hook State ──────────────────────────────────────
export interface SignupState {
  form: SignupFormData;
  errors: SignupFormErrors;
  isSubmitting: boolean;
  setField: (field: keyof SignupFormData, value: string) => void;
  handleSubmit: () => Promise<void>;
}

// ─── Landing Page ───────────────────────────────────────────
export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface StepItem {
  number: string;
  title: string;
  description: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}
