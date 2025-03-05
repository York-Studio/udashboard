import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Layout from '@/components/Layout';
import OccupancyCard from '@/components/OccupancyCard';
import PeakTimeChart from '@/components/PeakTimeChart';
import FinancialMetricsCard from '@/components/FinancialMetricsCard';
import StaffingForecastCard from '@/components/StaffingForecastCard';
import InventoryStatusCard from '@/components/InventoryStatusCard';
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
import { format, isSameDay } from 'date-fns';
import { FaSync, FaCalendarAlt } from 'react-icons/fa';
import { OccupancyData, CoverData, FinancialMetrics, RevenueBreakdown, StockItem, StaffingForecast, PeakTimeData } from '@/types/index';

// Helper function to get the latest version of each inventory item
function getLatestInventoryItems(items: StockItem[]): StockItem[] {
  const latestItems = new Map<string, StockItem>();
  
  items.forEach(item => {
    const existingItem = latestItems.get(item.name);
    
    if (!existingItem || new Date(item.lastUpdated) > new Date(existingItem.lastUpdated)) {
      latestItems.set(item.name, item);
    }
  });
  
  return Array.from(latestItems.values());
}

// Filter out future-dated items
function filterOutFutureItems(items: StockItem[]): StockItem[] {
  const now = new Date();
  return items.filter(item => new Date(item.lastUpdated) <= now);
}

