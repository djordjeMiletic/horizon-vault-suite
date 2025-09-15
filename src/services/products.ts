import { api } from "@/lib/api";
import type { PolicyDto } from "@/types/api";

// Product interface for compatibility with existing pages
export interface Product {
  id: string;
  name: string;
  provider: string;
  type: string;
  commissionRate: number;
  margin: number;
  description: string;
  features: string[];
  commissionExample: {
    ape: number;
    rate: string;
    commission: number;
    note: string;
  };
  bands: {
    threshold: number;
    rateAdjustment: number;
  }[];
  active?: boolean;
}

// Convert PolicyDto to Product format for backwards compatibility
function policyToProduct(policy: PolicyDto): Product {
  return {
    id: policy.id,
    name: policy.productName || '',
    provider: 'Insurance Provider', // Default since not in PolicyDto
    type: 'Life Insurance', // Default since not in PolicyDto
    commissionRate: policy.productRatePct / 100,
    margin: policy.marginPct / 100,
    description: `${policy.productName} insurance product`,
    features: ['Comprehensive Coverage', 'Flexible Terms', 'Competitive Rates'],
    commissionExample: {
      ape: 10000,
      rate: `${policy.productRatePct}%`,
      commission: 10000 * (policy.productRatePct / 100),
      note: 'Based on standard APE calculation'
    },
    bands: [],
    active: true
  };
}

// Products service - aliases to policies for now
export async function getProducts(): Promise<PolicyDto[]> {
  const { data } = await api.get("/Policies");
  return Array.isArray(data) ? data : (data?.items ?? []);
}

export async function getPublicProducts(): Promise<Product[]> {
  const policies = await getProducts();
  return policies.map(policyToProduct);
}

export async function createProduct(payload: any): Promise<Product> {
  // This would need to be implemented on the backend
  throw new Error('Product creation not yet implemented on backend');
}

export async function updateProduct(id: string, payload: any): Promise<Product> {
  // This would need to be implemented on the backend  
  throw new Error('Product updates not yet implemented on backend');
}

export const productsService = {
  getProducts,
  getPublicProducts,
  createProduct,
  updateProduct,
  getAll: () => getProducts(),
  create: createProduct,
  update: updateProduct
};