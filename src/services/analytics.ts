import { api } from "@/lib/api";
import type { SeriesPoint, ProductMixItem } from "@/types/api";

// Type guards and response normalizers for backend compatibility
function toSeriesPoints(input: any): SeriesPoint[] {
  if (Array.isArray(input)) return input;
  return Object.entries(input ?? {}).map(([month, value]) => ({ 
    month, 
    value: Number(value ?? 0) 
  }));
}

function toProductMixItems(input: any): ProductMixItem[] {
  if (Array.isArray(input)) return input;
  return Object.entries(input ?? {}).map(([product, amount]) => ({ 
    product, 
    amount: Number(amount ?? 0) 
  }));
}

export async function getSeries(range: "last3" | "last6" | "ytd", advisorEmail?: string | string[]) {
  const advisor = Array.isArray(advisorEmail) ? advisorEmail.join(",") : advisorEmail;
  const { data } = await api.get("/Analytics/series", { params: { range, advisorEmail: advisor } });
  return toSeriesPoints(data);
}

export async function getProductMix(range: "last3" | "last6" | "ytd", advisorEmail?: string | string[]) {
  const advisor = Array.isArray(advisorEmail) ? advisorEmail.join(",") : advisorEmail;
  const { data } = await api.get("/Analytics/product-mix", { params: { range, advisorEmail: advisor } });
  return toProductMixItems(data);
}