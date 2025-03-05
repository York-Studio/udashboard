import React from 'react';
import { FaBoxes, FaExclamationTriangle } from 'react-icons/fa';
import { StockItem } from '@/types/index';

interface InventoryStatusCardProps {
  inventory: StockItem[];
  lowStockThreshold?: number;
}

const InventoryStatusCard: React.FC<InventoryStatusCardProps> = ({ 
  inventory,
  lowStockThreshold = 3 // Default threshold for low stock alerts
}) => {
  // Group inventory by status
  const inStock = inventory.filter(item => item.status === 'In Stock');
  const lowStock = inventory.filter(item => item.status === 'Low Stock');
  const outOfStock = inventory.filter(item => item.status === 'Out of Stock');
  
  // Get items that need immediate attention (out of stock or very low)
  const criticalItems = inventory.filter(
    item => item.status === 'Out of Stock' || 
    (item.status === 'Low Stock' && item.currentStock <= lowStockThreshold)
  );
  
  // Calculate inventory health percentage
  const inventoryHealthPercentage = (inStock.length / inventory.length) * 100;
  
  // Get status color based on inventory health
  const getHealthColor = (percentage: number) => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-danger';
  };
  
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <span>Inventory Status</span>
        <FaBoxes className="text-primary" />
      </div>
      
      <div className="mt-4">
        {/* Inventory Health Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-bg-light rounded-lg text-center">
            <div className="text-sm font-medium text-gray-700">In Stock</div>
            <div className="text-2xl font-bold mt-1 text-success">{inStock.length}</div>
          </div>
          
          <div className="p-3 bg-bg-light rounded-lg text-center">
            <div className="text-sm font-medium text-gray-700">Low Stock</div>
            <div className="text-2xl font-bold mt-1 text-warning">{lowStock.length}</div>
          </div>
          
          <div className="p-3 bg-bg-light rounded-lg text-center">
            <div className="text-sm font-medium text-gray-700">Out of Stock</div>
            <div className="text-2xl font-bold mt-1 text-danger">{outOfStock.length}</div>
          </div>
        </div>
        
        {/* Inventory Health Indicator */}
        <div className="mt-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Inventory Health</span>
            <span className={`text-sm font-bold ${getHealthColor(inventoryHealthPercentage)}`}>
              {inventoryHealthPercentage.toFixed(1)}%
            </span>
          </div>
          
          <div className="mt-2 relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full ${
                getHealthColor(inventoryHealthPercentage).replace('text-', 'bg-')
              }`}
              style={{ width: `${inventoryHealthPercentage}%` }}
            ></div>
          </div>
        </div>
        
        {/* Critical Items Alert */}
        {criticalItems.length > 0 && (
          <div className="mt-6 p-4 bg-danger bg-opacity-10 border border-danger border-opacity-20 rounded-lg">
            <div className="flex items-center text-danger mb-2">
              <FaExclamationTriangle className="mr-2" />
              <span className="font-medium">Items Requiring Attention</span>
            </div>
            
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {criticalItems.map(item => (
                <li key={item.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-600 ml-2">({item.category})</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`font-bold ${
                      item.status === 'Out of Stock' ? 'text-danger' : 'text-warning'
                    }`}>
                      {item.currentStock}
                    </span>
                    <span className="text-gray-500 ml-2">/ {item.reorderLevel} min</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Usage Rate Analysis */}
        <div className="mt-6">
          <div className="text-sm font-medium text-gray-700 mb-2">Inventory Insights</div>
          <div className="text-sm text-gray-600">
            {lowStock.length > 0 ? (
              <p>
                {lowStock.length} items are running low and should be reordered soon. 
                {outOfStock.length > 0 && ` ${outOfStock.length} items are currently out of stock.`}
              </p>
            ) : (
              <p>Inventory levels are healthy with no items requiring immediate attention.</p>
            )}
            
            {/* Most used item insight */}
            {inventory.length > 0 && (
              <p className="mt-2">
                Highest usage item: <span className="font-medium">
                  {inventory.reduce((max, item) => 
                    item.usageRate > max.usageRate ? item : max
                  ).name}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryStatusCard; 