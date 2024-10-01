'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { createClient } from '@/utils/supabase/client';
import { fetchActions, createAction, updateAction, deleteAction } from '@/utils/api/actions';
import { Action } from '@/types/app';

const ManageActionsPage = () => {
  const [actions, setActions] = useState<Action[]>([]);
  const [actionForm, setActionForm] = useState({ name: '', description: '', base_xp: 0, frequency: '' });
  const [editingAction, setEditingAction] = useState<Action | null>(null);
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
        if (editingAction) {
          const updatedAction = await updateAction(editingAction.id, { ...actionForm, app_user_id: user.id });
          setActions(actions.map(a => a.id === editingAction.id ? updatedAction : a));
          setEditingAction(null);
          toast.success('Action updated successfully');
        } else {
          const createdAction = await createAction({ ...actionForm, app_user_id: user.id });
          setActions([createdAction, ...actions]);
          toast.success('Action created successfully');
        }
        setActionForm({ name: '', description: '', base_xp: 0, frequency: '' });
      }
    } catch (error) {
      toast.error('Failed to save action');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (action: Action) => {
    setEditingAction(action);
    setActionForm({
      name: action.name,
      description: action.description,
      base_xp: action.base_xp,
      frequency: action.frequency,
    });
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
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-300 hover:text-white mr-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-white">Manage Actions</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <input
            type="text"
            placeholder="Action Name"
            value={actionForm.name}
            onChange={(e) => setActionForm({...actionForm, name: e.target.value})}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={actionForm.description}
            onChange={(e) => setActionForm({...actionForm, description: e.target.value})}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Base XP"
            value={actionForm.base_xp}
            onChange={(e) => setActionForm({...actionForm, base_xp: parseInt(e.target.value)})}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Frequency"
            value={actionForm.frequency}
            onChange={(e) => setActionForm({...actionForm, frequency: e.target.value})}
            className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex space-x-4">
            {editingAction && (
              <button
                type="button"
                onClick={() => {
                  setEditingAction(null);
                  setActionForm({ name: '', description: '', base_xp: 0, frequency: '' });
                }}
                className="w-full bg-gray-600 text-white p-2 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : editingAction ? 'Update Action' : 'Create Action'}
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
                  <td className="px-4 py-2">{action.name}</td>
                  <td className="px-4 py-2">{action.description}</td>
                  <td className="px-4 py-2">{action.base_xp}</td>
                  <td className="px-4 py-2">{action.frequency}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleEdit(action)}
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