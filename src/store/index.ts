import { create } from "zustand";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => {
    localStorage.setItem("akram_token", token);
    localStorage.setItem("akram_user", JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem("akram_token");
    localStorage.removeItem("akram_user");
    set({ token: null, user: null });
  },
  loadFromStorage: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("akram_token");
    const userStr = localStorage.getItem("akram_user");
    if (token && userStr) {
      try {
        set({ token, user: JSON.parse(userStr) });
      } catch {
        set({ token: null, user: null });
      }
    }
  },
}));

interface FilterState {
  filial: string;
  classe: string;
  uf: string;
  comprador: string;
  validade_start: string;
  validade_end: string;
  page: number;
  setFilter: (key: string, value: string) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}

const defaultFilters = {
  filial: "",
  classe: "",
  uf: "",
  comprador: "",
  validade_start: "",
  validade_end: "",
  page: 1,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...defaultFilters,
  setFilter: (key, value) => set({ [key]: value, page: 1 }),
  setPage: (page) => set({ page }),
  resetFilters: () => set(defaultFilters),
}));
