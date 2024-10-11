'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import { fetchRewards, createReward, updateReward, deleteReward } from '@/utils/api/rewards';
import { Reward } from '@/types/app';

const ManageRewardsPage = () => {
  const [rewardName, setRewardName] = useState('');
  const [type, setType] = useState('');
  const [cost, setCost] = useState('');
  const [level, setLevel] = useState('');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadRewards = async () => {
      try {
        const data = await fetchRewards();
        setRewards(data);
      } catch (error: unknown) {
        toast.error('Failed to fetch rewards');
        console.error(error);
      }
    };

    loadRewards();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReward) {
        const updated = await updateReward(editingReward.id, { name: rewardName, type, cost, description: level });
        setRewards(rewards.map(r => r.id === editingReward.id ? updated : r));
        setEditingReward(null);
        toast.success('Reward updated successfully');
      } else {
        const newReward = await createReward({ name: rewardName, type, cost, description: level });
        setRewards([...rewards, newReward]);
        toast.success('Reward created successfully');
      }
      setRewardName('');
      setType('');
      setCost('');
      setLevel('');
    } catch (error: unknown) {
      toast.error('Failed to save reward');
      console.error(error);
    }
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setRewardName(reward.name);
    setType(reward.type);
    setCost(reward.cost ?? '');
    setLevel(reward.description ?? '');
  };

  const handleDelete = async (rewardId: string) => {
    if (window.confirm('Are you sure you want to delete this reward?')) {
      try {
        await deleteReward(rewardId);
        setRewards(rewards.filter(r => r.id !== rewardId));
        toast.success('Reward deleted successfully');
      } catch (error: unknown) {
        console.error(error);
        toast.error('Failed to delete reward');
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
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
            {editingReward ? 'Update Reward' : 'Submit'}
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
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((reward) => (
                <tr key={reward.id} className="border-b border-gray-700">
                  <td className="px-4 py-2">{reward.name}</td>
                  <td className="px-4 py-2">{reward.type}</td>
                  <td className="px-4 py-2">{reward.cost || 'null'}</td>
                  <td className="px-4 py-2">{reward.description || 'null'}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleEdit(reward)}
                      className="text-blue-400 hover:text-blue-500 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(reward.id)}
                      className="text-red-400 hover:text-red-500"
                    >
                      Delete
                    </button>
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

export default ManageRewardsPage;