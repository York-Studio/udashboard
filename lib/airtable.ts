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

if (!personalAccessToken) {
  throw new Error('Airtable personal access token is not defined');
}

if (!baseId) {
  throw new Error('Airtable base ID is not defined');
}

const base = new Airtable({ apiKey: personalAccessToken }).base(baseId);

// Define table names matching the user's Airtable base
const BOOKING_CAPACITY_TABLE = 'Booking Capacity Overview';
const COVER_TRACKER_TABLE = 'Cover Tracking';
const FINANCIAL_OVERVIEW_TABLE = 'Financial Overview';
const STAFF_SCHEDULING_TABLE = 'Staff Scheduling';
const STOCK_INSIGHT_TABLE = 'Stock Insights';

// Generic function to fetch records from a table
async function fetchRecords<T>(tableName: string): Promise<AirtableResponse<T>> {
  try {
    const records = await base(tableName).select().all();
    return {
      records: records.map(record => ({
        id: record.id,
        fields: record.fields as unknown as T,
      })),
    };
  } catch (error) {
    console.error(`Error fetching records from ${tableName}:`, error);
    throw error;
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