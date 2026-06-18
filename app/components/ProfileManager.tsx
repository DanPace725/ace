'use client'

import { useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { createManagedProfile, fetchManagedProfiles, updateManagedProfile, deleteManagedProfile } from '@/utils/api/users'
import {
  adjustProfileCredits,
  ensureProfileCreditAccount,
  ensureProfileCreditAccounts,
  fetchCreditAccountsForProfiles,
} from '@/utils/api/economy'
import { CreditAccount, ManagedProfile, ProfileWithAccount } from '@/types/app'

interface ProfileManagerProps {
  userId: string
  fallbackUserId?: string
  canCreateProfile?: boolean
}

const ProfileManager = ({ userId, fallbackUserId, canCreateProfile = true }: ProfileManagerProps) => {
  const [name, setName] = useState('')
  const [requiresReview, setRequiresReview] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profiles, setProfiles] = useState<ProfileWithAccount[]>([])
  const [editingProfile, setEditingProfile] = useState<string | null>(null)
  const [adjustingProfile, setAdjustingProfile] = useState<ProfileWithAccount | null>(null)
  const [creditAmount, setCreditAmount] = useState('')
  const [creditNote, setCreditNote] = useState('')
  const router = useRouter()

  const formatCredits = (value?: number | null) => `${(value ?? 0).toFixed(2)} credits`

  const attachCreditAccounts = useCallback(async (managedProfiles: ManagedProfile[]) => {
    const accounts = await fetchCreditAccountsForProfiles(managedProfiles.map((profile) => profile.id))
    const accountsByProfileId = accounts.reduce<Record<string, CreditAccount>>((lookup, account) => {
      if (account.profile_id) lookup[account.profile_id] = account
      return lookup
    }, {})

    return managedProfiles.map((profile) => ({
      ...profile,
      credit_account: accountsByProfileId[profile.id] ?? null,
    }))
  }, [])

  const loadProfiles = useCallback(async () => {
    try {
      const fetchedProfiles = await fetchManagedProfiles(
        fallbackUserId ? [userId, fallbackUserId] : userId
      )
      setProfiles(await attachCreditAccounts(fetchedProfiles))
    } catch (error) {
      toast.error('Failed to load profiles')
      console.error(error)
    }
  }, [attachCreditAccounts, fallbackUserId, userId])

  useEffect(() => {
    loadProfiles()
  }, [loadProfiles])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canCreateProfile) {
      toast.error('Cannot create a profile until the app user record is available')
      return
    }

    setIsLoading(true)

    try {
      const newProfile = await createManagedProfile(name, userId, requiresReview)
      const creditAccount = await ensureProfileCreditAccount(userId, newProfile.id)
      setProfiles([{ ...newProfile, credit_account: creditAccount }, ...profiles])
      setName('')
      setRequiresReview(false)
      toast.success('Profile created successfully')
    } catch (error) {
      toast.error('Failed to create profile')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async (profileId: string, newName: string, shouldRequireReview: boolean) => {
    try {
      await updateManagedProfile(profileId, newName, shouldRequireReview)
      setProfiles(profiles.map(p => p.id === profileId ? { ...p, name: newName, requires_review: shouldRequireReview } : p))
      setEditingProfile(null)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
      console.error(error)
    }
  }

  const handleDelete = async (profileId: string) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      try {
        await deleteManagedProfile(profileId)
        setProfiles(profiles.filter(p => p.id !== profileId))
        toast.success('Profile deleted successfully')
      } catch (error) {
        toast.error('Failed to delete profile')
        console.error(error)
      }
    }
  }

  const handleEnsureCreditAccounts = async () => {
    if (profiles.length === 0) {
      toast.info('No profiles need credit accounts yet')
      return
    }

    setIsLoading(true)
    try {
      await ensureProfileCreditAccounts(userId, profiles.map((profile) => profile.id))
      await loadProfiles()
      toast.success('Profile credit accounts are ready')
    } catch (error) {
      toast.error('Failed to prepare profile credit accounts')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const openCreditModal = (profile: ProfileWithAccount) => {
    setAdjustingProfile(profile)
    setCreditAmount('')
    setCreditNote('')
  }

  const closeCreditModal = () => {
    setAdjustingProfile(null)
    setCreditAmount('')
    setCreditNote('')
  }

  const submitCreditAdjustment = async (direction: 'add' | 'remove') => {
    if (!adjustingProfile) return

    const amount = Number(creditAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a credit amount greater than zero')
      return
    }

    setIsLoading(true)
    try {
      await adjustProfileCredits({
        app_user_id: userId,
        profile: adjustingProfile,
        amount: direction === 'add' ? amount : -amount,
        note: creditNote,
        created_by: userId,
      })
      closeCreditModal()
      await loadProfiles()
      toast.success(direction === 'add' ? 'Credits added' : 'Credits removed')
    } catch (error) {
      toast.error('Failed to adjust profile credits')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-3xl font-bold text-white">Manage Profiles</h1>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="w-full rounded-md bg-gray-600 px-4 py-3 font-medium text-white transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 sm:w-auto"
          >
            Back to Admin
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 mb-8">
          {!canCreateProfile && (
            <p className="rounded-md bg-yellow-900/40 p-3 text-sm text-yellow-100">
              Profile creation is unavailable because the app user record could not be found.
            </p>
          )}
          <div>
            <label htmlFor="name" className="block text-gray-300 mb-2">Profile Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <label className="flex items-start gap-3 rounded-md bg-gray-700 p-3 text-sm text-gray-200">
            <input
              type="checkbox"
              checked={requiresReview}
              onChange={(e) => setRequiresReview(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span>
              <span className="block font-medium text-white">Require review before awarding XP</span>
              <span className="text-gray-300">Logged tasks will wait in the admin review queue.</span>
            </span>
          </label>

          <div className="flex">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              disabled={isLoading || !canCreateProfile}
            >
              {isLoading ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </form>

        <h2 className="text-2xl font-bold text-white mb-4">Your Profiles</h2>
        <button
          type="button"
          onClick={handleEnsureCreditAccounts}
          className="mb-4 w-full rounded-md bg-gray-600 px-4 py-3 font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-700"
          disabled={isLoading || profiles.length === 0}
        >
          Ensure Credit Accounts
        </button>
        {profiles.length > 0 ? (
          <ul className="space-y-2">
            {profiles.map((profile) => (
              <li key={profile.id} className="bg-gray-700 p-3 rounded-md">
                {editingProfile === profile.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfiles(profiles.map(p => p.id === profile.id ? { ...p, name: e.target.value } : p))}
                      className="w-full bg-gray-600 text-white p-2 rounded-md"
                    />
                    <label className="flex items-start gap-3 text-sm text-gray-200">
                      <input
                        type="checkbox"
                        checked={Boolean(profile.requires_review)}
                        onChange={(e) => setProfiles(profiles.map(p => (
                          p.id === profile.id ? { ...p, requires_review: e.target.checked } : p
                        )))}
                        className="mt-1 h-4 w-4"
                      />
                      <span>Require review before awarding XP</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(profile.id, profile.name, Boolean(profile.requires_review))}
                        className="flex-1 bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingProfile(null)}
                        className="flex-1 bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white">{profile.name}</span>
                      <p className="text-xs text-gray-300">{formatCredits(profile.credit_account?.balance)}</p>
                      {profile.requires_review && (
                        <p className="text-xs text-yellow-300">Review required</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(profile.id)}
                        className="text-red-400 hover:text-red-500"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => openCreditModal(profile)}
                        className="text-green-300 hover:text-green-200"
                      >
                        Credits
                      </button>
                      <button
                        onClick={() => setEditingProfile(profile.id)}
                        className="text-blue-400 hover:text-blue-500"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No profiles created yet.</p>
        )}

        {adjustingProfile && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-4 sm:items-center sm:justify-center">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="adjust-profile-credits-title"
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-md bg-gray-800 p-5 shadow-xl"
            >
              <div className="mb-5">
                <p className="text-sm text-gray-400">Adjust profile credits</p>
                <h2 id="adjust-profile-credits-title" className="text-2xl font-bold text-white">{adjustingProfile.name}</h2>
              </div>
              <div className="mb-4 rounded-md bg-gray-900 p-3 text-sm text-gray-300">
                Current balance: <span className="font-medium text-white">{formatCredits(adjustingProfile.credit_account?.balance)}</span>
              </div>
              <div className="space-y-4">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="w-full rounded-md bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Note"
                  value={creditNote}
                  onChange={(e) => setCreditNote(e.target.value)}
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
      </div>
    </div>
  )
}

export default ProfileManager
