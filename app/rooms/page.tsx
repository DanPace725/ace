'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { fetchRooms, getProjectedRoomCredit } from '@/utils/api/economy'
import { getCurrentAppUserIdentity } from '@/utils/api/appUsers'
import { fetchManagedProfiles } from '@/utils/api/profiles'
import { roomStateLabels } from '@/utils/economyConfig'
import { ManagedProfile, RoomState, RoomWithAccount } from '@/types/app'

const stateTone: Record<RoomState, string> = {
  clean: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  needs_attention: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-100',
  messy: 'border-orange-500/40 bg-orange-500/10 text-orange-100',
  critical: 'border-red-500/40 bg-red-500/10 text-red-100',
}

const formatCredits = (value?: number | null) => `${(value ?? 0).toFixed(2)} credits`
const formatLiveCredits = (value?: number | null) => `${(value ?? 0).toFixed(5)} credits`

const formatDelta = (value: number) => {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(5)} credits`
}

const formatHourlyRate = (rate: number) => {
  const percent = rate * 100
  const sign = percent > 0 ? '+' : ''
  return `${sign}${percent.toFixed(2)}% / hour`
}

const formatStateChangedAt = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const isRoomsSchemaUnavailable = (error: unknown) => {
  const candidate = error as { code?: string; message?: string } | null
  const message = candidate?.message ?? ''

  return (
    candidate?.code === '42P01' ||
    candidate?.code === 'PGRST205' ||
    /rooms.*schema cache|relation .*rooms.* does not exist|could not find the table.*rooms/i.test(message)
  )
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomWithAccount[]>([])
  const [profiles, setProfiles] = useState<ManagedProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUnavailable, setIsUnavailable] = useState(false)
  const [hasLoadError, setHasLoadError] = useState(false)
  const [clock, setClock] = useState(() => Date.now())

  const profileNameById = useMemo(() => profiles.reduce<Record<string, string>>((lookup, profile) => {
    lookup[profile.id] = profile.name
    return lookup
  }, {}), [profiles])

  const loadRooms = useCallback(async () => {
    setIsLoading(true)
    setIsUnavailable(false)
    setHasLoadError(false)

    try {
      const identity = await getCurrentAppUserIdentity()
      if (!identity) {
        setRooms([])
        setProfiles([])
        return
      }

      const fetchedProfiles = await fetchManagedProfiles(identity.lookupIds)
      setProfiles(fetchedProfiles)

      try {
        const fetchedRooms = await fetchRooms(identity.lookupIds)
        setRooms(fetchedRooms)
      } catch (error) {
        if (isRoomsSchemaUnavailable(error)) {
          console.warn('Rooms are not available yet.', error)
          setRooms([])
          setIsUnavailable(true)
          return
        }

        console.error('Failed to load rooms.', error)
        setRooms([])
        setHasLoadError(true)
      }
    } catch (error) {
      console.error('Failed to load room page data.', error)
      setRooms([])
      setProfiles([])
      setHasLoadError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  useEffect(() => {
    const intervalId = window.setInterval(() => setClock(Date.now()), 500)
    return () => window.clearInterval(intervalId)
  }, [])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-md bg-gray-800 p-5 text-gray-300 shadow-lg">Loading rooms...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <section className="rounded-md bg-gray-800 p-5 shadow-lg sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-gray-400">Room economy</p>
            <h1 className="text-2xl font-bold text-white">Rooms</h1>
          </div>
          <Link
            href="/admin/rooms"
            className="rounded-md bg-gray-700 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-gray-600"
          >
            Manage Rooms
          </Link>
        </div>
      </section>

      {hasLoadError ? (
        <section className="rounded-md bg-gray-800 p-5 text-gray-300 shadow-lg">
          <h2 className="mb-2 text-xl font-semibold text-white">Could not load rooms</h2>
          <p>Refresh and try again. If this keeps happening, the console should show the specific data error.</p>
        </section>
      ) : isUnavailable ? (
        <section className="rounded-md bg-gray-800 p-5 text-gray-300 shadow-lg">
          <h2 className="mb-2 text-xl font-semibold text-white">Rooms are not enabled yet</h2>
          <p>
            Apply the rooms and credits migration to turn this page on. After that, this view will show each room,
            its state, assignment, and credit balance without making any changes to the database.
          </p>
        </section>
      ) : rooms.length === 0 ? (
        <section className="rounded-md bg-gray-800 p-5 text-gray-300 shadow-lg">
          <h2 className="mb-2 text-xl font-semibold text-white">No rooms yet</h2>
          <p>Create a room from the admin screen, then come back here to check the live room state.</p>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {rooms.map((room) => {
            const assignedName = room.assigned_profile_id
              ? profileNameById[room.assigned_profile_id] ?? 'Unknown profile'
              : 'Unassigned'
            const projection = getProjectedRoomCredit(room, new Date(clock))
            const deltaTone = projection.delta >= 0 ? 'text-green-300' : 'text-red-300'

            return (
              <article key={room.id} className="rounded-md bg-gray-800 p-4 shadow-lg">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-semibold text-white">{room.name}</h2>
                    <p className="text-sm text-gray-400">{room.is_shared ? 'Shared room' : 'Private room'}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${stateTone[room.state]}`}>
                    {roomStateLabels[room.state]}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="rounded-md bg-gray-900 p-3">
                    <p className="text-sm text-gray-400">Projected credits</p>
                    <p
                      className="font-mono text-lg font-semibold tabular-nums text-white"
                      aria-live="off"
                    >
                      {formatLiveCredits(projection.balance)}
                    </p>
                    <p className={`text-sm ${deltaTone}`}>{formatDelta(projection.delta)} since settlement</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md bg-gray-900 p-3">
                      <p className="text-sm text-gray-400">Rate</p>
                      <p className="font-medium text-white">{formatHourlyRate(projection.rate)}</p>
                    </div>
                    <div className="rounded-md bg-gray-900 p-3">
                      <p className="text-sm text-gray-400">Assigned</p>
                      <p className="truncate font-medium text-white">{assignedName}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md bg-gray-900 p-3">
                      <p className="text-sm text-gray-400">Stored</p>
                      <p className="font-medium text-white">{formatCredits(room.credit_account?.balance)}</p>
                    </div>
                    <div className="rounded-md bg-gray-900 p-3">
                      <p className="text-sm text-gray-400">Elapsed</p>
                      <p className="font-medium text-white">{projection.elapsedHours.toFixed(1)} hours</p>
                    </div>
                  </div>
                  <div className="rounded-md bg-gray-900 p-3">
                    <p className="text-sm text-gray-400">Last state change</p>
                    <p className="font-medium text-white">{formatStateChangedAt(room.state_changed_at)}</p>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      )}
    </div>
  )
}
