'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchEarnedRewards } from '@/utils/api/profiles';
import { fetchUnclaimedRewards, fetchClaimedRewards, claimReward } from '@/utils/api/rewards';
import { fetchManagedProfiles } from '@/utils/api/profiles';
import { EarnedReward, Reward, ManagedProfile } from '@/types/app';
import { toast } from 'react-toastify';

const RewardsPage = () => {
  const [unclaimedRewards, setUnclaimedRewards] = useState<EarnedReward[]>([]);
  const [claimedRewards, setClaimedRewards] = useState<EarnedReward[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ManagedProfile | null>(null);
  const [profiles, setProfiles] = useState<ManagedProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const fetchedProfiles = await fetchManagedProfiles();
        setProfiles(fetchedProfiles);
        if (fetchedProfiles.length > 0) {
          const urlParams = new URLSearchParams(window.location.search);
          const profileId = urlParams.get('profileId');
          const initialProfile = profileId
            ? fetchedProfiles.find(p => p.id === profileId) || fetchedProfiles[0]
            : fetchedProfiles[0];
          setSelectedProfile(initialProfile);
          loadRewards(initialProfile.id);
        } else {
          setIsLoading(false);
          toast.error('No profiles found');
        }
      } catch (error) {
        console.error('Failed to load profiles:', error);
        toast.error('Failed to load profiles');
        setIsLoading(false);
      }
    };

    loadProfiles();
  }, []);

  const loadRewards = async (profileId: string) => {
    setIsLoading(true);
    try {
      const [unclaimed, claimed] = await Promise.all([
        fetchUnclaimedRewards(profileId),
        fetchClaimedRewards(profileId)
      ]);
      setUnclaimedRewards(unclaimed);
      setClaimedRewards(claimed);
    } catch (error) {
      console.error('Failed to load rewards:', error);
      toast.error('Failed to load rewards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const profileId = e.target.value;
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setSelectedProfile(profile);
      loadRewards(profile.id);
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    if (selectedProfile) {
      try {
        const claimed = await claimReward(selectedProfile.id, rewardId);
        setUnclaimedRewards(unclaimedRewards.filter(reward => reward.reward_id !== claimed.reward_id));
        setClaimedRewards([claimed, ...claimedRewards]);
        toast.success('Reward claimed successfully');
      } catch (error) {
        console.error('Failed to claim reward:', error);
        toast.error('Failed to claim reward');
      }
    }
  };



  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  if (!selectedProfile) {
    return <div className="text-white">No profile selected</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-4xl bg-gray-800 p-8 rounded-lg shadow-lg">
        <button
            onClick={() => router.back()}
            className="text-gray-300 hover:text-white mr-4"
          >
            ← Back
          </button>
        <h1 className="text-3xl font-bold text-white mb-8">Rewards</h1>
        
        
        <div className="mb-6">
          <select 
            className="bg-gray-700 text-white p-2 rounded-md w-full"
            onChange={handleProfileChange}
            value={selectedProfile.id}
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>{profile.name}</option>
            ))}
          </select>
        </div>
  
        <h2 className="text-2xl font-bold text-white mb-4">Unclaimed Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {unclaimedRewards.map((reward) => (
            <div key={reward.reward_id} className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-xl font-semibold text-white">{reward.rewards.name}</h3>
              <p className="text-gray-300">Earned on: {new Date(reward.created_at).toLocaleDateString()}</p>
              <button 
                onClick={() => handleClaimReward(reward.reward_id)}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Claim
              </button>
            </div>
          ))}
        </div>
  
        <h2 className="text-2xl font-bold text-white mb-4">Recently Claimed Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {claimedRewards.map((reward) => (
            <div key={reward.reward_id} className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-xl font-semibold text-white">{reward.rewards.name}</h3>
              <p className="text-gray-300">Claimed on: {new Date(reward.created_at).toLocaleDateString()}</p>
              <span className="mt-2 text-green-400">Claimed</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;