// Admin data model
// This feature is frontend-only (dev mode toggle with localStorage)
// No backend data model changes required

export interface AdminDevModeState {
  enabled: boolean;
  lastUpdated: string;
}

export const AdminModel = {
  // Dev mode is stored in localStorage, no database model needed
  getDevMode: (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('open-dash-dev-mode') === 'true';
  },
  
  setDevMode: (enabled: boolean): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('open-dash-dev-mode', String(enabled));
  },
};
