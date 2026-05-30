'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { fetchManagedProfiles, fetchProfileData, fetchRecentTasks, fetchEarnedRewards, updateProfileLevel } from '@/utils/api/profiles'
import { fetchLevelData } from '@/utils/api/levels'
import { fetchLevelReward, earnReward } from '@/utils/api/rewards'
import { ManagedProfile, RecentTask, EarnedReward } from '@/types/app'
import { toast } from 'react-toastify'
import { getCurrentAppUserIdentity } from '@/utils/api/appUsers'

const Dashboard = () => {
  const router = useRouter()
  const [profiles, setProfiles] = useState<ManagedProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<ManagedProfile | null>(null)
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([])
  const [earnedRewards, setEarnedRewards] = useState<EarnedReward[]>([])
  const [currentLevelXP, setCurrentLevelXP] = useState(0)
  const [nextLevelXP, setNextLevelXP] = useState(0)

  useEffect(() => {
    const loadProfiles = async () => {
      const identity = await getCurrentAppUserIdentity()
      if (identity) {
        const fetchedProfiles = await fetchManagedProfiles(identity.lookupIds)
        setProfiles(fetchedProfiles)
        if (fetchedProfiles.length > 0) {
          setSelectedProfile(fetchedProfiles[0])
        }
      }
    }

    loadProfiles()
  }, [])

  const distributeLevelReward = useCallback(async (profileId: string, level: number) => {
    try {
      const levelReward = await fetchLevelReward(level)
      if (levelReward) {
        await earnReward(profileId, levelReward.id)
        toast.success(`You've earned a new reward for reaching level ${level}!`)
      }
    } catch (error) {
      console.error('Failed to distribute level reward:', error)
      toast.error('Failed to distribute level reward')
    }
  }, [])

  const updateLevelData = useCallback(async (profileId: string, currentLevel: number, currentXP: number) => {
    const levelData = await fetchLevelData(currentLevel)
    if (levelData && levelData.length > 0) {
      setCurrentLevelXP(levelData[0].cumulative_xp || 0)
      setNextLevelXP(levelData[1]?.cumulative_xp || levelData[0].xp_required)

      if (currentXP >= levelData[1]?.cumulative_xp) {
        const newLevel = currentLevel + 1
        await updateProfileLevel(profileId, newLevel)
        setSelectedProfile(prev => prev ? { ...prev, level: newLevel } : null)
        await distributeLevelReward(profileId, newLevel)
        await updateLevelData(profileId, newLevel, currentXP)
      }
    }
  }, [distributeLevelReward])

  useEffect(() => {
    const loadProfileData = async () => {
      if (selectedProfile) {
        const tasks = await fetchRecentTasks(selectedProfile.id)
        const rewards = await fetchEarnedRewards(selectedProfile.id)
        setRecentTasks(tasks)
        setEarnedRewards(rewards)
        await updateLevelData(selectedProfile.id, selectedProfile.level, selectedProfile.xp)
      }
    }

    loadProfileData()
  }, [selectedProfile, updateLevelData])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const profileId = urlParams.get('profileId')
    if (profileId && profiles.length > 0) {
      const profile = profiles.find(p => p.id === profileId)
      if (profile) {
        setSelectedProfile(profile)
      }
    }
  }, [profiles])

  const selectProfile = async (profileId: string) => {
    try {
      const profile = await fetchProfileData(profileId)
      setSelectedProfile(profile)
      setProfiles((currentProfiles) =>
        currentProfiles.map((currentProfile) => (
          currentProfile.id === profile.id ? profile : currentProfile
        ))
      )
    } catch (error) {
      toast.error('Failed to load profile')
      console.error(error)
    }
  }

  const handleProfileChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await selectProfile(e.target.value)
  }

  const handleLogTask = () => {
    router.push(`/actions?profileId=${selectedProfile?.id}`)
  }

  const calculateProgress = () => {
    if (!selectedProfile || nextLevelXP <= currentLevelXP) {
      return 0
    }

    const totalXPForNextLevel = nextLevelXP - currentLevelXP
    const currentProgress = selectedProfile.xp - currentLevelXP
    return Math.max(0, Math.min((currentProgress / totalXPForNextLevel) * 100, 100))
  }

  if (profiles.length === 0 && !selectedProfile) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
        <div className="w-full rounded-md bg-gray-800 p-5 shadow-lg">
          <h1 className="mb-2 text-2xl font-bold text-white">ACE</h1>
          <p className="mb-5 text-gray-300">Create a profile to start logging tasks and earning rewards.</p>
          <button
            onClick={() => router.push('/admin/app_users')}
            className="w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-500"
          >
            Create Profile
          </button>
        </div>
      </div>
    )
  }

  if (!selectedProfile) {
    return <div className="mx-auto max-w-md rounded-md bg-gray-800 p-5 text-gray-300">Loading...</div>
  }

  const xpToNext = Math.max(nextLevelXP - selectedProfile.xp, 0)
  const maxProfileXP = Math.max(...profiles.map((profile) => profile.xp), 1)

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <section className="rounded-md bg-gray-800 p-4 shadow-lg sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-400">Current profile</p>
            <h1 className="text-2xl font-bold text-white">{selectedProfile.name}</h1>
          </div>
          <select
            className="max-w-[45%] rounded-md bg-gray-700 p-2 text-sm text-white"
            onChange={handleProfileChange}
            value={selectedProfile.id}
            aria-label="Select profile"
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>{profile.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-[88px_1fr] items-center gap-4">
          <div className="h-20 w-20">
            <CircularProgressbar
              value={calculateProgress()}
              text={`${selectedProfile.level}`}
              styles={buildStyles({
                textColor: '#ffffff',
                pathColor: '#3b82f6',
                trailColor: '#374151',
              })}
            />
          </div>
          <div className="space-y-1 text-white">
            <p className="text-sm text-gray-300">Level {selectedProfile.level}</p>
            <p className="text-lg font-semibold">{selectedProfile.xp} XP</p>
            <p className="text-sm text-gray-300">{xpToNext} XP to next level</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={handleLogTask}
            className="rounded-md bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-500"
          >
            Log Task
          </button>
          <button
            onClick={() => router.push(`/rewards?profileId=${selectedProfile.id}`)}
            className="rounded-md bg-gray-700 px-4 py-3 font-medium text-white hover:bg-gray-600"
          >
            View Rewards
          </button>
        </div>
      </section>

      <section className="rounded-md bg-gray-800 p-4 shadow-lg sm:p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-400">All profiles</p>
          <h2 className="text-xl font-bold text-white">XP Progress</h2>
        </div>

        <div className="space-y-3">
          {profiles.map((profile) => {
            const barWidth = Math.max((profile.xp / maxProfileXP) * 100, profile.xp > 0 ? 5 : 0)
            const isSelected = selectedProfile.id === profile.id

            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => selectProfile(profile.id)}
                className={`w-full rounded-md p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isSelected ? 'bg-gray-700 ring-2 ring-blue-500' : 'bg-gray-900 hover:bg-gray-700'
                }`}
                aria-label={`Select ${profile.name}, ${profile.xp} XP`}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="truncate font-medium text-white">{profile.name}</span>
                  <span className="shrink-0 text-sm text-gray-300">{profile.xp} XP</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-gray-400">Level {profile.level}</div>
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Recent Tasks</h2>
          <button onClick={handleLogTask} className="text-sm font-medium text-blue-300">Add</button>
        </div>
        {recentTasks.length > 0 ? (
          <div className="space-y-3 sm:hidden">
            {recentTasks.map((task) => (
              <div key={task.id} className="rounded-md bg-gray-800 p-4 shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{task.actions.name}</h3>
                    <p className="text-sm text-gray-300">{new Date(task.timestamp).toLocaleDateString()}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-blue-200 px-2 py-1 text-xs text-blue-800">
                    {task.base_xp + (task.bonus_xp || 0)} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md bg-gray-800 p-4 text-gray-300">No tasks logged yet.</div>
        )}

        {recentTasks.length > 0 && (
          <div className="hidden overflow-hidden rounded-md bg-gray-800 shadow-md sm:block">
            <table className="w-full text-left text-gray-300">
              <thead className="bg-gray-700 text-xs uppercase text-white">
                <tr>
                  <th className="px-4 py-2">Task</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">XP</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((task) => (
                  <tr key={task.id} className="border-t border-gray-700">
                    <td className="px-4 py-2 text-white">{task.actions.name}</td>
                    <td className="px-4 py-2">{new Date(task.timestamp).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{task.base_xp + (task.bonus_xp || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Rewards</h2>
          <button onClick={() => router.push(`/rewards?profileId=${selectedProfile.id}`)} className="text-sm font-medium text-blue-300">All</button>
        </div>

        {earnedRewards.length > 0 ? (
          <div className="space-y-3 sm:hidden">
            {earnedRewards.map((reward) => (
              <div key={reward.reward_id} className="rounded-md bg-gray-800 p-4 shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{reward.rewards.name}</h3>
                    <p className="text-sm text-gray-300">{new Date(reward.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={reward.is_claimed ? 'shrink-0 text-sm text-green-400' : 'shrink-0 text-sm text-yellow-300'}>
                    {reward.is_claimed ? 'Claimed' : 'Unclaimed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md bg-gray-800 p-4 text-gray-300">No rewards earned yet.</div>
        )}

        {earnedRewards.length > 0 && (
          <div className="hidden overflow-hidden rounded-md bg-gray-800 shadow-md sm:block">
            <table className="w-full text-left text-gray-300">
              <thead className="bg-gray-700 text-xs uppercase text-white">
                <tr>
                  <th className="px-4 py-2">Reward</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {earnedRewards.map((reward) => (
                  <tr key={reward.reward_id} className="border-t border-gray-700">
                    <td className="px-4 py-2 text-white">{reward.rewards.name}</td>
                    <td className="px-4 py-2">{new Date(reward.created_at).toLocaleDateString()}</td>
                    <td className={reward.is_claimed ? 'px-4 py-2 text-green-400' : 'px-4 py-2 text-yellow-300'}>
                      {reward.is_claimed ? 'Claimed' : 'Unclaimed'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default Dashboard
