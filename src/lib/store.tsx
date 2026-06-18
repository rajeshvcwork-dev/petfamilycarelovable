import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { initialState, type AppState, type Pet, type MedicalRecord, type Notification as Notif, type Review } from "./seed";

const STORAGE_KEY = "petcarebuddy:v1";

type Ctx = {
  state: AppState;
  // auth
  login: (email: string, password: string) => boolean;
  loginGoogle: () => void;
  register: (data: { fullName: string; email: string; mobile: string; password: string }) => void;
  logout: () => void;
  // pets
  addPet: (pet: Omit<Pet, "id">) => string;
  updatePet: (id: string, patch: Partial<Pet>) => void;
  deletePet: (id: string) => void;
  // records
  addRecord: (rec: Omit<MedicalRecord, "id">) => void;
  deleteRecord: (id: string) => void;
  // notifications
  markRead: (id: string) => void;
  clearNotifications: () => void;
  // reviews
  addReview: (review: Omit<Review, "id" | "date">) => void;
  deleteReview: (id: string) => void;
  // theme
  toggleDark: () => void;
};

const AppCtx = createContext<Ctx | null>(null);

function load(): AppState {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    return JSON.parse(raw) as AppState;
  } catch {
    return initialState();
  }
}

function save(s: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

const uid = () => Math.random().toString(36).slice(2, 10);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => initialState());

  useEffect(() => {
    setState(load());
  }, []);

  useEffect(() => {
    save(state);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", state.darkMode);
    }
  }, [state]);

  const login: Ctx["login"] = useCallback((email, password) => {
    const e = email.trim().toLowerCase();
    // demo accounts
    if ((e === "demouser" || e === "demouser@petcarebuddy.app") && password === "demouser") {
      setState((s) => ({ ...s, currentUserId: "u_demo" }));
      return true;
    }
    if (e === "admin" && password === "admin") {
      setState((s) => ({ ...s, currentUserId: "u_admin" }));
      return true;
    }
    const user = state.users.find((u) => u.email.toLowerCase() === e && u.password === password);
    if (user) {
      setState((s) => ({ ...s, currentUserId: user.id }));
      return true;
    }
    return false;
  }, [state.users]);

  const loginGoogle: Ctx["loginGoogle"] = useCallback(() => {
    setState((s) => ({ ...s, currentUserId: "u_demo" }));
  }, []);

  const register: Ctx["register"] = useCallback((data) => {
    setState((s) => {
      const id = "u_" + uid();
      return {
        ...s,
        users: [
          ...s.users,
          { id, fullName: data.fullName, email: data.email, mobile: data.mobile, password: data.password, plan: "individual", location: "" },
        ],
        currentUserId: id,
      };
    });
  }, []);

  const logout = useCallback(() => setState((s) => ({ ...s, currentUserId: null })), []);

  const addPet: Ctx["addPet"] = useCallback((pet) => {
    const id = "p_" + uid();
    setState((s) => ({ ...s, pets: [...s.pets, { ...pet, id, ownerId: s.currentUserId || "u_demo" } as Pet] }));
    return id;
  }, []);

  const updatePet: Ctx["updatePet"] = useCallback((id, patch) => {
    setState((s) => ({ ...s, pets: s.pets.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  }, []);

  const deletePet: Ctx["deletePet"] = useCallback((id) => {
    setState((s) => ({
      ...s,
      pets: s.pets.filter((p) => p.id !== id),
      records: s.records.filter((r) => r.petId !== id),
    }));
  }, []);

  const addRecord: Ctx["addRecord"] = useCallback((rec) => {
    setState((s) => ({ ...s, records: [{ ...rec, id: "r_" + uid() }, ...s.records] }));
  }, []);

  const deleteRecord: Ctx["deleteRecord"] = useCallback((id) => {
    setState((s) => ({ ...s, records: s.records.filter((r) => r.id !== id) }));
  }, []);

  const markRead: Ctx["markRead"] = useCallback((id) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const clearNotifications = useCallback(() => {
    setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
  }, []);

  const addReview: Ctx["addReview"] = useCallback((review) => {
    setState((s) => ({
      ...s,
      reviews: [{ ...review, id: "rv_" + uid(), date: new Date().toISOString() } as Review, ...s.reviews],
    }));
  }, []);

  const deleteReview: Ctx["deleteReview"] = useCallback((id) => {
    setState((s) => ({ ...s, reviews: s.reviews.filter((r) => r.id !== id) }));
  }, []);

  const toggleDark = useCallback(() => setState((s) => ({ ...s, darkMode: !s.darkMode })), []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      login, loginGoogle, register, logout,
      addPet, updatePet, deletePet,
      addRecord, deleteRecord,
      markRead, clearNotifications,
      addReview, deleteReview,
      toggleDark,
    }),
    [state, login, loginGoogle, register, logout, addPet, updatePet, deletePet, addRecord, deleteRecord, markRead, clearNotifications, addReview, deleteReview, toggleDark],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function useCurrentUser() {
  const { state } = useApp();
  return state.users.find((u) => u.id === state.currentUserId) || null;
}

export function useUserPets() {
  const { state } = useApp();
  if (!state.currentUserId) return [];
  if (state.currentUserId === "u_admin") return state.pets;
  return state.pets.filter((p) => p.ownerId === state.currentUserId);
}
