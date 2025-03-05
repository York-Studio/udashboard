import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchStaffScheduling } from '@/lib/airtable';
import { 
  transformStaffScheduling, 
  calculateTotalScheduledHours,
  generateStaffingForecast
} from '@/lib/transformData';
import type { StaffSchedule, StaffingForecast } from '@/types/index';

type ResponseData = {
  staffSchedules: StaffSchedule[];
  totalScheduledHours: number;
  staffingForecast: StaffingForecast[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>
) {
  if (req.method === 'GET') {
    try {
      const response = await fetchStaffScheduling();
      const staffSchedules = transformStaffScheduling(response);
      
      // Calculate total scheduled hours
      const totalScheduledHours = calculateTotalScheduledHours(staffSchedules);
      
      // Generate staffing forecast
      const staffingForecast = generateStaffingForecast(staffSchedules);
      
      res.status(200).json({
        staffSchedules,
        totalScheduledHours,
        staffingForecast
      });
    } catch (error) {
      console.error('Error fetching staff scheduling data:', error);
      res.status(500).json({ error: 'Failed to fetch staff scheduling data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 