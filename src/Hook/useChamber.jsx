import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';
import { db } from '../db/MasterDB'; 

const generateLocalId = () => {
    return typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const useChamber = () => {
    const axiosSecure = UseAxiosSecure();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- FETCH AND STORE ALL CHAMBERS & CLEAR GHOST DATA ---
    const populateOfflineDatabase = useCallback(async (branch) => {
        if (!navigator.onLine || !branch) return;

        try {
            console.log("Downloading chamber data for offline use...");

            const { data } = await axiosSecure.get(`/chambers/${branch}/get-all`, {
                params: { limit: 10000 } 
            });
            
            if (data?.success && data?.data) {
                const bulkData = data.data.map(c => ({
                    ...c, localId: c._id, syncStatus: 'synced'
                }));
                
                await db.chambers.bulkPut(bulkData);
                console.log(`Successfully stored ${bulkData.length} chambers offline.`);

                // --- PRODUCTION GRADE GHOST-BUSTING ---
                const serverRecordIds = new Set(data.data.map(c => c._id));
                const allLocal = await db.chambers.where('branch').equals(branch).toArray();
                
                const ghostsToDelete = allLocal
                    .filter(c => 
                        c.syncStatus === 'synced' && 
                        !serverRecordIds.has(c.localId) && 
                        !serverRecordIds.has(c._id)
                    )
                    .map(c => c.localId);

                if (ghostsToDelete.length > 0) {
                    await db.chambers.bulkDelete(ghostsToDelete);
                    console.log(`Ghost cleanup: Permanently deleted ${ghostsToDelete.length} chambers that were removed from the cloud.`);
                }
            }
        } catch (err) {
            console.warn("Background bulk sync failed for chambers", err);
        }
    }, [axiosSecure]);

    // --- BACKGROUND SYNC FUNCTION ---
    const triggerSync = useCallback(async () => {
        if (!navigator.onLine) return;

      const queue = await db.syncQueue.filter(item => item.collection === 'chambers').sortBy('timestamp');
        if (queue.length === 0) return;

        console.log(`Syncing ${queue.length} chambers to the server...`);

        for (const item of queue) {
            try {
                const chamberRecord = await db.chambers.get(item.data.localId || item.data._id);

                if (item.action === 'CREATE') {
                    if (!chamberRecord) {
                        await db.syncQueue.delete(item.id);
                        continue;
                    }
                    const payload = { ...chamberRecord };
                    delete payload.localId;
                    delete payload.syncStatus;
                    delete payload._id;

                    const { data } = await axiosSecure.post('/chambers/post', payload);
                    
                    // --- Prevent Duplicates by replacing the UUID record entirely ---
                    const serverDoc = data?.data || data; 
                    await db.chambers.delete(item.data.localId); 
                    await db.chambers.put({
                        ...chamberRecord,
                        ...serverDoc, 
                        localId: serverDoc._id, 
                        syncStatus: 'synced'
                    });
                }
                else if (item.action === 'UPDATE') {
                    if (!chamberRecord) {
                        await db.syncQueue.delete(item.id);
                        continue;
                    }
                    const payload = { ...chamberRecord };
                    delete payload.localId;
                    delete payload.syncStatus;

                    const targetId = item.data._id || item.targetId;
                    await axiosSecure.put(`/chambers/update/${targetId}`, payload);
                    await db.chambers.update(item.data.localId || item.data._id, { syncStatus: 'synced' });
                }
                else if (item.action === 'DELETE') {
                    const targetId = item.data._id || item.targetId;
                    if (targetId && !item.data.localId?.toString().includes(targetId)) {
                        await axiosSecure.delete(`/chambers/delete/${targetId}`);
                    }
                    await db.chambers.delete(item.data.localId || item.data._id);
                }

                await db.syncQueue.delete(item.id);
                
            } catch (err) {
                console.error("Chamber sync failed for item:", item, err);
                const status = err.response?.status;
                
                if (status >= 400 && status < 500) {
                    if (item.action === 'CREATE') {
                        await db.chambers.delete(item.data.localId);
                    } else {
                        await db.chambers.update(item.data.localId || item.data._id, { syncStatus: 'synced' });
                    }
                    await db.syncQueue.delete(item.id);
                } else {
                    break;
                }
            }
        }
    }, [axiosSecure]);

    // --- UPGRADED: CACHE-FIRST FETCH CHAMBERS ---
    const getChambersByBranch = useCallback(async (branch, params) => {
        setLoading(true);
        setError(null);

        const trueTotalKey = `branch_${branch}_total_chambers`;
        let serverTotalItems = parseInt(localStorage.getItem(trueTotalKey)) || 0;

        try {
            // 1. ALWAYS query Dexie first
            let allLocal = await db.chambers
                .where('branch').equals(branch)
                .filter(c => c.syncStatus !== 'pending_delete')
                .toArray();

            allLocal.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            serverTotalItems = Math.max(serverTotalItems, allLocal.length);

            // 2. BACKGROUND REVALIDATION
            if (navigator.onLine) {
                axiosSecure.get(`/chambers/${branch}/get-all`, { params }).then(async ({ data }) => {
                    if (data?.success && data?.data) {
                        if (data.pagination?.totalItems) {
                            localStorage.setItem(trueTotalKey, data.pagination.totalItems);
                        }

                        const localChambers = data.data.map(c => ({
                            ...c, localId: c._id, syncStatus: 'synced'
                        }));
                        
                        for (const lc of localChambers) {
                            const existing = await db.chambers.get(lc.localId);
                            if (!existing || existing.syncStatus === 'synced') {
                                await db.chambers.put({ ...lc });
                            }
                        }
                    }
                }).catch(err => console.warn("Background cache update failed or timed out", err));
            }

            // --- Pagination & Search Setup ---
            if (params?.search) {
                const s = params.search.toLowerCase();
                allLocal = allLocal.filter(c =>
                    c.name?.toLowerCase().includes(s) ||
                    c.chamberName?.toLowerCase().includes(s) ||
                    c.phone?.toLowerCase().includes(s) ||
                    c.mobileNumber?.toLowerCase().includes(s)
                );
                serverTotalItems = allLocal.length; 
            }

            const page = params?.page || 1;
            const limit = params?.limit || 10;
            const skip = (page - 1) * limit;
            
            // UI Deduplicator: Hide ghost drafts while background cleans them
            const pendingNames = allLocal.filter(c => c.syncStatus === 'pending_create').map(c => c.name || c.chamberName);
            const displayData = allLocal.filter(c => !(c.syncStatus === 'synced' && pendingNames.includes(c.name || c.chamberName)));

            const paginatedData = displayData.slice(skip, skip + limit);
            const hasDataForThisPage = paginatedData.length > 0;

            // DYNAMIC OFFLINE PAGINATION SHRINKING
            const displayTotalItems = navigator.onLine ? serverTotalItems : displayData.length;
            const displayTotalPages = Math.ceil(displayTotalItems / limit) || 1;

            // 3. CACHE HIT
            if (hasDataForThisPage || !navigator.onLine) {
                console.log("Serving Chambers from Dexie Cache");
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
            console.log(`Cache miss for page ${page}. Fetching older chambers from Server...`);
            const { data } = await axiosSecure.get(`/chambers/${branch}/get-all`, { params });
            
            if (data?.success && data?.data) {
                if (data.pagination?.totalItems) {
                    localStorage.setItem(trueTotalKey, data.pagination.totalItems);
                }

                const localChambers = data.data.map(c => ({
                    ...c, localId: c._id, syncStatus: 'synced'
                }));
                for (const lc of localChambers) {
                    await db.chambers.put({ ...lc });
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

    // --- CREATE CHAMBER ---
    const createChamber = async (chamberData) => {
        setLoading(true);
        setError(null);
        const localId = generateLocalId();
        const localData = { ...chamberData, localId, _id: localId, syncStatus: 'pending_create', createdAt: new Date().toISOString() };

        try {
            if (!navigator.onLine) throw new Error('OFFLINE');
            
            const { data } = await axiosSecure.post('/chambers/post', chamberData);
            const serverDoc = data?.data || data; 
            await db.chambers.put({ ...serverDoc, localId: serverDoc._id, syncStatus: 'synced' });
            return serverDoc;
        } catch (err) {
            const isOffline = !navigator.onLine || err.message === 'OFFLINE' || err.code === 'ERR_NETWORK';
            const isServerHang = err.response?.status >= 500;

            if (isOffline || isServerHang) {
                await db.chambers.put({ ...localData });
                await db.syncQueue.add({
                    action: 'CREATE', collection: 'chambers', data: localData, timestamp: Date.now(), retryCount: 0
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

    // --- UPDATE CHAMBER ---
    const updateChamber = async (id, updateData) => {
        setLoading(true);
        setError(null);
        try {
            if (!navigator.onLine) throw new Error('OFFLINE');
            
            const { data } = await axiosSecure.put(`/chambers/update/${id}`, updateData);
            const serverDoc = data?.data || data;
            await db.chambers.put({ ...serverDoc, localId: serverDoc._id || id, syncStatus: 'synced' });
            return serverDoc;
        } catch (err) {
            const isOffline = !navigator.onLine || err.message === 'OFFLINE' || err.code === 'ERR_NETWORK';
            const isServerHang = err.response?.status >= 500;

            if (isOffline || isServerHang) {
                const existingRecord = await db.chambers.get(id) || {};
                const localData = { ...existingRecord, ...updateData, localId: id, _id: id, syncStatus: 'pending_update' };
                await db.chambers.put({ ...localData });
                await db.syncQueue.add({
                    action: 'UPDATE', collection: 'chambers', data: localData, targetId: id, timestamp: Date.now(), retryCount: 0
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

    // --- REMOVE CHAMBER ---
    const removeChamber = async (id) => {
        setLoading(true);
        setError(null);
        try {
            if (!navigator.onLine) throw new Error('OFFLINE');
            if (!id) throw new Error("Invalid or missing ID provided.");

            // 1. Delete from Server
            if (!id.toString().includes('-')) { 
                await axiosSecure.delete(`/chambers/delete/${id}`);
            }
            
            // 2. ROBUST LOCAL DELETE
            await db.chambers.delete(id);
            
            const fallbackCheck = await db.chambers.where('_id').equals(id).first();
            if (fallbackCheck) {
                await db.chambers.delete(fallbackCheck.localId);
            }
            
            return { success: true };
        } catch (err) {
            const isOffline = !navigator.onLine || err.message === 'OFFLINE' || err.code === 'ERR_NETWORK';
            const isServerHang = err.response?.status >= 500;

            if (isOffline || isServerHang) {
                const chamber = await db.chambers.get(id);
                if (chamber) {
                    await db.chambers.update(id, { syncStatus: 'pending_delete' });
                    await db.syncQueue.add({
                        action: 'DELETE', collection: 'chambers', data: chamber, targetId: id, timestamp: Date.now(), retryCount: 0
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
        getChambersByBranch,
        createChamber,
        updateChamber,
        removeChamber,
        triggerSync,
        populateOfflineDatabase
    };
};

export default useChamber;