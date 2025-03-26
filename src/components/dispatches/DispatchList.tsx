import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface CourierInfo {
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber?: string;
  currentLocation?: {
    coordinates: {
      lat: number;
      lng: number;
    };
    lastUpdated: string;
  };
}

interface RouteInfo {
  optimized: boolean;
  waypoints: Array<{
    order: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    estimatedArrivalTime?: string;
    actualArrivalTime?: string;
    status: string;
    notes?: string;
  }>;
  totalDistance?: number;
  totalTime?: number;
}

interface DispatchItem {
  _id: string;
  dispatchNumber: string;
  orders: Array<{
    _id: string;
    orderNumber: string;
    status: string;
    deliveryAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    customer?: {
      name: string;
      phone: string;
    };
  }>;
  courier: CourierInfo;
  status: string;
  route: RouteInfo;
  startTime?: string;
  endTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface DispatchListProps {
  initialDispatches?: DispatchItem[];
  isLoading?: boolean;
}

const DispatchList: React.FC<DispatchListProps> = ({ initialDispatches = [], isLoading = false }) => {
  const [dispatches, setDispatches] = useState<DispatchItem[]>(initialDispatches);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [loading, setLoading] = useState(isLoading);

  // Mock data for demonstration
  useEffect(() => {
    if (initialDispatches.length === 0 && !isLoading) {
      setLoading(true);
      // In a real app, this would be an API call
      setTimeout(() => {
        const mockDispatches = [
          {
            _id: '1',
            dispatchNumber: 'DSP-123456-789',
            orders: [
              {
                _id: '101',
                orderNumber: 'ORD-123456-789',
                status: 'dispatched',
                deliveryAddress: {
                  street: '123 Main St',
                  city: 'Karachi',
                  state: 'Sindh',
                  postalCode: '74000',
                  country: 'Pakistan'
                },
                customer: {
                  name: 'John Doe',
                  phone: '+92 300 1234567'
                }
              },
              {
                _id: '102',
                orderNumber: 'ORD-234567-890',
                status: 'dispatched',
                deliveryAddress: {
                  street: '456 Park Ave',
                  city: 'Karachi',
                  state: 'Sindh',
                  postalCode: '74100',
                  country: 'Pakistan'
                },
                customer: {
                  name: 'Jane Smith',
                  phone: '+92 300 7654321'
                }
              }
            ],
            courier: {
              name: 'Ahmed Khan',
              phone: '+92 300 1111222',
              vehicleType: 'motorcycle',
              vehicleNumber: 'ABC-123',
              currentLocation: {
                coordinates: {
                  lat: 24.8607,
                  lng: 67.0011
                },
                lastUpdated: '2023-03-15T10:45:00Z'
              }
            },
            status: 'in-progress',
            route: {
              optimized: true,
              waypoints: [
                {
                  order: '101',
                  address: {
                    street: '123 Main St',
                    city: 'Karachi',
                    state: 'Sindh',
                    postalCode: '74000',
                    country: 'Pakistan',
                    coordinates: {
                      lat: 24.8607,
                      lng: 67.0011
                    }
                  },
                  estimatedArrivalTime: '2023-03-15T11:30:00Z',
                  status: 'pending',
                  notes: ''
                },
                {
                  order: '102',
                  address: {
                    street: '456 Park Ave',
                    city: 'Karachi',
                    state: 'Sindh',
                    postalCode: '74100',
                    country: 'Pakistan',
                    coordinates: {
                      lat: 24.8506,
                      lng: 67.0104
                    }
                  },
                  estimatedArrivalTime: '2023-03-15T12:15:00Z',
                  status: 'pending',
                  notes: ''
                }
              ],
              totalDistance: 8.5,
              totalTime: 45
            },
            startTime: '2023-03-15T10:30:00Z',
            endTime: '',
            notes: '',
            createdAt: '2023-03-15T09:00:00Z',
            updatedAt: '2023-03-15T10:30:00Z'
          },
          {
            _id: '2',
            dispatchNumber: 'DSP-234567-890',
            orders: [
              {
                _id: '103',
                orderNumber: 'ORD-345678-901',
                status: 'dispatched',
                deliveryAddress: {
                  street: '789 Ocean Blvd',
                  city: 'Lahore',
                  state: 'Punjab',
                  postalCode: '54000',
                  country: 'Pakistan'
                },
                customer: {
                  name: 'Robert Johnson',
                  phone: '+92 300 9876543'
                }
              }
            ],
            courier: {
              name: 'Bilal Ahmed',
              phone: '+92 300 3333444',
              vehicleType: 'car',
              vehicleNumber: 'XYZ-789',
              currentLocation: {
                coordinates: {
                  lat: 31.5204,
                  lng: 74.3587
                },
                lastUpdated: '2023-03-15T11:15:00Z'
              }
            },
            status: 'completed',
            route: {
              optimized: true,
              waypoints: [
                {
                  order: '103',
                  address: {
                    street: '789 Ocean Blvd',
                    city: 'Lahore',
                    state: 'Punjab',
                    postalCode: '54000',
                    country: 'Pakistan',
                    coordinates: {
                      lat: 31.5204,
                      lng: 74.3587
                    }
                  },
                  estimatedArrivalTime: '2023-03-15T11:00:00Z',
                  actualArrivalTime: '2023-03-15T10:55:00Z',
                  status: 'completed',
                  notes: 'Delivered to customer directly'
                }
              ],
              totalDistance: 5.2,
              totalTime: 25
            },
            startTime: '2023-03-15T10:30:00Z',
            endTime: '2023-03-15T11:00:00Z',
            notes: 'Delivery completed ahead of schedule',
            createdAt: '2023-03-15T09:30:00Z',
            updatedAt: '2023-03-15T11:00:00Z'
          },
          {
            _id: '3',
            dispatchNumber: 'DSP-345678-901',
            orders: [
              {
                _id: '104',
                orderNumber: 'ORD-456789-012',
                status: 'dispatched',
                deliveryAddress: {
                  street: '101 Tech Park',
                  city: 'Islamabad',
                  state: 'Federal',
                  postalCode: '44000',
                  country: 'Pakistan'
                },
                customer: {
                  name: 'Sarah Williams',
                  phone: '+92 300 3456789'
                }
              },
              {
                _id: '105',
                orderNumber: 'ORD-567890-123',
                status: 'dispatched',
                deliveryAddress: {
                  street: '202 Blue Area',
                  city: 'Islamabad',
                  state: 'Federal',
                  postalCode: '44000',
                  country: 'Pakistan'
                },
                customer: {
                  name: 'Michael Brown',
                  phone: '+92 300 8765432'
                }
              }
            ],
            courier: {
              name: 'Zainab Ali',
              phone: '+92 300 5555666',
              vehicleType: 'van',
              vehicleNumber: 'LMN-456',
              currentLocation: {
                coordinates: {
                  lat: 33.6844,
                  lng: 73.0479
                },
                lastUpdated: '2023-03-15T10:00:00Z'
              }
            },
            status: 'pending',
            route: {
              optimized: true,
              waypoints: [
                {
                  order: '104',
                  address: {
                    street: '101 Tech Park',
                    city: 'Islamabad',
                    state: 'Federal',
                    postalCode: '44000',
                    country: 'Pakistan',
                    coordinates: {
                      lat: 33.6844,
                      lng: 73.0479
                    }
                  },
                  estimatedArrivalTime: '2023-03-15T14:00:00Z',
                  status: 'pending',
                  notes: ''
                },
                {
                  order: '105',
                  address: {
                    street: '202 Blue Area',
                    city: 'Islamabad',
                    state: 'Federal',
                    postalCode: '44000',
                    country: 'Pakistan',
                    coordinates: {
                      lat: 33.7294,
                      lng: 73.0931
                    }
                  },
                  estimatedArrivalTime: '2023-03-15T14:45:00Z',
                  status: 'pending',
                  notes: ''
                }
              ],
              totalDistance: 12.3,
              totalTime: 60
            },
            startTime: '',
            endTime: '',
            notes: 'Scheduled for afternoon delivery',
            createdAt: '2023-03-15T08:00:00Z',
            updatedAt: '2023-03-15T08:00:00Z'
          }
        ];

        setDispatches(mockDispatches);
        setTotalPages(1);
        setLoading(false);
      }, 1000);
    }
  }, [initialDispatches, isLoading]);

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // In a real app, this would trigger an API call with debounce
  };