const Dashboard: NextPage = () => {
  // State for dashboard data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // All data states
  const [allBookingCapacities, setAllBookingCapacities] = useState<any[]>([]);
  const [allCoverTrackers, setAllCoverTrackers] = useState<any[]>([]);
  const [allFinancialOverviews, setAllFinancialOverviews] = useState<any[]>([]);
  const [allStockItems, setAllStockItems] = useState<StockItem[]>([]);
  const [allStaffSchedules, setAllStaffSchedules] = useState<any[]>([]);
  
  // Filtered data states
  const [occupancyData, setOccupancyData] = useState<OccupancyData | null>(null);
  const [coverData, setCoverData] = useState<CoverData[]>([]);
  const [peakTimeData, setPeakTimeData] = useState<PeakTimeData[]>([]);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [latestStockItems, setLatestStockItems] = useState<StockItem[]>([]);
  const [staffingForecast, setStaffingForecast] = useState<StaffingForecast[]>([]);
  const [totalScheduledHours, setTotalScheduledHours] = useState(0);
  
  // Function to fetch all dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
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
      
      // Process and store all data
      const bookingCapacities = transformBookingCapacity(bookingCapacityResponse);
      const coverTrackers = transformCoverTracker(coverTrackerResponse);
      const financialOverviews = transformFinancialOverview(financialOverviewResponse);
      const stockItems = transformStockInsight(stockInsightResponse);
      const staffSchedules = transformStaffScheduling(staffSchedulingResponse);
      
      // Store all data
      setAllBookingCapacities(bookingCapacities);
      setAllCoverTrackers(coverTrackers);
      setAllFinancialOverviews(financialOverviews);
      setAllStockItems(filterOutFutureItems(stockItems));
      setAllStaffSchedules(staffSchedules);
      
      // Filter data for selected date
      filterDataForSelectedDate(
        selectedDate,
        bookingCapacities,
        coverTrackers,
        financialOverviews,
        filterOutFutureItems(stockItems),
        staffSchedules
      );
      
      // Update last updated timestamp
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter data for selected date
  const filterDataForSelectedDate = (
    date: Date,
    bookingCapacities: any[] = allBookingCapacities,
    coverTrackers: any[] = allCoverTrackers,
    financialOverviews: any[] = allFinancialOverviews,
    stockItems: StockItem[] = allStockItems,
    staffSchedules: any[] = allStaffSchedules
  ) => {
    // Filter booking capacity data for selected date
    const filteredBookingCapacity = bookingCapacities.find(booking => 
      isSameDay(new Date(booking.date), date)
    );
    
    const occupancy = filteredBookingCapacity 
      ? calculateOccupancy(filteredBookingCapacity)
      : null;
    
    setOccupancyData(occupancy);
    
    // Filter cover tracker data for selected date
    const filteredCoverTracker = coverTrackers.find(tracker => 
      isSameDay(new Date(tracker.date), date)
    );
    
    if (filteredCoverTracker) {
      const trackerCoverData = generateCoverData(filteredCoverTracker);
      setCoverData(trackerCoverData);
      setPeakTimeData([createPeakTimeData(filteredCoverTracker, trackerCoverData)]);
    } else {
      setCoverData([]);
      setPeakTimeData([]);
    }
    
    // Filter financial overview data for selected date
    const filteredFinancialOverview = financialOverviews.find(financial => 
      isSameDay(new Date(financial.date), date)
    );
    
    let metrics = null;
    
    if (filteredFinancialOverview) {
      console.log('Found financial data for selected date:', filteredFinancialOverview);
      metrics = calculateFinancialMetrics(filteredFinancialOverview);
      
      // Log the calculated metrics for debugging
      console.log('Calculated financial metrics:', metrics);
    } else {
      console.log('No financial data found for selected date:', format(date, 'yyyy-MM-dd'));
    }
    
    setFinancialMetrics(metrics);

    // Filter stock items for selected date
    // For stock, we'll show the latest items up to the selected date
    const itemsUpToSelectedDate = stockItems.filter(item => 
      new Date(item.lastUpdated) <= date
    );
    
    const latestItems = getLatestInventoryItems(itemsUpToSelectedDate);
    setStockItems(latestItems);
    setLatestStockItems(latestItems);
    
    // Filter staff scheduling data for selected date
    const filteredStaffSchedules = staffSchedules.filter(schedule => 
      isSameDay(new Date(schedule.shiftStart), date)
    );
    
    const hours = calculateTotalScheduledHours(filteredStaffSchedules);
    const forecast = generateStaffingForecast(filteredStaffSchedules);
    
    setTotalScheduledHours(hours);
    setStaffingForecast(forecast);
  };
  
  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
    filterDataForSelectedDate(newDate);
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  return (
    <Layout title="Restaurant Dashboard">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Restaurant Overview</h1>
        
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mt-4 md:mt-0">
          {/* Date Selector */}
          <div className="flex items-center">
            <label htmlFor="date-selector" className="mr-2 text-gray-700 flex items-center">
              <FaCalendarAlt className="mr-2" />
              Date:
            </label>
            <input
              id="date-selector"
              type="date"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={handleDateChange}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <div className="text-sm text-gray-600">
                Last updated: {lastUpdated.toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}
            
            <button 
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="flex items-center space-x-1 px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50"
            >
              <FaSync className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}
      
      {/* Selected Date Display */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700">
          Data for {format(selectedDate, 'EEEE, dd/MM/yyyy')}
        </h2>
      </div>
      
      {/* Dashboard Content */}
      {isLoading && !occupancyData ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading dashboard data...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Occupancy Card */}
          {occupancyData ? (
            <OccupancyCard occupancyData={occupancyData} />
          ) : (
            <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-center items-center h-64">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Occupancy Data</h3>
              <p className="text-gray-500">No data available for this date</p>
            </div>
          )}
          
          {/* Financial Metrics Card */}
          {financialMetrics ? (
            <FinancialMetricsCard 
              metrics={financialMetrics} 
            />
          ) : (
            <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-center items-center h-64">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Financial Metrics</h3>
              <p className="text-gray-500">No data available for this date</p>
            </div>
          )}
          
          {/* Inventory Status Card */}
          {latestStockItems.length > 0 ? (
            <InventoryStatusCard inventory={latestStockItems} />
          ) : (
            <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-center items-center h-64">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Inventory Status</h3>
              <p className="text-gray-500">No data available for this date</p>
            </div>
          )}
          
          {/* Staffing Forecast Card */}
          {staffingForecast.length > 0 ? (
            <div className="lg:col-span-1">
              <StaffingForecastCard 
                forecasts={staffingForecast} 
                totalScheduledHours={totalScheduledHours} 
              />
            </div>
          ) : (
            <div className="lg:col-span-1 bg-white rounded-lg shadow p-6 flex flex-col justify-center items-center h-64">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Staffing Forecast</h3>
              <p className="text-gray-500">No data available for this date</p>
            </div>
          )}
          
          {/* Peak Time Chart */}
          {peakTimeData.length > 0 ? (
            <div className="lg:col-span-2">
              <PeakTimeChart coverData={coverData} />
            </div>
          ) : (
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 flex flex-col justify-center items-center h-64">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Peak Time Data</h3>
              <p className="text-gray-500">No data available for this date</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default Dashboard; 