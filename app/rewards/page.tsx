'use client'

import React from 'react';

const Rewards = () => {
  

  // Mock user data - replace with actual data fetching logic
  const user = {
    name: "John Doe",
    unclaimedRewards: [
      { id: 1, reward: "Special Badge", date: "2024-08-25" },
      { id: 2, reward: "10% Discount", date: "2024-09-05" },
    ],
    claimedRewards: [
      { id: 3, reward: "Free Coffee", date: "2024-08-28" },
      { id: 4, reward: "Extra Break", date: "2024-09-01" },
    ]
  };

  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-4xl bg-gray-800 p-8 rounded-lg shadow-lg">
        {/* User Info Section */}
        <div className="bg-gray-700 p-4 rounded-md shadow-md flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="ml-4 text-white">
              <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
            </div>
          </div>
          <div>
          </div>
        </div>

        {/* Unclaimed Rewards Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Unclaimed Rewards</h2>
          <table className="w-full bg-gray-700 rounded-lg shadow-md overflow-hidden">
            <thead>
              <tr className="bg-gray-600 text-left text-white">
                <th className="py-2 px-4">Reward</th>
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {user.unclaimedRewards.map(reward => (
                <tr key={reward.id} className="border-t border-gray-600">
                  <td className="py-2 px-4 text-white">{reward.reward}</td>
                  <td className="py-2 px-4 text-white">{reward.date}</td>
                  <td className="py-2 px-4">
                    <button className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700">
                      Claim
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Claimed Rewards Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-white">Claimed Rewards</h2>
          <table className="w-full bg-gray-700 rounded-lg shadow-md overflow-hidden">
            <thead>
              <tr className="bg-gray-600 text-left text-white">
                <th className="py-2 px-4">Reward</th>
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {user.claimedRewards.map(reward => (
                <tr key={reward.id} className="border-t border-gray-600">
                  <td className="py-2 px-4 text-white">{reward.reward}</td>
                  <td className="py-2 px-4 text-white">{reward.date}</td>
                  <td className="py-2 px-4">
                    <span className="text-green-400">Claimed</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
