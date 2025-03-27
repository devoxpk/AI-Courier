'use client';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    orderBook: 0,
    confirmed: 0,
    unassigned: 55,
    onHold: 0,
    packaging: 3,
    readyForShipment: 4,
    shipmentPicked: 0,
    shipperWarehouse: 0,
    deliveryInTransit: 0,
    deliveryInProcess: 0,
    deliveryAttempted: 0,
    advicePending: 0,
    delivered: 174,
    returned: 34
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Stats cards */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-blue-500 rounded-md p-3">
                    {/* Icon */}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Unassigned Orders
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.unassigned}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          {/* Add more stat cards similarly */}
        </div>

        <div className="mt-8">
          <div className="flex justify-end space-x-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
              Create Order
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded-md">
              Bulk Upload
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}