'use client'

import React from 'react';
import { useRouter } from 'next/navigation';

const AdminPage = () => {
  const router = useRouter();

  const adminActions = [
    { title: 'Manage Users', path: '/admin/users' },
    { title: 'Manage Tasks', path: '/admin/actions' },
    { title: 'Manage Levels', path: '/admin/levels' },
    { title: 'Manage Rewards', path: '/admin/rewards' },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-2 gap-4">
          {adminActions.map((action, index) => (
            <button
              key={index}
              onClick={() => router.push(action.path)}
              className="bg-gray-700 text-white p-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
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