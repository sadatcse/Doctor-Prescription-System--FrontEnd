import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';
import { db } from '../db/MasterDB'; // <-- INJECTED FOR PWA

const useMedicine = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- NEW PWA LOGIC: DELTA SYNC BULK LOAD ---
  const populateOfflineDatabase = useCallback(async () => {
    if (!navigator.onLine) return;

    try {
      const lastSync = localStorage.getItem('lastMedSync');
      console.log(lastSync ? "Checking for new medicines..." : "Downloading full medicine database...");

      // Call the new dedicated Bulk Sync route (with delta timestamp if available)
      const url = lastSync 
        ? `/medicinepwa/bulk-sync?after=${lastSync}` 
        : `/medicinepwa/bulk-sync`;

      const { data } = await axiosSecure.get(url);

      if (data?.success && data?.data && data.data.length > 0) {
         const bulkData = data.data.map(med => ({
             ...med, 
             localId: med._id, 
             syncStatus: 'synced'
         }));
         
         await db.medicines.bulkPut(bulkData);
         localStorage.setItem('lastMedSync', new Date().toISOString());
         console.log(`Successfully synced ${bulkData.length} medicines to Dexie!`);
      } else {
         console.log("Offline medicine database is already up to date.");
      }
    } catch (err) {
      console.warn("Background bulk sync failed for medicines", err);
    }
  }, [axiosSecure]);

  const getPaginatedMedicines = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      // --- NEW PWA LOGIC: CACHE-FIRST SEARCH ---
      if (params?.search) {
        const termToLower = params.search.toLowerCase();
        let localResults = await db.medicines
          .filter(med => 
            med.brandName?.toLowerCase().includes(termToLower) || 
            med.genericName?.toLowerCase().includes(termToLower)
          )
          .limit(params.limit || 20)
          .toArray();

        if (localResults.length > 0 || !navigator.onLine) {
          return { data: localResults }; 
        }
      }
      // --- END PWA LOGIC ---

      // ORIGINAL API CALL
      const { data } = await axiosSecure.get('/medicines', { params });

      // --- NEW PWA LOGIC: SAVE TO CACHE FOR NEXT TIME ---
      if (params?.search) {
        const resultsToCache = data?.data?.data || data?.data || data?.medicines || (Array.isArray(data) ? data : []);
        if (Array.isArray(resultsToCache) && resultsToCache.length > 0) {
          const validMeds = resultsToCache.filter(med => med._id); 
          if (validMeds.length > 0) {
             await db.medicines.bulkPut(validMeds);
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

  const getAllMedicines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.get('/medicines/get-all');
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const getMedicineById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.get(`/medicines/get-id/${id}`);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const getMedicinesByManufacturer = useCallback(async (manufacturer) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.get(`/medicines/filter/manufacturer/${manufacturer}`);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const getMedicinesByGenericName = useCallback(async (genericName) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.get(`/medicines/filter/generic/${genericName}`);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const createMedicine = async (medicineData) => {
    setLoading(true);
    setError(null);
    try {
      if (!navigator.onLine) throw new Error('OFFLINE'); // <-- INJECTED FOR PWA

      const { data } = await axiosSecure.post('/medicines/post', medicineData);
      
      // Save new medicine directly to cache
      const serverDoc = data?.data || data;
      if (serverDoc && serverDoc._id) await db.medicines.put(serverDoc); 

      return data;
    } catch (err) {
      // --- NEW PWA LOGIC: OFFLINE QUEUEING ---
      const isOffline = !navigator.onLine || err.message === 'OFFLINE' || err.code === 'ERR_NETWORK';
      if (isOffline) {
        const localId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
        const localData = { ...medicineData, _id: localId, localId, syncStatus: 'pending_create' };
        
        await db.medicines.put(localData);
        await db.syncQueue.add({
          action: 'CREATE', collection: 'medicines', data: localData, timestamp: Date.now(), retryCount: 0
        });
        return { data: localData, success: true };
      }
      // --- END PWA LOGIC ---

      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMedicine = async (id, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.put(`/medicines/update/${id}`, updateData);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeMedicine = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.delete(`/medicines/delete/${id}`);
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
    getPaginatedMedicines,
    getAllMedicines,
    getMedicineById,
    getMedicinesByManufacturer,
    getMedicinesByGenericName,
    createMedicine,
    updateMedicine,
    removeMedicine,
    populateOfflineDatabase // <-- Exported
  };
};

export default useMedicine;