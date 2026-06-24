'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchActions } from '@/utils/api/actions'
import { createActionLog } from '@/utils/api/actionLogs'
import { createPendingActionLog } from '@/utils/api/reviewQueue'
import { fetchManagedProfiles, updateProfileXP } from '@/utils/api/profiles'
import { earnReward, fetchRewards } from '@/utils/api/rewards'
import { awardProfileTaskCredits, calculateProfileTaskCredits } from '@/utils/api/economy'
import { Action, ManagedProfile } from '@/types/app'
import { toast } from 'react-toastify'
import { getCurrentAppUserIdentity, requireCurrentAppUserIdentity } from '@/utils/api/appUsers'
import { economyRates } from '@/utils/economyConfig'

const getTodayDate = () => new Date().toISOString().slice(0, 10)
const formatTaskCredits = (baseXp: number) => `${calculateProfileTaskCredits(baseXp).toFixed(2)} credits`

const LogTaskPage = () => {
  const [actions, setActions] = useState<Action[]>([])
  const [selectedAction, setSelectedAction] = useState('')
  const [date, setDate] = useState(getTodayDate)
  const [bonusXP, setBonusXP] = useState('')
  const [showBonusXP, setShowBonusXP] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profiles, setProfiles] = useState<ManagedProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<ManagedProfile | null>(null)
  const router = useRouter()
  const selectedActionDetails = actions.find(action => action.id === selectedAction)

  const loadProfilesAndActions = useCallback(async () => {
    try {
      const identity = await getCurrentAppUserIdentity()
      if (identity) {
        const fetchedProfiles = await fetchManagedProfiles(identity.lookupIds)
        const fetchedActions = await fetchActions(identity.lookupIds)
        setProfiles(fetchedProfiles)
        setActions(fetchedActions)
        setSelectedAction(fetchedActions[0]?.id ?? '')

        if (fetchedProfiles.length > 0) {
          setSelectedProfile(fetchedProfiles[0])
        }
      }
    } catch (error) {
      toast.error('Failed to load profiles and actions')
      console.error(error)
    }
  }, [])

  useEffect(() => {
    loadProfilesAndActions()
  }, [loadProfilesAndActions])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const profileId = urlParams.get('profileId')
    if (profileId) {
      const profile = profiles.find(p => p.id === profileId)
      if (profile) {
        setSelectedProfile(profile)
      }
    }
  }, [profiles])

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const profileId = e.target.value
    const profile = profiles.find(p => p.id === profileId)
    if (profile) {
      setSelectedProfile(profile)
    }
  }

  const handleRandomReward = async (profileId: string) => {
    try {
      const chance = Math.random()
      if (chance <= 0.1) {
        const availableRewards = await fetchRewards()
        if (availableRewards.length > 0) {
          const randomReward = availableRewards[Math.floor(Math.random() * availableRewards.length)]
          await earnReward(profileId, randomReward.id)
          toast.success(`You've earned a random reward: ${randomReward.name}!`)
        }
      }
    } catch (error) {
      console.error('Failed to handle random reward:', error)
      toast.error('Failed to award random reward')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProfile) {
      toast.error('Please select a profile')
      return
    }

    const selectedActionData = actions.find(action => action.id === selectedAction)
    if (!selectedActionData) {
      toast.error('Please select a task')
      return
    }

    setIsLoading(true)

    try {
      const actionLog = {
        profile_id: selectedProfile.id,
        action_id: selectedAction,
        timestamp: date,
        base_xp: selectedActionData.base_xp,
        bonus_xp: parseInt(bonusXP) || 0,
      }

      if (selectedProfile.requires_review) {
        await createPendingActionLog(actionLog)
        toast.success('Task sent for review')
        router.push(`/profile?profileId=${selectedProfile.id}`)
        return
      }

      const identity = await requireCurrentAppUserIdentity()
      const createdLog = await createActionLog(actionLog)
      await awardProfileTaskCredits({
        app_user_id: identity.appUserId,
        profile_id: selectedProfile.id,
        action_id: selectedAction,
        action_log_id: createdLog.id,
        base_xp: selectedActionData.base_xp,
        bonus_xp: actionLog.bonus_xp,
        created_by: identity.appUserId,
      })
      await updateProfileXP(selectedProfile.id)
      await handleRandomReward(selectedProfile.id)
      toast.success('Task logged successfully')
      router.push(`/profile?profileId=${selectedProfile.id}`)
    } catch (error) {
      toast.error('Failed to log task')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-5">
        <p className="text-sm text-gray-400">Quick log</p>
        <h1 className="text-3xl font-bold text-white">Log Task</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-md bg-gray-800 p-4 text-sm text-gray-300 shadow-lg">
          Task credits use base XP only. {economyRates.profile.xpPerHour} XP equals {economyRates.profile.hourlyCreditRate.toFixed(2)} credits.
        </div>

        <div className="rounded-md bg-gray-800 p-4 shadow-lg">
          <label htmlFor="profile" className="mb-2 block text-sm font-medium text-gray-300">Profile</label>
          <select
            id="profile"
            value={selectedProfile?.id || ''}
            onChange={handleProfileChange}
            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>{profile.name}</option>
            ))}
          </select>
          {selectedProfile?.requires_review && (
            <p className="mt-3 rounded-md bg-yellow-900/40 p-3 text-sm text-yellow-100">
              Tasks for this profile will be sent to the review queue before XP is awarded.
            </p>
          )}
        </div>

        <div className="rounded-md bg-gray-800 p-4 shadow-lg">
          <label htmlFor="task" className="mb-2 block text-sm font-medium text-gray-300">Task</label>
          <select
            id="task"
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            required
          >
            <option value="">Select a task</option>
            {actions.map((action) => (
              <option key={action.id} value={action.id}>
                {`${action.name} - ${action.base_xp} XP / ${formatTaskCredits(action.base_xp)}`}
              </option>
            ))}
          </select>
          {selectedActionDetails && (
            <p className="mt-3 rounded-md bg-gray-700/80 px-3 py-2 text-sm text-gray-200">
              Base value: {selectedActionDetails.base_xp} XP / {formatTaskCredits(selectedActionDetails.base_xp)}
            </p>
          )}
          {actions.length === 0 && (
            <p className="mt-3 text-sm text-gray-400">No tasks are available yet.</p>
          )}
        </div>

        <div className="rounded-md bg-gray-800 p-4 shadow-lg">
          <label htmlFor="date" className="mb-2 block text-sm font-medium text-gray-300">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            required
          />
        </div>

        <div className="rounded-md bg-gray-800 p-4 shadow-lg">
          <button
            type="button"
            onClick={() => setShowBonusXP(!showBonusXP)}
            className="flex w-full items-center justify-between text-left text-sm font-medium text-gray-200"
          >
            Bonus XP
            <span className="text-gray-400">{showBonusXP ? 'Hide' : 'Optional'}</span>
          </button>
          {showBonusXP && (
            <>
              <input
                type="number"
                id="bonusXP"
                value={bonusXP}
                onChange={(e) => setBonusXP(e.target.value)}
                className="mt-3 w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="0"
              />
              <p className="mt-2 text-xs text-gray-400">Bonus XP affects XP and levels, not credit payout.</p>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 p-3 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-600"
            disabled={isLoading || !selectedProfile || !selectedAction}
          >
            {isLoading ? 'Saving...' : selectedProfile?.requires_review ? 'Submit for Review' : 'Log Task'}
          </button>
          <button
            type="button"
            onClick={() => router.push(selectedProfile ? `/profile?profileId=${selectedProfile.id}` : '/profile')}
            className="w-full rounded-md bg-gray-700 p-3 font-medium text-white transition hover:bg-gray-600"
          >
            Profile
          </button>
        </div>
      </form>
    </div>
  )
}

export default LogTaskPage
