'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { fetchRewards, createReward, updateReward, deleteReward } from '@/utils/api/rewards';
import { Reward } from '@/types/app';

type RewardFormState = {
  name: string;
  type: string;
  cost: string;
  level: string;
};

const emptyRewardForm: RewardFormState = { name: '', type: '', cost: '', level: '' };

const ManageRewardsPage = () => {
  const [rewardForm, setRewardForm] = useState<RewardFormState>(emptyRewardForm);
  const [editForm, setEditForm] = useState<RewardFormState>(emptyRewardForm);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);

    try {
      const newReward = await createReward({
        name: rewardForm.name,
        type: rewardForm.type,
        cost: rewardForm.cost,
        description: rewardForm.level,
      });
      setRewards([...rewards, newReward]);
      setRewardForm(emptyRewardForm);
      toast.success('Reward created successfully');
    } catch (error: unknown) {
      toast.error('Failed to save reward');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setEditForm({
      name: reward.name,
      type: reward.type,
      cost: reward.cost ?? '',
      level: reward.description ?? '',
    });
  };

  const closeEditModal = () => {
    setEditingReward(null);
    setEditForm(emptyRewardForm);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReward) return;

    setIsLoading(true);

    try {
      const updated = await updateReward(editingReward.id, {
        name: editForm.name,
        type: editForm.type,
        cost: editForm.cost,
        description: editForm.level,
      });
      setRewards(rewards.map(r => r.id === editingReward.id ? updated : r));
      closeEditModal();
      toast.success('Reward updated successfully');
    } catch (error: unknown) {
      toast.error('Failed to update reward');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
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
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-gray-400">Admin tools</p>
            <h1 className="text-3xl font-bold text-white">Manage Rewards</h1>
          </div>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="w-full rounded-md bg-gray-700 px-4 py-3 font-medium text-white transition hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 sm:w-auto"
          >
            Back to Admin
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <input
            type="text"
            placeholder="Reward Name"
            value={rewardForm.name}
            onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <select
            value={rewardForm.type}
            onChange={(e) => setRewardForm({ ...rewardForm, type: e.target.value })}
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
            value={rewardForm.cost}
            onChange={(e) => setRewardForm({ ...rewardForm, cost: e.target.value })}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Level"
            value={rewardForm.level}
            onChange={(e) => setRewardForm({ ...rewardForm, level: e.target.value })}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Create Reward'}
            </button>
          </div>
        </form>

        <div className="space-y-3 sm:hidden">
          {rewards.map((reward) => (
            <div key={reward.id} className="rounded-md bg-gray-700 p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-white">{reward.name}</h2>
                  <p className="text-sm text-gray-300">{reward.type}</p>
                </div>
                <span className="shrink-0 text-sm text-gray-300">{reward.cost || 'No cost'}</span>
              </div>
              <p className="mb-3 text-sm text-gray-300">Level: {reward.description || 'None'}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(reward.id)}
                  className="flex-1 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleEdit(reward)}
                  className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto sm:block">
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
                      onClick={() => handleDelete(reward.id)}
                      className="mr-2 text-red-400 hover:text-red-500"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleEdit(reward)}
                      className="text-blue-400 hover:text-blue-500"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingReward && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-4 sm:items-center sm:justify-center">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-reward-title"
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-md bg-gray-800 p-5 shadow-xl"
            >
              <div className="mb-5">
                <p className="text-sm text-gray-400">Edit reward</p>
                <h2 id="edit-reward-title" className="text-2xl font-bold text-white">{editingReward.name}</h2>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <input
                  type="text"
                  placeholder="Reward Name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-md bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  className="w-full rounded-md bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Level">Level</option>
                  <option value="Random">Random</option>
                </select>
                <input
                  type="text"
                  placeholder="Cost"
                  value={editForm.cost}
                  onChange={(e) => setEditForm({ ...editForm, cost: e.target.value })}
                  className="w-full rounded-md bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Level"
                  value={editForm.level}
                  onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                  className="w-full rounded-md bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="rounded-md bg-gray-600 p-3 font-medium text-white transition hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-blue-600 p-3 font-medium text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-600"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRewardsPage;
