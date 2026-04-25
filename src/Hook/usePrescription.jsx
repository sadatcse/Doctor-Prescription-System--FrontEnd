import { useState, useCallback } from "react";
import UseAxiosSecure from "./UseAxioSecure";
import { db, encryptText, encryptData, sensitivePrescriptionFields, sensitivePrescriptionObjects } from "../db/MasterDB"; 

const generateLocalId = () => {
    return typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const usePrescription = (initialParams = null) => {
    const axiosSecure = UseAxiosSecure();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- FETCH AND STORE ONLY LAST 7 DAYS & CLEAR GHOST DATA ---
    const populateOfflineDatabase = useCallback(async (branch) => {
        if (!navigator.onLine || !branch) return;

        try {
            console.log("Downloading recent prescription data for offline use...");

            // const sevenDaysAgo = new Date();
            // sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            // const cutoffIsoString = sevenDaysAgo.toISOString();

            const { data } = await axiosSecure.get(`/prescriptions/${branch}/get-all`, {
                params: { limit: 10000 /*, fromDate: cutoffIsoString */ } 
            });
            
            if (data?.success && data?.data) {
                // const recentPrescriptions = data.data.filter(p => {
                //     if (!p.createdAt) return true; 
                //     return new Date(p.createdAt) >= sevenDaysAgo;
                // });
                const recentPrescriptions = data.data; // Bypass 7-day filter

                // Explicitly encrypt here because bulkPut bypasses the Dexie 'creating' hook
                const bulkData = recentPrescriptions.map(p => {
                    const localPresc = { ...p, localId: p._id, syncStatus: 'synced' };

                    sensitivePrescriptionFields.forEach(field => {
                        if (localPresc[field] !== undefined && localPresc[field] !== null && localPresc[field] !== "") {
                            localPresc[field] = encryptText(localPresc[field]);
                        }
                    });
                    sensitivePrescriptionObjects.forEach(field => {
                        if (localPresc[field] !== undefined && localPresc[field] !== null) {
                            localPresc[field] = typeof localPresc[field] === 'object' ? encryptData(localPresc[field]) : encryptText(localPresc[field]);
                        }
                    });

                    return localPresc;
                });
                
                await db.prescriptions.bulkPut(bulkData);
                console.log(`Successfully stored ${bulkData.length} encrypted recent prescriptions offline.`);

                // --- PRODUCTION GRADE GHOST-BUSTING ---
                const serverRecordIds = new Set(recentPrescriptions.map(p => p._id));
                const allLocal = await db.prescriptions.where('branch').equals(branch).toArray();
                
                const ghostsToDelete = allLocal
                    .filter(p => 
                        p.syncStatus === 'synced' && 
                        // p.createdAt && 
                        // new Date(p.createdAt) >= sevenDaysAgo && 
                        !serverRecordIds.has(p.localId) && 
                        !serverRecordIds.has(p._id)
                    )
                    .map(p => p.localId);

                if (ghostsToDelete.length > 0) {
                    await db.prescriptions.bulkDelete(ghostsToDelete);
                }

                // --- STANDARD AUTO-CLEANUP (Older than 7 days) ---
                // const staleRecordIds = allLocal
                //     .filter(p => 
                //         p.syncStatus === 'synced' && 
                //         p.createdAt && 
                //         new Date(p.createdAt) < sevenDaysAgo
                //     )
                //     .map(p => p.localId);

                // if (staleRecordIds.length > 0) {
                //     await db.prescriptions.bulkDelete(staleRecordIds);
                // }
            }
        } catch (err) {
            console.warn("Background bulk sync failed", err);
        }
    }, [axiosSecure]);

    // --- BACKGROUND SYNC FUNCTION ---
    const triggerSync = useCallback(async () => {
        if (!navigator.onLine) return;

        const queue = await db.syncQueue.filter(item => item.collection === 'prescriptions').sortBy('timestamp');
        if (queue.length === 0) return;

        console.log(`Syncing ${queue.length} items to the server...`);

        for (const item of queue) {
            try {
                // Dexie read hook automatically decrypts it for us to send to the server
                const prescRecord = await db.prescriptions.get(item.data.localId || item.data._id);

                if (item.action === 'CREATE') {
                    if (!prescRecord) {
                        await db.syncQueue.delete(item.id);
                        continue;
                    }
                    const payload = { ...prescRecord };
                    delete payload.localId;
                    delete payload.syncStatus;
                    delete payload._id; 

                    const { data } = await axiosSecure.post('/prescriptions/post', payload);
                    
                    await db.prescriptions.delete(item.data.localId);
                    await db.prescriptions.put({
                        ...prescRecord,
                        ...data?.data, 
                        localId: data?.data?._id || data._id, 
                        syncStatus: 'synced'
                    });
                }
                else if (item.action === 'UPDATE') {
                    if (!prescRecord) {
                        await db.syncQueue.delete(item.id);
                        continue;
                    }
                    const payload = { ...prescRecord };
                    delete payload.localId;
                    delete payload.syncStatus;
                    delete payload._id; // CRITICAL: Prevent Mongo error
                    delete payload.__v; // CRITICAL: Prevent Mongo error

                    const targetId = item.data._id || item.targetId;
                    await axiosSecure.put(`/prescriptions/update/${targetId}`, payload);
                    await db.prescriptions.update(item.data.localId || item.data._id, { syncStatus: 'synced' });
                }
                else if (item.action === 'DELETE') {
                    const targetId = item.data._id || item.targetId;
                    if (targetId && !item.data.localId?.toString().includes(targetId)) {
                        await axiosSecure.delete(`/prescriptions/delete/${targetId}`);
                    }
                    await db.prescriptions.delete(item.data.localId || item.data._id);
                }

                await db.syncQueue.delete(item.id);
                
            } catch (err) {
                console.error("Sync failed for item:", item, err);
                const status = err.response?.status;
                
                if (status >= 400 && status < 500) {
                    if (item.action === 'CREATE') {
                        await db.prescriptions.delete(item.data.localId);
                    } else {
                        await db.prescriptions.update(item.data.localId || item.data._id, { syncStatus: 'synced' });
                    }
                    await db.syncQueue.delete(item.id);
                } else {
                    break;
                }
            }
        }
    }, [axiosSecure]);

    // --- UPGRADED: CACHE-FIRST FETCH ---
    const getPrescriptionsByBranch = useCallback(async (branch, params) => {
        setLoading(true);
        setError(null);

        // const sevenDaysAgo = new Date();
        // sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trueTotalKey = `branch_${branch}_total_prescriptions`;
        let serverTotalItems = parseInt(localStorage.getItem(trueTotalKey)) || 0;

        try {
            // 1. ALWAYS query Dexie first (Read hook automatically decrypts)
            let allLocal = await db.prescriptions
                .where('branch').equals(branch)
                .filter(p => p.syncStatus !== 'pending_delete')
                .toArray();

            allLocal.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            serverTotalItems = Math.max(serverTotalItems, allLocal.length);

            // 2. BACKGROUND REVALIDATION
            if (navigator.onLine) {
                axiosSecure.get(`/prescriptions/${branch}/get-all`, { params }).then(async ({ data }) => {
                    if (data?.success && data?.data) {
                        if (data.pagination?.totalItems) localStorage.setItem(trueTotalKey, data.pagination.totalItems);

                        const localPrescriptions = data.data.map(p => ({
                            ...p, localId: p._id, syncStatus: 'synced'
                        }));
                        
                        for (const lp of localPrescriptions) {
                            const existing = await db.prescriptions.get(lp.localId);
                            if (!existing || existing.syncStatus === 'synced') {
                                // if (!lp.createdAt || new Date(lp.createdAt) >= sevenDaysAgo) {
                                    await db.prescriptions.put({ ...lp });
                                // }
                            }
                        }
                    }
                }).catch(err => console.warn("Background cache update failed", err));
            }

            // --- Pagination & Search Setup ---
            if (params?.search) {
                const s = params.search.toLowerCase();
                allLocal = allLocal.filter(p =>
                    p.prescriptionId?.toLowerCase().includes(s) ||
                    p.patient?.name?.toLowerCase().includes(s) ||
                    p.patient?.phone?.includes(s)
                );
                serverTotalItems = allLocal.length; 
            }

            const page = params?.page || 1;
            const limit = params?.limit || 10;
            const skip = (page - 1) * limit;
            
            // Hide ghost drafts 
            const pendingIds = allLocal.filter(p => p.syncStatus === 'pending_create').map(p => p.prescriptionId);
            const displayData = allLocal.filter(p => !(p.syncStatus === 'synced' && pendingIds.includes(p.prescriptionId)));

            const paginatedData = displayData.slice(skip, skip + limit);
            const hasDataForThisPage = paginatedData.length > 0;

            const displayTotalItems = navigator.onLine ? serverTotalItems : displayData.length;
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
            const { data } = await axiosSecure.get(`/prescriptions/${branch}/get-all`, { params });
            
            if (data?.success && data?.data) {
                if (data.pagination?.totalItems) localStorage.setItem(trueTotalKey, data.pagination.totalItems);

                const localPrescs = data.data.map(p => ({
                    ...p, localId: p._id, syncStatus: 'synced'
                }));
                for (const lp of localPrescs) {
                    // if (!lp.createdAt || new Date(lp.createdAt) >= sevenDaysAgo) {
                        await db.prescriptions.put({ ...lp });
                    // }
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


    const createPrescription = async (payload) => {
        setLoading(true);
        setError(null);
        const localId = generateLocalId();
        const localData = { ...payload, localId, _id: localId, syncStatus: 'pending_create', createdAt: new Date().toISOString() };

        try {
            if (!navigator.onLine) throw new Error('OFFLINE');
            
            const { data } = await axiosSecure.post('/prescriptions/post', payload);
            const serverDoc = data?.data || data;
            await db.prescriptions.put({ ...serverDoc, localId: serverDoc._id, syncStatus: 'synced' });
            return serverDoc;
        } catch (err) {
            const isOffline = !navigator.onLine || err.message === 'OFFLINE' || err.code === 'ERR_NETWORK';
            const isServerHang = err.response?.status >= 500;

            if (isOffline || isServerHang) {
                await db.prescriptions.put({ ...localData });
                await db.syncQueue.add({
                    action: 'CREATE', collection: 'prescriptions', data: localData, timestamp: Date.now(), retryCount: 0
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

    const updatePrescription = async (id, updateData) => {
        setLoading(true);
        setError(null);
        try {
            if (!navigator.onLine) throw new Error('OFFLINE');
            
            const { data } = await axiosSecure.put(`/prescriptions/update/${id}`, updateData);
            const serverDoc = data?.data || data;
            await db.prescriptions.put({ ...serverDoc, localId: serverDoc._id || id, syncStatus: 'synced' });
            return serverDoc;
        } catch (err) {
            const isOffline = !navigator.onLine || err.message === 'OFFLINE' || err.code === 'ERR_NETWORK';
            const isServerHang = err.response?.status >= 500;

            if (isOffline || isServerHang) {
                const localData = { ...updateData, localId: id, _id: id, syncStatus: 'pending_update' };
                await db.prescriptions.put({ ...localData });
                await db.syncQueue.add({
                    action: 'UPDATE', collection: 'prescriptions', data: localData, targetId: id, timestamp: Date.now(), retryCount: 0
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

    const removePrescription = async (id) => {
        setLoading(true);
        setError(null);
        try {
            if (!navigator.onLine) throw new Error('OFFLINE');
            if (!id.toString().includes('-')) { 
                await axiosSecure.delete(`/prescriptions/delete/${id}`);
            }
            
            await db.prescriptions.delete(id);
            const fallbackCheck = await db.prescriptions.where('_id').equals(id).first();
            if (fallbackCheck) await db.prescriptions.delete(fallbackCheck.localId);
            
            return { success: true };
        } catch (err) {
            const isOffline = !navigator.onLine || err.message === 'OFFLINE' || err.code === 'ERR_NETWORK';
            const isServerHang = err.response?.status >= 500;

            if (isOffline || isServerHang) {
                const presc = await db.prescriptions.get(id);
                if (presc) {
                    await db.prescriptions.update(id, { syncStatus: 'pending_delete' });
                    await db.syncQueue.add({
                        action: 'DELETE', collection: 'prescriptions', data: presc, targetId: id, timestamp: Date.now(), retryCount: 0
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

    const getPrescriptionStats = useCallback(async (branch) => {
        setLoading(true);
        try {
            if (!navigator.onLine) {
                setLoading(false);
                return { success: true, data: { newCount: 0, oldCount: 0, reportCount: 0, unassignedCount: 0 }};
            }
            const { data } = await axiosSecure.get(`/prescriptions/${branch}/prescription-stats`);
            return data;
        } catch (err) {
            if (!navigator.onLine || err.code === 'ERR_NETWORK') {
                return { success: true, data: { newCount: 0, oldCount: 0, reportCount: 0, unassignedCount: 0 }};
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    // Keep this to not break other components relying on it
    const getAllPrescriptions = useCallback(async (params) => {
        return getPrescriptionsByBranch(params?.branch || 'default', params);
    }, [getPrescriptionsByBranch]);

    return {
        loading,
        error,
        getPrescriptionsByBranch,
        getAllPrescriptions,
        getPrescriptionStats,
        createPrescription,
        updatePrescription,
        removePrescription,
        triggerSync,
        populateOfflineDatabase 
    };
};

export default usePrescription;