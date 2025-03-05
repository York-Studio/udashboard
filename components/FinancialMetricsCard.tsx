import React from 'react';
import { FaChartPie, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { FinancialMetrics } from '@/types/index';
import { formatCurrency, formatPercentage } from '@/lib/transformData';

interface FinancialMetricsCardProps {
  metrics: FinancialMetrics;
  previousPeriodProfit?: number;
}

const FinancialMetricsCard: React.FC<FinancialMetricsCardProps> = ({ 
  metrics, 
  previousPeriodProfit 
}) => {
  const { totalRevenue, costOfGoodsSold, operatingExpenses, netProfit } = metrics;
  
  // Calculate profit margin
  const profitMargin = (netProfit / totalRevenue) * 100;
  
  // Calculate profit change if previous period data is available
  const profitChange = previousPeriodProfit 
    ? ((netProfit - previousPeriodProfit) / previousPeriodProfit) * 100 
    : null;
  
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <span>Financial Performance</span>
        <FaChartPie className="text-primary" />
      </div>
      
      <div className="mt-4">
        {/* Key Metrics */}
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-bg-light rounded-lg">
              <div className="text-sm font-medium text-gray-700">Revenue</div>
              <div className="text-xl font-bold mt-1">{formatCurrency(totalRevenue)}</div>
            </div>
            
            <div className="p-3 bg-bg-light rounded-lg">
              <div className="text-sm font-medium text-gray-700">COGS</div>
              <div className="text-xl font-bold mt-1">{formatCurrency(costOfGoodsSold)}</div>
            </div>
            
            <div className="p-3 bg-bg-light rounded-lg">
              <div className="text-sm font-medium text-gray-700">Operating Expenses</div>
              <div className="text-xl font-bold mt-1">{formatCurrency(operatingExpenses)}</div>
            </div>
            
            <div className="p-3 bg-bg-light rounded-lg">
              <div className="text-sm font-medium text-gray-700">Profit Margin</div>
              <div className="text-xl font-bold mt-1">{formatPercentage(profitMargin)}</div>
            </div>
          </div>
          
          {/* Net Profit */}
          <div className="mt-4 p-4 bg-primary bg-opacity-90 text-gray-800 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">Net Profit</div>
              {profitChange !== null && (
                <div className={`flex items-center text-sm ${profitChange >= 0 ? 'text-success' : 'text-danger'}`}>
                  {profitChange >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                  {Math.abs(profitChange).toFixed(1)}%
                </div>
              )}
            </div>
            <div className="text-2xl font-bold mt-1">{formatCurrency(netProfit)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialMetricsCard; 