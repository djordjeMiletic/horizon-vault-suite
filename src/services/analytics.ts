import { api } from "@/lib/api";
import type { SeriesPoint, ProductMixItem } from "@/types/api";

export async function getSeries(range: "last3" | "last6" | "ytd", advisorEmail?: string | string[]) {
  const advisor = Array.isArray(advisorEmail) ? advisorEmail.join(",") : advisorEmail;
  const { data } = await api.get("/analytics/series", { params: { range, advisorEmail: advisor } });
  return data as SeriesPoint[];
}

export async function getProductMix(range: "last3" | "last6" | "ytd", advisorEmail?: string | string[]) {
  const advisor = Array.isArray(advisorEmail) ? advisorEmail.join(",") : advisorEmail;
  const { data } = await api.get("/analytics/product-mix", { params: { range, advisorEmail: advisor } });
  return data as ProductMixItem[];
}