import Airtable from 'airtable';
import type { 
  AirtableResponse, 
  BookingCapacityRecord, 
  CoverTrackerRecord, 
  FinancialOverviewRecord,
  StaffSchedulingRecord,
  StockInsightRecord
} from '@/types/index';

// Initialize Airtable with personal access token
const personalAccessToken = process.env.NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN;
const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

// Flag to determine if we're using mock data
const useMockData = !personalAccessToken || !baseId;

// Only initialize Airtable if we have the required credentials
let base: any = null;
if (!useMockData) {
  // Use the personal access token for authentication
  base = new Airtable({ apiKey: personalAccessToken }).base(baseId as string);
}

// Define table names matching the user's Airtable base
const BOOKING_CAPACITY_TABLE = 'Booking Capacity Overview';
const COVER_TRACKER_TABLE = 'Cover Tracking';
const FINANCIAL_OVERVIEW_TABLE = 'Financial Overview';
const STAFF_SCHEDULING_TABLE = 'Staff Scheduling';
const STOCK_INSIGHT_TABLE = 'Stock Insights';

// Mock data for each table
const mockData: Record<string, Array<{id: string, fields: Record<string, any>}>> = {
  [BOOKING_CAPACITY_TABLE]: [
    { id: 'mock1', fields: { 'Date': '2023-06-01', 'Time Slot': '12:00 PM', 'Total Seats': 120, 'Reserved Seats': 80, 'Occupancy Rate': 66.7 } },
    { id: 'mock2', fields: { 'Date': '2023-06-01', 'Time Slot': '6:00 PM', 'Total Seats': 120, 'Reserved Seats': 110, 'Occupancy Rate': 91.7 } },
    { id: 'mock3', fields: { 'Date': '2023-06-02', 'Time Slot': '12:00 PM', 'Total Seats': 120, 'Reserved Seats': 60, 'Occupancy Rate': 50.0 } }
  ],
  [COVER_TRACKER_TABLE]: [
    { id: 'mock1', fields: { 'Date': '2023-06-01', 'Total Covers': 190, 'Walk-ins': 30, 'Reservations': 160, 'Average Party Size': 3.2 } },
    { id: 'mock2', fields: { 'Date': '2023-06-02', 'Total Covers': 175, 'Walk-ins': 25, 'Reservations': 150, 'Average Party Size': 3.0 } }
  ],
  [FINANCIAL_OVERVIEW_TABLE]: [
    { id: 'mock1', fields: { 'Date': '2023-06-01', 'Total Revenue': 8500, 'Revenue Breakdown': { 'Food': 6000, 'Beverage': 2500 }, 'Average Check': 45 } },
    { id: 'mock2', fields: { 'Date': '2023-06-02', 'Total Revenue': 7800, 'Revenue Breakdown': { 'Food': 5500, 'Beverage': 2300 }, 'Average Check': 42 } }
  ],
  [STAFF_SCHEDULING_TABLE]: [
    { id: 'mock1', fields: { 'Date': '2023-06-01', 'Shift': 'Lunch', 'Staff Required': 12, 'Staff Scheduled': 12, 'Staff Present': 11 } },
    { id: 'mock2', fields: { 'Date': '2023-06-01', 'Shift': 'Dinner', 'Staff Required': 15, 'Staff Scheduled': 15, 'Staff Present': 14 } }
  ],
  [STOCK_INSIGHT_TABLE]: [
    { id: 'mock1', fields: { 'Item': 'Ribeye Steak', 'Category': 'Meat', 'Current Stock': 45, 'Reorder Level': 20, 'Status': 'In Stock' } },
    { id: 'mock2', fields: { 'Item': 'House Red Wine', 'Category': 'Beverage', 'Current Stock': 18, 'Reorder Level': 15, 'Status': 'Low Stock' } }
  ]
};

// Generic function to fetch records from a table
async function fetchRecords<T>(tableName: string): Promise<AirtableResponse<T>> {
  try {
    // If using mock data, return the mock data for this table
    if (useMockData) {
      console.log(`Using mock data for ${tableName} (Airtable credentials not provided)`);
      return {
        records: (mockData[tableName] || []).map((record: {id: string, fields: Record<string, any>}) => ({
          id: record.id,
          fields: record.fields as unknown as T,
        })),
      };
    }
    
    // Otherwise, fetch from Airtable
    const records = await base(tableName).select().all();
    return {
      records: records.map((record: any) => ({
        id: record.id,
        fields: record.fields as unknown as T,
      })),
    };
  } catch (error) {
    console.error(`Error fetching records from ${tableName}:`, error);
    // Return empty records array instead of throwing to prevent app from crashing
    return { records: [] };
  }
}

