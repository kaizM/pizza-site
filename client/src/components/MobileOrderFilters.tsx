import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, Search, X } from 'lucide-react';

interface Order {
  id: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  status: string;
  orderType: string;
  total: number;
  createdAt: string;
}

interface MobileOrderFiltersProps {
  orders: Order[];
  onFilteredOrders: (orders: Order[]) => void;
}

export default function MobileOrderFilters({ orders, onFilteredOrders }: MobileOrderFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState('all');

  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customerInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.phone.includes(searchTerm) ||
        order.id.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(order => order.orderType === typeFilter);
    }

    // Price range filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(order => {
        if (max) {
          return order.total >= min && order.total <= max;
        }
        return order.total >= min;
      });
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.total - a.total);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.total - b.total);
        break;
    }

    onFilteredOrders(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setSortBy('newest');
    setPriceRange('all');
    onFilteredOrders(orders);
  };

  const activeFiltersCount = [
    searchTerm,
    statusFilter !== 'all',
    typeFilter !== 'all',
    sortBy !== 'newest',
    priceRange !== 'all'
  ].filter(Boolean).length;

  return (
    <div className="p-4 bg-white border-b">
      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search orders, customers, phone..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            // Real-time search
            setTimeout(applyFilters, 300);
          }}
          className="pl-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              applyFilters();
            }}
            className="absolute right-2 top-2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Sheet */}
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-orange-500 text-xs p-0 flex items-center justify-center">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filter Orders</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Order Type Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Order Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="highest">Highest Amount</SelectItem>
                    <SelectItem value="lowest">Lowest Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">Price Range</label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="0-25">$0 - $25</SelectItem>
                    <SelectItem value="25-50">$25 - $50</SelectItem>
                    <SelectItem value="50-100">$50 - $100</SelectItem>
                    <SelectItem value="100">$100+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button onClick={applyFilters} className="flex-1">
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={clearFilters} className="flex-1">
                  Clear All
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Quick Status Filters */}
        <div className="flex gap-1 overflow-x-auto">
          <Button
            variant={statusFilter === 'confirmed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setStatusFilter(statusFilter === 'confirmed' ? 'all' : 'confirmed');
              setTimeout(applyFilters, 100);
            }}
          >
            New
          </Button>
          <Button
            variant={statusFilter === 'preparing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setStatusFilter(statusFilter === 'preparing' ? 'all' : 'preparing');
              setTimeout(applyFilters, 100);
            }}
          >
            Preparing
          </Button>
          <Button
            variant={statusFilter === 'ready' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setStatusFilter(statusFilter === 'ready' ? 'all' : 'ready');
              setTimeout(applyFilters, 100);
            }}
          >
            Ready
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-sm text-gray-600">Active filters:</span>
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {searchTerm}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  setSearchTerm('');
                  applyFilters();
                }}
              />
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {statusFilter}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  setStatusFilter('all');
                  applyFilters();
                }}
              />
            </Badge>
          )}
          {typeFilter !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {typeFilter}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  setTypeFilter('all');
                  applyFilters();
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}