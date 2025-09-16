import { api, setDemoSession } from "@/lib/api";
import type { UserSession } from "@/types/api";

// src/lib/auth.ts
export async function demoLogin(email: string, role: UserSession["role"]) {
  await api.post("/Auth/demo-login", { email, role });
  localStorage.setItem("demo_email", email);
  localStorage.setItem("demo_role", role);
  return getSession();
}


export async function getSession() {
  const { data } = await api.get("/auth/session");
  return data as UserSession;
}

export function demoLogout() {
  setDemoSession(null);
}
