import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { format, parseISO, isToday, isSameDay } from 'date-fns';
import { FaUsersCog, FaUserClock, FaCalendarAlt } from 'react-icons/fa';
import Layout from '@/components/Layout';
import { fetchStaffScheduling } from '@/lib/airtable';
import { 
  transformStaffScheduling,
  calculateTotalScheduledHours, 
  generateStaffingForecast 
} from '@/lib/transformData';
import type { StaffSchedule, StaffingForecast } from '@/types/index';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StaffPage: NextPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allStaffSchedules, setAllStaffSchedules] = useState<StaffSchedule[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<StaffSchedule[]>([]);
  const [staffingForecast, setStaffingForecast] = useState<StaffingForecast[]>([]);
  const [totalScheduledHours, setTotalScheduledHours] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  useEffect(() => {
    fetchStaffData();
  }, []);
  
  // Filter schedules when selectedDate changes
  useEffect(() => {
    if (allStaffSchedules.length > 0) {
      filterSchedulesByDate();
    }
  }, [selectedDate, allStaffSchedules]);
  
  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const response = await fetchStaffScheduling();
      
      const schedules = transformStaffScheduling(response);
      setAllStaffSchedules(schedules);
      
      // Initial filtering will happen in the useEffect
      setError(null);
    } catch (err) {
      console.error('Error fetching staff data:', err);
      setError('Failed to load staff data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const filterSchedulesByDate = () => {
    // Filter schedules for the selected date
    const schedulesForDate = allStaffSchedules.filter(schedule => {
      const shiftDate = new Date(schedule.shiftStart);
      return isSameDay(shiftDate, selectedDate);
    });
    
    // Sort by role in ascending alphabetical order
    const sortedSchedules = [...schedulesForDate].sort((a, b) => 
      a.role.localeCompare(b.role)
    );
    
    setFilteredSchedules(sortedSchedules);
    
    // Generate forecast based on filtered schedules
    const forecast = generateStaffingForecast(sortedSchedules);
    setStaffingForecast(forecast);
    
    // Calculate total hours for filtered schedules
    const totalHours = calculateTotalScheduledHours(sortedSchedules);
    setTotalScheduledHours(totalHours);
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };
  
  const formatDateTime = (dateTimeStr: string): string => {
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateTimeStr;
    }
  };
  
  const formatHour = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${period}`;
  };
  
  const getRoleColor = (role: string): string => {
    const roleColors: { [key: string]: string } = {
      'Chef': 'bg-primary',
      'Sous Chef': 'bg-primary bg-opacity-80',
      'Server': 'bg-secondary',
      'Host': 'bg-accent',
      'Bartender': 'bg-secondary bg-opacity-80',
      'Manager': 'bg-success',
      'Busser': 'bg-gray-400'
    };
    
    return roleColors[role] || 'bg-gray-400';
  };
  
  const forecastChartData = {
    labels: staffingForecast.map(item => formatHour(item.hour)),
    datasets: [
      {
        label: 'Scheduled Staff',
        data: staffingForecast.map(item => item.scheduledStaff),
        backgroundColor: 'rgba(147, 197, 253, 0.7)', // Pastel blue (primary)
      },
      {
        label: 'Recommended Staff',
        data: staffingForecast.map(item => item.recommendedStaff),
        backgroundColor: 'rgba(196, 181, 253, 0.7)', // Pastel purple (secondary)
      },
      {
        label: 'Forecasted Covers (÷10)',
        data: staffingForecast.map(item => item.forecastedCovers / 10),
        backgroundColor: 'rgba(165, 243, 252, 0.7)', // Pastel cyan (accent)
      }
    ],
  };
  
  return (
    <Layout title="Staff Scheduling">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
          
          {/* Date Selector */}
          <div className="mt-4 md:mt-0 flex items-center">
            <label htmlFor="date-selector" className="mr-2 text-gray-700 flex items-center">
              <FaCalendarAlt className="mr-2" />
              Select Date:
            </label>
            <input
              id="date-selector"
              type="date"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={handleDateChange}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-danger bg-opacity-10 border-l-4 border-danger text-danger p-4 mb-6">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Staff Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-card-bg rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Staff on Shift</h3>
                  <FaUsersCog className="text-xl text-primary" />
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {filteredSchedules.length}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {format(selectedDate, 'EEEE, dd/MM/yyyy')}
                </p>
              </div>
              
              <div className="bg-card-bg rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Total Hours Scheduled</h3>
                  <FaUserClock className="text-xl text-secondary" />
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {totalScheduledHours}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {format(selectedDate, 'EEEE, dd/MM/yyyy')}
                </p>
              </div>
              
              <div className="bg-card-bg rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Average Hours per Staff</h3>
                  <FaCalendarAlt className="text-xl text-accent" />
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {filteredSchedules.length > 0 ? (totalScheduledHours / filteredSchedules.length).toFixed(1) : 0}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {format(selectedDate, 'EEEE, dd/MM/yyyy')}
                </p>
              </div>
            </div>
            
            {/* Staffing Forecast Chart */}
            <div className="bg-card-bg rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-6">
                Staffing Forecast for {format(selectedDate, 'EEEE, dd/MM/yyyy')}
              </h3>
              {staffingForecast.length > 0 ? (
                <div className="h-80">
                  <Bar 
                    data={forecastChartData} 
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Number of Staff / Covers (÷10)'
                          }
                        }
                      }
                    }} 
                  />
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 bg-bg-light rounded-lg">
                  <p className="text-gray-500">No staffing data available for this date</p>
                </div>
              )}
            </div>
            
            {/* Staff Schedule Table */}
            <div className="bg-card-bg rounded-lg shadow-sm overflow-hidden">
              <h3 className="text-lg font-semibold text-gray-700 p-6 border-b">
                Staff Schedule for {format(selectedDate, 'EEEE, dd/MM/yyyy')}
              </h3>
              {filteredSchedules.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-bg-light">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift Start</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift End</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forecasted Covers</th>
                      </tr>
                    </thead>
                    <tbody className="bg-card-bg divide-y divide-gray-200">
                      {filteredSchedules.map((staff) => (
                        <tr key={staff.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {staff.staffName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-800 ${getRoleColor(staff.role)}`}>
                              {staff.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateTime(staff.shiftStart)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateTime(staff.shiftEnd)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {staff.scheduledHours}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {staff.role === 'Chef' ? '-' : staff.forecastedCovers}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No staff scheduled for this date
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default StaffPage; 