'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentAppUserIdentity } from '@/utils/api/appUsers'
import {
  fetchProfilesWithCreditAccounts,
  fetchRoomCreditTimelines,
  getProjectedRoomCredit,
  RoomCreditTimeline,
} from '@/utils/api/economy'
import { ProfileWithAccount } from '@/types/app'

const chartColors = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#22d3ee']

const formatCredits = (value: number) => `${value.toFixed(2)}`
const formatLiveCredits = (value: number) => value.toFixed(5)

const formatDate = (value: string) => new Date(value).toLocaleDateString(undefined, {
  month: 'short',
  day: 'numeric',
})

const buildPath = (
  points: { timestamp: string; balance: number }[],
  minTime: number,
  maxTime: number,
  maxBalance: number
) => {
  const width = 560
  const height = 220
  const left = 44
  const top = 20
  const timeSpan = Math.max(maxTime - minTime, 1)
  const balanceSpan = Math.max(maxBalance, 1)

  return points.map((point, index) => {
    const time = new Date(point.timestamp).getTime()
    const x = left + ((time - minTime) / timeSpan) * width
    const y = top + height - (Math.max(point.balance, 0) / balanceSpan) * height
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
}

function RoomCreditChart({ timelines }: { timelines: RoomCreditTimeline[] }) {
  const [clock, setClock] = useState(() => Date.now())

  useEffect(() => {
    const intervalId = window.setInterval(() => setClock(Date.now()), 500)
    return () => window.clearInterval(intervalId)
  }, [])

  const liveTimelines = useMemo(() => timelines.map((timeline) => {
    const projected = getProjectedRoomCredit(timeline.room, new Date(clock))
    const existingPoints = timeline.points.filter((point) => point.event_type !== 'projected')

    return {
      ...timeline,
      points: [
        ...existingPoints,
        {
          timestamp: new Date(clock).toISOString(),
          balance: projected.balance,
          event_type: 'projected' as const,
        },
      ],
    }
  }), [clock, timelines])

  const chartData = useMemo(() => {
    const allPoints = liveTimelines.flatMap((timeline) => timeline.points)
    const times = allPoints.map((point) => new Date(point.timestamp).getTime())
    const balances = allPoints.map((point) => point.balance)
    const minTime = Math.min(...times, Date.now() - 1000 * 60 * 60)
    const maxTime = Math.max(...times, Date.now())
    const maxBalance = Math.max(...balances, 1)

    return { minTime, maxTime, maxBalance }
  }, [liveTimelines])

  if (liveTimelines.length === 0) {
    return <div className="rounded-md bg-gray-900 p-4 text-gray-300">No rooms available yet.</div>
  }

  return (
    <div className="rounded-md bg-gray-900 p-3 sm:p-4">
      <div className="mb-4 flex items-center justify-between gap-3 text-sm text-gray-300">
        <span>{formatDate(new Date(chartData.minTime).toISOString())}</span>
        <span>{formatDate(new Date(chartData.maxTime).toISOString())}</span>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 640 280" className="min-h-64 min-w-[640px]">
          <line x1="44" y1="240" x2="604" y2="240" stroke="#4b5563" strokeWidth="1" />
          <line x1="44" y1="20" x2="44" y2="240" stroke="#4b5563" strokeWidth="1" />
          <text x="8" y="26" fill="#9ca3af" fontSize="12">{formatCredits(chartData.maxBalance)}</text>
          <text x="18" y="244" fill="#9ca3af" fontSize="12">0</text>
          {[0.25, 0.5, 0.75].map((ratio) => {
            const y = 240 - ratio * 220
            return (
              <line
                key={ratio}
                x1="44"
                y1={y}
                x2="604"
                y2={y}
                stroke="#1f2937"
                strokeWidth="1"
              />
            )
          })}
          {liveTimelines.map((timeline, index) => {
            const color = chartColors[index % chartColors.length]
            const path = buildPath(
              timeline.points,
              chartData.minTime,
              chartData.maxTime,
              chartData.maxBalance
            )

            return (
              <g key={timeline.room.id}>
                <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
                {timeline.points.map((point) => {
                  const timeSpan = Math.max(chartData.maxTime - chartData.minTime, 1)
                  const x = 44 + ((new Date(point.timestamp).getTime() - chartData.minTime) / timeSpan) * 560
                  const y = 240 - (Math.max(point.balance, 0) / Math.max(chartData.maxBalance, 1)) * 220
                  return <circle key={`${timeline.room.id}-${point.timestamp}-${point.event_type}`} cx={x} cy={y} r="4" fill={color} />
                })}
              </g>
            )
          })}
        </svg>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        {liveTimelines.map((timeline, index) => {
          const latestPoint = timeline.points[timeline.points.length - 1]
          const color = chartColors[index % chartColors.length]

          return (
            <div key={timeline.room.id} className="rounded-md bg-gray-800 p-3">
              <div className="mb-1 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="truncate font-medium text-white">{timeline.room.name}</span>
              </div>
              <p className="font-mono tabular-nums text-gray-300" aria-live="off">
                {formatLiveCredits(latestPoint?.balance ?? 0)} credits
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function StatsDashboardPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<ProfileWithAccount[]>([])
  const [timelines, setTimelines] = useState<RoomCreditTimeline[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const loadStats = useCallback(async () => {
    setIsLoading(true)
    setLoadError(false)

    try {
      const identity = await getCurrentAppUserIdentity()
      if (!identity) {
        setProfiles([])
        setTimelines([])
        return
      }

      const [fetchedProfiles, fetchedTimelines] = await Promise.all([
        fetchProfilesWithCreditAccounts(identity.lookupIds),
        fetchRoomCreditTimelines(identity.lookupIds),
      ])
      setProfiles(fetchedProfiles)
      setTimelines(fetchedTimelines)
    } catch (error) {
      console.error('Failed to load dashboard stats.', error)
      setLoadError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const maxProfileXP = Math.max(...profiles.map((profile) => profile.xp), 1)

  if (isLoading) {
    return <div className="mx-auto max-w-4xl rounded-md bg-gray-800 p-5 text-gray-300">Loading dashboard...</div>
  }

  if (loadError) {
    return <div className="mx-auto max-w-4xl rounded-md bg-gray-800 p-5 text-gray-300">Could not load dashboard data.</div>
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <section className="rounded-md bg-gray-800 p-4 shadow-lg sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-gray-400">All profiles</p>
            <h1 className="text-2xl font-bold text-white">Home</h1>
          </div>
          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="rounded-md bg-gray-700 px-4 py-3 text-sm font-medium text-white hover:bg-gray-600"
          >
            Profiles
          </button>
        </div>
      </section>

      <section className="rounded-md bg-gray-800 p-4 shadow-lg sm:p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-400">Profiles</p>
          <h2 className="text-xl font-bold text-white">XP Progress</h2>
        </div>

        {profiles.length === 0 ? (
          <div className="rounded-md bg-gray-900 p-4 text-gray-300">No profiles available yet.</div>
        ) : (
          <div className="space-y-3">
            {profiles.map((profile) => {
              const barWidth = Math.max((profile.xp / maxProfileXP) * 100, profile.xp > 0 ? 5 : 0)

              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => router.push(`/profile?profileId=${profile.id}`)}
                  className="w-full rounded-md bg-gray-900 p-3 text-left transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={`Open ${profile.name}, ${profile.xp} XP`}
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
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-gray-400">
                    <span>Level {profile.level}</span>
                    <span>{formatCredits(profile.credit_account?.balance ?? 0)} credits</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </section>

      <section className="rounded-md bg-gray-800 p-4 shadow-lg sm:p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-400">Rooms</p>
          <h2 className="text-xl font-bold text-white">Credit Balances</h2>
        </div>
        <RoomCreditChart timelines={timelines} />
      </section>
    </div>
  )
}
