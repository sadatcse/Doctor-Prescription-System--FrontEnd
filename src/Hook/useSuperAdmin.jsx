import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';

const useSuperAdmin = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reusable error extractor
  const getErrorMessage = (err) => {
    return err.response?.data?.message || err.response?.data?.error || err.message || "An unexpected error occurred";
  };

  const getAllUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.get('/user');
      return data;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw msg; // Throwing the string message
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const createUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.post('/user/post', userData);
      return data;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw msg;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.put(`/user/update/${id}`, updateData);
      return data;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw msg;
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.delete(`/user/delete/${id}`);
      return data;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw msg;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getAllUsers,
    createUser,
    updateUser,
    removeUser,
  };
};

export default useSuperAdmin;