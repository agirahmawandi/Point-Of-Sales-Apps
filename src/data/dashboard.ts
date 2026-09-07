import type {
  DashboardStats,
  SalesChartData,
  TopProduct,
  CashFlowData,
  ProfitLossReport,
} from '@/types';

export const dashboardStats: DashboardStats = {
  todayRevenue: 5200000,
  todayHPP: 3100000,
  todayProfit: 1400000,
  lowStockCount: 7,
  todayRevenueChange: 12.5,
  todayHPPChange: 8.2,
  todayProfitChange: 15.3,
};

export const salesChartData: SalesChartData[] = [
  { date: '2026-08-06', revenue: 3800000, profit: 1150000 },
  { date: '2026-08-07', revenue: 4100000, profit: 1220000 },
  { date: '2026-08-08', revenue: 5600000, profit: 1680000 },
  { date: '2026-08-09', revenue: 5900000, profit: 1750000 },
  { date: '2026-08-10', revenue: 4200000, profit: 1250000 },
  { date: '2026-08-11', revenue: 3950000, profit: 1180000 },
  { date: '2026-08-12', revenue: 4300000, profit: 1290000 },
  { date: '2026-08-13', revenue: 4150000, profit: 1230000 },
  { date: '2026-08-14', revenue: 4700000, profit: 1410000 },
  { date: '2026-08-15', revenue: 6200000, profit: 1860000 },
  { date: '2026-08-16', revenue: 6450000, profit: 1920000 },
  { date: '2026-08-17', revenue: 5800000, profit: 1720000 },
  { date: '2026-08-18', revenue: 4100000, profit: 1210000 },
  { date: '2026-08-19', revenue: 3900000, profit: 1160000 },
  { date: '2026-08-20', revenue: 4250000, profit: 1270000 },
  { date: '2026-08-21', revenue: 4600000, profit: 1380000 },
  { date: '2026-08-22', revenue: 5950000, profit: 1780000 },
  { date: '2026-08-23', revenue: 6100000, profit: 1820000 },
  { date: '2026-08-24', revenue: 3850000, profit: 1140000 },
  { date: '2026-08-25', revenue: 4100000, profit: 1220000 },
  { date: '2026-08-26', revenue: 4350000, profit: 1300000 },
  { date: '2026-08-27', revenue: 4500000, profit: 1350000 },
  { date: '2026-08-28', revenue: 4800000, profit: 1440000 },
  { date: '2026-08-29', revenue: 6300000, profit: 1890000 },
  { date: '2026-08-30', revenue: 6500000, profit: 1940000 },
  { date: '2026-08-31', revenue: 4400000, profit: 1310000 },
  { date: '2026-09-01', revenue: 4900000, profit: 1450000 },
  { date: '2026-09-02', revenue: 4750000, profit: 1400000 },
  { date: '2026-09-03', revenue: 4600000, profit: 1360000 },
  { date: '2026-09-04', revenue: 5200000, profit: 1400000 },
];

export const topProducts: TopProduct[] = [
  {
    productId: 'prod-11',
    productName: 'Aqua Air Mineral Botol 600ml',
    totalSold: 320,
    totalRevenue: 1440000,
  },
  {
    productId: 'prod-4',
    productName: 'Indomie Mi Goreng 85g',
    totalSold: 285,
    totalRevenue: 997500,
  },
  {
    productId: 'prod-10',
    productName: 'Teh Pucuk Harum 350ml',
    totalSold: 210,
    totalRevenue: 840000,
  },
  {
    productId: 'prod-1',
    productName: 'Beras Premium 5kg',
    totalSold: 85,
    totalRevenue: 6290000,
  },
  {
    productId: 'prod-3',
    productName: 'Minyak Goreng Tropical 2L',
    totalSold: 72,
    totalRevenue: 2808000,
  },
];

