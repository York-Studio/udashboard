import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchBookingCapacity } from '@/lib/airtable';
import { transformBookingCapacity, calculateOccupancy } from '@/lib/transformData';
import type { BookingCapacity, OccupancyData } from '@/types/index';

type ResponseData = {
  bookingCapacities: BookingCapacity[];
  occupancyData: OccupancyData | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>
) {
  if (req.method === 'GET') {
    try {
      const response = await fetchBookingCapacity();
      const bookingCapacities = transformBookingCapacity(response);
      
      // Calculate occupancy data for the most recent booking
      const latestBooking = bookingCapacities.length > 0 
        ? bookingCapacities.reduce((latest, current) => {
            const latestDate = new Date(latest.date);
            const currentDate = new Date(current.date);
            return currentDate > latestDate ? current : latest;
          })
        : null;
      
      const occupancyData = latestBooking 
        ? calculateOccupancy(latestBooking)
        : null;
      
      res.status(200).json({
        bookingCapacities,
        occupancyData
      });
    } catch (error) {
      console.error('Error fetching booking capacity data:', error);
      res.status(500).json({ error: 'Failed to fetch booking capacity data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 