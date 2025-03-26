import React from 'react';
import Link from 'next/link';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  weight?: number;
}

interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface DispatchInfo {
  dispatchId?: string;
  dispatchDate?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
}

interface ExceptionDetails {
  type?: string;
  description?: string;
  reportedAt?: string;
  resolvedAt?: string;
  resolution?: string;
}

interface OrderDetailProps {
  order: {
    _id: string;
    orderNumber: string;
    customer: {
      _id: string;
      name: string;
      email: string;
      phone: string;
      address?: Address;
    };
    items: OrderItem[];
    totalAmount: number;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    pickupAddress?: Address;
    deliveryAddress: Address;
    dispatchInfo?: DispatchInfo;
    trackingNumber?: string;
    notes?: string;
    exceptionDetails?: ExceptionDetails;
    createdAt: string;
    updatedAt: string;
  };
  isLoading?: boolean;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order, isLoading = false }) => {
  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'dispatched':
        return 'bg-purple-100 text-purple-800';
      case 'in-transit':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-orange-100 text-orange-800';
      case 'exception':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get payment status badge color
  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
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

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-2 text-gray-500">Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 shadow rounded-lg overflow-hidden">
      {/* Order Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order #{order.orderNumber}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getPaymentStatusBadgeColor(order.paymentStatus)}`}>
              Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
            </span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/orders/${order._id}/edit`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            Edit Order
          </Link>
          {order.status === 'pending' && (
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Process Order
            </button>
          )}
          {(order.status === 'pending' || order.status === 'processing') && (
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
              Dispatch Order
            </button>
          )}
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            Generate Invoice
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            Print Label
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Customer Information */}
        <div className="col-span-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Customer Information</h3>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <p className="font-medium text-gray-900 dark:text-white">{order.customer.name}</p>
            <p>{order.customer.email}</p>
            <p>{order.customer.phone}</p>
            {order.customer.address && (
              <div className="mt-2">
                <p>{order.customer.address.street}</p>
                <p>{order.customer.address.city}, {order.customer.address.state} {order.customer.address.postalCode}</p>
                <p>{order.customer.address.country}</p>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Information */}
        <div className="col-span-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delivery Address</h3>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <p>{order.deliveryAddress.street}</p>
            <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.postalCode}</p>
            <p>{order.deliveryAddress.country}</p>
          </div>

          {order.trackingNumber && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Tracking Number</h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{order.trackingNumber}</p>
            </div>
          )}
        </div>

        {/* Payment Information */}
        <div className="col-span-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Payment Information</h3>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <p><span className="font-medium">Method:</span> {order.paymentMethod.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            <p><span className="font-medium">Status:</span> {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}</p>
            <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">Rs. {order.totalAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Order Items</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Weight</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Rs. {item.price.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.weight ? `${item.weight} kg` : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Rs. {(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 dark:bg-gray-800">
                <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-right">Total:</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">Rs. {order.totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Information */}
      {order.dispatchInfo && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dispatch Information</h3>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {order.dispatchInfo.dispatchId && (
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Dispatch ID</p>
                <p className="text-gray-500 dark:text-gray-400">
                  <Link href={`/dispatches/${order.dispatchInfo.dispatchId}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                    {order.dispatchInfo.dispatchId}
                  </Link>
                </p>
              </div>
            )}
            {order.dispatchInfo.dispatchDate && (
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Dispatch Date</p>
                <p className="text-gray-500 dark:text-gray-400">{formatDate(order.dispatchInfo.dispatchDate)}</p>
              </div>
            )}
            {order.dispatchInfo.estimatedDeliveryDate && (
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Estimated Delivery</p>
                <p className="text-gray-500 dark:text-gray-400">{formatDate(order.dispatchInfo.estimatedDeliveryDate)}</p>
              </div>
            )}
            {order.dispatchInfo.actualDeliveryDate && (
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Actual Delivery</p>
                <p className="text-gray-500 dark:text-gray-400">{formatDate(order.dispatchInfo.actualDeliveryDate)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exception Details */}
      {order.exceptionDetails && order.exceptionDetails.type && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-red-50 dark:bg-red-900/20">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-400">Exception Details</h3>
          <div className="mt-2 text-sm">
            <p><span className="font-medium text-gray-900 dark:text-white">Type:</span> <span className="text-red-700 dark:text-red-400">{order.exceptionDetails.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span></p>
            {order.exceptionDetails.description && (
              <p className="mt-1"><span className="font-medium text-gray-900 dark:text-white">Description:</span> <span className="text-gray-700 dark:text-gray-300">{order.exceptionDetails.description}</span></p>
            )}
            {order.exceptionDetails.reportedAt && (
              <p className="mt-1"><span className="font-medium text-gray-900 dark:text-white">Reported:</span> <span className="text-gray-700 dark:text-gray-300">{formatDate(order.exceptionDetails.reportedAt)}</span></p>
            )}
            {order.exceptionDetails.resolvedAt && (
              <p className="mt-1"><span className="font-medium text-gray-900 dark:text-white">Resolved:</span> <span className="text-gray-700 dark:text-gray-300">{formatDate(order.exceptionDetails.resolvedAt)}</span></p>
            )}
            {order.exceptionDetails.resolution && (
              <p className="mt-1"><span className="font-medium text-gray-900 dark:text-white">Resolution:</span> <span className="text-gray-700 dark:text-gray-300">{order.exceptionDetails.resolution}</span></p>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notes</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{order.notes}</p>
        </div>
      )}

      {/* Order Timeline */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Order Timeline</h3>
        <div className="mt-4 flow-root">
          <ul className="-mb-8">
            <li className="relative pb-8">
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-900">
                    <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">Order created</p>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {formatDate(order.createdAt)}
                  </div>
                </div>
              </div>
            </li>
            {order.status !== 'pending' && (
              <li className="relative pb-8">
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-900">
                      <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">Order processed</p>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {formatDate(order.updatedAt)}
                    </div>
                  </div>
                </div>
              </li>
            )}
            {(order.status === 'dispatched' || order.status === 'in-transit' || order.status === 'delivered') && order.dispatchInfo?.dispatchDate && (
              <li className="relative pb-8">
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-900">
                      <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">Order dispatched</p>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {formatDate(order.dispatchInfo.dispatchDate)}
                    </div>
                  </div>
                </div>
              </li>
            )}
            {order.status === 'delivered' && order.dispatchInfo?.actualDeliveryDate && (
              <li className="relative">
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-900">
                      <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">Order delivered</p>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {formatDate(order.dispatchInfo.actualDeliveryDate)}
                    </div>
                  </div>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;