export const cashFlowData: CashFlowData[] = [
  { date: '2026-08-06', inflow: 3800000, outflow: 2200000, balance: 26600000 },
  { date: '2026-08-07', inflow: 4100000, outflow: 1800000, balance: 28900000 },
  { date: '2026-08-08', inflow: 5600000, outflow: 2400000, balance: 32100000 },
  { date: '2026-08-09', inflow: 5900000, outflow: 3100000, balance: 34900000 },
  { date: '2026-08-10', inflow: 4200000, outflow: 4500000, balance: 34600000 },
  { date: '2026-08-11', inflow: 3950000, outflow: 1950000, balance: 36600000 },
  { date: '2026-08-12', inflow: 4300000, outflow: 2100000, balance: 38800000 },
  { date: '2026-08-13', inflow: 4150000, outflow: 2050000, balance: 40900000 },
  { date: '2026-08-14', inflow: 4700000, outflow: 3500000, balance: 42100000 },
  { date: '2026-08-15', inflow: 6200000, outflow: 2800000, balance: 45500000 },
  { date: '2026-08-16', inflow: 6450000, outflow: 2900000, balance: 49050000 },
  { date: '2026-08-17', inflow: 5800000, outflow: 2600000, balance: 52250000 },
  { date: '2026-08-18', inflow: 4100000, outflow: 5500000, balance: 50850000 },
  { date: '2026-08-19', inflow: 3900000, outflow: 1850000, balance: 52900000 },
  { date: '2026-08-20', inflow: 4250000, outflow: 2150000, balance: 55000000 },
  { date: '2026-08-21', inflow: 4600000, outflow: 2300000, balance: 57300000 },
  { date: '2026-08-22', inflow: 5950000, outflow: 2700000, balance: 60550000 },
  { date: '2026-08-23', inflow: 6100000, outflow: 2950000, balance: 63700000 },
  { date: '2026-08-24', inflow: 3850000, outflow: 1900000, balance: 65650000 },
  { date: '2026-08-25', inflow: 4100000, outflow: 4200000, balance: 65550000 },
  { date: '2026-08-26', inflow: 4350000, outflow: 2050000, balance: 67850000 },
  { date: '2026-08-27', inflow: 4500000, outflow: 2200000, balance: 70150000 },
  { date: '2026-08-28', inflow: 4800000, outflow: 2400000, balance: 72550000 },
  { date: '2026-08-29', inflow: 6300000, outflow: 3000000, balance: 75850000 },
  { date: '2026-08-30', inflow: 6500000, outflow: 3100000, balance: 79250000 },
  { date: '2026-08-31', inflow: 4400000, outflow: 2100000, balance: 81550000 },
  { date: '2026-09-01', inflow: 4900000, outflow: 9900000, balance: 76550000 },
  { date: '2026-09-02', inflow: 4750000, outflow: 2605000, balance: 78695000 },
  { date: '2026-09-03', inflow: 4600000, outflow: 2325000, balance: 80970000 },
  { date: '2026-09-04', inflow: 5200000, outflow: 2435000, balance: 83735000 },
];

export const profitLossReport: ProfitLossReport = {
  period: 'September 2026',
  grossSales: 135400000,
  discounts: 2800000,
  netSales: 132600000,
  hpp: 84200000,
  grossProfit: 48400000,
  expenses: [
    { category: 'Gaji Karyawan', amount: 5600000 },
    { category: 'Sewa', amount: 3500000 },
    { category: 'Listrik & Air', amount: 685000 },
    { category: 'Perlengkapan Toko', amount: 370000 },
    { category: 'Transportasi', amount: 225000 },
    { category: 'Lain-lain', amount: 85000 },
  ],
  totalExpenses: 10465000,
  netProfit: 37935000,
};

export const mockDashboardStats = dashboardStats;
export const mockSalesChartData = salesChartData;
export const mockTopProducts = topProducts;
export const mockCashFlowData = cashFlowData;
export const mockProfitLossReport = profitLossReport;
