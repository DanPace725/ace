'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import {
  adjustRoomCredits,
  archiveRoom,
  createRoom,
  fetchRooms,
  getProjectedRoomCredit,
  settleRoomCredits,
  updateRoom,
} from '@/utils/api/economy'
import { getCurrentAppUserIdentity, requireCurrentAppUserIdentity } from '@/utils/api/appUsers'
import { fetchManagedProfiles } from '@/utils/api/profiles'
import { economyRates, roomStateLabels } from '@/utils/economyConfig'
import { ManagedProfile, RoomState, RoomWithAccount } from '@/types/app'

type RoomFormState = {
  name: string
  state: RoomState
  is_shared: boolean
  assigned_profile_id: string
}

type CreditAdjustmentState = {
  amount: string
  note: string
}

const emptyRoomForm: RoomFormState = {
  name: '',
  state: 'clean',
  is_shared: false,
  assigned_profile_id: '',
}

const emptyCreditAdjustment: CreditAdjustmentState = {
  amount: '',
  note: '',
}

const roomStates = Object.keys(roomStateLabels) as RoomState[]

const formatCredits = (value?: number | null) => `${(value ?? 0).toFixed(2)} credits`

const formatDelta = (value: number) => {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)} credits`
}

export default function ManageRoomsPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<RoomWithAccount[]>([])
  const [profiles, setProfiles] = useState<ManagedProfile[]>([])
  const [roomForm, setRoomForm] = useState<RoomFormState>(emptyRoomForm)
  const [editForm, setEditForm] = useState<RoomFormState>(emptyRoomForm)
  const [creditForm, setCreditForm] = useState<CreditAdjustmentState>(emptyCreditAdjustment)
  const [editingRoom, setEditingRoom] = useState<RoomWithAccount | null>(null)
  const [adjustingRoom, setAdjustingRoom] = useState<RoomWithAccount | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [clock, setClock] = useState(() => Date.now())

  const profileNameById = profiles.reduce<Record<string, string>>((lookup, profile) => {
    lookup[profile.id] = profile.name
    return lookup
  }, {})

  const loadRooms = useCallback(async () => {
    setIsLoading(true)
    try {
      const identity = await getCurrentAppUserIdentity()
      if (!identity) {
        setRooms([])
        setProfiles([])
        return
      }

      const [fetchedProfiles, fetchedRooms] = await Promise.all([
        fetchManagedProfiles(identity.lookupIds),
        fetchRooms(identity.lookupIds),
      ])
      setProfiles(fetchedProfiles)
      setRooms(fetchedRooms)
    } catch (error) {
      toast.error('Failed to load rooms')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  useEffect(() => {
    const intervalId = window.setInterval(() => setClock(Date.now()), 30000)
    return () => window.clearInterval(intervalId)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const identity = await requireCurrentAppUserIdentity()
      const createdRoom = await createRoom({
        app_user_id: identity.appUserId,
        name: roomForm.name,
        state: roomForm.state,
        is_shared: roomForm.is_shared,
        assigned_profile_id: roomForm.assigned_profile_id || null,
      })
      setRooms([createdRoom, ...rooms])
      setRoomForm(emptyRoomForm)
      toast.success('Room created successfully')
    } catch (error) {
      toast.error('Failed to create room')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (room: RoomWithAccount) => {
    setEditingRoom(room)
    setEditForm({
      name: room.name,
      state: room.state,
      is_shared: room.is_shared,
      assigned_profile_id: room.assigned_profile_id ?? '',
    })
  }

  const closeEditModal = () => {
    setEditingRoom(null)
    setEditForm(emptyRoomForm)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRoom) return

    setIsLoading(true)
    try {
      const identity = await requireCurrentAppUserIdentity()
      const updatedRoom = await updateRoom(
        editingRoom,
        {
          name: editForm.name,
          state: editForm.state,
          is_shared: editForm.is_shared,
          assigned_profile_id: editForm.assigned_profile_id || null,
        },
        identity.appUserId
      )
      setRooms(rooms.map((room) => (
        room.id === updatedRoom.id ? { ...room, ...updatedRoom } : room
      )))
      closeEditModal()
      await loadRooms()
      toast.success('Room updated successfully')
    } catch (error) {
      toast.error('Failed to update room')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleArchive = async (roomId: string) => {
    if (!window.confirm('Archive this room?')) return

    try {
      await archiveRoom(roomId)
      setRooms(rooms.filter((room) => room.id !== roomId))
      toast.success('Room archived successfully')
    } catch (error) {
      toast.error('Failed to archive room')
      console.error(error)
    }
  }

  const handleAdjustCredits = (room: RoomWithAccount) => {
    setAdjustingRoom(room)
    setCreditForm(emptyCreditAdjustment)
  }

  const closeCreditModal = () => {
    setAdjustingRoom(null)
    setCreditForm(emptyCreditAdjustment)
  }

  const submitCreditAdjustment = async (direction: 'add' | 'remove') => {
    if (!adjustingRoom) return

    const amount = Number(creditForm.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a credit amount greater than zero')
      return
    }

    setIsLoading(true)
    try {
      const identity = await requireCurrentAppUserIdentity()
      await adjustRoomCredits({
        room: adjustingRoom,
        amount: direction === 'add' ? amount : -amount,
        note: creditForm.note,
        created_by: identity.appUserId,
      })
      closeCreditModal()
      await loadRooms()
      toast.success(direction === 'add' ? 'Credits added' : 'Credits removed')
    } catch (error) {
      toast.error('Failed to adjust credits')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettleRoom = async (room: RoomWithAccount) => {
    setIsLoading(true)
    try {
      const identity = await requireCurrentAppUserIdentity()
      const event = await settleRoomCredits(room, identity.appUserId)
      await loadRooms()
      toast.success(event ? 'Room credits settled' : 'No credit change to settle')
    } catch (error) {
      toast.error('Failed to settle room credits')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderRoomForm = (
    form: RoomFormState,
    setForm: React.Dispatch<React.SetStateAction<RoomFormState>>,
    submitLabel: string
  ) => (
    <>
      <input
        type="text"
        placeholder="Room Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full rounded-md bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <select
        value={form.state}
        onChange={(e) => setForm({ ...form, state: e.target.value as RoomState })}
        className="w-full rounded-md bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {roomStates.map((state) => (
          <option key={state} value={state}>{roomStateLabels[state]}</option>
        ))}
      </select>
      <select
        value={form.assigned_profile_id}
        onChange={(e) => setForm({ ...form, assigned_profile_id: e.target.value })}
        className="w-full rounded-md bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">No assigned profile</option>
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>{profile.name}</option>
        ))}
      </select>
      <label className="flex items-start gap-3 rounded-md bg-gray-700 p-3 text-sm text-gray-200">
        <input
          type="checkbox"
          checked={form.is_shared}
          onChange={(e) => setForm({ ...form, is_shared: e.target.checked })}
          className="mt-1 h-4 w-4"
        />
        <span>
          <span className="block font-medium text-white">Shared room</span>
          <span className="text-gray-300">Shared rooms can affect the house account later.</span>
        </span>
      </label>
      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 p-3 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-600"
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : submitLabel}
      </button>
    </>
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-4xl rounded-lg bg-gray-800 p-5 shadow-lg sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-gray-400">Admin tools</p>
            <h1 className="text-3xl font-bold text-white">Manage Rooms</h1>
          </div>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="w-full rounded-md bg-gray-700 px-4 py-3 font-medium text-white transition hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 sm:w-auto"
          >
            Back to Admin
          </button>
        </div>

        <div className="mb-6 rounded-md bg-gray-900 p-4 text-sm text-gray-300">
          Clean rooms earn {(economyRates.room.cleanHourly * 100).toFixed(2)}% per hour. Messy rooms lose {Math.abs(economyRates.room.messyHourly * 100).toFixed(2)}% per hour.
        </div>

        <form onSubmit={handleSubmit} className="mb-8 space-y-4">
          {renderRoomForm(roomForm, setRoomForm, 'Create Room')}
        </form>

        {isLoading && rooms.length === 0 ? (
          <p className="text-gray-300">Loading...</p>
        ) : rooms.length === 0 ? (
          <div className="rounded-md bg-gray-700 p-4 text-gray-300">No rooms created yet.</div>
        ) : (
          <div className="space-y-3">
            {rooms.map((room) => {
              const projection = getProjectedRoomCredit(room, new Date(clock))
              const deltaTone = projection.delta >= 0 ? 'text-green-300' : 'text-red-300'

              return (
                <div key={room.id} className="rounded-md bg-gray-700 p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-white">{room.name}</h2>
                      <p className="text-sm text-gray-300">{roomStateLabels[room.state]}</p>
                      <p className="text-sm text-gray-300">
                        {room.assigned_profile_id ? `Assigned to ${profileNameById[room.assigned_profile_id] ?? 'Unknown profile'}` : 'No assigned profile'}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium text-white">{formatCredits(projection.balance)}</p>
                      <p className={deltaTone}>{formatDelta(projection.delta)} projected</p>
                      <p className="text-gray-300">{room.is_shared ? 'Shared' : 'Private'}</p>
                    </div>
                  </div>
                  <div className="mb-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                    <div className="rounded-md bg-gray-800 p-3">
                      <p className="text-gray-400">Stored</p>
                      <p className="font-medium text-white">{formatCredits(room.credit_account?.balance)}</p>
                    </div>
                    <div className="rounded-md bg-gray-800 p-3">
                      <p className="text-gray-400">Rate</p>
                      <p className="font-medium text-white">{(projection.rate * 100).toFixed(2)}% / hour</p>
                    </div>
                    <div className="rounded-md bg-gray-800 p-3">
                      <p className="text-gray-400">Elapsed</p>
                      <p className="font-medium text-white">{projection.elapsedHours.toFixed(1)} hours</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <button
                      type="button"
                      onClick={() => handleArchive(room.id)}
                      className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500"
                    >
                      Archive
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSettleRoom(room)}
                      className="rounded-md bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-500"
                    >
                      Settle
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustCredits(room)}
                      className="rounded-md bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
                    >
                      Credits
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(room)}
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {adjustingRoom && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-4 sm:items-center sm:justify-center">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="adjust-room-credits-title"
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-md bg-gray-800 p-5 shadow-xl"
            >
              <div className="mb-5">
                <p className="text-sm text-gray-400">Adjust credits</p>
                <h2 id="adjust-room-credits-title" className="text-2xl font-bold text-white">{adjustingRoom.name}</h2>
              </div>
              <div className="mb-4 rounded-md bg-gray-900 p-3 text-sm text-gray-300">
                <p>Projected balance: <span className="font-medium text-white">{formatCredits(getProjectedRoomCredit(adjustingRoom, new Date(clock)).balance)}</span></p>
                <p>Stored balance: <span className="font-medium text-white">{formatCredits(adjustingRoom.credit_account?.balance)}</span></p>
              </div>
              <div className="space-y-4">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount"
                  value={creditForm.amount}
                  onChange={(e) => setCreditForm({ ...creditForm, amount: e.target.value })}
                  className="w-full rounded-md bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Note"
                  value={creditForm.note}
                  onChange={(e) => setCreditForm({ ...creditForm, note: e.target.value })}
                  className="min-h-24 w-full rounded-md bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => submitCreditAdjustment('remove')}
                    className="rounded-md bg-red-600 p-3 font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-gray-600"
                    disabled={isLoading}
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={() => submitCreditAdjustment('add')}
                    className="rounded-md bg-green-700 p-3 font-medium text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-600"
                    disabled={isLoading}
                  >
                    Apply
                  </button>
                </div>
                <button
                  type="button"
                  onClick={closeCreditModal}
                  className="w-full rounded-md bg-gray-600 p-3 font-medium text-white transition hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {editingRoom && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-4 sm:items-center sm:justify-center">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-room-title"
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-md bg-gray-800 p-5 shadow-xl"
            >
              <div className="mb-5">
                <p className="text-sm text-gray-400">Edit room</p>
                <h2 id="edit-room-title" className="text-2xl font-bold text-white">{editingRoom.name}</h2>
              </div>
              <form onSubmit={handleUpdate} className="space-y-4">
                {renderRoomForm(editForm, setEditForm, 'Save Changes')}
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="w-full rounded-md bg-gray-600 p-3 font-medium text-white transition hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Discard
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
