import React from 'react';
import { FaUsers, FaInfoCircle } from 'react-icons/fa';
import { OccupancyData } from '@/types/index';
import { formatPercentage } from '@/lib/transformData';

interface OccupancyCardProps {
  occupancyData: OccupancyData;
}

const OccupancyCard: React.FC<OccupancyCardProps> = ({ occupancyData }) => {
  const { totalSeats, bookedSeats, occupancyRate, averageLeadTime } = occupancyData;
  
  // Determine color based on occupancy rate
  const getOccupancyColor = (rate: number) => {
    if (rate < 40) return 'text-primary';
    if (rate < 70) return 'text-success';
    if (rate < 90) return 'text-warning';
    return 'text-danger';
  };
  
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <span>Occupancy Overview</span>
        <FaUsers className="text-primary" />
      </div>
      
      <div className="mt-4">
        {/* Occupancy Gauge */}
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`absolute top-0 left-0 h-full ${getOccupancyColor(occupancyRate).replace('text-', 'bg-')}`}
            style={{ width: `${Math.min(100, occupancyRate)}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
        
        {/* Occupancy Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">{formatPercentage(occupancyRate)}</div>
            <div className="text-sm text-gray-600">Occupancy Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">
              {bookedSeats} / {totalSeats}
            </div>
            <div className="text-sm text-gray-600">Seats Booked</div>
          </div>
        </div>
        
        {/* Lead Time */}
        <div className="mt-6 p-3 bg-bg-light rounded-lg">
          <div className="flex items-center space-x-2">
            <FaInfoCircle className="text-primary" />
            <span className="text-sm font-medium">Average Lead Time</span>
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {averageLeadTime.toFixed(1)} days
          </div>
          <div className="mt-1 text-xs text-gray-600">
            Average time between booking and reservation date
          </div>
        </div>
      </div>
    </div>
  );
};

export default OccupancyCard; 