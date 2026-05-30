'use client'

import React from 'react';
import { useRouter } from 'next/navigation';

const AdminPage = () => {
  const router = useRouter();

  const adminActions = [
    { title: 'Manage Profiles', path: '/admin/app_users' },
    { title: 'Manage Tasks', path: '/admin/actions' },
    { title: 'Review Queue', path: '/admin/review-queue' },
    { title: 'Manage Levels', path: '/admin/levels' },
    { title: 'Manage Rewards', path: '/admin/rewards' },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-md bg-gray-800 p-5 shadow-lg sm:p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Admin</h1>
        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {adminActions.map((action, index) => (
            <button
              key={index}
              onClick={() => router.push(action.path)}
              className="rounded-md bg-gray-700 p-4 text-left font-medium text-white transition hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {action.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
