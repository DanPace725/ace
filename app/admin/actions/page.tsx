'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { createClient } from '@/utils/supabase/client';
import { fetchActions, createAction, updateAction, deleteAction } from '@/utils/api/actions';
import { Action } from '@/types/app';

const ManageActionsPage = () => {
  const [actions, setActions] = useState<Action[]>([]);
  const [newAction, setNewAction] = useState({ name: '', description: '', base_xp: 0, frequency: '' });
  const [editingAction, setEditingAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadActions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadActions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const fetchedActions = await fetchActions(user.id);
        setActions(fetchedActions);
      }
    } catch (error) {
      toast.error('Failed to load actions');
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const createdAction = await createAction({ ...newAction, app_user_id: user.id });
        setActions([createdAction, ...actions]);
        setNewAction({ name: '', description: '', base_xp: 0, frequency: '' });
        toast.success('Action created successfully');
      }
    } catch (error) {
      toast.error('Failed to create action');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (actionId: string, updatedAction: Partial<Action>) => {
    try {
      const updated = await updateAction(actionId, updatedAction);
      setActions(actions.map(a => a.id === actionId ? updated : a));
      setEditingAction(null);
      toast.success('Action updated successfully');
    } catch (error) {
      toast.error('Failed to update action');
      console.error(error);
    }
  };

  const handleDelete = async (actionId: string) => {
    if (window.confirm('Are you sure you want to delete this action?')) {
      try {
        await deleteAction(actionId);
        setActions(actions.filter(a => a.id !== actionId));
        toast.success('Action deleted successfully');
      } catch (error) {
        toast.error('Failed to delete action');
        console.error(error);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-4xl bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-8">Manage Actions</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <input
            type="text"
            placeholder="Action Name"
            value={newAction.name}
            onChange={(e) => setNewAction({...newAction, name: e.target.value})}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={newAction.description}
            onChange={(e) => setNewAction({...newAction, description: e.target.value})}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Base XP"
            value={newAction.base_xp}
            onChange={(e) => setNewAction({...newAction, base_xp: parseInt(e.target.value)})}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Frequency"
            value={newAction.frequency}
            onChange={(e) => setNewAction({...newAction, frequency: e.target.value})}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full bg-gray-600 text-white p-2 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Action'}
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300">
            <thead className="text-xs uppercase bg-gray-700">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Base XP</th>
                <th className="px-4 py-2">Frequency</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((action) => (
                <tr key={action.id} className="border-b border-gray-700">
                  <td className="px-4 py-2">
                    {editingAction === action.id ? (
                      <input
                        type="text"
                        value={action.name}
                        onChange={(e) => setActions(actions.map(a => a.id === action.id ? { ...a, name: e.target.value } : a))}
                        className="bg-gray-600 text-white p-1 rounded-md"
                      />
                    ) : (
                      action.name
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingAction === action.id ? (
                      <input
                        type="text"
                        value={action.description}
                        onChange={(e) => setActions(actions.map(a => a.id === action.id ? { ...a, description: e.target.value } : a))}
                        className="bg-gray-600 text-white p-1 rounded-md"
                      />
                    ) : (
                      action.description
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingAction === action.id ? (
                      <input
                        type="number"
                        value={action.base_xp}
                        onChange={(e) => setActions(actions.map(a => a.id === action.id ? { ...a, base_xp: parseInt(e.target.value) } : a))}
                        className="bg-gray-600 text-white p-1 rounded-md"
                      />
                    ) : (
                      action.base_xp
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingAction === action.id ? (
                      <input
                        type="text"
                        value={action.frequency}
                        onChange={(e) => setActions(actions.map(a => a.id === action.id ? { ...a, frequency: e.target.value } : a))}
                        className="bg-gray-600 text-white p-1 rounded-md"
                      />
                    ) : (
                      action.frequency
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingAction === action.id ? (
                      <>
                        <button
                          onClick={() => handleEdit(action.id, action)}
                          className="text-green-400 hover:text-green-500 mr-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingAction(null)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingAction(action.id)}
                          className="text-blue-400 hover:text-blue-500 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(action.id)}
                          className="text-red-400 hover:text-red-500"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageActionsPage;