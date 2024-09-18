'use client'

import React from 'react';
import { useRouter } from 'next/navigation';


const Dashboard = () => {
  const router = useRouter();
  

  const user = {
    level: 2,
    xpNeeded: 150,
    nextReward: "Special Badge",
    recentTasks: [
      { id: 1, task: "Finish project report", date: "2024-09-01", reward: "10 XP" },
      { id: 2, task: "Daily workout", date: "2024-09-02", reward: "5 XP" },
    ],
    earnedRewards: [
      { id: 1, reward: "Special Badge", date: "2024-08-25", claimed: false },
      { id: 2, reward: "Free Coffee", date: "2024-08-28", claimed: true },
    ]
  };

 

  // Function to go to the Log Task page
  const handleLogTask = () => {
    router.push('/actions');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-4xl bg-gray-800 p-8 rounded-lg shadow-lg">
        {/* User Info Section */}
        <div className="bg-gray-700 p-4 rounded-md shadow-md flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-gray-600 w-16 h-16 rounded-full flex items-center justify-center">
              <span className="text-xl text-white">{user.level}</span>
            </div>
            <div className="ml-4 text-white">
              <p>XP needed for next level: <strong>{user.xpNeeded}</strong></p>
              <p>Next Level Reward: <strong>{user.nextReward}</strong></p>
            </div>
          </div>
          <div>
            <select className="bg-gray-600 text-white p-2 rounded-md mr-2">
              <option>Name</option>
            </select>
            <button onClick={handleLogTask} className="bg-blue-600 text-white px-4 py-2 rounded-md mr-2 hover:bg-blue-700">
              Log New Task
            </button>
          </div>
        </div>

        {/* Recent Tasks Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Recent Tasks</h2>
          <table className="w-full bg-gray-700 rounded-lg shadow-md overflow-hidden">
            <thead>
              <tr className="bg-gray-600 text-left text-white">
                <th className="py-2 px-4">Task</th>
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Reward</th>
              </tr>
            </thead>
            <tbody>
              {user.recentTasks.map(task => (
                <tr key={task.id} className="border-t border-gray-600">
                  <td className="py-2 px-4 text-white">{task.task}</td>
                  <td className="py-2 px-4 text-white">{task.date}</td>
                  <td className="py-2 px-4">
                    <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs">{task.reward}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Earned Rewards Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-white">Earned Rewards</h2>
          <table className="w-full bg-gray-700 rounded-lg shadow-md overflow-hidden">
            <thead>
              <tr className="bg-gray-600 text-left text-white">
                <th className="py-2 px-4">Reward</th>
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Claim</th>
              </tr>
            </thead>
            <tbody>
              {user.earnedRewards.map(reward => (
                <tr key={reward.id} className="border-t border-gray-600">
                  <td className="py-2 px-4 text-white">{reward.reward}</td>
                  <td className="py-2 px-4 text-white">{reward.date}</td>
                  <td className="py-2 px-4">
                    {reward.claimed ? (
                      <span className="text-green-400">Claimed</span>
                    ) : (
                      <input type="checkbox" className="bg-gray-500 border-gray-400 text-blue-600 focus:ring-blue-500" />
                    )}
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

export default Dashboard;