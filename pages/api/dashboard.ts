import type { NextApiRequest, NextApiResponse } from 'next';
import { 
  fetchBookingCapacity,
  fetchCoverTracker,
  fetchFinancialOverview,
  fetchStockInsight,
  fetchStaffScheduling
} from '@/lib/airtable';
import { 
  transformBookingCapacity, 
  calculateOccupancy, 
  transformCoverTracker,
  generateCoverData,
  createPeakTimeData,
  transformFinancialOverview,
  calculateFinancialMetrics, 
  calculateRevenueBreakdown, 
  transformStockInsight, 
  getLowStockItems, 
  transformStaffScheduling, 
  calculateTotalScheduledHours, 
  generateStaffingForecast 
} from '@/lib/transformData';
import type { CoverData, PeakTimeData } from '@/types/index';

type Data = {
  success: boolean;
  data?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    // Get date from query params or use current date
    const date = req.query.date as string || new Date().toISOString().split('T')[0];
    
    // Fetch all data in parallel for better performance
    const [
      bookingCapacityResponse,
      coverTrackerResponse,
      financialOverviewResponse,
      stockInsightResponse,
      staffSchedulingResponse
    ] = await Promise.all([
      fetchBookingCapacity(),
      fetchCoverTracker(),
      fetchFinancialOverview(),
      fetchStockInsight(),
      fetchStaffScheduling()
    ]);
    
    // Transform data
    const bookingCapacities = transformBookingCapacity(bookingCapacityResponse);
    
    // Get the most recent booking capacity record
    const latestBookingCapacity = bookingCapacities.length > 0 
      ? bookingCapacities.reduce((latest, current) => {
          const latestDate = new Date(latest.date);
          const currentDate = new Date(current.date);
          return currentDate > latestDate ? current : latest;
        })
      : null;
    
    const occupancy = latestBookingCapacity 
      ? calculateOccupancy(latestBookingCapacity)
      : null;
    
    const coverTrackers = transformCoverTracker(coverTrackerResponse);
    
    // Generate cover data for each tracker entry
    const allCoverData: CoverData[] = [];
    const peakTimeData: PeakTimeData[] = [];
    
    coverTrackers.forEach(tracker => {
      const coverData = generateCoverData(tracker);
      allCoverData.push(...coverData);
      
      peakTimeData.push(createPeakTimeData(tracker, coverData));
    });
    
    const financialOverviews = transformFinancialOverview(financialOverviewResponse);
    
    // Get the most recent financial overview
    const latestFinancialOverview = financialOverviews.length > 0 
      ? financialOverviews.reduce((latest, current) => {
          const latestDate = new Date(latest.date);
          const currentDate = new Date(current.date);
          return currentDate > latestDate ? current : latest;
        })
      : null;
    
    const financialMetrics = latestFinancialOverview 
      ? calculateFinancialMetrics(latestFinancialOverview)
      : null;
    
    const revenueBreakdown = latestFinancialOverview
      ? calculateRevenueBreakdown(latestFinancialOverview)
      : [];
    
    const stockItems = transformStockInsight(stockInsightResponse);
    const lowStockItems = getLowStockItems(stockItems);
    
    const staffSchedules = transformStaffScheduling(staffSchedulingResponse);
    const totalScheduledHours = calculateTotalScheduledHours(staffSchedules);
    const staffingForecast = generateStaffingForecast(staffSchedules);
    
    // Return all dashboard data
    res.status(200).json({
      success: true,
      data: {
        bookingCapacities,
        occupancy,
        coverTrackers,
        peakTimeData,
        coverData: allCoverData,
        financialOverviews,
        financialMetrics,
        revenueBreakdown,
        stockItems,
        lowStockItems,
        staffSchedules,
        totalScheduledHours,
        staffingForecast,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard data' 
    });
  }
} 