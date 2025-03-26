import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MapComponent from '@/components/maps/MapComponent';
import 'leaflet/dist/leaflet.css';

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

interface WaypointInfo {
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
}

interface OrderInfo {
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
}

interface DispatchTrackerProps {
  dispatch: {
    _id: string;
    dispatchNumber: string;
    orders: OrderInfo[];
    courier: CourierInfo;
    status: string;
    route: {
      optimized: boolean;
      waypoints: WaypointInfo[];
      totalDistance?: number;
      totalTime?: number;
    };
    startTime?: string;
    endTime?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  };
  isLoading?: boolean;
}

const DispatchTracker: React.FC<DispatchTrackerProps> = ({ dispatch, isLoading = false }) => {
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // seconds
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [timeRemaining, setTimeRemaining] = useState<number>(refreshInterval);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // Mock function to simulate refreshing data from the server
  const refreshData = () => {
    // In a real app, this would make an API call to get the latest dispatch data
    setLastRefreshed(new Date());
    setTimeRemaining(refreshInterval);
    console.log('Refreshing dispatch data...');
  };

  // Handle auto-refresh countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (autoRefresh && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (autoRefresh && timeRemaining === 0) {
      refreshData();
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [autoRefresh, timeRemaining]);

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

  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    return `${seconds}s`;
  };

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

  // Get waypoint status badge color
  const getWaypointStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'arrived':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'skipped':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get vehicle type icon
  const getVehicleTypeIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'motorcycle':
        return (
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 17h14M5 12h14M5 7h14" />
          </svg>
        );
      case 'car':
        return (
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 5h8m-4 5v-5m4 5v-5" />
          </svg>
        );
      case 'van':
        return (
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        );
      case 'truck':
        return (
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-2 text-gray-500">Loading dispatch tracking...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg overflow-hidden">
      {/* Tracker Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tracking Dispatch #{dispatch.dispatchNumber}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Last updated: {formatDate(lastRefreshed.toISOString())}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeColor(dispatch.status)}`}>
              {dispatch.status.charAt(0).toUpperCase() + dispatch.status.slice(1)}
            </span>
            <button 
              onClick={refreshData}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <div className="flex items-center">
            <input
              id="auto-refresh"
              name="auto-refresh"
              type="checkbox"
              checked={autoRefresh}
              onChange={() => setAutoRefresh(!autoRefresh)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="auto-refresh" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Auto-refresh
            </label>
          </div>
          {autoRefresh && (
            <div className="ml-4 flex items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Refreshing in {formatTimeRemaining(timeRemaining)}</span>
              <select
                value={refreshInterval}
                onChange={(e) => {
                  const newInterval = parseInt(e.target.value);
                  setRefreshInterval(newInterval);
                  setTimeRemaining(newInterval);
                }}
                className="ml-2 block w-24 pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>1m</option>
                <option value={300}>5m</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Map Component */}
        <div className="lg:col-span-2 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          <div className="h-96">
            {dispatch.courier.currentLocation && (
              <MapComponent 
                courierLocation={dispatch.courier.currentLocation.coordinates}
                waypoints={dispatch.route.waypoints.map(waypoint => ({
                  coordinates: waypoint.address.coordinates || { lat: 0, lng: 0 },
                  status: waypoint.status,
                  order: waypoint.order
                }))}
                height="100%"
                width="100%"
              />
            )}
          </div>
        </div>

        {/* Courier Information */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Courier Information</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">{dispatch.courier.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{dispatch.courier.phone}</p>
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex-shrink-0 mr-1.5">
                    {getVehicleTypeIcon(dispatch.courier.vehicleType)}
                  </div>
                  <span className="capitalize">{dispatch.courier.vehicleType}</span>
                  {dispatch.courier.vehicleNumber && (
                    <span className="ml-2 text-gray-400 dark:text-gray-500">({dispatch.courier.vehicleNumber})</span>
                  )}
                </div>
                {dispatch.courier.currentLocation && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Last Updated:</span> {formatDate(dispatch.courier.currentLocation.lastUpdated)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Coordinates:</span> {dispatch.courier.currentLocation.coordinates.lat.toFixed(4)}, {dispatch.courier.currentLocation.coordinates.lng.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Dispatch Summary</h4>
              <dl className="mt-2 divide-y divide-gray-200 dark:divide-gray-800">
                <div className="py-2 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(dispatch.status)}`}>
                      {dispatch.status.charAt(0).toUpperCase() + dispatch.status.slice(1)}
                    </span>
                  </dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Orders:</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{dispatch.orders.length}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Time:</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{formatDate(dispatch.startTime)}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Est. Completion:</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">
                    {dispatch.route.totalTime ? formatDate(new Date(dispatch.startTime ? new Date(dispatch.startTime).getTime() + dispatch.route.totalTime * 60000 : Date.now()).toISOString()) : 'N/A'}
                  </dd>
                </div>
                {dispatch.route.totalDistance && (
                  <div className="py-2 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Distance:</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">{dispatch.route.totalDistance} km</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Progress */}
      <div className="px-6 pb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Delivery Progress</h3>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {dispatch.route.waypoints.map((waypoint, index) => (
              <li key={index} className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    {waypoint.status === 'completed' ? (
                      <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <svg className="h-5 w-5 text-green-600 dark:text-green-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : waypoint.status === 'arrived' ? (
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <svg className="h-5 w-5 text-blue-600 dark:text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                    ) : waypoint.status === 'skipped' ? (
                      <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                        <svg className="h-5 w-5 text-red-600 dark:text-red-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">{index + 1}</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Stop {index + 1}: Order #{waypoint.order}
                      </h4>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getWaypointStatusBadgeColor(waypoint.status)}`}>
                        {waypoint.status.charAt(0).toUpperCase() + waypoint.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <p>{waypoint.address.street}, {waypoint.address.city}, {waypoint.address.state} {waypoint.address.postalCode}</p>
                      <div className="mt-2 flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          <p><span className="font-medium">Estimated Arrival:</span> {formatDate(waypoint.estimatedArrivalTime)}</p>
                          {waypoint.actualArrivalTime && (
                            <p><span className="font-medium">Actual Arrival:</span> {formatDate(waypoint.actualArrivalTime)}</p>
                          )}
                        </div>
                        {waypoint.notes && (
                          <div className="mt-2 sm:mt-0 sm:ml-4">
                            <p><span className="font-medium">Notes:</span> {waypoint.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-6 flex flex-wrap gap-2">
        <Link href={`/dispatches/${dispatch._id}`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View Dispatch Details
        </Link>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1c-1.5 0-2.91-.59-3.97-1.66A10.043 10.043 0 0112 19c-2.22 0-4.3.86-5.87 2.43A7.98 7.98 0 012 16V5z" />
          </svg>
          Contact Courier
        </button>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2h6z" />
          </svg>
          Print Dispatch
        </button>
      </div>
    </div>
  );
};

export default DispatchTracker;