'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { createActionLog } from '@/utils/api/actionLogs'
import { getCurrentAppUserIdentity, requireCurrentAppUserIdentity } from '@/utils/api/appUsers'
import { awardProfileTaskCredits } from '@/utils/api/economy'
import { updateProfileXP } from '@/utils/api/profiles'
import { earnReward, fetchRewards } from '@/utils/api/rewards'
import { fetchPendingActionLogs, updatePendingActionLogStatus } from '@/utils/api/reviewQueue'
import { PendingActionLog } from '@/types/app'

const ReviewQueuePage = () => {
  const router = useRouter()
  const [pendingLogs, setPendingLogs] = useState<PendingActionLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeLogId, setActiveLogId] = useState<string | null>(null)

  const loadPendingLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const identity = await getCurrentAppUserIdentity()
      if (!identity) {
        setPendingLogs([])
        return
      }

      const logs = await fetchPendingActionLogs(identity.lookupIds)
      setPendingLogs(logs)
    } catch (error) {
      toast.error('Failed to load review queue')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPendingLogs()
  }, [loadPendingLogs])

  const handleRandomReward = async (profileId: string) => {
    const chance = Math.random()
    if (chance > 0.1) return

    const availableRewards = await fetchRewards()
    if (availableRewards.length === 0) return

    const randomReward = availableRewards[Math.floor(Math.random() * availableRewards.length)]
    await earnReward(profileId, randomReward.id)
    toast.success(`Random reward earned: ${randomReward.name}`)
  }

  const approveLog = async (pendingLog: PendingActionLog) => {
    setActiveLogId(pendingLog.id)
    try {
      const identity = await requireCurrentAppUserIdentity()
      const createdLog = await createActionLog({
        profile_id: pendingLog.profile_id,
        action_id: pendingLog.action_id,
        timestamp: pendingLog.timestamp,
        base_xp: pendingLog.base_xp,
        bonus_xp: pendingLog.bonus_xp,
      })
      await awardProfileTaskCredits({
        app_user_id: identity.appUserId,
        profile_id: pendingLog.profile_id,
        action_id: pendingLog.action_id,
        action_log_id: createdLog.id,
        base_xp: pendingLog.base_xp,
        bonus_xp: pendingLog.bonus_xp,
        created_by: identity.appUserId,
      })
      await updatePendingActionLogStatus(pendingLog.id, 'approved', identity.appUserId)
      await updateProfileXP(pendingLog.profile_id)
      await handleRandomReward(pendingLog.profile_id)
      setPendingLogs((currentLogs) => currentLogs.filter((log) => log.id !== pendingLog.id))
      toast.success('Task approved')
    } catch (error) {
      toast.error('Failed to approve task')
      console.error(error)
    } finally {
      setActiveLogId(null)
    }
  }

  const denyLog = async (pendingLog: PendingActionLog) => {
    setActiveLogId(pendingLog.id)
    try {
      const identity = await requireCurrentAppUserIdentity()
      await updatePendingActionLogStatus(pendingLog.id, 'denied', identity.appUserId)
      setPendingLogs((currentLogs) => currentLogs.filter((log) => log.id !== pendingLog.id))
      toast.success('Task denied')
    } catch (error) {
      toast.error('Failed to deny task')
      console.error(error)
    } finally {
      setActiveLogId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-md bg-gray-800 p-5 shadow-lg sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-gray-400">Admin tools</p>
            <h1 className="text-3xl font-bold text-white">Review Queue</h1>
          </div>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="w-full rounded-md bg-gray-700 px-4 py-3 font-medium text-white transition hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 sm:w-auto"
          >
            Back to Admin
          </button>
        </div>

        {isLoading ? (
          <p className="text-gray-300">Loading...</p>
        ) : pendingLogs.length === 0 ? (
          <div className="rounded-md bg-gray-700 p-4 text-gray-300">No tasks are waiting for review.</div>
        ) : (
          <div className="space-y-3">
            {pendingLogs.map((pendingLog) => {
              const isActive = activeLogId === pendingLog.id
              const totalXP = pendingLog.base_xp + pendingLog.bonus_xp

              return (
                <div key={pendingLog.id} className="rounded-md bg-gray-700 p-4">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-white">{pendingLog.actions?.name ?? 'Unknown task'}</h2>
                      <p className="text-sm text-gray-300">{pendingLog.managed_profiles?.name ?? 'Unknown profile'}</p>
                      <p className="mt-1 text-xs text-gray-400">{new Date(pendingLog.timestamp).toLocaleDateString()}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-200 px-2 py-1 text-xs text-blue-800">
                      {totalXP} XP
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => approveLog(pendingLog)}
                      disabled={isActive}
                      className="rounded-md bg-green-600 px-4 py-3 font-medium text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-gray-600"
                    >
                      {isActive ? 'Working...' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      onClick={() => denyLog(pendingLog)}
                      disabled={isActive}
                      className="rounded-md bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-gray-600"
                    >
                      {isActive ? 'Working...' : 'Deny'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewQueuePage
