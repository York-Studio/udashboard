import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Layout from '@/components/Layout';
import { fetchBookingCapacity } from '@/lib/airtable';
import { transformBookingCapacity, formatDate } from '@/lib/transformData';
import { BookingCapacity } from '@/types/index';
import { FaCalendarAlt, FaUserFriends, FaCheck, FaClock, FaBan, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, isWithinInterval, subDays, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';

type ViewType = 'day' | 'week' | 'month';

const BookingsPage: NextPage = () => {
  const [bookingCapacities, setBookingCapacities] = useState<BookingCapacity[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingCapacity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<ViewType>('day');
  
  // Fetch booking capacity data
  const fetchBookingCapacityData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchBookingCapacity();
      const transformedBookings = transformBookingCapacity(response);
      setBookingCapacities(transformedBookings);
      filterBookingsByView(transformedBookings, selectedDate, viewType);
    } catch (err) {
      console.error('Error fetching booking capacity:', err);
      setError('Failed to load booking data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter bookings based on selected view and date
  const filterBookingsByView = (bookings: BookingCapacity[], date: Date, view: ViewType) => {
    let filtered: BookingCapacity[] = [];
    
    switch (view) {
      case 'day':
        // Filter for the selected day
        filtered = bookings.filter(booking => 
          isSameDay(new Date(booking.date), date)
        );
        break;
        
      case 'week':
        // Filter for the week containing the selected date
        const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday as start of week
        const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
        
        filtered = bookings.filter(booking => {
          const bookingDate = new Date(booking.date);
          return isWithinInterval(bookingDate, { start: weekStart, end: weekEnd });
        });
        break;
        
      case 'month':
        // Filter for the month containing the selected date
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        
        filtered = bookings.filter(booking => {
          const bookingDate = new Date(booking.date);
          return isWithinInterval(bookingDate, { start: monthStart, end: monthEnd });
        });
        break;
    }
    
    // Sort by date in descending order, then by time slot
    filtered.sort((a, b) => {
      // First compare dates in descending order
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      
      // If dates are the same, compare time slots
      if (dateComparison === 0) {
        // Extract hours from time slots for comparison
        const getHour = (timeSlot: string) => {
          const match = timeSlot.match(/(\d+)(?::(\d+))?\s*(am|pm)?/i);
          if (!match) return 0;
          
          let hour = parseInt(match[1]);
          const isPM = match[3]?.toLowerCase() === 'pm';
          
          // Convert to 24-hour format
          if (isPM && hour !== 12) hour += 12;
          if (!isPM && hour === 12) hour = 0;
          
          return hour;
        };
        
        return getHour(a.timeSlot) - getHour(b.timeSlot);
      }
      
      return dateComparison;
    });
    
    setFilteredBookings(filtered);
  };
  
  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
    filterBookingsByView(bookingCapacities, newDate, viewType);
  };
  
  // Handle view type change
  const handleViewChange = (view: ViewType) => {
    setViewType(view);
    filterBookingsByView(bookingCapacities, selectedDate, view);
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
    filterBookingsByView(bookingCapacities, newDate, viewType);
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
    filterBookingsByView(bookingCapacities, newDate, viewType);
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
  
  // Fetch data when component mounts
  useEffect(() => {
    fetchBookingCapacityData();
  }, []);
  
  // Get status color based on occupancy rate
  const getOccupancyStatusColor = (occupancyRate: number) => {
    if (occupancyRate >= 80) return 'text-red-500';
    if (occupancyRate >= 50) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  return (
    <Layout title="Booking Capacity">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Booking Capacity</h1>
      </div>
      
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
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}
      
      {/* Booking Capacity List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading booking data...</div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-6 bg-gray-50 rounded-lg text-center">
          <FaCalendarAlt className="mx-auto text-4xl text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-700">No Booking Data Found</h3>
          <p className="text-gray-600 mt-1">
            There is no booking capacity data for the selected {viewType}.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                  <span className="ml-1 text-primary">▼</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Slot
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seats Available
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seats Booked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Occupancy Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatDate(booking.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.timeSlot}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.seatsAvailable}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <FaUserFriends className="mr-2 text-primary" />
                      {booking.seatsBooked}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${getOccupancyStatusColor(booking.occupancyRate)}`}>
                        {booking.occupancyRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.averageLeadTime} hours
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {booking.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default BookingsPage; 