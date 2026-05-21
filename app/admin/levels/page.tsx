'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { fetchLevels, LevelData } from '@/utils/api/levels'

const ManageLevelsPage = () => {
  const [levels, setLevels] = useState<LevelData[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-300 hover:text-white mr-4"
          >
            &larr;
          </button>
          <h1 className="text-3xl font-bold text-white">Levels</h1>
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
                </tr>
              </thead>
              <tbody>
                {levels.length > 0 ? (
                  levels.map((level) => (
                    <tr key={level.level_number} className="border-b border-gray-700">
                      <td className="px-4 py-2">{level.level_number}</td>
                      <td className="px-4 py-2">{level.xp_required}</td>
                      <td className="px-4 py-2">{level.cumulative_xp ?? '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-3 text-gray-400" colSpan={3}>No levels found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageLevelsPage
