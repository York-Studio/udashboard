import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Layout from '@/components/Layout';
import { fetchStockInsight } from '@/lib/airtable';
import { transformStockInsight, getLowStockItems } from '@/lib/transformData';
import { StockItem } from '@/types/index';
import { FaBoxes, FaSearch, FaFilter, FaExclamationTriangle, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

// Helper function to get the latest version of each inventory item
function getLatestInventoryItems(items: StockItem[]): StockItem[] {
  const latestItems = new Map<string, StockItem>();
  
  items.forEach(item => {
    const existingItem = latestItems.get(item.name);
    
    if (!existingItem || new Date(item.lastUpdated) > new Date(existingItem.lastUpdated)) {
      latestItems.set(item.name, item);
    }
  });
  
  return Array.from(latestItems.values());
}

// Filter out future-dated items
function filterOutFutureItems(items: StockItem[]): StockItem[] {
  const now = new Date();
  return items.filter(item => new Date(item.lastUpdated) <= now);
}

type SortField = 'name' | 'category' | 'currentStock' | 'reorderLevel' | 'usageRate' | 'lastUpdated' | 'status';
type SortDirection = 'asc' | 'desc';

const InventoryPage: NextPage = () => {
  const [inventory, setInventory] = useState<StockItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<StockItem[]>([]);
  const [latestInventory, setLatestInventory] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('lastUpdated');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Fetch inventory data
  const fetchInventoryData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchStockInsight();
      const transformedInventory = transformStockInsight(response);
      
      // Filter out future-dated items
      const currentItems = filterOutFutureItems(transformedInventory);
      setInventory(currentItems);
      
      // Calculate latest inventory items
      const latest = getLatestInventoryItems(currentItems);
      setLatestInventory(latest);
      setFilteredInventory(currentItems);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch data when component mounts
  useEffect(() => {
    fetchInventoryData();
  }, []);
  
  // Extract unique categories from inventory
  const categories = ['all', ...Array.from(new Set(latestInventory
    .filter(item => item.category) // Filter out null/undefined categories
    .map(item => item.category)))
  ];
  
  // Handle sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get sort icon for column header
  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return <FaSort className="ml-1 text-gray-400" />;
    return sortDirection === 'asc' ? <FaSortUp className="ml-1 text-gray-700" /> : <FaSortDown className="ml-1 text-gray-700" />;
  };
  
  // Apply filters and sorting when dependencies change
  useEffect(() => {
    let filtered = [...latestInventory];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        (item.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      // Extract values based on sort field
      switch (sortField) {
        case 'name':
          valueA = a.name?.toLowerCase() || '';
          valueB = b.name?.toLowerCase() || '';
          break;
        case 'category':
          valueA = a.category?.toLowerCase() || '';
          valueB = b.category?.toLowerCase() || '';
          break;
        case 'currentStock':
          valueA = a.currentStock;
          valueB = b.currentStock;
          break;
        case 'reorderLevel':
          valueA = a.reorderLevel;
          valueB = b.reorderLevel;
          break;
        case 'usageRate':
          valueA = a.usageRate;
          valueB = b.usageRate;
          break;
        case 'lastUpdated':
          valueA = new Date(a.lastUpdated).getTime();
          valueB = new Date(b.lastUpdated).getTime();
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        default:
          valueA = a.name?.toLowerCase() || '';
          valueB = b.name?.toLowerCase() || '';
      }
      
      // Compare values based on direction
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredInventory(filtered);
  }, [searchTerm, categoryFilter, statusFilter, latestInventory, sortField, sortDirection]);
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Layout title="Inventory">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
        <p className="text-gray-600 mt-1">Track and manage restaurant inventory levels</p>
      </div>
      
      {/* Low Stock Alert */}
      {!isLoading && latestInventory.length > 0 && (
        <div className="mb-6">
          {latestInventory.filter(item => 
            item.status === 'Low Stock' || 
            item.status === 'Out of Stock'
          ).length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-600 mb-2">
                <FaExclamationTriangle className="mr-2" />
                <span className="font-medium">Low Stock Alert</span>
              </div>
              <p className="text-sm text-red-600">
                {latestInventory.filter(item => 
                  item.status === 'Low Stock' || 
                  item.status === 'Out of Stock'
                ).length} items are running low or out of stock and need to be reordered.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Inventory Stats */}
      {!isLoading && inventory.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Total Items</div>
            <div className="text-2xl font-bold">{latestInventory.length}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">In Stock</div>
            <div className="text-2xl font-bold text-green-600">
              {latestInventory.filter(item => item.status === 'In Stock').length}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Low Stock</div>
            <div className="text-2xl font-bold text-yellow-600">
              {latestInventory.filter(item => item.status === 'Low Stock').length}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">Out of Stock</div>
            <div className="text-2xl font-bold text-red-600">
              {latestInventory.filter(item => item.status === 'Out of Stock').length}
            </div>
          </div>
        </div>
      )}
      
      {/* Filters and Search */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}
      
      {/* Inventory Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading inventory...</div>
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="p-6 bg-gray-50 rounded-lg text-center">
          <FaBoxes className="mx-auto text-4xl text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-700">No Inventory Items Found</h3>
          <p className="text-gray-600 mt-1">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'There are no inventory items in the system.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Item Name
                    {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    {getSortIcon('category')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('currentStock')}
                >
                  <div className="flex items-center">
                    Current Stock
                    {getSortIcon('currentStock')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('reorderLevel')}
                >
                  <div className="flex items-center">
                    Reorder Level
                    {getSortIcon('reorderLevel')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('usageRate')}
                >
                  <div className="flex items-center">
                    Usage Rate
                    {getSortIcon('usageRate')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('lastUpdated')}
                >
                  <div className="flex items-center">
                    Last Updated
                    {getSortIcon('lastUpdated')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {getSortIcon('status')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name || 'Unnamed Item'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.category || 'Uncategorized'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.currentStock ?? 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.reorderLevel ?? 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.usageRate ? `${item.usageRate}/day` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status || 'Unknown')}`}>
                      {item.status || 'Unknown'}
                    </span>
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

export default InventoryPage; 