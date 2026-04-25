import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';
import { db } from '../db/MasterDB'; // <-- INJECTED FOR PWA

const useLabtest = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- NEW PWA LOGIC: DELTA SYNC BULK LOAD ---
  const populateOfflineLabtests = useCallback(async () => {
    if (!navigator.onLine) return;

    try {
      const lastSync = localStorage.getItem('lastLabSync');
      console.log(lastSync ? "Checking for new Lab Tests..." : "Downloading full lab test database...");

      // Call the dedicated Bulk Sync route
      const url = lastSync 
        ? `/labtestpwa/bulk-sync?after=${lastSync}` 
        : `/labtestpwa/bulk-sync`;

      const { data } = await axiosSecure.get(url);

      if (data?.success && data?.data && data.data.length > 0) {
         const bulkData = data.data.map(test => ({
             ...test, 
             localId: test._id, 
             syncStatus: 'synced'
         }));
         
         await db.labtests.bulkPut(bulkData);
         localStorage.setItem('lastLabSync', new Date().toISOString());
         console.log(`Successfully synced ${bulkData.length} Lab Tests to Dexie!`);
      } else {
         console.log("Offline Lab Test database is already up to date.");
      }
    } catch (err) {
      console.warn("Background bulk sync failed for lab tests", err);
    }
  }, [axiosSecure]);

  const getPaginatedLabtests = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      // --- NEW PWA LOGIC: CACHE-FIRST SEARCH ---
      if (params?.search) {
        const termToLower = params.search.toLowerCase();
        let localResults = await db.labtests
          .filter(test => test.testName?.toLowerCase().includes(termToLower))
          .limit(params.limit || 20)
          .toArray();

        if (localResults.length > 0 || !navigator.onLine) {
          // Wrap in the standard response format your component expects
          return { success: true, data: localResults }; 
        }
      }
      // --- END PWA LOGIC ---

      // ORIGINAL API CALL
      const { data } = await axiosSecure.get('/labtests', { params });

      // --- NEW PWA LOGIC: SAVE TO CACHE FOR NEXT TIME ---
      if (params?.search) {
        const resultsToCache = data?.data?.data || data?.data || data?.labtests || (Array.isArray(data) ? data : []);
        if (Array.isArray(resultsToCache) && resultsToCache.length > 0) {
          const validTests = resultsToCache.filter(test => test._id); 
          if (validTests.length > 0) {
             await db.labtests.bulkPut(validTests);
          }
        }
      }
      // --- END PWA LOGIC ---

      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const getLabtestById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.get(`/labtests/get-id/${id}`);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const createLabtest = async (labtestData) => {
    setLoading(true);
    setError(null);
    try {
      if (!navigator.onLine) throw new Error('OFFLINE'); // <-- INJECTED FOR PWA

      const { data } = await axiosSecure.post('/labtests/post', labtestData);
      
      // Save new lab test directly to cache
      const serverDoc = data?.data || data;
      if (serverDoc && serverDoc._id) await db.labtests.put(serverDoc); 

      return data;
    } catch (err) {
      // --- NEW PWA LOGIC: OFFLINE QUEUEING ---
      const isOffline = !navigator.onLine || err.message === 'OFFLINE' || err.code === 'ERR_NETWORK';
      if (isOffline) {
        const localId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
        const localData = { ...labtestData, _id: localId, localId, syncStatus: 'pending_create' };
        
        await db.labtests.put(localData);
        await db.syncQueue.add({
          action: 'CREATE', collection: 'labtests', data: localData, timestamp: Date.now(), retryCount: 0
        });
        return { success: true, data: localData };
      }
      // --- END PWA LOGIC ---

      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLabtest = async (id, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.put(`/labtests/update/${id}`, updateData);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeLabtest = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.delete(`/labtests/delete/${id}`);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getPaginatedLabtests,
    getLabtestById,
    createLabtest,
    updateLabtest,
    removeLabtest,
    populateOfflineLabtests // <-- Exported
  };
};

export default useLabtest;