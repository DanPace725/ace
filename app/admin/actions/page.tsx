'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PublicImage from '@/app/components/PublicImage';

const ManageTasksPage = () => {
  const [taskName, setTaskName] = useState('');
  const [xpPerTask, setXpPerTask] = useState('');
  const [frequency, setFrequency] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ taskName, xpPerTask, frequency });
    // Placeholder: In a real app, this would save the data
    alert(`Task created: ${taskName}, XP: ${xpPerTask}, Frequency: ${frequency}`);
  };

  // Placeholder data for existing tasks
  const placeholderTasks = [
    { id: 1, name: 'Clean Room', xp: 50, frequency: 'Daily' },
    { id: 2, name: 'Do Homework', xp: 75, frequency: 'Weekdays' },
    { id: 3, name: 'Read a Book', xp: 100, frequency: 'Weekly' },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-lg relative">
        <div className="absolute top-4 right-4">
          <PublicImage
            src="logo1.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-300 hover:text-white mr-4"
          >
            ←
          </button>
          <h1 className="text-3xl font-bold text-white">Manage Tasks</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <input
            type="text"
            placeholder="Task Name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            placeholder="XP per Task"
            value={xpPerTask}
            onChange={(e) => setXpPerTask(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full bg-gray-600 text-white p-2 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            >
              Create Task
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300">
            <thead className="text-xs uppercase bg-gray-700">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Task Name</th>
                <th className="px-4 py-2">XP</th>
                <th className="px-4 py-2">Frequency</th>
              </tr>
            </thead>
            <tbody>
              {placeholderTasks.map((task) => (
                <tr key={task.id} className="border-b border-gray-700">
                  <td className="px-4 py-2">{task.id}</td>
                  <td className="px-4 py-2">{task.name}</td>
                  <td className="px-4 py-2">{task.xp}</td>
                  <td className="px-4 py-2">{task.frequency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageTasksPage;