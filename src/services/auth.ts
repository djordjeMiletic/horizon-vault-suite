import { api } from "@/lib/api";
import type { UserSession } from "@/types/api";

export async function demoLogin(email: string, role: UserSession["role"]) {
  await api.post("/auth/demo-login", { email, role });
  return getSession();
}

export async function getSession() {
  const { data } = await api.get("/auth/session");
  return data as UserSession;
}