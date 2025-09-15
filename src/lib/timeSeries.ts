import { computeCommission } from './commission';

export interface TimeSeriesData {
  month: string;
  totalCommission: number;
  count: number;
  totalApe: number;
  totalReceipts: number;
}

export interface RollupOptions {
  from?: string;
  to?: string;
  advisorFilter?: string[];
}

/**
 * Generate array of months going back N months from current date
 * Returns format: ["2025-04", "2025-05", ..., "2025-09"]
 */
export function monthsBack(n: number): string[] {
  const months: string[] = [];
  const currentDate = new Date();
  
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthStr = date.toISOString().slice(0, 7); // YYYY-MM format
    months.push(monthStr);
  }
  
  return months;
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

/**
 * Aggregate payments into monthly rollups with commission calculations
 */
export function rollupMonthly(payments: any[], options: RollupOptions = {}): TimeSeriesData[] {
  const { from, to, advisorFilter } = options;
  
  // Filter payments by date range and advisor
  let filteredPayments = payments.filter(payment => {
    const paymentDate = payment.date || payment.paymentDate;
    if (!paymentDate) return false;
    
    const paymentMonth = paymentDate.slice(0, 7); // Extract YYYY-MM
    
    // Apply date filters
    if (from && paymentMonth < from) return false;
    if (to && paymentMonth > to) return false;
    
    // Apply advisor filter
    if (advisorFilter && advisorFilter.length > 0) {
      const paymentAdvisor = payment.advisorEmail || `advisor${payment.advisorId}@advisor.com`;
      return advisorFilter.includes(paymentAdvisor);
    }
    
    return true;
  });
  
  // Group by month
  const monthlyGroups: Record<string, any[]> = {};
  
  filteredPayments.forEach(payment => {
    const paymentDate = payment.date || payment.paymentDate;
    const month = paymentDate.slice(0, 7);
    
    if (!monthlyGroups[month]) {
      monthlyGroups[month] = [];
    }
    monthlyGroups[month].push(payment);
  });
  
  // Calculate rollups
  const rollups: TimeSeriesData[] = Object.entries(monthlyGroups).map(([month, monthPayments]) => {
    let totalCommission = 0;
    let totalApe = 0;
    let totalReceipts = 0;
    
    monthPayments.forEach(payment => {
      // Use existing commission amount if available, otherwise calculate
      if (payment.commissionAmount) {
        totalCommission += payment.commissionAmount;
      } else {
        // Fallback calculation
        const commission = (payment.ape || 0) * 0.03; // Simple 3% fallback
        totalCommission += commission;
      }
      
      totalApe += payment.ape || 0;
      totalReceipts += payment.receipts || payment.actualReceipts || 0;
    });
    
    return {
      month,
      totalCommission,
      count: monthPayments.length,
      totalApe,
      totalReceipts
    };
  });
  
  // Sort by month
  rollups.sort((a, b) => a.month.localeCompare(b.month));
  
  return rollups;
}

/**
 * Get date range for common time periods
 */
export function getDateRange(period: 'thisMonth' | 'last3Months' | 'last6Months' | 'ytd'): { from: string; to: string } {
  const current = new Date();
  const currentMonth = getCurrentMonth();
  
  switch (period) {
    case 'thisMonth':
      return { from: currentMonth, to: currentMonth };
      
    case 'last3Months':
      return { 
        from: monthsBack(3)[0], 
        to: currentMonth 
      };
      
    case 'last6Months':
      return { 
        from: monthsBack(6)[0], 
        to: currentMonth 
      };
      
    case 'ytd':
      return { 
        from: `${current.getFullYear()}-01`, 
        to: currentMonth 
      };
      
    default:
      return { from: monthsBack(6)[0], to: currentMonth };
  }
}

/**
 * Format month string for display
 */
export function formatMonthForDisplay(monthStr: string): string {
  const date = new Date(monthStr + '-01');
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Generate complete month series with zero-filled gaps
 */
export function fillMonthGaps(data: TimeSeriesData[], months: string[]): TimeSeriesData[] {
  const dataMap = new Map(data.map(item => [item.month, item]));
  
  return months.map(month => {
    const existing = dataMap.get(month);
    return existing || {
      month,
      totalCommission: 0,
      count: 0,
      totalApe: 0,
      totalReceipts: 0
    };
  });
}