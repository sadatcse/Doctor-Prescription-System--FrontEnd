// src/Hook/usePatient.js
import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';
import { db, decryptText, encryptText, sensitivePatientFields } from '../db/MasterDB'; 

const generateLocalId = () => {
    return typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const usePatient = () => {
    const axiosSecure = UseAxiosSecure();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- NEW: FETCH AND STORE ONLY LAST 7 DAYS & CLEAR GHOST DATA ---
    const populateOfflineDatabase = useCallback(async (branch) => {
        if (!navigator.onLine || !branch) return;

        try {
            console.log("Downloading recent patient data (last 7 days) for offline use...");

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const cutoffIsoString = sevenDaysAgo.toISOString();

            const { data } = await axiosSecure.get(`/patients/${branch}/get-all`, {
                params: { 
                    limit: 10000, 
                    fromDate: cutoffIsoString 
                } 
            });
            
            if (data?.success && data?.data) {
                const recentPatients = data.data.filter(p => {
                    if (!p.createdAt) return true; 
                    return new Date(p.createdAt) >= sevenDaysAgo;
                });

                const bulkData = recentPatients.map(p => {
                    const localPatient = { ...p, localId: p._id, syncStatus: 'synced' };

                    sensitivePatientFields.forEach(field => {
                        if (localPatient[field] !== undefined && localPatient[field] !== null && localPatient[field] !== "") {
                            localPatient[field] = encryptText(localPatient[field]);
                        }
                    });

                    return localPatient;
                });
                
                await db.patients.bulkPut(bulkData);
                console.log(`Successfully stored ${bulkData.length} encrypted recent patients offline.`);

                // --- NEW: PRODUCTION GRADE GHOST-BUSTING ---
                const serverRecordIds = new Set(recentPatients.map(p => p._id));
                const allLocal = await db.patients.toArray();
                
                const ghostsToDelete = allLocal
                    .filter(p => 
                        p.syncStatus === 'synced' && 
                        p.createdAt && 
                        new Date(p.createdAt) >= sevenDaysAgo && 
                        !serverRecordIds.has(p.localId) && 
                        !serverRecordIds.has(p._id)
                    )
                    .map(p => p.localId);

                if (ghostsToDelete.length > 0) {
                    await db.patients.bulkDelete(ghostsToDelete);
                    console.log(`Ghost cleanup: Permanently deleted ${ghostsToDelete.length} records that were removed from the cloud.`);
                }

                // --- STANDARD AUTO-CLEANUP ---
                const staleRecordIds = allLocal
                    .filter(p => 
                        p.syncStatus === 'synced' && 
                        p.createdAt && 
                        new Date(p.createdAt) < sevenDaysAgo
                    )
                    .map(p => p.localId);

                if (staleRecordIds.length > 0) {
                    await db.patients.bulkDelete(staleRecordIds);
                    console.log(`Cleaned up ${staleRecordIds.length} old records from local cache.`);
                }
            }
        } catch (err) {
            console.warn("Background bulk sync failed", err);
        }
    }, [axiosSecure]);

    // --- GOAL 5: BACKGROUND SYNC FUNCTION ---
    const triggerSync = useCallback(async () => {
        if (!navigator.onLine) return;

        const queue = await db.syncQueue.orderBy('timestamp').toArray();
        if (queue.length === 0) return;

        console.log(`Syncing ${queue.length} items to the server...`);

        for (const item of queue) {
            try {
                const patientRecord = await db.patients.get(item.data.localId || item.data._id);

                if (item.action === 'CREATE') {
                    if (!patientRecord) {
                        await db.syncQueue.delete(item.id);
                        continue;
                    }
                    const payload = { ...patientRecord };
                    delete payload.localId;
                    delete payload.syncStatus;
                    delete payload._id;

                    const { data } = await axiosSecure.post('/patients/post', payload);
                    
                    // --- FIX: Prevent Duplicates by replacing the UUID record entirely ---
                    await db.patients.delete(item.data.localId); // Destroy the temporary draft
                    await db.patients.put({
                        ...patientRecord,
                        ...data, // Inject the server's response
                        localId: data._id, // Lock the Primary Key to the real MongoDB _id
                        syncStatus: 'synced'
                    });
                }
                else if (item.action === 'UPDATE') {
                    if (!patientRecord) {
                        await db.syncQueue.delete(item.id);
                        continue;
                    }
                    const payload = { ...patientRecord };
                    delete payload.localId;
                    delete payload.syncStatus;

                    const targetId = item.data._id || item.targetId;
                    await axiosSecure.put(`/patients/update/${targetId}`, payload);
                    await db.patients.update(item.data.localId || item.data._id, { syncStatus: 'synced' });
                }
                else if (item.action === 'DELETE') {
                    const targetId = item.data._id || item.targetId;
                    if (targetId && !item.data.localId?.toString().includes(targetId)) {
                        await axiosSecure.delete(`/patients/delete/${targetId}`);
                    }
                    await db.patients.delete(item.data.localId || item.data._id);
                }

                await db.syncQueue.delete(item.id);
                
            } catch (err) {
                console.error("Sync failed for item:", item, err);
                const status = err.response?.status;
                
                if (status >= 400 && status < 500) {
                    if (item.action === 'CREATE') {
                        await db.patients.delete(item.data.localId);
                    } else {
                        await db.patients.update(item.data.localId || item.data._id, { syncStatus: 'synced' });
                    }
                    await db.syncQueue.delete(item.id);
                } else {
                    break;
                }
            }
        }
    }, [axiosSecure]);

    // --- UPGRADED: CACHE-FIRST FETCH PATIENTS ---
    const getPatientsByBranch = useCallback(async (branch, params) => {
        setLoading(true);
        setError(null);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trueTotalKey = `branch_${branch}_total_patients`;
        let serverTotalItems = parseInt(localStorage.getItem(trueTotalKey)) || 0;

        try {
            // 1. ALWAYS query Dexie first
            let allLocal = await db.patients
                .where('branch').equals(branch)
                .filter(p => p.syncStatus !== 'pending_delete')
                .toArray();

            allLocal.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            serverTotalItems = Math.max(serverTotalItems, allLocal.length);

            // 2. BACKGROUND REVALIDATION
            if (navigator.onLine) {
                axiosSecure.get(`/patients/${branch}/get-all`, { params }).then(async ({ data }) => {
                    if (data?.success && data?.data) {
                        if (data.pagination?.totalItems) {
                            localStorage.setItem(trueTotalKey, data.pagination.totalItems);
                        }

                        const localPatients = data.data.map(p => ({
                            ...p, localId: p._id, syncStatus: 'synced'
                        }));
                        
                        for (const lp of localPatients) {
                            const existing = await db.patients.get(lp.localId);
                            if (!existing || existing.syncStatus === 'synced') {
                                if (!lp.createdAt || new Date(lp.createdAt) >= sevenDaysAgo) {
                                    await db.patients.put({ ...lp });
                                }
                            }
                        }
                    }
                }).catch(err => console.warn("Background cache update failed or timed out", err));
            }

            // --- Pagination & Search Setup ---
            if (params?.search) {
                const s = params.search.toLowerCase();
                allLocal = allLocal.filter(p =>
                    p.fullName?.toLowerCase().includes(s) ||
                    p.phone?.toLowerCase().includes(s) ||
                    p.bloodGroup?.toLowerCase().includes(s)
                );
                serverTotalItems = allLocal.length; 
            }

            const page = params?.page || 1;
            const limit = params?.limit || 10;
            const skip = (page - 1) * limit;
            const paginatedData = allLocal.slice(skip, skip + limit);
            const hasDataForThisPage = paginatedData.length > 0;

            // --- FIX: DYNAMIC OFFLINE PAGINATION SHRINKING ---
            const displayTotalItems = navigator.onLine ? serverTotalItems : allLocal.length;
            const displayTotalPages = Math.ceil(displayTotalItems / limit) || 1;

            // 3. CACHE HIT
            if (hasDataForThisPage || !navigator.onLine) {
                console.log("Serving Page from Dexie Cache");
                setLoading(false);
                return {
                    success: true,
                    data: paginatedData,
                    pagination: {
                        totalItems: displayTotalItems,
                        totalPages: displayTotalPages,
                        currentPage: page > displayTotalPages ? 1 : page, 
                        itemsPerPage: limit
                    }
                };
            }

            // 4. CACHE MISS
            console.log(`Cache miss for page ${page}. Fetching older data from Server...`);
            const { data } = await axiosSecure.get(`/patients/${branch}/get-all`, { params });
            
            if (data?.success && data?.data) {
                if (data.pagination?.totalItems) {
                    localStorage.setItem(trueTotalKey, data.pagination.totalItems);
                }

                const localPatients = data.data.map(p => ({
                    ...p, localId: p._id, syncStatus: 'synced'
                }));
                for (const lp of localPatients) {
                    if (!lp.createdAt || new Date(lp.createdAt) >= sevenDaysAgo) {
                        await db.patients.put({ ...lp });
                    }
                }
            }
            return data;

        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    // --- CREATE PATIENT ---
    const createPatient = async (patientData) => {
        setLoading(true);
        setError(null);
        const localId = generateLocalId();
        const localData = { ...patientData, localId, syncStatus: 'pending_create', createdAt: new Date().toISOString() };

        try {
            if (!navigator.onLine) throw new Error('OFFLINE');
            
            const { data } = await axiosSecure.post('/patients/post', patientData);
            await db.patients.put({ ...data, localId: data._id, syncStatus: 'synced' });
            return data;
        } catch (err) {
            const isOffline = !navigator.onLine || err.message === 'OFFLINE' || err.code === 'ERR_NETWORK';
            const isServerHang = err.response?.status >= 500;

            if (isOffline || isServerHang) {
                await db.patients.put({ ...localData });
                await db.syncQueue.add({
                    action: 'CREATE', collection: 'patients', data: localData, timestamp: Date.now(), retryCount: 0
                });
                return { ...localData, _id: localId }; 
            }
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // --- UPDATE PATIENT ---
    const updatePatient = async (id, updateData) => {
        setLoading(true);
        setError(null);
        try {
            if (!navigator.onLine) throw new Error('OFFLINE');
            
            const { data } = await axiosSecure.put(`/patients/update/${id}`, updateData);
            await db.patients.put({ ...data, localId: data._id || id, syncStatus: 'synced' });
            return data;
        } catch (err) {
            const isOffline = !navigator.onLine || err.message === 'OFFLINE' || err.code === 'ERR_NETWORK';
            const isServerHang = err.response?.status >= 500;

            if (isOffline || isServerHang) {
                const localData = { ...updateData, localId: id, _id: id, syncStatus: 'pending_update' };
                await db.patients.put({ ...localData });
                await db.syncQueue.add({
                    action: 'UPDATE', collection: 'patients', data: localData, targetId: id, timestamp: Date.now(), retryCount: 0
                });
                return localData;
            }
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // --- REMOVE PATIENT ---
    const removePatient = async (id) => {
        setLoading(true);
        setError(null);
        try {
            if (!navigator.onLine) throw new Error('OFFLINE');
            
            // 1. Delete from Server
            if (!id.toString().includes('-')) { 
                await axiosSecure.delete(`/patients/delete/${id}`);
            }
            
            // 2. ROBUST LOCAL DELETE: Ensure we catch it whether passed by localId or _id
            await db.patients.delete(id);
            
            // Safety fallback: if Dexie missed it because of an ID mismatch, force query and delete
            const fallbackCheck = await db.patients.where('_id').equals(id).first();
            if (fallbackCheck) {
                await db.patients.delete(fallbackCheck.localId);
            }
            
            return { success: true };
        } catch (err) {
            const isOffline = !navigator.onLine || err.message === 'OFFLINE' || err.code === 'ERR_NETWORK';
            const isServerHang = err.response?.status >= 500;

            if (isOffline || isServerHang) {
                const patient = await db.patients.get(id);
                if (patient) {
                    await db.patients.update(id, { syncStatus: 'pending_delete' });
                    await db.syncQueue.add({
                        action: 'DELETE', collection: 'patients', data: patient, targetId: id, timestamp: Date.now(), retryCount: 0
                    });
                }
                return { message: "Scheduled for offline deletion" };
            }
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
        getPatientsByBranch,
        createPatient,
        updatePatient,
        removePatient,
        triggerSync,
        populateOfflineDatabase 
    };
};

export default usePatient;