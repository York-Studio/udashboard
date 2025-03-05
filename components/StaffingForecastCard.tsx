import React from 'react';
import { Chart } from 'react-chartjs-2';
import { FaUsers } from 'react-icons/fa';
import { StaffingForecast } from '@/types/index';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StaffingForecastCardProps {
  forecasts: StaffingForecast[];
  totalScheduledHours: number;
}

const StaffingForecastCard: React.FC<StaffingForecastCardProps> = ({ 
  forecasts, 
  totalScheduledHours 
}) => {
  // Sort forecasts by hour
  const sortedForecasts = [...forecasts].sort((a, b) => a.hour - b.hour);
  
  // Prepare data for Chart.js
  const chartData = {
    labels: sortedForecasts.map(item => `${item.hour}:00`),
    datasets: [
      {
        label: 'Scheduled',
        data: sortedForecasts.map(item => item.scheduledStaff),
        backgroundColor: 'rgba(147, 197, 253, 0.7)', // primary color (pastel blue)
        borderColor: 'rgba(147, 197, 253, 1)',
        borderWidth: 1,
        yAxisID: 'y',
        type: 'bar' as const,
      },
      {
        label: 'Recommended',
        data: sortedForecasts.map(item => item.recommendedStaff),
        type: 'line' as const,
        backgroundColor: 'rgba(252, 165, 165, 0.7)', // danger color (pastel red)
        borderColor: 'rgba(252, 165, 165, 1)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        yAxisID: 'y',
      },
    ],
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 10,
          font: {
            size: 10,
          },
        },
      },
      tooltip: {
        callbacks: {
          title: (items: any) => {
            if (items.length > 0) {
              return `Time: ${items[0].label}`;
            }
            return '';
          },
        },
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: false,
        },
        ticks: {
          font: {
            size: 10,
          },
        },
        min: 0,
        max: Math.max(
          ...sortedForecasts.map(f => Math.max(f.scheduledStaff, f.recommendedStaff))
        ) + 1,
      },
      x: {
        ticks: {
          font: {
            size: 10,
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6,
        },
      },
    },
  };
  
  // Calculate staffing efficiency
  const totalScheduled = sortedForecasts.reduce((sum, item) => sum + item.scheduledStaff, 0);
  const totalRecommended = sortedForecasts.reduce((sum, item) => sum + item.recommendedStaff, 0);
  const staffingEfficiency = totalRecommended > 0 
    ? (totalScheduled / totalRecommended) * 100 
    : 100;
  
  // Determine if understaffed or overstaffed
  const staffingStatus = staffingEfficiency < 90 
    ? 'Understaffed' 
    : staffingEfficiency > 110 
      ? 'Overstaffed' 
      : 'Optimal';
  
  // Determine status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Understaffed': return 'text-danger';
      case 'Overstaffed': return 'text-warning';
      default: return 'text-success';
    }
  };
  
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <span>Staff Scheduling</span>
        <FaUsers className="text-primary" />
      </div>
      
      <div className="mt-2">
        <div className="h-48">
          <Chart type="bar" data={chartData} options={chartOptions} />
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="p-2 bg-bg-light rounded-lg">
            <div className="text-xs font-medium text-gray-700">Scheduled Hours</div>
            <div className="text-lg font-bold">{totalScheduledHours}</div>
          </div>
          
          <div className="p-2 bg-bg-light rounded-lg">
            <div className="text-xs font-medium text-gray-700">Status</div>
            <div className={`text-lg font-bold ${getStatusColor(staffingStatus)}`}>
              {staffingStatus} ({Math.round(staffingEfficiency)}%)
            </div>
          </div>
        </div>
        
        {(sortedForecasts.some(f => f.scheduledStaff < f.recommendedStaff) || 
          sortedForecasts.some(f => f.scheduledStaff > f.recommendedStaff + 1)) && (
          <div className="mt-2 text-xs text-gray-700">
            {sortedForecasts.some(f => f.scheduledStaff < f.recommendedStaff) && (
              <p className="text-danger">
                Need more staff at: {
                  sortedForecasts
                    .filter(f => f.scheduledStaff < f.recommendedStaff)
                    .map(f => `${f.hour}:00`)
                    .join(', ')
                }
              </p>
            )}
            {sortedForecasts.some(f => f.scheduledStaff > f.recommendedStaff + 1) && (
              <p className="text-warning">
                Overstaffed at: {
                  sortedForecasts
                    .filter(f => f.scheduledStaff > f.recommendedStaff + 1)
                    .map(f => `${f.hour}:00`)
                    .join(', ')
                }
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffingForecastCard; 