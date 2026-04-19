import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure'; // Adjust this import path if needed based on your folder structure

export const useEmailAccount = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // GET: Fetch all email accounts
  const getAllEmailAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.get('/email-accounts');
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // GET: Fetch a single email account by ID
  const getEmailAccountById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.get(`/email-accounts/get-id/${id}`);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // POST: Create a new email account
  const createEmailAccount = async (accountData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.post('/email-accounts/post', accountData);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // PUT: Update an existing email account
  const updateEmailAccount = async (id, accountData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.put(`/email-accounts/update/${id}`, accountData);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // DELETE: Remove an email account
  const deleteEmailAccount = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.delete(`/email-accounts/delete/${id}`);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getAllEmailAccounts,
    getEmailAccountById,
    createEmailAccount,
    updateEmailAccount,
    deleteEmailAccount
  };
};