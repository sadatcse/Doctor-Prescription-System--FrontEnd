import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';
import { db } from '../db/MasterDB';

const generateLocalId = () => {
    return typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const usePreCheckup = () => {
    const axiosSecure = UseAxiosSecure();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- FETCH AND STORE ALL DATA & CLEAR GHOST DATA ---
    const populateOfflineDatabase = useCallback(async (branch) => {
        if (!navigator.onLine || !branch) return;

        try {
            console.log("Downloading ALL pre-checkup data for offline use...");

            const { data } = await axiosSecure.get(`/precheckups/${branch}/get-all`, {
                params: { 
                    limit: 10000 
                } 
            });
            
            if (data?.success && data?.data) {
                const allPreCheckups = data.data;

                // Dexie hooks in MasterDB will automatically encrypt sensitive fields
                const bulkData = allPreCheckups.map(pc => ({
                    ...pc, localId: pc._id, syncStatus: 'synced'
                }));
                
                await db.preCheckups.bulkPut(bulkData);
                console.log(`Successfully stored ${bulkData.length} encrypted pre-checkups offline.`);

                // --- PRODUCTION GRADE GHOST-BUSTING ---
                const serverRecordIds = new Set(allPreCheckups.map(pc => pc._id));
                const allLocal = await db.preCheckups.toArray();
                
                const ghostsToDelete = allLocal
                    .filter(pc => 
                        pc.syncStatus === 'synced' && 
                        !serverRecordIds.has(pc.localId) && 
                        !serverRecordIds.has(pc._id)
                    )
                    .map(pc => pc.localId);

                if (ghostsToDelete.length > 0) {
                    await db.preCheckups.bulkDelete(ghostsToDelete);
                    console.log(`Ghost cleanup: Permanently deleted ${ghostsToDelete.length} pre-checkups removed from cloud.`);
                }
            }
        } catch (err) {
            console.warn("Background bulk sync failed for pre-checkups", err);
        }
    }, [axiosSecure]);

    // --- BACKGROUND SYNC FUNCTION ---
    const triggerSync = useCallback(async () => {
        if (!navigator.onLine) return;

        const queue = await db.syncQueue.filter(item => item.collection === 'preCheckups').sortBy('timestamp');
        if (queue.length === 0) return;

        console.log(`Syncing ${queue.length} pre-checkups to the server...`);

        for (const item of queue) {
            try {
                const pcRecord = await db.preCheckups.get(item.data.localId || item.data._id);

                if (item.action === 'CREATE' || item.action === 'CREATE_FULL') {
                    if (!pcRecord) {
                        await db.syncQueue.delete(item.id);
                        continue;
                    }
                    const payload = { ...pcRecord };
                    delete payload.localId;
                    delete payload.syncStatus;
                    delete payload._id;

                    const endpoint = item.action === 'CREATE_FULL' ? '/precheckups/create-full' : '/precheckups/post';
                    const { data } = await axiosSecure.post(endpoint, payload);
                    
                    const serverDoc = data?.data || data;
                    await db.preCheckups.delete(item.data.localId); 
                    await db.preCheckups.put({
                        ...pcRecord,
                        ...serverDoc, 
                        localId: serverDoc._id, 
                        syncStatus: 'synced'
                    });
                }
                else if (item.action === 'UPDATE') {
                    if (!pcRecord) {
                        await db.syncQueue.delete(item.id);
                        continue;
                    }
                    const payload = { ...pcRecord };
                    delete payload.localId;
                    delete payload.syncStatus;

                    const targetId = item.data._id || item.targetId;
                    await axiosSecure.put(`/precheckups/update/${targetId}`, payload);
                    await db.preCheckups.update(item.data.localId || item.data._id, { syncStatus: 'synced' });
                }
                else if (item.action === 'DELETE') {
                    const targetId = item.data._id || item.targetId;
                    if (targetId && !item.data.localId?.toString().includes(targetId)) {
                        await axiosSecure.delete(`/precheckups/delete/${targetId}`);
                    }
                    await db.preCheckups.delete(item.data.localId || item.data._id);
                }

                await db.syncQueue.delete(item.id);
                
            } catch (err) {
                console.error("PreCheckup sync failed for item:", item, err);
                const status = err.response?.status;
                
                if (status >= 400 && status < 500) {
                    if (item.action === 'CREATE' || item.action === 'CREATE_FULL') {
                        await db.preCheckups.delete(item.data.localId);
                    } else {
                        await db.preCheckups.update(item.data.localId || item.data._id, { syncStatus: 'synced' });
                    }
                    await db.syncQueue.delete(item.id);
                } else {
                    break;
                }
            }
        }
    }, [axiosSecure]);

    // --- UPGRADED: CACHE-FIRST FETCH PRE-CHECKUPS ---
    const getPreCheckupsByBranch = useCallback(async (branch, params) => {
        setLoading(true);
        setError(null);

        const trueTotalKey = `branch_${branch}_total_precheckups`;
        let serverTotalItems = parseInt(localStorage.getItem(trueTotalKey)) || 0;

        try {
            // 1. ALWAYS query Dexie first (reading hook decrypts data)
            // FIX: Use .toArray() first so we don't skip unindexed offline items missing 'branch'
            let allLocal = await db.preCheckups.toArray();
            allLocal = allLocal.filter(pc => 
                (pc.branch === branch || !pc.branch) && 
                pc.syncStatus !== 'pending_delete'
            );

            allLocal.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            serverTotalItems = Math.max(serverTotalItems, allLocal.length);

            // 2. BACKGROUND REVALIDATION
            if (navigator.onLine) {
                axiosSecure.get(`/precheckups/${branch}/get-all`, { params }).then(async ({ data }) => {
                    if (data?.success && data?.data) {
                        if (data.pagination?.totalItems) {
                            localStorage.setItem(trueTotalKey, data.pagination.totalItems);
                        }

                        const localPCs = data.data.map(pc => ({
                            ...pc, localId: pc._id, syncStatus: 'synced'
                        }));
                        
                        for (const lpc of localPCs) {
                            const existing = await db.preCheckups.get(lpc.localId);
                            if (!existing || existing.syncStatus === 'synced') {
                                await db.preCheckups.put({ ...lpc });
                            }
                        }
                    }
                }).catch(err => console.warn("Background cache update failed", err));
            }

            // --- Pagination & Search Setup ---
            if (params?.search) {
                const s = params.search.toLowerCase();
                allLocal = allLocal.filter(pc =>
                    pc.patient?.fullName?.toLowerCase().includes(s) ||
                    pc.patient?.phone?.toLowerCase().includes(s) ||
                    pc.appointmentId?.appointmentId?.toLowerCase().includes(s)
                );
                serverTotalItems = allLocal.length; 
            }

            const page = params?.page || 1;
            const limit = params?.limit || 10;
            const skip = (page - 1) * limit;
            
            // UI Deduplicator
            const pendingIds = allLocal.filter(pc => pc.syncStatus === 'pending_create' || pc.syncStatus === 'pending_create_full').map(pc => pc.localId);
            const displayData = allLocal.filter(pc => !(pc.syncStatus === 'synced' && pendingIds.includes(pc.localId)));

            const paginatedData = displayData.slice(skip, skip + limit);
            const hasDataForThisPage = paginatedData.length > 0;

            const displayTotalItems = navigator.onLine ? serverTotalItems : displayData.length;
            const displayTotalPages = Math.ceil(displayTotalItems / limit) || 1;

            // 3. CACHE HIT
            if (hasDataForThisPage || !navigator.onLine) {
                console.log("Serving PreCheckups from Dexie Cache");
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
            console.log(`Cache miss for page ${page}. Fetching from Server...`);
            const { data } = await axiosSecure.get(`/precheckups/${branch}/get-all`, { params });
            
            if (data?.success && data?.data) {
                if (data.pagination?.totalItems) {
                    localStorage.setItem(trueTotalKey, data.pagination.totalItems);
                }
                const localPCs = data.data.map(pc => ({
                    ...pc, localId: pc._id, syncStatus: 'synced'
                }));
                for (const lpc of localPCs) {
                    await db.preCheckups.put({ ...lpc });
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

    // --- GET PRE-CHECKUP BY ID ---
    const getPreCheckupById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            // Check cache first
            const cachedRecord = await db.preCheckups.get(id);
            if (cachedRecord && cachedRecord.syncStatus !== 'pending_delete') {
                setLoading(false);
                return { success: true, data: cachedRecord };
            }

            if (!navigator.onLine) throw new Error('OFFLINE');

            const { data } = await axiosSecure.get(`/precheckups/get-id/${id}`);
            if (data?.success && data?.data) {
                await db.preCheckups.put({ ...data.data, localId: data.data._id, syncStatus: 'synced' });
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

    // --- CREATE PRE-CHECKUP ---
    const createPreCheckup = async (preCheckupData) => {
        setLoading(true);
        setError(null);
        const localId = generateLocalId();
        // FIX: Deep clone so the encryption hook doesn't encrypt our live React state
        const localData = JSON.parse(JSON.stringify({ ...preCheckupData, localId, _id: localId, syncStatus: 'pending_create', createdAt: new Date().toISOString() }));

        try {
            if (!navigator.onLine) throw new Error('OFFLINE');
            
            const { data } = await axiosSecure.post('/precheckups/post', preCheckupData);
            const serverDoc = data?.data || data; 
            await db.preCheckups.put({ ...serverDoc, localId: serverDoc._id, syncStatus: 'synced' });
            return serverDoc;
        } catch (err) {
            const isOffline = !navigator.onLine || err.message === 'OFFLINE' || err.code === 'ERR_NETWORK';
            const isServerHang = err.response?.status >= 500;

            if (isOffline || isServerHang) {
                await db.preCheckups.put({ ...localData });
                await db.syncQueue.add({
                    action: 'CREATE', collection: 'preCheckups', data: localData, timestamp: Date.now(), retryCount: 0
                });
                return { ...localData, success: true }; 
            }
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // --- CREATE PATIENT WITH PRE-CHECKUP (COMPOUND ACTION) ---
    const createPatientWithPreCheckup = async (fullData) => {
        setLoading(true);
        setError(null);
        const localId = generateLocalId();
        // FIX: Deep clone so the encryption hook doesn't encrypt our live React state
        const localData = JSON.parse(JSON.stringify({ ...fullData, localId, _id: localId, syncStatus: 'pending_create', createdAt: new Date().toISOString() }));

        try {
            if (!navigator.onLine) throw new Error('OFFLINE');
            
            const { data } = await axiosSecure.post('/precheckups/create-full', fullData);
            const serverDoc = data?.data || data;
            await db.preCheckups.put({ ...serverDoc, localId: serverDoc._id, syncStatus: 'synced' });
            return serverDoc;
        } catch (err) {
            const isOffline = !navigator.onLine || err.message === 'OFFLINE' || err.code === 'ERR_NETWORK';
            const isServerHang = err.response?.status >= 500;

            if (isOffline || isServerHang) {
                // Save compound payload to queue.
                await db.preCheckups.put({ ...localData });
                await db.syncQueue.add({
                    action: 'CREATE_FULL', collection: 'preCheckups', data: localData, timestamp: Date.now(), retryCount: 0
                });
                return { ...localData, success: true }; 
            }
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // --- UPDATE PRE-CHECKUP ---
    const updatePreCheckup = async (id, updateData) => {
        setLoading(true);
        setError(null);
        try {
            if (!navigator.onLine) throw new Error('OFFLINE');
            
            const { data } = await axiosSecure.put(`/precheckups/update/${id}`, updateData);
            const serverDoc = data?.data || data;
            await db.preCheckups.put({ ...serverDoc, localId: serverDoc._id || id, syncStatus: 'synced' });
            return serverDoc;
        } catch (err) {
            const isOffline = !navigator.onLine || err.message === 'OFFLINE' || err.code === 'ERR_NETWORK';
            const isServerHang = err.response?.status >= 500;

            if (isOffline || isServerHang) {
                const existingRecord = await db.preCheckups.get(id) || {};
                // FIX: Deep clone so the encryption hook doesn't encrypt our live React state
                const localData = JSON.parse(JSON.stringify({ ...existingRecord, ...updateData, localId: id, _id: id, syncStatus: 'pending_update' }));
                await db.preCheckups.put({ ...localData });
                await db.syncQueue.add({
                    action: 'UPDATE', collection: 'preCheckups', data: localData, targetId: id, timestamp: Date.now(), retryCount: 0
                });
                return { ...localData, success: true };
            }
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // --- REMOVE PRE-CHECKUP ---
    const removePreCheckup = async (id) => {
        setLoading(true);
        setError(null);
        try {
            if (!navigator.onLine) throw new Error('OFFLINE');
            if (!id) throw new Error("Invalid or missing ID provided.");

            if (!id.toString().includes('-')) { 
                await axiosSecure.delete(`/precheckups/delete/${id}`);
            }
            
            await db.preCheckups.delete(id);
            const fallbackCheck = await db.preCheckups.where('_id').equals(id).first();
            if (fallbackCheck) {
                await db.preCheckups.delete(fallbackCheck.localId);
            }
            
            return { success: true };
        } catch (err) {
            const isOffline = !navigator.onLine || err.message === 'OFFLINE' || err.code === 'ERR_NETWORK';
            const isServerHang = err.response?.status >= 500;

            if (isOffline || isServerHang) {
                const pc = await db.preCheckups.get(id);
                if (pc) {
                    await db.preCheckups.update(id, { syncStatus: 'pending_delete' });
                    await db.syncQueue.add({
                        action: 'DELETE', collection: 'preCheckups', data: pc, targetId: id, timestamp: Date.now(), retryCount: 0
                    });
                }
                return { success: true, message: "Scheduled for offline deletion" };
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
        getPreCheckupsByBranch,
        getPreCheckupById,
        createPreCheckup,
        updatePreCheckup,
        removePreCheckup,
        createPatientWithPreCheckup,
        triggerSync,
        populateOfflineDatabase
    };
};

export default usePreCheckup;