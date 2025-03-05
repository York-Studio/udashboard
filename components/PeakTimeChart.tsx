import React from 'react';
import { Line } from 'react-chartjs-2';
import { FaChartLine } from 'react-icons/fa';
import { CoverData } from '@/types/index';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
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
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PeakTimeChartProps {
  coverData: CoverData[];
  title?: string;
}

const PeakTimeChart: React.FC<PeakTimeChartProps> = ({ 
  coverData, 
  title = 'Peak Time Analysis' 
}) => {
  // Sort data by hour
  const sortedData = [...coverData].sort((a, b) => a.hour - b.hour);
  
  // Prepare data for Chart.js
  const data = {
    labels: sortedData.map(item => `${item.hour}:00`),
    datasets: [
      {
        label: 'Covers',
        data: sortedData.map(item => item.covers),
        borderColor: '#93c5fd', // Pastel blue (primary)
        backgroundColor: 'rgba(147, 197, 253, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };
  
  // Chart options
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (items) => {
            if (items.length > 0) {
              return `Time: ${items[0].label}`;
            }
            return '';
          },
          label: (context) => {
            return `Covers: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: false,
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
      x: {
        title: {
          display: false,
        },
        ticks: {
          font: {
            size: 10,
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
      },
    },
  };
  
  // Find peak time (hour with most covers)
  const peakHour = sortedData.reduce(
    (max, current) => (current.covers > max.covers ? current : max),
    { hour: 0, covers: 0 }
  );
  
  // Calculate average covers
  const totalCovers = sortedData.reduce((sum, item) => sum + item.covers, 0);
  const averageCovers = totalCovers / sortedData.length || 0;
  
  return (
    <div className="dashboard-card dashboard-card-wide">
      <div className="dashboard-card-header">
        <span>{title}</span>
        <FaChartLine className="text-primary" />
      </div>
      
      <div className="mt-2">
        {/* Chart */}
        <div className="h-40">
          <Line data={data} options={options} />
        </div>
        
        {/* Stats and Insights */}
        <div className="mt-3">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="p-2 bg-bg-light rounded-lg">
              <div className="text-xs font-medium text-gray-700">Peak Time</div>
              <div className="text-lg font-bold">{peakHour.hour}:00 ({peakHour.covers} covers)</div>
            </div>
            
            <div className="p-2 bg-bg-light rounded-lg">
              <div className="text-xs font-medium text-gray-700">Average Covers</div>
              <div className="text-lg font-bold">{Math.round(averageCovers)} per hour</div>
            </div>
          </div>
          
          <div className="text-xs text-gray-700 p-2 bg-bg-light rounded-lg">
            <p className="font-medium">Insights:</p>
            <p>
              {peakHour.covers > averageCovers * 1.5
                ? `Strong peak at ${peakHour.hour}:00 with ${peakHour.covers} covers, ${Math.round(
                    (peakHour.covers / averageCovers - 1) * 100
                  )}% above average.`
                : `Relatively even distribution with slight peak at ${peakHour.hour}:00.`}
              {peakHour.hour >= 17 && peakHour.hour <= 21
                ? " Dinner service is busiest."
                : peakHour.hour >= 11 && peakHour.hour <= 14
                ? " Lunch service shows highest traffic."
                : " Unusual peak time detected."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeakTimeChart; 