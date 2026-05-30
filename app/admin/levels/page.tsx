'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { fetchLevels, LevelData, updateLevel } from '@/utils/api/levels'

type LevelFormState = {
  xp_required: string;
  cumulative_xp: string;
};

const ManageLevelsPage = () => {
  const [levels, setLevels] = useState<LevelData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingLevel, setEditingLevel] = useState<LevelData | null>(null)
  const [levelForm, setLevelForm] = useState<LevelFormState>({ xp_required: '', cumulative_xp: '' })
  const router = useRouter()

  useEffect(() => {
    const loadLevels = async () => {
      try {
        const data = await fetchLevels()
        setLevels(data)
      } catch (error) {
        toast.error('Failed to load levels')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLevels()
  }, [])

  const handleEdit = (level: LevelData) => {
    setEditingLevel(level)
    setLevelForm({
      xp_required: String(level.xp_required),
      cumulative_xp: level.cumulative_xp === null ? '' : String(level.cumulative_xp),
    })
  }

  const closeEditModal = () => {
    setEditingLevel(null)
    setLevelForm({ xp_required: '', cumulative_xp: '' })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLevel) return

    const xpRequired = Number.parseInt(levelForm.xp_required, 10)
    const cumulativeXP = levelForm.cumulative_xp.trim() === ''
      ? null
      : Number.parseInt(levelForm.cumulative_xp, 10)

    if (Number.isNaN(xpRequired) || (cumulativeXP !== null && Number.isNaN(cumulativeXP))) {
      toast.error('Please enter valid XP values')
      return
    }

    setIsSaving(true)
    try {
      const updatedLevel = await updateLevel(editingLevel.level_number, {
        xp_required: xpRequired,
        cumulative_xp: cumulativeXP,
      })
      setLevels(levels.map(level => (
        level.level_number === updatedLevel.level_number ? updatedLevel : level
      )))
      closeEditModal()
      toast.success('Level updated successfully')
    } catch (error) {
      toast.error('Failed to update level')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-gray-400">Admin tools</p>
            <h1 className="text-3xl font-bold text-white">Levels</h1>
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300">
              <thead className="text-xs uppercase bg-gray-700">
                <tr>
                  <th className="px-4 py-2">Level</th>
                  <th className="px-4 py-2">XP Required</th>
                  <th className="px-4 py-2">Cumulative XP</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {levels.length > 0 ? (
                  levels.map((level) => (
                    <tr key={level.level_number} className="border-b border-gray-700">
                      <td className="px-4 py-2">{level.level_number}</td>
                      <td className="px-4 py-2">{level.xp_required}</td>
                      <td className="px-4 py-2">{level.cumulative_xp ?? '-'}</td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(level)}
                          className="text-blue-400 hover:text-blue-500"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-3 text-gray-400" colSpan={4}>No levels found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {editingLevel && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-4 sm:items-center sm:justify-center">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-level-title"
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-md bg-gray-800 p-5 shadow-xl"
            >
              <div className="mb-5">
                <p className="text-sm text-gray-400">Edit level</p>
                <h2 id="edit-level-title" className="text-2xl font-bold text-white">Level {editingLevel.level_number}</h2>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <input
                  type="number"
                  placeholder="XP Required"
                  value={levelForm.xp_required}
                  onChange={(e) => setLevelForm({ ...levelForm, xp_required: e.target.value })}
                  className="w-full rounded-md bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Cumulative XP"
                  value={levelForm.cumulative_xp}
                  onChange={(e) => setLevelForm({ ...levelForm, cumulative_xp: e.target.value })}
                  className="w-full rounded-md bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="rounded-md bg-gray-600 p-3 font-medium text-white transition hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-blue-600 p-3 font-medium text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-600"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageLevelsPage
