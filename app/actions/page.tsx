'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { fetchActions } from '@/utils/api/actions';
import { createActionLog } from '@/utils/api/actionLogs';
import { fetchManagedProfiles, updateProfileXP } from '@/utils/api/profiles';
import { Action, ManagedProfile } from '@/types/app';
import { toast } from 'react-toastify';

const LogTaskPage = () => {
  const [actions, setActions] = useState<Action[]>([]);
  const [selectedAction, setSelectedAction] = useState('');
  const [date, setDate] = useState('');
  const [bonusXP, setBonusXP] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState<ManagedProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ManagedProfile | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadProfilesAndActions();
  }, []);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const profileId = urlParams.get('profileId');
    if (profileId) {
      const profile = profiles.find(p => p.id === profileId);
      if (profile) {
        setSelectedProfile(profile);
      }
    }
  }, [profiles]);

  const loadProfilesAndActions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const fetchedProfiles = await fetchManagedProfiles(user.id);
        setProfiles(fetchedProfiles);
        if (fetchedProfiles.length > 0) {
          setSelectedProfile(fetchedProfiles[0]);
          const fetchedActions = await fetchActions(user.id);
          setActions(fetchedActions);
        }
      }
    } catch (error) {
      toast.error('Failed to load profiles and actions');
      console.error(error);
    }
  };

  const handleProfileChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const profileId = e.target.value;
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setSelectedProfile(profile);
    }
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) {
      toast.error('Please select a profile');
      return;
    }
    setIsLoading(true);

    try {
      const selectedActionData = actions.find(action => action.id === selectedAction);
      if (!selectedActionData) {
        throw new Error('Selected action not found');
      }

      await createActionLog({
        profile_id: selectedProfile.id,
        action_id: selectedAction,
        timestamp: date,
        base_xp: selectedActionData.base_xp,
        bonus_xp: parseInt(bonusXP) || 0,
      });
       // Update the profile's XP
       await updateProfileXP(selectedProfile.id);
      toast.success('Task logged successfully');
      router.push(`/dashboard?profileId=${selectedProfile?.id}`);
    } catch (error) {
      toast.error('Failed to log task');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-8">Log Task</h1>
        
        <div className="mb-6">
          <label htmlFor="profile" className="block text-sm font-medium text-gray-300 mb-2">Profile</label>
          <select
            id="profile"
            value={selectedProfile?.id || ''}
            onChange={handleProfileChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-white"
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>{profile.name}</option>
            ))}
          </select>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task" className="block text-sm font-medium text-gray-300">Task</label>
            <select
              id="task"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-white"
              required
            >
              <option value="">Select a task</option>
              {actions.map((action) => (
                <option key={action.id} value={action.id}>{action.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-300">Date</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-white"
              required
            />
          </div>
          
          <div>
            <label htmlFor="bonusXP" className="block text-sm font-medium text-gray-300">Bonus XP</label>
            <input
              type="number"
              id="bonusXP"
              value={bonusXP}
              onChange={(e) => setBonusXP(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-white"
            />
          </div>
          
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
              disabled={isLoading || !selectedProfile}
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogTaskPage;