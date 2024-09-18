'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const LogTask = () => {
  const [task, setTask] = useState('');
  const [date, setDate] = useState('');
  const [bonusXP, setBonusXP] = useState('');
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to handle form submission goes here
    console.log({ task, date, bonusXP });
    // TODO: Implement task logging logic
  };

  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-lg">
        {/* User Info Section */}
        <div className="bg-gray-700 p-4 rounded-md shadow-md flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-gray-600 w-16 h-16 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white">2</span>
            </div>
            <div className="ml-4 text-white">
              <p>XP needed for next level: <strong>150</strong></p>
            </div>
          </div>
          <div>
            <select className="bg-gray-600 text-white p-2 rounded-md mr-2">
              <option>Name</option>
            </select>
          </div>
        </div>

        {/* Log Task Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Log Task</h2>

          <div>
            <label htmlFor="task" className="block text-gray-300 mb-2">Task</label>
            <input
              type="text"
              id="task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Enter task"
              className="w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-gray-300 mb-2">Date</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="bonusXP" className="block text-gray-300 mb-2">Bonus XP</label>
            <input
              type="number"
              id="bonusXP"
              value={bonusXP}
              onChange={(e) => setBonusXP(e.target.value)}
              placeholder="Enter bonus XP"
              className="w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
              onClick={() => router.push('/dashboard')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogTask;