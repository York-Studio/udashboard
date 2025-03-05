import type { 
  AirtableResponse, 
  BookingCapacityRecord,
  BookingCapacity,
  OccupancyData,
  CoverTrackerRecord,
  CoverTracker,
  CoverData,
  PeakTimeData,
  FinancialOverviewRecord,
  FinancialOverview,
  FinancialMetrics,
  RevenueBreakdown,
  StaffSchedulingRecord,
  StaffSchedule,
  StaffingForecast,
  StockInsightRecord,
  StockItem
} from '@/types/index';
import { format, parseISO, parse } from 'date-fns';

// Constants
const RESTAURANT_TOTAL_SEATS = 120; // Example value, replace with actual value

// Transform booking capacity records
export function transformBookingCapacity(response: AirtableResponse<BookingCapacityRecord>): BookingCapacity[] {
  return response.records.map(record => {
    // Calculate the occupancy rate correctly
    const seatsAvailable = record.fields['Seats Available'];
    const seatsBooked = record.fields['Seats Booked'];
    const totalSeats = seatsAvailable + seatsBooked;
    const occupancyRate = totalSeats > 0 
      ? Math.round((seatsBooked / totalSeats) * 100) 
      : 0;
    
    return {
      id: record.id,
      date: record.fields.Date,
      timeSlot: record.fields['Time Slot'],
      seatsAvailable: seatsAvailable,
      seatsBooked: seatsBooked,
      occupancyRate: occupancyRate,
      averageLeadTime: record.fields['Average Booking Lead Time'],
      notes: record.fields['Booking Notes']
    };
  });
}

// Calculate occupancy data from booking capacity
export function calculateOccupancy(bookingCapacity: BookingCapacity): OccupancyData {
  // Total seats should be the sum of available seats and booked seats
  const totalSeats = bookingCapacity.seatsAvailable + bookingCapacity.seatsBooked;
  
  // Calculate occupancy rate correctly as (booked seats / total seats) * 100
  const calculatedOccupancyRate = totalSeats > 0 
    ? Math.round((bookingCapacity.seatsBooked / totalSeats) * 100) 
    : 0;
  
  return {
    totalSeats: totalSeats,
    bookedSeats: bookingCapacity.seatsBooked,
    occupancyRate: calculatedOccupancyRate,
    averageLeadTime: bookingCapacity.averageLeadTime
  };
}

// Transform cover tracker records
export function transformCoverTracker(response: AirtableResponse<CoverTrackerRecord>): CoverTracker[] {
  return response.records.map(record => ({
    id: record.id,
    date: record.fields.Date,
    dayOfWeek: record.fields['Day of Week'],
    totalCovers: record.fields['Total Covers'],
    peakTime: record.fields['Peak Time'],
    diningTrendNotes: record.fields['Dining Trend Notes'],
    notes: record.fields.Notes
  }));
}

// Convert peak time string to hour number
function peakTimeToHour(peakTimeStr: string): number {
  try {
    const timeParts = peakTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeParts) return 12; // default to noon if parsing fails
    
    let hour = parseInt(timeParts[1]);
    const isPM = timeParts[3].toUpperCase() === 'PM';
    
    // Adjust hour for PM times (except 12 PM)
    if (isPM && hour !== 12) hour += 12;
    // Adjust 12 AM to be 0
    if (!isPM && hour === 12) hour = 0;
    
    return hour;
  } catch (e) {
    console.error('Error parsing peak time:', e);
    return 12; // default to noon if parsing fails
  }
}

// Generate cover data from cover tracker
export function generateCoverData(coverTracker: CoverTracker): CoverData[] {
  const peakHour = peakTimeToHour(coverTracker.peakTime);
  
  // Create a distribution of covers centered around the peak time
  // This is a simplification - in a real scenario, you would use actual hourly data
  const hourlyDistribution = [
    { hour: peakHour - 3, percentage: 0.2 },
    { hour: peakHour - 2, percentage: 0.4 },
    { hour: peakHour - 1, percentage: 0.7 },
    { hour: peakHour, percentage: 1.0 },
    { hour: peakHour + 1, percentage: 0.8 },
    { hour: peakHour + 2, percentage: 0.5 },
    { hour: peakHour + 3, percentage: 0.3 }
  ];
  
  // Normalize hours to ensure they're in the 0-23 range
  const normalizeHour = (h: number) => (h + 24) % 24;
  
  // Generate cover data for each hour in the distribution
  return hourlyDistribution.map(item => ({
    hour: normalizeHour(item.hour),
    covers: Math.round(coverTracker.totalCovers * item.percentage / hourlyDistribution.reduce((sum, h) => sum + h.percentage, 0))
  }));
}

// Group cover data by day for peak time analysis
export function createPeakTimeData(coverTracker: CoverTracker, coverData: CoverData[]): PeakTimeData {
  return {
    day: coverTracker.dayOfWeek,
    covers: coverData,
    peakTime: coverTracker.peakTime,
    totalCovers: coverTracker.totalCovers
  };
}

