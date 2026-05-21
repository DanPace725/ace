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
        const profileId = new URLSearchParams(window.location.search).get('profileId')
        const initialProfile = profileId
          ? fetchedProfiles.find((profile) => profile.id === profileId)
          : null
        setProfiles(fetchedProfiles)
        setSelectedProfileId(initialProfile?.id ?? fetchedProfiles[0]?.id ?? '')
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

  const renderRewardCards = (rewards: EarnedReward[], status: 'Unclaimed' | 'Claimed') => (
    rewards.length > 0 ? (
      <div className="space-y-3">
        {rewards.map((reward) => (
          <div key={`${reward.profile_id}-${reward.reward_id}`} className="rounded-md bg-gray-800 p-4 shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{reward.rewards.name}</h3>
                <p className="text-sm text-gray-300">{new Date(reward.created_at).toLocaleDateString()}</p>
              </div>
              <span className={status === 'Claimed' ? 'shrink-0 text-sm text-green-400' : 'shrink-0 text-sm text-yellow-300'}>
                {status}
              </span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="rounded-md bg-gray-800 p-4 text-gray-300">No rewards found.</div>
    )
  )

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="rounded-md bg-gray-800 p-4 shadow-lg sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-white">Rewards</h1>
          <select
            value={selectedProfileId}
            onChange={(event) => setSelectedProfileId(event.target.value)}
            className="rounded-md bg-gray-700 p-3 text-white"
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
            <section className="mt-6">
              <h2 className="text-2xl font-bold mb-4 text-white">Unclaimed Rewards</h2>
              <div className="sm:hidden">{renderRewardCards(unclaimedRewards, 'Unclaimed')}</div>
              <table className="hidden w-full overflow-hidden rounded-md bg-gray-800 text-left shadow-md sm:table">
                <thead>
                  <tr className="bg-gray-600 text-left text-white">
                    <th className="py-2 px-4">Reward</th>
                    <th className="py-2 px-4">Date</th>
                    <th className="py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>{renderRewardRows(unclaimedRewards, 'Unclaimed')}</tbody>
              </table>
            </section>

            <section className="mt-6">
              <h2 className="text-2xl font-bold mb-4 text-white">Claimed Rewards</h2>
              <div className="sm:hidden">{renderRewardCards(claimedRewards, 'Claimed')}</div>
              <table className="hidden w-full overflow-hidden rounded-md bg-gray-800 text-left shadow-md sm:table">
                <thead>
                  <tr className="bg-gray-600 text-left text-white">
                    <th className="py-2 px-4">Reward</th>
                    <th className="py-2 px-4">Date</th>
                    <th className="py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>{renderRewardRows(claimedRewards, 'Claimed')}</tbody>
              </table>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default Rewards
