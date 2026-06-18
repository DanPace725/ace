'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { getCurrentAppUserIdentity, requireCurrentAppUserIdentity } from '@/utils/api/appUsers'
import { fetchManagedProfiles } from '@/utils/api/profiles'
import { fetchRooms, getProjectedRoomCredit } from '@/utils/api/economy'
import {
  createRoomResponsibility,
  fetchRoomResponsibilities,
  updateRoomResponsibilityStatus,
} from '@/utils/api/roomResponsibilities'
import { economyRates, roomStateLabels } from '@/utils/economyConfig'
import { ManagedProfile, RoomResponsibilityStatus, RoomResponsibilityWithDetails, RoomWithAccount } from '@/types/app'

type AssignmentFormState = {
  room_id: string
  assigned_profile_id: string
  due_at: string
  grace_hours: string
}

const pad = (value: number) => value.toString().padStart(2, '0')

const toLocalDateTimeInput = (date: Date) => {
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const getDefaultDueAt = () => {
  const date = new Date()
  date.setHours(date.getHours() + 2)
  date.setMinutes(0, 0, 0)
  return toLocalDateTimeInput(date)
}

const buildEmptyForm = (): AssignmentFormState => ({
  room_id: '',
  assigned_profile_id: '',
  due_at: getDefaultDueAt(),
  grace_hours: String(economyRates.responsibility.graceHours),
})

const statusTone: Record<RoomResponsibilityStatus, string> = {
  assigned: 'bg-blue-500/20 text-blue-100',
  submitted: 'bg-yellow-500/20 text-yellow-100',
  approved: 'bg-emerald-500/20 text-emerald-100',
  denied: 'bg-red-500/20 text-red-100',
  rescued: 'bg-purple-500/20 text-purple-100',
  cancelled: 'bg-gray-500/20 text-gray-200',
}

const formatDateTime = (value?: string | null) => {
  if (!value) return 'No due date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const formatGraceUntil = (assignment: RoomResponsibilityWithDetails) => {
  if (!assignment.due_at) return 'No grace window'
  const dueAt = new Date(assignment.due_at)
  if (Number.isNaN(dueAt.getTime())) return 'Unknown grace window'
  const graceUntil = new Date(dueAt.getTime() + assignment.grace_hours * 60 * 60 * 1000)
  return formatDateTime(graceUntil.toISOString())
}

const getTimingLabel = (assignment: RoomResponsibilityWithDetails) => {
  if (!assignment.due_at || assignment.status !== 'assigned') return null

  const now = Date.now()
  const dueAt = new Date(assignment.due_at).getTime()
  const graceUntil = dueAt + assignment.grace_hours * 60 * 60 * 1000

  if (Number.isNaN(dueAt)) return null
  if (now <= dueAt) return 'Open'
  if (now <= graceUntil) return 'In grace'
  return 'Past grace'
}

export default function ManageAssignmentsPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<RoomWithAccount[]>([])
  const [profiles, setProfiles] = useState<ManagedProfile[]>([])
  const [assignments, setAssignments] = useState<RoomResponsibilityWithDetails[]>([])
  const [form, setForm] = useState<AssignmentFormState>(buildEmptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === form.room_id) ?? null,
    [form.room_id, rooms]
  )

  const loadAssignments = useCallback(async () => {
    setIsLoading(true)
    try {
      const identity = await getCurrentAppUserIdentity()
      if (!identity) {
        setRooms([])
        setProfiles([])
        setAssignments([])
        return
      }

      const [fetchedProfiles, fetchedRooms, fetchedAssignments] = await Promise.all([
        fetchManagedProfiles(identity.lookupIds),
        fetchRooms(identity.lookupIds),
        fetchRoomResponsibilities(identity.lookupIds),
      ])

      setProfiles(fetchedProfiles)
      setRooms(fetchedRooms)
      setAssignments(fetchedAssignments)
      setForm((currentForm) => ({
        ...currentForm,
        room_id: currentForm.room_id || fetchedRooms[0]?.id || '',
        assigned_profile_id: currentForm.assigned_profile_id || fetchedProfiles[0]?.id || '',
      }))
    } catch (error) {
      toast.error('Failed to load assignments')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAssignments()
  }, [loadAssignments])

  const setDuePreset = (hoursFromNow: number) => {
    const date = new Date()
    date.setHours(date.getHours() + hoursFromNow)
    date.setMinutes(0, 0, 0)
    setForm((currentForm) => ({ ...currentForm, due_at: toLocalDateTimeInput(date) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoom) {
      toast.error('Select a room')
      return
    }

    const graceHours = Number(form.grace_hours)
    if (!Number.isFinite(graceHours) || graceHours < 0) {
      toast.error('Enter a valid grace period')
      return
    }

    setIsSaving(true)
    try {
      const identity = await requireCurrentAppUserIdentity()
      const projection = getProjectedRoomCredit(selectedRoom)
      const createdAssignment = await createRoomResponsibility({
        app_user_id: identity.appUserId,
        room_id: form.room_id,
        assigned_profile_id: form.assigned_profile_id,
        assigned_by: identity.appUserId,
        due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
        grace_hours: graceHours,
        starting_room_state: selectedRoom.state,
        starting_room_balance: projection.balance,
      })

      setAssignments([createdAssignment, ...assignments])
      setForm((currentForm) => ({
        ...currentForm,
        due_at: getDefaultDueAt(),
        grace_hours: String(economyRates.responsibility.graceHours),
      }))
      toast.success('Assignment created')
    } catch (error) {
      toast.error('Failed to create assignment')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const cancelAssignment = async (assignmentId: string) => {
    setIsSaving(true)
    try {
      const updatedAssignment = await updateRoomResponsibilityStatus(assignmentId, 'cancelled')
      setAssignments(assignments.map((assignment) => (
        assignment.id === assignmentId ? updatedAssignment : assignment
      )))
      toast.success('Assignment cancelled')
    } catch (error) {
      toast.error('Failed to cancel assignment')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="rounded-md bg-gray-800 p-5 shadow-lg sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-gray-400">Admin tools</p>
            <h1 className="text-3xl font-bold text-white">Manage Assignments</h1>
          </div>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="w-full rounded-md bg-gray-700 px-4 py-3 font-medium text-white transition hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 sm:w-auto"
          >
            Back to Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mb-8 space-y-4">
          <select
            value={form.room_id}
            onChange={(e) => setForm({ ...form, room_id: e.target.value })}
            className="w-full rounded-md bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select room</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} - {roomStateLabels[room.state]}
              </option>
            ))}
          </select>

          <select
            value={form.assigned_profile_id}
            onChange={(e) => setForm({ ...form, assigned_profile_id: e.target.value })}
            className="w-full rounded-md bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Assign to profile</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>{profile.name}</option>
            ))}
          </select>

          <div className="rounded-md bg-gray-900 p-4">
            <label htmlFor="due-at" className="mb-2 block text-sm font-medium text-gray-300">Due date and time</label>
            <input
              id="due-at"
              type="datetime-local"
              value={form.due_at}
              onChange={(e) => setForm({ ...form, due_at: e.target.value })}
              className="w-full rounded-md bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDuePreset(2)}
                className="rounded-md bg-gray-700 px-3 py-2 text-sm text-white hover:bg-gray-600"
              >
                2 hours
              </button>
              <button
                type="button"
                onClick={() => setDuePreset(24)}
                className="rounded-md bg-gray-700 px-3 py-2 text-sm text-white hover:bg-gray-600"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setDuePreset(48)}
                className="rounded-md bg-gray-700 px-3 py-2 text-sm text-white hover:bg-gray-600"
              >
                2 days
              </button>
            </div>
          </div>

          <label className="block rounded-md bg-gray-900 p-4">
            <span className="mb-2 block text-sm font-medium text-gray-300">Grace period in hours</span>
            <input
              type="number"
              min="0"
              max="168"
              step="0.25"
              value={form.grace_hours}
              onChange={(e) => setForm({ ...form, grace_hours: e.target.value })}
              className="w-full rounded-md bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isSaving || rooms.length === 0 || profiles.length === 0}
            className="w-full rounded-md bg-blue-600 p-3 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-600"
          >
            {isSaving ? 'Saving...' : 'Create Assignment'}
          </button>
        </form>

        {isLoading ? (
          <p className="text-gray-300">Loading...</p>
        ) : assignments.length === 0 ? (
          <div className="rounded-md bg-gray-700 p-4 text-gray-300">No room assignments yet.</div>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => {
              const timingLabel = getTimingLabel(assignment)
              const canCancel = assignment.status === 'assigned' || assignment.status === 'submitted'

              return (
                <div key={assignment.id} className="rounded-md bg-gray-700 p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-white">{assignment.rooms?.name ?? 'Unknown room'}</h2>
                      <p className="text-sm text-gray-300">{assignment.managed_profiles?.name ?? 'Unknown profile'}</p>
                      <p className="text-xs text-gray-400">
                        Started as {assignment.starting_room_state ? roomStateLabels[assignment.starting_room_state] : 'unknown state'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusTone[assignment.status]}`}>
                        {assignment.status}
                      </span>
                      {timingLabel && (
                        <span className="rounded-full bg-gray-800 px-2 py-1 text-xs text-gray-200">{timingLabel}</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                    <div className="rounded-md bg-gray-800 p-3">
                      <p className="text-gray-400">Due</p>
                      <p className="font-medium text-white">{formatDateTime(assignment.due_at)}</p>
                    </div>
                    <div className="rounded-md bg-gray-800 p-3">
                      <p className="text-gray-400">Grace Until</p>
                      <p className="font-medium text-white">{formatGraceUntil(assignment)}</p>
                    </div>
                    <div className="rounded-md bg-gray-800 p-3">
                      <p className="text-gray-400">Grace</p>
                      <p className="font-medium text-white">{assignment.grace_hours} hours</p>
                    </div>
                  </div>

                  {canCancel && (
                    <button
                      type="button"
                      onClick={() => cancelAssignment(assignment.id)}
                      disabled={isSaving}
                      className="w-full rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-gray-600 sm:w-auto"
                    >
                      Cancel Assignment
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
