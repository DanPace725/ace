'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const ManageRewardsPage = () => {
  const [rewardName, setRewardName] = useState('');
  const [type, setType] = useState('');
  const [cost, setCost] = useState('');
  const [level, setLevel] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ rewardName, type, cost, level });
    // Placeholder: In a real app, this would save the data
    alert(`Reward created: ${rewardName}, Type: ${type}, Cost: ${cost}, Level: ${level}`);
  };

  // Placeholder data for existing rewards
  const placeholderRewards = [
    { reward: 'Stuffed Animal', type: 'Level', cost: null, level: 'Level 3' },
    { reward: 'Piece of Candy', type: 'Random', cost: 'Content', level: null },
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
          <h1 className="text-3xl font-bold text-white">Manage Rewards</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <input
            type="text"
            placeholder="Reward Name"
            value={rewardName}
            onChange={(e) => setRewardName(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Type</option>
            <option value="Level">Level</option>
            <option value="Random">Random</option>
          </select>
          <input
            type="text"
            placeholder="Cost"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <th className="px-4 py-2">Reward</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Cost</th>
                <th className="px-4 py-2">Level</th>
              </tr>
            </thead>
            <tbody>
              {placeholderRewards.map((reward, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="px-4 py-2">{reward.reward}</td>
                  <td className="px-4 py-2">{reward.type}</td>
                  <td className="px-4 py-2">{reward.cost || 'null'}</td>
                  <td className="px-4 py-2">{reward.level || 'null'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageRewardsPage;