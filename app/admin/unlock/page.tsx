'use client'

import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { getCurrentAppUserIdentity, requireCurrentAppUserIdentity } from '@/utils/api/appUsers'
import { fetchAdminPinSetting, saveAdminPin, verifyAdminPin } from '@/utils/api/adminPin'
import { isValidAdminPin, unlockAdminSession } from '@/utils/adminLock'

const getSafeNextPath = (nextPath: string | null) => {
  if (!nextPath || !nextPath.startsWith('/admin') || nextPath.startsWith('/admin/unlock')) {
    return '/admin'
  }

  return nextPath
}

function AdminUnlockForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [hasPin, setHasPin] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const nextPath = getSafeNextPath(searchParams.get('next'))

  const loadPinState = useCallback(async () => {
    setIsLoading(true)
    try {
      const identity = await getCurrentAppUserIdentity()
      if (!identity) {
        setHasPin(null)
        return
      }

      const setting = await fetchAdminPinSetting(identity.appUserId)
      setHasPin(Boolean(setting))
    } catch (error) {
      toast.error('Failed to load admin PIN')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPinState()
  }, [loadPinState])

  const handlePinChange = (value: string) => {
    setPin(value.replace(/\D/g, '').slice(0, 4))
  }

  const handleConfirmPinChange = (value: string) => {
    setConfirmPin(value.replace(/\D/g, '').slice(0, 4))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!isValidAdminPin(pin)) {
      toast.error('Enter a 4 digit PIN')
      return
    }

    setIsSaving(true)
    try {
      const identity = await requireCurrentAppUserIdentity()

      if (hasPin) {
        const isValid = await verifyAdminPin(identity.appUserId, pin)
        if (!isValid) {
          toast.error('Incorrect PIN')
          return
        }
      } else {
        if (pin !== confirmPin) {
          toast.error('PINs do not match')
          return
        }

        await saveAdminPin(identity.appUserId, pin)
        toast.success('Admin PIN created')
      }

      unlockAdminSession()
      router.replace(nextPath)
    } catch (error) {
      toast.error(hasPin ? 'Failed to unlock admin' : 'Failed to create admin PIN')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="rounded-md bg-gray-800 p-5 text-gray-300">Loading admin lock...</div>
  }

  return (
    <div className="rounded-md bg-gray-800 p-5 shadow-lg sm:p-8">
      <div className="mb-6">
        <p className="text-sm text-gray-400">Admin tools</p>
        <h1 className="text-3xl font-bold text-white">{hasPin ? 'Unlock Admin' : 'Create Admin PIN'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-300">4 digit PIN</span>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            value={pin}
            onChange={(event) => handlePinChange(event.target.value)}
            className="w-full rounded-md bg-gray-700 p-4 text-center font-mono text-2xl tracking-[0.5em] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
            autoFocus
            required
          />
        </label>

        {!hasPin && (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-300">Confirm PIN</span>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={confirmPin}
              onChange={(event) => handleConfirmPinChange(event.target.value)}
              className="w-full rounded-md bg-gray-700 p-4 text-center font-mono text-2xl tracking-[0.5em] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
              required
            />
          </label>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-md bg-blue-600 p-3 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-600"
        >
          {isSaving ? 'Working...' : hasPin ? 'Unlock' : 'Create PIN'}
        </button>
      </form>

      {!hasPin && (
        <p className="mt-4 rounded-md bg-gray-900 p-3 text-sm text-gray-300">
          This is a light friction lock for the admin screens, not a replacement for account security.
        </p>
      )}
    </div>
  )
}

export default function AdminUnlockPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center">
      <Suspense fallback={<div className="rounded-md bg-gray-800 p-5 text-gray-300">Loading admin lock...</div>}>
        <AdminUnlockForm />
      </Suspense>
    </div>
  )
}
