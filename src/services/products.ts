import { api } from "@/lib/api";

export interface Product {
  id: string;
  name: string;
  provider: string;
  type: string;
  description: string;
  features: string[];
  commissionRate: number;
  margin: number;
  commissionExample: {
    ape: number;
    rate: string;
    commission: string;
    note: string;
  };
  bands: Array<{
    threshold: number;
    rateAdjustment: number;
  }>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  name: string;
  provider: string;
  type: string;
  description: string;
  features: string[];
  commissionRate: number;
  margin: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export async function getProducts(params?: {
  active?: boolean;
  type?: string;
  provider?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<Product[]> {
  const { data } = await api.get("/products", { params });
  return Array.isArray(data) ? data : data?.items ?? [];
}

export async function getPublicProducts(): Promise<Product[]> {
  const { data } = await api.get("/products/public");
  return Array.isArray(data) ? data : data?.items ?? [];
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const { data } = await api.post("/products", payload);
  return data;
}

export async function updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
  const { data } = await api.put(`/products/${id}`, payload);
  return data;
}

export async function toggleProductStatus(id: string, active: boolean): Promise<Product> {
  const { data } = await api.patch(`/products/${id}/status`, { active });
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}