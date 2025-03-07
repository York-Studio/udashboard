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
  // Define restaurant opening hours
  const openingHour = 11; // 11am
  const closingHour = 23; // 11pm

  // Filter forecasts to only include restaurant opening hours
  const filteredForecasts = forecasts.filter(
    f => f.hour >= openingHour && f.hour <= closingHour
  );
  
  // Sort forecasts by hour
  const sortedForecasts = [...filteredForecasts].sort((a, b) => a.hour - b.hour);
  
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
          autoSkip: true, // Enable autoSkip to show fewer labels
          maxTicksLimit: 6, // Show at most 6 time labels on the x-axis
        },
      },
    },
  };
  
  // Calculate staffing efficiency based on restaurant hours only
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
  
  // Format hour for display with am/pm
  const formatHour = (hour: number) => {
    if (hour === 12) return '12pm';
    if (hour === 0) return '12am';
    return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
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
                    .map(f => `${formatHour(f.hour)}`)
                    .join(', ')
                }
              </p>
            )}
            {sortedForecasts.some(f => f.scheduledStaff > f.recommendedStaff + 1) && (
              <p className="text-warning">
                Overstaffed at: {
                  sortedForecasts
                    .filter(f => f.scheduledStaff > f.recommendedStaff + 1)
                    .map(f => `${formatHour(f.hour)}`)
                    .join(', ')
                }
              </p>
            )}
          </div>
        )}
        
        {/* Staffing Insights */}
        <div className="mt-4 text-xs text-gray-700 p-2 bg-bg-light rounded-lg">
          <p className="font-medium">Insights:</p>
          <p>
            {staffingStatus === 'Optimal' ? 
              `Optimal staffing levels during operating hours with a ${Math.round(staffingEfficiency)}% efficiency ratio.` :
              staffingStatus === 'Understaffed' ? 
              `Understaffed by approximately ${Math.round((totalRecommended - totalScheduled) / totalRecommended * 100)}% during operating hours.` :
              `Overstaffed by approximately ${Math.round((totalScheduled - totalRecommended) / totalRecommended * 100)}% during operating hours.`
            }
            
            {sortedForecasts.length > 0 && ` Peak staffing need at ${
              formatHour(sortedForecasts.reduce((max, current) => 
                current.recommendedStaff > max.recommendedStaff ? current : max
              ).hour)
            } with ${
              sortedForecasts.reduce((max, current) => 
                current.recommendedStaff > max.recommendedStaff ? current : max
              ).recommendedStaff
            } staff recommended.`}
            
            {(() => {
              // Find the hours with the biggest staffing gaps
              const gaps = sortedForecasts.map(f => ({
                hour: f.hour,
                gap: f.recommendedStaff - f.scheduledStaff
              }));
              
              const worstUnderstaffed = gaps.reduce((worst, current) => 
                current.gap > worst.gap ? current : worst, 
                { hour: 0, gap: -Infinity }
              );
              
              const worstOverstaffed = gaps.reduce((worst, current) => 
                current.gap < worst.gap ? current : worst, 
                { hour: 0, gap: Infinity }
              );
              
              if (worstUnderstaffed.gap > 1) {
                return ` Most critical staffing shortage at ${formatHour(worstUnderstaffed.hour)} (${worstUnderstaffed.gap} additional staff needed).`;
              } else if (worstOverstaffed.gap < -1) {
                return ` Significant overstaffing at ${formatHour(worstOverstaffed.hour)} (${Math.abs(worstOverstaffed.gap)} excess staff).`;
              }
              return '';
            })()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffingForecastCard; 