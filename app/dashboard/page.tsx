'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { fetchManagedProfiles, fetchProfileData, fetchRecentTasks, fetchEarnedRewards } from '@/utils/api/profiles';
import { ManagedProfile, RecentTask, EarnedReward } from '@/types/app';

const Dashboard = () => {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ManagedProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ManagedProfile | null>(null);
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
  const [earnedRewards, setEarnedRewards] = useState<EarnedReward[]>([]);

  useEffect(() => {
    const loadProfiles = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const fetchedProfiles = await fetchManagedProfiles(user.id);
        setProfiles(fetchedProfiles);
        if (fetchedProfiles.length > 0) {
          setSelectedProfile(fetchedProfiles[0]);
        }
      }
    };
    loadProfiles();
  }, []);

  useEffect(() => {
    const loadProfileData = async () => {
      if (selectedProfile) {
        const tasks = await fetchRecentTasks(selectedProfile.id);
        const rewards = await fetchEarnedRewards(selectedProfile.id);
        setRecentTasks(tasks as RecentTask[]);
        setEarnedRewards(rewards as EarnedReward[]);
      }
    };
    loadProfileData();
  }, [selectedProfile]);

  const handleProfileChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const profileId = e.target.value;
    const profile = await fetchProfileData(profileId);
    setSelectedProfile(profile);
  };

  const handleLogTask = () => {
    router.push('/actions');
  };

  if (!selectedProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-4xl bg-gray-800 p-8 rounded-lg shadow-lg">
        {/* User Info Section */}
        <div className="bg-gray-700 p-4 rounded-md shadow-md flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-gray-600 w-16 h-16 rounded-full flex items-center justify-center">
              <span className="text-xl text-white">{selectedProfile.level}</span>
            </div>
            <div className="ml-4 text-white">
              <p>XP: <strong>{selectedProfile.xp}</strong></p>
              <p>Level: <strong>{selectedProfile.level}</strong></p>
            </div>
          </div>
          <div>
            <select 
              className="bg-gray-600 text-white p-2 rounded-md mr-2"
              onChange={handleProfileChange}
              value={selectedProfile.id}
            >
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>{profile.name}</option>
              ))}
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
                <th className="py-2 px-4">XP Earned</th>
              </tr>
            </thead>
            <tbody>
              {recentTasks.map((task: RecentTask) => (
                <tr key={task.id} className="border-t border-gray-600">
                  <td className="py-2 px-4 text-white">{task.actions.name}</td>
                  <td className="py-2 px-4 text-white">{new Date(task.timestamp).toLocaleDateString()}</td>
                  <td className="py-2 px-4">
                    <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {task.base_xp + (task.bonus_xp || 0)} XP
                    </span>
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
              {earnedRewards.map((reward : EarnedReward) => (
                <tr key={reward.id} className="border-t border-gray-600">
                  <td className="py-2 px-4 text-white">{reward.rewards.name}</td>
                  <td className="py-2 px-4 text-white">{new Date(reward.created_at).toLocaleDateString()}</td>
                  <td className="py-2 px-4">
                    {reward.is_claimed ? (
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