import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchStockInsight } from '@/lib/airtable';
import { transformStockInsight, getLowStockItems } from '@/lib/transformData';
import type { StockItem } from '@/types/index';

type ResponseData = {
  stockItems: StockItem[];
  lowStockAlerts: StockItem[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>
) {
  if (req.method === 'GET') {
    try {
      const response = await fetchStockInsight();
      const stockItems = transformStockInsight(response);
      
      // Get low stock items for alerts
      const lowStockAlerts = getLowStockItems(stockItems);
      
      res.status(200).json({
        stockItems,
        lowStockAlerts
      });
    } catch (error) {
      console.error('Error fetching stock insight data:', error);
      res.status(500).json({ error: 'Failed to fetch stock insight data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 