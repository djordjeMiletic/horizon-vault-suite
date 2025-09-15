import { api } from "@/lib/api";
import type { UserSession } from "@/types/api";

export async function demoLogin(email: string, role: UserSession["role"]) {
  await api.post("/Auth/demo-login", { email, role });
  return getSession();
}

export async function getSession() {
  const { data } = await api.get("/Auth/session");
  return data as UserSession;
}