// Transform financial overview records
export function transformFinancialOverview(response: AirtableResponse<FinancialOverviewRecord>): FinancialOverview[] {
  return response.records.map(record => ({
    id: record.id,
    date: record.fields.Date,
    totalRevenue: record.fields['Total Revenue'],
    costOfGoodsSold: record.fields['Cost of Goods Sold (COGS)'],
    operatingExpenses: record.fields['Operating Expenses'],
    netProfit: record.fields['Net Profit'],
    revenueBreakdown: record.fields['Revenue Breakdown']
  }));
}

// Calculate financial metrics from financial overview
export function calculateFinancialMetrics(financialOverview: FinancialOverview): FinancialMetrics {
  return {
    totalRevenue: financialOverview.totalRevenue,
    costOfGoodsSold: financialOverview.costOfGoodsSold,
    operatingExpenses: financialOverview.operatingExpenses,
    netProfit: financialOverview.netProfit
  };
}

// Parse revenue breakdown string into structured data
export function parseRevenueBreakdown(breakdownStr: string): RevenueBreakdown[] {
  try {
    console.log('Parsing revenue breakdown string:', breakdownStr);
    
    if (!breakdownStr || typeof breakdownStr !== 'string') {
      console.error('Invalid revenue breakdown string:', breakdownStr);
      return [];
    }
    
    // Example formats: 
    // "60% dinner, 40% bar"
    // "Dinner: 60%, Bar: 40%"
    // "60% - Dinner, 40% - Bar"
    
    const parts = breakdownStr.split(',').map(part => part.trim());
    console.log('Split parts:', parts);
    
    const result: RevenueBreakdown[] = [];
    
    for (const part of parts) {
      // Try different regex patterns to match various formats
      let match = part.match(/(\d+(?:\.\d+)?)%\s+(.*)/);  // "60% dinner"
      
      if (!match) {
        match = part.match(/(.*?):\s*(\d+(?:\.\d+)?)%/);  // "Dinner: 60%"
        if (match) {
          // Swap the groups since they're in different order
          match = [match[0], match[2], match[1]];
        }
      }
      
      if (!match) {
        match = part.match(/(\d+(?:\.\d+)?)%\s*-\s*(.*)/);  // "60% - Dinner"
      }
      
      if (match) {
        const percentage = parseFloat(match[1]);
        const category = match[2].trim();
        
        console.log(`Parsed: category="${category}", percentage=${percentage}`);
        
        result.push({
          category,
          percentage,
          amount: 0 // This will be calculated in calculateRevenueBreakdown
        });
      } else {
        console.warn(`Could not parse revenue breakdown part: "${part}"`);
      }
    }
    
    console.log('Parsed revenue breakdown result:', result);
    return result;
  } catch (e) {
    console.error('Error parsing revenue breakdown:', e);
    return []; // Return empty array if parsing fails
  }
}

// Calculate revenue breakdown from financial overview
export function calculateRevenueBreakdown(financialOverview: FinancialOverview): RevenueBreakdown[] {
  try {
    if (!financialOverview) {
      console.error('Missing financial overview data');
      return [];
    }
    
    if (!financialOverview.revenueBreakdown) {
      console.error('Missing revenue breakdown string in financial overview');
      return [];
    }
    
    if (typeof financialOverview.totalRevenue !== 'number' || isNaN(financialOverview.totalRevenue)) {
      console.error('Invalid total revenue in financial overview:', financialOverview.totalRevenue);
      return [];
    }
    
    console.log('Calculating revenue breakdown for total revenue:', financialOverview.totalRevenue);
    
    const breakdown = parseRevenueBreakdown(financialOverview.revenueBreakdown);
    
    if (breakdown.length === 0) {
      console.warn('No revenue breakdown items parsed');
      
      // If parsing failed but we have total revenue, create a default breakdown
      if (financialOverview.totalRevenue > 0) {
        console.log('Creating default revenue breakdown with 100% "Total Revenue"');
        return [{
          category: 'Total Revenue',
          percentage: 100,
          amount: financialOverview.totalRevenue
        }];
      }
      
      return [];
    }
    
    // Calculate amounts based on percentages of total revenue
    const result = breakdown.map(item => ({
      ...item,
      amount: (financialOverview.totalRevenue * item.percentage) / 100
    }));
    
    console.log('Calculated revenue breakdown:', result);
    return result;
  } catch (error) {
    console.error('Error calculating revenue breakdown:', error);
    return [];
  }
}

