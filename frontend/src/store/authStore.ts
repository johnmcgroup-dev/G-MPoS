import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: any;
  token: string | null;
  tenantId: string | null;
  login: (user: any, token: string, tenantId: string) => void;
  logout: () => void;
  setTenantId: (tenantId: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      tenantId: null,
      login: (user, token, tenantId) =>
        set({ user, token, tenantId }),
      logout: () =>
        set({ user: null, token: null, tenantId: null }),
      setTenantId: (tenantId) =>
        set({ tenantId }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