  // Handle status filter change
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    // In a real app, this would trigger an API call
  };

  // Handle sort
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    // In a real app, this would trigger an API call
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // In a real app, this would trigger an API call
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-2 text-gray-500">Loading dispatches...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg overflow-hidden">
      {/* Filters and Search */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
              </div>
              <input
                type="search"
                className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search dispatches..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Link href="/dispatches/create" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Dispatch
            </Link>
          </div>
        </div>
      </div>

      {/* Dispatch List */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('dispatchNumber')}
              >
                Dispatch #
                {sortField === 'dispatchNumber' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                Status
                {sortField === 'status' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Orders
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Courier
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('createdAt')}
              >
                Created
                {sortField === 'createdAt' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {dispatches.length > 0 ? (
              dispatches.map((dispatch) => (
                <tr key={dispatch._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    <Link href={`/dispatches/${dispatch._id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                      {dispatch.dispatchNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(dispatch.status)}`}>
                      {dispatch.status.charAt(0).toUpperCase() + dispatch.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col">
                      <span>{dispatch.orders.length} orders</span>
                      <div className="text-xs mt-1">
                        {dispatch.orders.slice(0, 2).map((order, index) => (
                          <div key={order._id} className="truncate">
                            {order.orderNumber}
                          </div>
                        ))}
                        {dispatch.orders.length > 2 && (
                          <div className="text-gray-400">+{dispatch.orders.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col">
                      <span>{dispatch.courier.name}</span>
                      <span className="text-xs">{dispatch.courier.phone}</span>
                      <span className="text-xs capitalize">{dispatch.courier.vehicleType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(dispatch.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link href={`/dispatches/${dispatch._id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                        View
                      </Link>
                      <Link href={`/dispatches/${dispatch._id}/track`} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                        Track
                      </Link>
                      {dispatch.status !== 'completed' && dispatch.status !== 'cancelled' && (
                        <Link href={`/dispatches/${dispatch._id}/edit`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                          Edit
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No dispatches found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * 10, dispatches.length)}
                  </span>{' '}
                  of <span className="font-medium">{dispatches.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchList;