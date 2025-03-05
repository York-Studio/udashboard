import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchFinancialOverview } from '@/lib/airtable';
import { 
  transformFinancialOverview, 
  calculateFinancialMetrics,
  calculateRevenueBreakdown
} from '@/lib/transformData';
import type { FinancialOverview, FinancialMetrics, RevenueBreakdown } from '@/types/index';

type ResponseData = {
  financialOverviews: FinancialOverview[];
  financialMetrics: FinancialMetrics | null;
  revenueBreakdown: RevenueBreakdown[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>
) {
  if (req.method === 'GET') {
    try {
      const response = await fetchFinancialOverview();
      const financialOverviews = transformFinancialOverview(response);
      
      // Calculate financial metrics for the most recent overview
      const latestOverview = financialOverviews.length > 0 
        ? financialOverviews.reduce((latest, current) => {
            const latestDate = new Date(latest.date);
            const currentDate = new Date(current.date);
            return currentDate > latestDate ? current : latest;
          })
        : null;
      
      const financialMetrics = latestOverview 
        ? calculateFinancialMetrics(latestOverview)
        : null;
      
      const revenueBreakdown = latestOverview
        ? calculateRevenueBreakdown(latestOverview)
        : [];
      
      res.status(200).json({
        financialOverviews,
        financialMetrics,
        revenueBreakdown
      });
    } catch (error) {
      console.error('Error fetching financial overview data:', error);
      res.status(500).json({ error: 'Failed to fetch financial overview data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 