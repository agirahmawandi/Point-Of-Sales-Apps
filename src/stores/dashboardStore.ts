import { create } from 'zustand';
import { startOfDay, endOfDay, startOfWeek, endOfMonth, startOfMonth, subDays } from 'date-fns';

export type DateFilterType = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';

interface DashboardState {
  dateFilter: DateFilterType;
  customStartDate: Date | null;
  customEndDate: Date | null;
  setDateFilter: (filter: DateFilterType) => void;
  setCustomDateRange: (start: Date, end: Date) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  dateFilter: 'today',
  customStartDate: null,
  customEndDate: null,
  setDateFilter: (filter) => set({ dateFilter: filter }),
  setCustomDateRange: (start, end) => set({ customStartDate: start, customEndDate: end, dateFilter: 'custom' }),
}));

export const getDashboardDateRange = (state: DashboardState) => {
  const now = new Date();
  
  switch (state.dateFilter) {
    case 'today':
      return { startDate: startOfDay(now), endDate: endOfDay(now) };
    case 'yesterday': {
      const yesterday = subDays(now, 1);
      return { startDate: startOfDay(yesterday), endDate: endOfDay(yesterday) };
    }
    case 'this_week':
      return { startDate: startOfWeek(now, { weekStartsOn: 1 }), endDate: endOfDay(now) };
    case 'this_month':
      return { startDate: startOfMonth(now), endDate: endOfDay(now) };
    case 'custom':
      if (state.customStartDate && state.customEndDate) {
        return { startDate: startOfDay(state.customStartDate), endDate: endOfDay(state.customEndDate) };
      }
      return { startDate: startOfDay(now), endDate: endOfDay(now) }; // fallback
    default:
      return { startDate: startOfDay(now), endDate: endOfDay(now) };
  }
};
