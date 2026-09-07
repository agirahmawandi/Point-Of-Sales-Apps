export interface DashboardStats {
  todayRevenue: number;
  todayHPP: number;
  todayProfit: number;
  lowStockCount: number;
  todayRevenueChange: number;
  todayHPPChange: number;
  todayProfitChange: number;
}

export interface SalesChartData {
  date: string;
  revenue: number;
  profit: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
}

export interface CashFlowData {
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
}

export interface ProfitLossReport {
  period: string;
  grossSales: number;
  discounts: number;
  netSales: number;
  hpp: number;
  grossProfit: number;
  expenses: {
    category: string;
    amount: number;
  }[];
  totalExpenses: number;
  netProfit: number;
}
