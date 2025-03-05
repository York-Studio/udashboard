// Booking Capacity (formerly Booking)
export interface BookingCapacityRecord {
  Date: string;
  'Time Slot': string;
  'Seats Available': number;
  'Seats Booked': number;
  'Occupancy Rate': number;
  'Average Booking Lead Time': number;
  'Booking Notes'?: string;
}

export interface BookingCapacity {
  id: string;
  date: string;
  timeSlot: string;
  seatsAvailable: number;
  seatsBooked: number;
  occupancyRate: number;
  averageLeadTime: number;
  notes?: string;
}

export interface OccupancyData {
  totalSeats: number;
  bookedSeats: number;
  occupancyRate: number;
  averageLeadTime: number;
}

// Cover Tracker (formerly Covers)
export interface CoverTrackerRecord {
  Date: string;
  'Day of Week': string;
  'Total Covers': number;
  'Peak Time': string;
  'Dining Trend Notes'?: string;
  Notes?: string;
}

export interface CoverTracker {
  id: string;
  date: string;
  dayOfWeek: string;
  totalCovers: number;
  peakTime: string;
  diningTrendNotes?: string;
  notes?: string;
}

export interface CoverData {
  hour: number;
  covers: number;
}

export interface PeakTimeData {
  day: string;
  covers: CoverData[];
  peakTime: string;
  totalCovers: number;
}

// Financial Overview (formerly Financial Metrics)
export interface FinancialOverviewRecord {
  Date: string;
  'Total Revenue': number;
  'Cost of Goods Sold (COGS)': number;
  'Operating Expenses': number;
  'Net Profit': number;
  'Revenue Breakdown': string;
}

export interface FinancialOverview {
  id: string;
  date: string;
  totalRevenue: number;
  costOfGoodsSold: number;
  operatingExpenses: number;
  netProfit: number;
  revenueBreakdown: string;
}

export interface FinancialMetrics {
  totalRevenue: number;
  costOfGoodsSold: number;
  operatingExpenses: number;
  netProfit: number;
}

export interface RevenueBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

// Staff Scheduling (formerly Staff Shifts)
export interface StaffSchedulingRecord {
  'Staff Name': string;
  Role: string;
  'Shift Start': string;
  'Shift End': string;
  'Forecasted Covers': number;
  'Scheduled Hours': number;
  Notes?: string;
}

export interface StaffSchedule {
  id: string;
  staffName: string;
  role: string;
  shiftStart: string;
  shiftEnd: string;
  forecastedCovers: number;
  scheduledHours: number;
  notes?: string;
}

export interface StaffingForecast {
  hour: number;
  forecastedCovers: number;
  scheduledStaff: number;
  recommendedStaff: number;
}

// Stock Insight (formerly Inventory)
export interface StockInsightRecord {
  'Item Name': string;
  Category: string;
  'Current Stock': number;
  'Reorder Level': number;
  'Usage Rate (per day)': number;
  'Low Stock Alert'?: string;
  'Last Updated': string;
  'Notes'?: string;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  usageRate: number; // per day
  lowStockAlert?: string;
  lastUpdated: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  notes?: string;
}

// Dashboard Filters
export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}

// Airtable Response Types
export interface AirtableResponse<T> {
  records: {
    id: string;
    fields: T;
  }[];
}

// Airtable Record Types
export interface BookingRecord {
  Date: string;
  Time: string;
  'Party Size': number;
  Name: string;
  'Contact Info': string;
  Notes?: string;
  Status: string;
  'Lead Time'?: number;
}

export interface InventoryRecord {
  Name: string;
  Category: string;
  'Current Stock': number;
  Unit: string;
  'Reorder Level': number;
  'Usage Rate': number;
  Status: string;
}

export interface StaffShiftRecord {
  'Employee Name': string;
  Position: string;
  'Start Time': string;
  'End Time': string;
  Date: string;
  Hours: number;
}

export interface FinancialRecord {
  Date: string;
  Category: string;
  Amount: number;
  Type: 'Revenue' | 'COGS' | 'Operating Expense';
}

export interface CoverRecord {
  Date: string;
  Hour: number;
  Covers: number;
} 