import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';

export const useUser = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // GET: Fetch all users (Supports search, branch, and role query filters)
  const getUsers = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.get('/user', { params: filters });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);


  const getUserByBranch = useCallback(async (branch) => {
    setLoading(true);
    setError(null);
    try {

      const { data } = await axiosSecure.get(`/user/branch/${branch}`);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // GET: Fetch a single user by ID
  const getUserById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.get(`/user/get-id/${id}`);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // POST: Create a new user
  const createUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.post('/user/post', userData);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // PUT: Update an existing user
  const updateUser = async (id, userData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.put(`/user/update/${id}`, userData);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // PUT: Change user password
  const changePassword = async (passwordData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.put('/user/change-password', passwordData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // DELETE: Remove a user
  const deleteUser = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.delete(`/user/delete/${id}`);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getUsers,
    getUserByBranch,
    getUserById,
    createUser,
    updateUser,
    changePassword,
    deleteUser
  };
};