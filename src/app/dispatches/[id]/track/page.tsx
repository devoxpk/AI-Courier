'use client';

import React, { useState, useEffect } from 'react';
import DispatchTracker from '@/components/dispatches/DispatchTracker';
import Link from 'next/link';

interface TrackDispatchPageProps {
  params: {
    id: string;
  };
}

export default function TrackDispatchPage({ params }: TrackDispatchPageProps) {
  const { id } = params;
  const [dispatch, setDispatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would be an API call
    // Simulating API call with setTimeout
    setLoading(true);
    setTimeout(() => {
      // Mock data for demonstration
      const mockDispatch = {
        _id: id,
        dispatchNumber: `DSP-${id.slice(0, 6)}-${id.slice(-3)}`,
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
      };

      setDispatch(mockDispatch);
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-500">Loading dispatch tracking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
          <h2 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h2>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
          <div className="mt-4">
            <Link href="/dispatches" className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-500">
              &larr; Back to Dispatches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center">
          <Link href={`/dispatches/${id}`} className="mr-4 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
            &larr; Back to Dispatch Details
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dispatch Tracking</h1>
        </div>
      </div>
      
      {dispatch && <DispatchTracker dispatch={dispatch} />}
    </div>
  );
}