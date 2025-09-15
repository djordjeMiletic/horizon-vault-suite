import { api } from "@/lib/api";
import type { GoalDto } from "@/types/api";

export async function getGoals(subjectType: "Advisor" | "Manager", ref: string) {
  const subject = subjectType.toLowerCase(); // advisor|manager
  const { data } = await api.get("/goals", { params: { subject, ref } });
  return data as GoalDto;
}