// Fetch booking capacity records
export async function fetchBookingCapacity(): Promise<AirtableResponse<BookingCapacityRecord>> {
  return fetchRecords<BookingCapacityRecord>(BOOKING_CAPACITY_TABLE);
}

// Fetch cover tracker records
export async function fetchCoverTracker(): Promise<AirtableResponse<CoverTrackerRecord>> {
  return fetchRecords<CoverTrackerRecord>(COVER_TRACKER_TABLE);
}

// Fetch financial overview records
export async function fetchFinancialOverview(): Promise<AirtableResponse<FinancialOverviewRecord>> {
  try {
    console.log('Fetching financial overview data from Airtable...');
    const response = await fetchRecords<FinancialOverviewRecord>(FINANCIAL_OVERVIEW_TABLE);
    console.log(`Successfully fetched ${response.records.length} financial overview records`);
    
    // Log the first record for debugging (if available)
    if (response.records.length > 0) {
      console.log('Sample financial record:', {
        id: response.records[0].id,
        date: response.records[0].fields.Date,
        totalRevenue: response.records[0].fields['Total Revenue'],
        revenueBreakdown: response.records[0].fields['Revenue Breakdown']
      });
    } else {
      console.warn('No financial overview records found in Airtable');
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching financial overview data:', error);
    // Return empty records array instead of throwing to prevent app from crashing
    return { records: [] };
  }
}

// Fetch staff scheduling records
export async function fetchStaffScheduling(): Promise<AirtableResponse<StaffSchedulingRecord>> {
  return fetchRecords<StaffSchedulingRecord>(STAFF_SCHEDULING_TABLE);
}

// Fetch stock insight records
export async function fetchStockInsight(): Promise<AirtableResponse<StockInsightRecord>> {
  return fetchRecords<StockInsightRecord>(STOCK_INSIGHT_TABLE);
}

// Function to create a new record in any table
export async function createRecord<T>(tableName: string, fields: T): Promise<{ id: string; fields: T }> {
  try {
    // If using mock data, return a mock response
    if (useMockData) {
      console.log(`Mock creating record in ${tableName} (Airtable credentials not provided)`);
      return {
        id: `mock-${Date.now()}`,
        fields: fields,
      };
    }
    
    // Otherwise, create in Airtable
    const createdRecord = await base(tableName).create([{ fields: fields as any }]);
    return {
      id: createdRecord[0].id,
      fields: createdRecord[0].fields as T,
    };
  } catch (error) {
    console.error(`Error creating record in ${tableName}:`, error);
    throw error;
  }
}

// Function to update a record in any table
export async function updateRecord<T>(tableName: string, id: string, fields: Partial<T>): Promise<{ id: string; fields: T }> {
  try {
    // If using mock data, return a mock response
    if (useMockData) {
      console.log(`Mock updating record in ${tableName} (Airtable credentials not provided)`);
      return {
        id: id,
        fields: fields as T,
      };
    }
    
    // Otherwise, update in Airtable
    const updatedRecord = await base(tableName).update([{ id, fields: fields as any }]);
    return {
      id: updatedRecord[0].id,
      fields: updatedRecord[0].fields as T,
    };
  } catch (error) {
    console.error(`Error updating record in ${tableName}:`, error);
    throw error;
  }
}

// Function to delete a record from any table
export async function deleteRecord(tableName: string, id: string): Promise<{ id: string; deleted: boolean }> {
  try {
    // If using mock data, return a mock response
    if (useMockData) {
      console.log(`Mock deleting record from ${tableName} (Airtable credentials not provided)`);
      return {
        id: id,
        deleted: true,
      };
    }
    
    // Otherwise, delete from Airtable
    const deletedRecord = await base(tableName).destroy([id]);
    return {
      id: deletedRecord[0].id,
      deleted: true,
    };
  } catch (error) {
    console.error(`Error deleting record from ${tableName}:`, error);
    throw error;
  }
} 