'use client';

import React from 'react';
import DispatchList from '@/components/dispatches/DispatchList';
import Link from 'next/link';

export default function DispatchesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dispatches</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage and monitor all courier dispatches
        </p>
      </div>
      
      <DispatchList />
    </div>
  );
}