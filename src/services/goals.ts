import { api } from "@/lib/api";
import type { GoalDto } from "@/types/api";

export async function getGoals(subjectType: "Advisor" | "Manager", ref: string) {
  const subject = subjectType.toLowerCase(); // advisor|manager
  const { data } = await api.get("/Goals", { params: { subject, ref } });
  return data as GoalDto;
}

export const goalsService = {
  getGoals,
  getAdvisorGoals: (advisorEmail: string) => getGoals("Advisor", advisorEmail),
  getManagerGoals: () => getGoals("Manager", "")
};