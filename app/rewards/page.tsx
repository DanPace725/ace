'use client'

import React, { useEffect, useState } from 'react'
import { fetchManagedProfiles } from '@/utils/api/profiles'
import { fetchClaimedRewards, fetchUnclaimedRewards } from '@/utils/api/rewards'
import { EarnedReward, ManagedProfile } from '@/types/app'
import { toast } from 'react-toastify'

const Rewards = () => {
  const [profiles, setProfiles] = useState<ManagedProfile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState('')
  const [unclaimedRewards, setUnclaimedRewards] = useState<EarnedReward[]>([])
  const [claimedRewards, setClaimedRewards] = useState<EarnedReward[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const fetchedProfiles = await fetchManagedProfiles()
        setProfiles(fetchedProfiles)
        setSelectedProfileId(fetchedProfiles[0]?.id ?? '')
      } catch (error) {
        toast.error('Failed to load profiles')
        console.error(error)
      }
    }

    loadProfiles()
  }, [])

  useEffect(() => {
    const loadRewards = async () => {
      if (!selectedProfileId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const [unclaimed, claimed] = await Promise.all([
          fetchUnclaimedRewards(selectedProfileId),
          fetchClaimedRewards(selectedProfileId),
        ])
        setUnclaimedRewards(unclaimed)
        setClaimedRewards(claimed)
      } catch (error) {
        toast.error('Failed to load rewards')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRewards()
  }, [selectedProfileId])

  const renderRewardRows = (rewards: EarnedReward[], status: 'Unclaimed' | 'Claimed') => (
    rewards.length > 0 ? (
      rewards.map((reward) => (
        <tr key={`${reward.profile_id}-${reward.reward_id}`} className="border-t border-gray-600">
          <td className="py-2 px-4 text-white">{reward.rewards.name}</td>
          <td className="py-2 px-4 text-white">{new Date(reward.created_at).toLocaleDateString()}</td>
          <td className="py-2 px-4">
            <span className={status === 'Claimed' ? 'text-green-400' : 'text-yellow-300'}>{status}</span>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td className="py-3 px-4 text-gray-300" colSpan={3}>No rewards found.</td>
      </tr>
    )
  )

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-4xl bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="bg-gray-700 p-4 rounded-md shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-white">Rewards</h1>
          <select
            value={selectedProfileId}
            onChange={(event) => setSelectedProfileId(event.target.value)}
            className="bg-gray-600 text-white p-2 rounded-md"
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>{profile.name}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <p className="text-gray-300">Loading...</p>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-white">Unclaimed Rewards</h2>
              <table className="w-full bg-gray-700 rounded-lg shadow-md overflow-hidden">
                <thead>
                  <tr className="bg-gray-600 text-left text-white">
                    <th className="py-2 px-4">Reward</th>
                    <th className="py-2 px-4">Date</th>
                    <th className="py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>{renderRewardRows(unclaimedRewards, 'Unclaimed')}</tbody>
              </table>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4 text-white">Claimed Rewards</h2>
              <table className="w-full bg-gray-700 rounded-lg shadow-md overflow-hidden">
                <thead>
                  <tr className="bg-gray-600 text-left text-white">
                    <th className="py-2 px-4">Reward</th>
                    <th className="py-2 px-4">Date</th>
                    <th className="py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>{renderRewardRows(claimedRewards, 'Claimed')}</tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Rewards