// Transform staff scheduling records
export function transformStaffScheduling(response: AirtableResponse<StaffSchedulingRecord>): StaffSchedule[] {
  return response.records.map(record => ({
    id: record.id,
    staffName: record.fields['Staff Name'],
    role: record.fields.Role,
    shiftStart: record.fields['Shift Start'],
    shiftEnd: record.fields['Shift End'],
    forecastedCovers: record.fields['Forecasted Covers'],
    scheduledHours: record.fields['Scheduled Hours'],
    notes: record.fields.Notes
  }));
}

// Calculate total scheduled hours from staff schedules
export function calculateTotalScheduledHours(schedules: StaffSchedule[]): number {
  return schedules.reduce((total, schedule) => total + schedule.scheduledHours, 0);
}

// Extract date from ISO datetime string
function extractDateFromISO(isoString: string): string {
  try {
    return isoString.split('T')[0];
  } catch (e) {
    return isoString;
  }
}

// Generate staffing forecast based on staff schedules
export function generateStaffingForecast(schedules: StaffSchedule[]): StaffingForecast[] {
  // Group staff by hour
  const staffByHour: { [hour: number]: number } = {};
  const forecastedCoversByHour: { [hour: number]: number } = {};
  
  // Process each staff schedule
  schedules.forEach(schedule => {
    try {
      // Extract start and end times
      const startTime = new Date(schedule.shiftStart);
      const endTime = new Date(schedule.shiftEnd);
      
      // Calculate hours between start and end times
      const startHour = startTime.getHours();
      const endHour = endTime.getHours();
      
      // Handle overnight shifts
      const hoursRange = endHour >= startHour 
        ? Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)
        : [
            ...Array.from({ length: 24 - startHour }, (_, i) => startHour + i),
            ...Array.from({ length: endHour + 1 }, (_, i) => i)
          ];
      
      // Add staff to each hour they work
      hoursRange.forEach(hour => {
        staffByHour[hour] = (staffByHour[hour] || 0) + 1;
      });
      
      // Use forecasted covers for this shift
      const coversPerHour = schedule.forecastedCovers / hoursRange.length;
      hoursRange.forEach(hour => {
        forecastedCoversByHour[hour] = (forecastedCoversByHour[hour] || 0) + coversPerHour;
      });
    } catch (e) {
      console.error('Error processing staff schedule:', e);
    }
  });
  
  // Create forecast for each hour
  return Object.keys(staffByHour).map(hourStr => {
    const hour = parseInt(hourStr);
    const forecastedCovers = Math.round(forecastedCoversByHour[hour] || 0);
    const scheduledStaff = staffByHour[hour] || 0;
    
    // Updated staffing recommendation: 
    // 0-20 covers: 1 staff
    // 21-40 covers: 2 staff
    // 41-60 covers: 3 staff, and so on
    const recommendedStaff = Math.ceil(forecastedCovers / 20);
    
    return {
      hour,
      forecastedCovers,
      scheduledStaff,
      recommendedStaff
    };
  }).sort((a, b) => a.hour - b.hour);
}

// Transform stock insight records
export function transformStockInsight(response: AirtableResponse<StockInsightRecord>): StockItem[] {
  return response.records.map(record => ({
    id: record.id,
    name: record.fields['Item Name'],
    category: record.fields.Notes || record.fields.Category, // Use Notes as category, fallback to Category
    currentStock: record.fields['Current Stock'],
    reorderLevel: record.fields['Reorder Level'],
    usageRate: record.fields['Usage Rate (per day)'],
    lowStockAlert: record.fields['Low Stock Alert'],
    lastUpdated: record.fields['Last Updated'],
    notes: record.fields.Notes,
    status: determineStockStatus(record.fields['Current Stock'], record.fields['Reorder Level'])
  }));
}

// Determine stock status based on current stock and reorder level
function determineStockStatus(currentStock: number, reorderLevel: number): 'In Stock' | 'Low Stock' | 'Out of Stock' {
  if (currentStock <= 0) {
    return 'Out of Stock';
  } else if (currentStock <= reorderLevel) {
    return 'Low Stock';
  } else {
    return 'In Stock';
  }
}

// Get low stock items for alerts
export function getLowStockItems(stock: StockItem[]): StockItem[] {
  // Group items by name and find the latest version of each item
  const latestItems = new Map<string, StockItem>();
  
  stock.forEach(item => {
    const existingItem = latestItems.get(item.name);
    
    // If this item doesn't exist in our map yet or is newer than the existing one, add/update it
    if (!existingItem || new Date(item.lastUpdated) > new Date(existingItem.lastUpdated)) {
      latestItems.set(item.name, item);
    }
  });
  
  // Convert the map back to an array and filter for low/out of stock items
  return Array.from(latestItems.values()).filter(
    item => item.status === 'Low Stock' || item.status === 'Out of Stock'
  );
}

// Format currency values
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(value);
}

// Format percentage values
export function formatPercentage(value: number): string {
  return value.toFixed(1) + '%';
}

// Format date values
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return dateString; // Return the original string if parsing fails
  }
} 