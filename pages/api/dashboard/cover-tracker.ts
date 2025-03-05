import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchCoverTracker } from '@/lib/airtable';
import { transformCoverTracker, generateCoverData, createPeakTimeData } from '@/lib/transformData';
import type { CoverTracker, PeakTimeData, CoverData } from '@/types/index';

type ResponseData = {
  coverTrackers: CoverTracker[];
  peakTimeData: PeakTimeData[];
  coverData: CoverData[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>
) {
  if (req.method === 'GET') {
    try {
      const response = await fetchCoverTracker();
      const coverTrackers = transformCoverTracker(response);
      
      // Generate cover data for each tracker entry
      const allCoverData: CoverData[] = [];
      const peakTimeData: PeakTimeData[] = [];
      
      coverTrackers.forEach(tracker => {
        const coverData = generateCoverData(tracker);
        allCoverData.push(...coverData);
        
        peakTimeData.push(createPeakTimeData(tracker, coverData));
      });
      
      res.status(200).json({
        coverTrackers,
        peakTimeData,
        coverData: allCoverData
      });
    } catch (error) {
      console.error('Error fetching cover tracker data:', error);
      res.status(500).json({ error: 'Failed to fetch cover tracker data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 