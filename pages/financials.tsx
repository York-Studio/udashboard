import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { FaChartLine, FaMoneyBillWave, FaShoppingCart, FaChartPie, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Layout from '@/components/Layout';
import { fetchFinancialOverview } from '@/lib/airtable';
import { 
  transformFinancialOverview, 
  calculateFinancialMetrics,
  formatCurrency
} from '@/lib/transformData';
import type { FinancialMetrics, FinancialOverview } from '@/types/index';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, isWithinInterval, subDays, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type ViewType = 'day' | 'week' | 'month';

const FinancialsPage: NextPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allFinancialData, setAllFinancialData] = useState<FinancialOverview[]>([]);
  const [filteredFinancialData, setFilteredFinancialData] = useState<FinancialOverview[]>([]);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<ViewType>('day');

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const response = await fetchFinancialOverview();
      
      // Transform all financial overview records
      const financialOverviews = transformFinancialOverview(response);
      setAllFinancialData(financialOverviews);
      
      // Filter data based on the selected view and date
      filterFinancialDataByView(financialOverviews, selectedDate, viewType);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching financial data:', err);
      setError('Failed to load financial data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter financial data based on selected view and date
  const filterFinancialDataByView = (data: FinancialOverview[], date: Date, view: ViewType) => {
    let filtered: FinancialOverview[] = [];
    
    switch (view) {
      case 'day':
        // Filter for the selected day
        filtered = data.filter(item => 
          isSameDay(new Date(item.date), date)
        );
        break;
        
      case 'week':
        // Filter for the week containing the selected date
        const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday as start of week
        const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
        
        filtered = data.filter(item => {
          const itemDate = new Date(item.date);
          return isWithinInterval(itemDate, { start: weekStart, end: weekEnd });
        });
        break;
        
      case 'month':
        // Filter for the month containing the selected date
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        
        filtered = data.filter(item => {
          const itemDate = new Date(item.date);
          return isWithinInterval(itemDate, { start: monthStart, end: monthEnd });
        });
        break;
    }
    
    // Sort by date in descending order (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredFinancialData(filtered);
    
    // Calculate aggregated metrics for the filtered data
    calculateAggregatedMetrics(filtered);
  };

  // Calculate aggregated financial metrics for the filtered data
  const calculateAggregatedMetrics = (data: FinancialOverview[]) => {
    if (data.length === 0) {
      setFinancialMetrics(null);
      return;
    }
    
    // Aggregate financial metrics
    const aggregatedMetrics: FinancialMetrics = {
      totalRevenue: data.reduce((sum, item) => sum + item.totalRevenue, 0),
      costOfGoodsSold: data.reduce((sum, item) => sum + item.costOfGoodsSold, 0),
      operatingExpenses: data.reduce((sum, item) => sum + item.operatingExpenses, 0),
      netProfit: data.reduce((sum, item) => sum + item.netProfit, 0)
    };
    
    setFinancialMetrics(aggregatedMetrics);
  };

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
    filterFinancialDataByView(allFinancialData, newDate, viewType);
  };
  
  // Handle view type change
  const handleViewChange = (view: ViewType) => {
    setViewType(view);
    filterFinancialDataByView(allFinancialData, selectedDate, view);
  };
  
  // Navigate to previous period
  const navigateToPrevious = () => {
    let newDate: Date;
    
    switch (viewType) {
      case 'day':
        newDate = subDays(selectedDate, 1);
        break;
      case 'week':
        newDate = subWeeks(selectedDate, 1);
        break;
      case 'month':
        newDate = subMonths(selectedDate, 1);
        break;
      default:
        newDate = selectedDate;
    }
    
    setSelectedDate(newDate);
    filterFinancialDataByView(allFinancialData, newDate, viewType);
  };
  
  // Navigate to next period
  const navigateToNext = () => {
    let newDate: Date;
    
    switch (viewType) {
      case 'day':
        newDate = addDays(selectedDate, 1);
        break;
      case 'week':
        newDate = addWeeks(selectedDate, 1);
        break;
      case 'month':
        newDate = addMonths(selectedDate, 1);
        break;
      default:
        newDate = selectedDate;
    }
    
    setSelectedDate(newDate);
    filterFinancialDataByView(allFinancialData, newDate, viewType);
  };
  
  // Get display text for current view
  const getViewDisplayText = (): string => {
    switch (viewType) {
      case 'day':
        return format(selectedDate, 'EEEE, dd/MM/yyyy');
      case 'week':
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'dd/MM/yyyy')} - ${format(weekEnd, 'dd/MM/yyyy')}`;
      case 'month':
        return format(selectedDate, 'MMMM yyyy');
      default:
        return '';
    }
  };

  const barChartData = {
    labels: ['Revenue', 'COGS', 'Operating Expenses', 'Net Profit'],
    datasets: [
      {
        label: 'Financial Performance',
        data: financialMetrics ? [
          financialMetrics.totalRevenue,
          financialMetrics.costOfGoodsSold,
          financialMetrics.operatingExpenses,
          financialMetrics.netProfit
        ] : [],
        backgroundColor: [
          'rgba(147, 197, 253, 0.7)', // Pastel blue (primary)
          'rgba(196, 181, 253, 0.7)', // Pastel purple (secondary)
          'rgba(165, 243, 252, 0.7)', // Pastel cyan (accent)
          'rgba(134, 239, 172, 0.7)', // Pastel green (success)
        ],
        borderColor: [
          'rgba(147, 197, 253, 1)', // Pastel blue (primary)
          'rgba(196, 181, 253, 1)', // Pastel purple (secondary)
          'rgba(165, 243, 252, 1)', // Pastel cyan (accent)
          'rgba(134, 239, 172, 1)', // Pastel green (success)
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 14,
          }
        }
      },
      title: {
        display: true,
        text: `Financial Performance Overview - ${getViewDisplayText()}`,
        font: {
          size: 18,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: (value: any) => formatCurrency(value),
          font: {
            size: 12,
          }
        },
        title: {
          display: true,
          text: 'Amount (GBP)',
          font: {
            size: 14,
            weight: 'bold' as const,
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12,
            weight: 'bold' as const,
          }
        }
      }
    }
  };

  return (
    <Layout title="Financial Performance">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Financial Dashboard</h1>
        
        {/* View Controls */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* View Type Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 font-medium">View:</span>
            <div className="inline-flex rounded-md shadow-sm">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                  viewType === 'day'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300`}
                onClick={() => handleViewChange('day')}
              >
                Day
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium ${
                  viewType === 'week'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border-t border-b border-gray-300`}
                onClick={() => handleViewChange('week')}
              >
                Week
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                  viewType === 'month'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300`}
                onClick={() => handleViewChange('month')}
              >
                Month
              </button>
            </div>
          </div>
          
          {/* Date Navigation */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={navigateToPrevious}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Previous"
              >
                <FaChevronLeft className="text-gray-600" />
              </button>
              
              <span className="text-gray-700 font-medium">{getViewDisplayText()}</span>
              
              <button
                onClick={navigateToNext}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Next"
              >
                <FaChevronRight className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        ) : filteredFinancialData.length === 0 ? (
          <div className="p-6 bg-gray-50 rounded-lg text-center mb-6">
            <FaChartPie className="mx-auto text-4xl text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-700">No Financial Data Found</h3>
            <p className="text-gray-600 mt-1">
              There is no financial data available for the selected {viewType}.
            </p>
          </div>
        ) : (
          <>
            {/* Financial Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
                  <FaMoneyBillWave className="text-xl text-primary" />
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {financialMetrics && formatCurrency(financialMetrics.totalRevenue)}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">COGS</h3>
                  <FaShoppingCart className="text-xl text-secondary" />
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {financialMetrics && formatCurrency(financialMetrics.costOfGoodsSold)}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Operating Expenses</h3>
                  <FaChartLine className="text-xl text-accent" />
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {financialMetrics && formatCurrency(financialMetrics.operatingExpenses)}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Net Profit</h3>
                  <FaChartPie className="text-xl text-success" />
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {financialMetrics && formatCurrency(financialMetrics.netProfit)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {financialMetrics && (financialMetrics.netProfit / financialMetrics.totalRevenue * 100).toFixed(2)}% margin
                </p>
              </div>
            </div>
            
            {/* Enhanced Financial Overview Chart */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="h-96">
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default FinancialsPage; 