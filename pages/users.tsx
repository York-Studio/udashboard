import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { FaUserPlus, FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'manager' | 'staff';
  password?: string;
}

const UsersPage: NextPage = () => {
  const { user, users, addUser, removeUser, updateUser } = useAuth();
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    role: 'staff' as 'admin' | 'manager' | 'staff',
  });
  const [editingUser, setEditingUser] = useState<null | {
    id: string;
    username: string;
    name: string;
    role: 'admin' | 'manager' | 'staff';
  }>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      toast.error('You do not have permission to access this page');
      router.push('/');
    } else {
      setIsLoading(false);
    }
  }, [user, router]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = addUser({
        ...newUser,
        id: Math.random().toString(36).substring(2, 9),
      });

      if (success) {
        toast.success(`User ${newUser.username} added successfully`);
        setNewUser({
          username: '',
          password: '',
          name: '',
          role: 'staff',
        });
      }
    } catch (err) {
      toast.error('Failed to add user');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveUser = (userId: string, username: string) => {
    // Don't allow removing your own account
    if (user && userId === user.id) {
      toast.error("You cannot remove your own account");
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete user ${username}?`);
    
    if (confirmed) {
      const success = removeUser(userId);
      if (success) {
        toast.success(`User ${username} removed successfully`);
      } else {
        toast.error('Failed to remove user');
      }
    }
  };

  const handleEditUser = (userId: string) => {
    const userToEdit = users.find((u: User) => u.id === userId);
    if (userToEdit) {
      setEditingUser({
        id: userToEdit.id,
        username: userToEdit.username,
        name: userToEdit.name,
        role: userToEdit.role,
      });
    }
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;

    try {
      const success = updateUser(editingUser.id, {
        username: editingUser.username,
        name: editingUser.name,
        role: editingUser.role,
      });

      if (success) {
        toast.success(`User ${editingUser.username} updated successfully`);
        setEditingUser(null);
      } else {
        toast.error('Failed to update user');
      }
    } catch (err) {
      toast.error('An error occurred while updating user');
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Users Management (Admin Only) | Restaurant Dashboard</title>
      </Head>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-text">
              Users Management
            </h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
              Administrator access required. Manage user accounts and permissions.
            </p>
          </div>
        </div>

        {/* Add User Form */}
        <div className="mt-8 bg-white dark:bg-dark-card shadow overflow-hidden sm:rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-4">
            Add New User
          </h2>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  required
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  placeholder="johndoe"
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-dark-input text-gray-900 dark:text-dark-text focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="••••••••"
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-dark-input text-gray-900 dark:text-dark-text focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="John Doe"
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-dark-input text-gray-900 dark:text-dark-text focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as 'admin' | 'manager' | 'staff'})}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-dark-input text-gray-900 dark:text-dark-text focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-800 bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FaUserPlus className="mr-2" />
                    Add User
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Users List */}
        <div className="mt-8 bg-white dark:bg-dark-card shadow sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-dark-card">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Username
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((userItem: User) => (
                  <tr key={userItem.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                      {editingUser && editingUser.id === userItem.id ? (
                        <input
                          type="text"
                          value={editingUser.name}
                          onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                          className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1 px-2 bg-white dark:bg-dark-input text-gray-900 dark:text-dark-text focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      ) : (
                        userItem.name
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                      {editingUser && editingUser.id === userItem.id ? (
                        <input
                          type="text"
                          value={editingUser.username}
                          onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                          className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1 px-2 bg-white dark:bg-dark-input text-gray-900 dark:text-dark-text focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      ) : (
                        userItem.username
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                      {editingUser && editingUser.id === userItem.id ? (
                        <select
                          value={editingUser.role}
                          onChange={(e) => setEditingUser({...editingUser, role: e.target.value as 'admin' | 'manager' | 'staff'})}
                          className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1 px-2 bg-white dark:bg-dark-input text-gray-900 dark:text-dark-text focus:outline-none focus:ring-primary focus:border-primary"
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="staff">Staff</option>
                        </select>
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          userItem.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                            : userItem.role === 'manager'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {userItem.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingUser && editingUser.id === userItem.id ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={handleSaveEdit}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-200"
                          >
                            <FaCheck className="h-5 w-5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200"
                          >
                            <FaTimes className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditUser(userItem.id)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200"
                          >
                            <FaEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleRemoveUser(userItem.id, userItem.username)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200"
                            disabled={user ? user.id === userItem.id : false}
                          >
                            <FaTrash className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UsersPage; 