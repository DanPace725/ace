'use client'

import React, { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { fetchActions, createAction, updateAction, deleteAction } from '@/utils/api/actions';
import { Action } from '@/types/app';
import { getCurrentAppUserIdentity, requireCurrentAppUserIdentity } from '@/utils/api/appUsers';

type ActionFormState = {
  name: string;
  description: string;
  base_xp: number;
  frequency: string;
};

const emptyActionForm: ActionFormState = { name: '', description: '', base_xp: 0, frequency: '' };

const ManageActionsPage = () => {
  const [actions, setActions] = useState<Action[]>([]);
  const [actionForm, setActionForm] = useState<ActionFormState>(emptyActionForm);
  const [editForm, setEditForm] = useState<ActionFormState>(emptyActionForm);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const loadActions = useCallback(async () => {
    try {
      const identity = await getCurrentAppUserIdentity();
      if (identity) {
        const fetchedActions = await fetchActions(identity.lookupIds);
        setActions(fetchedActions);
      }
    } catch (error) {
      toast.error('Failed to load actions');
      console.error(error);
    }
  }, []);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const identity = await requireCurrentAppUserIdentity();
      if (identity) {
        const createdAction = await createAction({ ...actionForm, app_user_id: identity.appUserId });
        setActions([createdAction, ...actions]);
        setActionForm(emptyActionForm);
        toast.success('Action created successfully');
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
    setEditForm({
      name: action.name,
      description: action.description,
      base_xp: action.base_xp,
      frequency: action.frequency,
    });
  };

  const closeEditModal = () => {
    setEditingAction(null);
    setEditForm(emptyActionForm);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAction) return;

    setIsLoading(true);

    try {
      const identity = await requireCurrentAppUserIdentity();
      const updatedAction = await updateAction(editingAction.id, { ...editForm, app_user_id: identity.appUserId });
      setActions(actions.map(a => a.id === editingAction.id ? updatedAction : a));
      closeEditModal();
      toast.success('Action updated successfully');
    } catch (error) {
      toast.error('Failed to update action');
      console.error(error);
    } finally {
      setIsLoading(false);
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
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-gray-400">Admin tools</p>
            <h1 className="text-3xl font-bold text-white">Manage Actions</h1>
          </div>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="w-full rounded-md bg-gray-700 px-4 py-3 font-medium text-white transition hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 sm:w-auto"
          >
            Back to Admin
          </button>
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
            onChange={(e) => setActionForm({...actionForm, base_xp: Number.parseInt(e.target.value, 10) || 0})}
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
          <div className="flex">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Create Action'}
            </button>
          </div>
        </form>

        <div className="space-y-3 sm:hidden">
          {actions.map((action) => (
            <div key={action.id} className="rounded-md bg-gray-700 p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-white">{action.name}</h2>
                  <p className="text-sm text-gray-300">{action.description || 'No description'}</p>
                </div>
                <span className="shrink-0 rounded-full bg-blue-200 px-2 py-1 text-xs text-blue-800">{action.base_xp} XP</span>
              </div>
              <p className="mb-3 text-sm text-gray-300">Frequency: {action.frequency || 'None'}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(action.id)}
                  className="flex-1 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleEdit(action)}
                  className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto sm:block">
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
                      onClick={() => handleDelete(action.id)}
                      className="mr-2 text-red-400 hover:text-red-500"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleEdit(action)}
                      className="text-blue-400 hover:text-blue-500"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingAction && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-4 sm:items-center sm:justify-center">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-action-title"
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-md bg-gray-800 p-5 shadow-xl"
            >
              <div className="mb-5">
                <p className="text-sm text-gray-400">Edit task</p>
                <h2 id="edit-action-title" className="text-2xl font-bold text-white">{editingAction.name}</h2>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <input
                  type="text"
                  placeholder="Action Name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-md bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-md bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Base XP"
                  value={editForm.base_xp}
                  onChange={(e) => setEditForm({ ...editForm, base_xp: Number.parseInt(e.target.value, 10) || 0 })}
                  className="w-full rounded-md bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Frequency"
                  value={editForm.frequency}
                  onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })}
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
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageActionsPage;
