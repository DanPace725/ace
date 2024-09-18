'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const CreateChildProfilePage = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [grade, setGrade] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement child profile creation logic
    console.log({ name, age, grade });
    // After successful creation, redirect to profiles list
    router.push('/admin/profiles');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-8">Create Child Profile</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-gray-300 mb-2">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="age" className="block text-gray-300 mb-2">Age</label>
            <input
              type="number"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="1"
              max="18"
            />
          </div>

          <div>
            <label htmlFor="grade" className="block text-gray-300 mb-2">Grade</label>
            <select
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Grade</option>
              <option value="K">Kindergarten</option>
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>{`Grade ${i + 1}`}</option>
              ))}
            </select>
          </div>
          <div className="flex space-x-4">
            
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-600 text-white p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            >
              Create Child Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChildProfilePage;