'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const ManageLevelsPage = () => {
  const [levelName, setLevelName] = useState('');
  const [xpNeeded, setXpNeeded] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ levelName, xpNeeded });
    // Placeholder: In a real app, this would save the data
    alert(`Level created: ${levelName}, XP Needed: ${xpNeeded}`);
  };

  // Placeholder data for existing levels
  const placeholderLevels = [
    { level: 0, xpRequired: 0, cumulativeXP: 0 },
    { level: 1, xpRequired: 100, cumulativeXP: 100 },
    { level: 2, xpRequired: 200, cumulativeXP: 300 },
    { level: 3, xpRequired: 300, cumulativeXP: 600 },
    { level: 4, xpRequired: 400, cumulativeXP: 1000 },
    { level: 5, xpRequired: 500, cumulativeXP: 1500 },
    { level: 6, xpRequired: 600, cumulativeXP: 2100 },
    { level: 7, xpRequired: 700, cumulativeXP: 2800 },
    { level: 8, xpRequired: 800, cumulativeXP: 3600 },
    { level: 9, xpRequired: 900, cumulativeXP: 4500 },
    { level: 10, xpRequired: 1000, cumulativeXP: 5500 },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-300 hover:text-white mr-4"
          >
            ←
          </button>
          <h1 className="text-3xl font-bold text-white">Manage Levels</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <input
            type="text"
            placeholder="Level Name"
            value={levelName}
            onChange={(e) => setLevelName(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            placeholder="XP Needed"
            value={xpNeeded}
            onChange={(e) => setXpNeeded(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          >
            Submit
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300">
            <thead className="text-xs uppercase bg-gray-700">
              <tr>
                <th className="px-4 py-2">Level</th>
                <th className="px-4 py-2">XP Required</th>
                <th className="px-4 py-2">Cumulative XP</th>
              </tr>
            </thead>
            <tbody>
              {placeholderLevels.map((level) => (
                <tr key={level.level} className="border-b border-gray-700">
                  <td className="px-4 py-2">{level.level}</td>
                  <td className="px-4 py-2">{level.xpRequired}</td>
                  <td className="px-4 py-2">{level.cumulativeXP}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageLevelsPage;