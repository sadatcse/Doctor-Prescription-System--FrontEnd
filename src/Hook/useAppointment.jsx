// src/Hook/useAppointment.js
import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';
import { db } from '../db/MasterDB'; 

const generateLocalId = () => {
    return typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// --- FIX: Helper to extract string IDs from populated objects to prevent Backend CastErrors ---
const sanitizePayloadForServer = (payload) => {
    const cleanPayload = { ...payload };
    if (cleanPayload.patientId && typeof cleanPayload.patientId === 'object') {
        cleanPayload.patientId = cleanPayload.patientId._id || cleanPayload.patientId;
    }
    if (cleanPayload.chamberId && typeof cleanPayload.chamberId === 'object') {
        cleanPayload.chamberId = cleanPayload.chamberId._id || cleanPayload.chamberId;
    }
    // Remove temporary offline placeholders before sending to server
    if (cleanPayload.appointmentId && cleanPayload.appointmentId.startsWith('OFF-')) {
        delete cleanPayload.appointmentId;
    }
    if (cleanPayload.serial === '-') {
        delete cleanPayload.serial;
    }
    return cleanPayload;
};

// --- FIX: Helper to populate relational fields locally so offline UI doesn't render blank rows ---
const populateLocalAppointment = async (apptData) => {
    const populated = { ...apptData };
    if (populated.patientId && typeof populated.patientId === 'string') {
        try { const pat = await db.patients.get(populated.patientId); if (pat) populated.patientId = pat; } catch (e) {}
    }
    if (populated.chamberId && typeof populated.chamberId === 'string') {
        try { const cha = await db.chambers.get(populated.chamberId); if (cha) populated.chamberId = cha; } catch (e) {}
    }
    return populated;
};

const useAppointment = () => {
    const axiosSecure = UseAxiosSecure();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- FETCH AND STORE ALL DATA & CLEAR GHOST DATA ---
    const populateOfflineDatabase = useCallback(async (branch) => {
        if (!navigator.onLine || !branch) return;

        try {
            console.log("Downloading ALL appointment data for offline use...");

            const { data } = await axiosSecure.get(`/appointments/${branch}/get-all`, {
                params: { limit: 100000 }
            });
            
            if (data?.success && data?.data) {
                // FIX: DEEP CLONE to prevent mutating the original data reference
                const allAppointments = JSON.parse(JSON.stringify(data.data));

                const bulkData = allAppointments.map(app => ({
                    ...app, localId: app._id, syncStatus: 'synced'
                }));
                
                await db.appointments.bulkPut(bulkData);
                console.log(`Successfully stored ${bulkData.length} appointments offline.`);

                // --- GHOST-BUSTING ---
                const serverRecordIds = new Set(allAppointments.map(a => a._id));
                const allLocal = await db.appointments.toArray();
                
                const ghostsToDelete = allLocal
                    .filter(a => 
                        a.syncStatus === 'synced' && 
                        !serverRecordIds.has(a.localId) && 
                        !serverRecordIds.has(a._id)
                    )
                    .map(a => a.localId);

                if (ghostsToDelete.length > 0) {
                    await db.appointments.bulkDelete(ghostsToDelete);
                }
            }
        } catch (err) {
            console.warn("Background bulk sync failed", err);
        }
    }, [axiosSecure]);

    // --- BACKGROUND SYNC FUNCTION ---
    const triggerSync = useCallback(async () => {
        if (!navigator.onLine) return;

        const queue = await db.syncQueue.where('collection').equals('appointments').toArray();
        queue.sort((a, b) => a.timestamp - b.timestamp);
        
        if (queue.length === 0) return;

        console.log(`Syncing ${queue.length} appointments to the server...`);

        for (const item of queue) {
            try {
                const appRecord = await db.appointments.get(item.data.localId || item.data._id);

                if (item.action === 'CREATE') {
                    if (!appRecord) {
                        await db.syncQueue.delete(item.id);
                        continue;
                    }
                    const payload = sanitizePayloadForServer({ ...appRecord }); // FIX applied
                    delete payload.localId;
                    delete payload.syncStatus;
                    delete payload._id;

                    const { data } = await axiosSecure.post('/appointments/post', payload);
                    
                    // FIX: Deep Clone server response before saving to Dexie
                    const clonedServerData = JSON.parse(JSON.stringify(data));
                    
                    await db.appointments.delete(item.data.localId); 
                    await db.appointments.put({
                        ...appRecord,
                        ...clonedServerData, 
                        localId: clonedServerData._id, 
                        syncStatus: 'synced'
                    });
                }
                else if (item.action === 'UPDATE') {
                    if (!appRecord) {
                        await db.syncQueue.delete(item.id);
                        continue;
                    }
                    const payload = sanitizePayloadForServer({ ...appRecord }); // FIX applied
                    delete payload.localId;
                    delete payload.syncStatus;

                    const targetId = item.data._id || item.targetId;
                    await axiosSecure.put(`/appointments/update/${targetId}`, payload);
                    await db.appointments.update(item.data.localId || item.data._id, { syncStatus: 'synced' });
                }
                else if (item.action === 'DELETE') {
                    const targetId = item.data._id || item.targetId;
                    if (targetId && !item.data.localId?.toString().includes(targetId)) {
                        await axiosSecure.delete(`/appointments/delete/${targetId}`);
                    }
                    await db.appointments.delete(item.data.localId || item.data._id);
                }

                await db.syncQueue.delete(item.id);
                
            } catch (err) {
                console.error("Sync failed for item:", item, err);
                const status = err.response?.status;
                
                if (status >= 400 && status < 500) {
                    if (item.action === 'CREATE') {
                        await db.appointments.delete(item.data.localId);
                    } else {
                        await db.appointments.update(item.data.localId || item.data._id, { syncStatus: 'synced' });
                    }
                    await db.syncQueue.delete(item.id);
                } else {
                    break;
                }
            }
        }
    }, [axiosSecure]);

    // --- NETWORK-FIRST FETCH APPOINTMENTS ---
    const getAppointmentsByBranch = useCallback(async (branch, params) => {
        setLoading(true);
        setError(null);

        try {
            // 1. ONLINE: SERVER FIRST
            if (navigator.onLine) {
                try {
                    const { data } = await axiosSecure.get(`/appointments/${branch}/get-all`, { params });
                    
                    if (data?.success && data?.data) {
                        // FIX: DEEP CLONE before handing data off to Dexie's hooks
                        const clonedData = JSON.parse(JSON.stringify(data.data));
                        
                        const localApps = clonedData.map(a => ({ ...a, localId: a._id, syncStatus: 'synced' }));
                        for (const la of localApps) {
                            await db.appointments.put(la); 
                        }
                    }
                    setLoading(false);
                    return data; 
                } catch (serverErr) {
                    console.warn("Server fetch failed, falling back to local database...", serverErr);
                }
            }

            // 2. OFFLINE: INDEXEDDB
            console.log("Serving Appointments from Dexie (Offline)");
            let allLocal = await db.appointments
                .where('branch').equals(branch)
                .filter(a => a.syncStatus !== 'pending_delete')
                .toArray();

            allLocal.sort((a, b) => new Date(b.appointmentDate || 0) - new Date(a.appointmentDate || 0));

            if (params?.search) {
                const s = params.search.toLowerCase();
                allLocal = allLocal.filter(a =>
                    a.patientId?.fullName?.toLowerCase().includes(s) ||
                    a.patientId?.phone?.toLowerCase().includes(s) ||
                    a.appointmentId?.toLowerCase().includes(s) ||
                    a.serial?.toString().includes(s)
                );
            }
            if (params?.status) allLocal = allLocal.filter(a => (a.preCheckupId ? 'Completed' : 'Pending') === params.status);
            if (params?.paymentStatus) allLocal = allLocal.filter(a => a.paymentStatus === params.paymentStatus);
            if (params?.isPrescription) allLocal = allLocal.filter(a => a.isPrescription === params.isPrescription);
            if (params?.chamberId) allLocal = allLocal.filter(a => a.chamberId?._id === params.chamberId || a.chamberId === params.chamberId);

            const page = params?.page || 1;
            const limit = params?.limit || 10;
            const skip = (page - 1) * limit;
            const paginatedData = allLocal.slice(skip, skip + limit);

            setLoading(false);
            return {
                success: true,
                data: paginatedData,
                pagination: {
                    totalItems: allLocal.length,
                    totalPages: Math.ceil(allLocal.length / limit) || 1,
                    currentPage: page,
                    itemsPerPage: limit
                }
            };

        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            setLoading(false);
            throw err;
        }
    }, [axiosSecure]);

    // --- GET SINGLE APPOINTMENT ---
    const getAppointmentById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            if (navigator.onLine) {
                try {
                    const { data } = await axiosSecure.get(`/appointments/get-id/${id}`);
                    if (data?.success && data?.data) {
                        // FIX: DEEP CLONE before saving
                        const clonedData = JSON.parse(JSON.stringify(data.data));
                        await db.appointments.put({ ...clonedData, localId: clonedData._id, syncStatus: 'synced' });
                    }
                    return data;
                } catch (e) {
                    console.warn("Server get-id failed, checking local...", e);
                }
            }

            const localApp = await db.appointments.get(id);
            if (localApp) {
                return { success: true, data: localApp };
            }
            throw new Error("Appointment not found locally or on server.");

        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    // --- CREATE APPOINTMENT ---
    const createAppointment = async (appointmentData) => {
        setLoading(true);
        setError(null);
        const localId = generateLocalId();
        const localData = { ...appointmentData, localId, syncStatus: 'pending_create', createdAt: new Date().toISOString() };

        try {
            if (!navigator.onLine) throw new Error('OFFLINE');
            
            const serverPayload = sanitizePayloadForServer(appointmentData); // FIX applied
            const { data } = await axiosSecure.post('/appointments/post', serverPayload);
            
            // FIX: DEEP CLONE before saving
            const clonedData = JSON.parse(JSON.stringify(data));
            await db.appointments.put({ ...clonedData, localId: clonedData._id, syncStatus: 'synced' });
            
            return data;
        } catch (err) {
            const isOffline = !navigator.onLine || err.message === 'OFFLINE' || err.code === 'ERR_NETWORK';
            const isServerHang = err.response?.status >= 500;

            if (isOffline || isServerHang) {
                // FIX: Populate relational fields locally so UI isn't blank
                const populatedData = await populateLocalAppointment(localData);
                
                // Add temporary offline placeholders for missing server-generated fields
                if (!populatedData.appointmentId) populatedData.appointmentId = `OFF-${localId.substring(0, 4).toUpperCase()}`;
                if (!populatedData.serial) populatedData.serial = '-';

                await db.appointments.put(populatedData);
                await db.syncQueue.add({
                    action: 'CREATE', collection: 'appointments', data: localData, timestamp: Date.now(), retryCount: 0
                });
                return { ...populatedData, _id: localId }; 
            }
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // --- UPDATE APPOINTMENT ---
    const updateAppointment = async (id, updateData) => {
        setLoading(true);
        setError(null);
        try {
            if (!navigator.onLine) throw new Error('OFFLINE');
            
            const serverPayload = sanitizePayloadForServer(updateData); // FIX applied
            const { data } = await axiosSecure.put(`/appointments/update/${id}`, serverPayload);
            
            const clonedResponse = JSON.parse(JSON.stringify(data));
            const actualUpdatedDoc = clonedResponse.data ? clonedResponse.data : clonedResponse;
            
            const existingRecord = await db.appointments.get(id);
            const mergedData = existingRecord 
                ? { ...existingRecord, ...actualUpdatedDoc, localId: actualUpdatedDoc._id || id, syncStatus: 'synced' }
                : { ...actualUpdatedDoc, localId: actualUpdatedDoc._id || id, syncStatus: 'synced' };

            await db.appointments.put(mergedData);
            
            return data;
        } catch (err) {
            const isOffline = !navigator.onLine || err.message === 'OFFLINE' || err.code === 'ERR_NETWORK';
            const isServerHang = err.response?.status >= 500;

            if (isOffline || isServerHang) {
                const existingRecord = await db.appointments.get(id);
                if (!existingRecord) throw new Error("Appointment not found locally to update.");

                const clonedUpdateData = JSON.parse(JSON.stringify(updateData));
                let localMergedData = { ...existingRecord, ...clonedUpdateData, localId: id, _id: id, syncStatus: 'pending_update' };
                
                // FIX: Repopulate if string IDs overwrote populated objects
                localMergedData = await populateLocalAppointment(localMergedData);

                await db.appointments.put(localMergedData);
                await db.syncQueue.add({
                    action: 'UPDATE', collection: 'appointments', data: localMergedData, targetId: id, timestamp: Date.now(), retryCount: 0
                });
                return localMergedData;
            }
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // --- REMOVE APPOINTMENT ---
    const removeAppointment = async (id) => {
        setLoading(true);
        setError(null);
        try {
            if (!navigator.onLine) throw new Error('OFFLINE');
            
            if (!id.toString().includes('-')) { 
                await axiosSecure.delete(`/appointments/delete/${id}`);
            }
            
            await db.appointments.delete(id);
            const fallbackCheck = await db.appointments.where('_id').equals(id).first();
            if (fallbackCheck) {
                await db.appointments.delete(fallbackCheck.localId);
            }
            
            return { success: true };
        } catch (err) {
            const isOffline = !navigator.onLine || err.message === 'OFFLINE' || err.code === 'ERR_NETWORK';
            const isServerHang = err.response?.status >= 500;

            if (isOffline || isServerHang) {
                const appRecord = await db.appointments.get(id);
                if (appRecord) {
                    await db.appointments.update(id, { syncStatus: 'pending_delete' });
                    await db.syncQueue.add({
                        action: 'DELETE', collection: 'appointments', data: appRecord, targetId: id, timestamp: Date.now(), retryCount: 0
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

    // --- GENERIC PAGINATED (FALLBACK) ---
    const getPaginatedAppointments = useCallback(async (params) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.get('/appointments', { params });
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    // --- PAYMENT STATS ---
    const getPaymentStats = useCallback(async (branch, params) => {
        setLoading(true);
        setError(null);
        try {
            if (navigator.onLine) {
                try {
                    const { data } = await axiosSecure.get(`/appointments/${branch}/payment-stats`, { params });
                    if (data?.success) {
                        const clonedData = JSON.parse(JSON.stringify(data));
                        await db.appointmentStats.put({ branch, data: clonedData, lastUpdated: new Date().toISOString() });
                    }
                    return data;
                } catch(e) {
                    console.warn("Stats fetch failed, looking locally");
                }
            }

            const cachedStats = await db.appointmentStats.get(branch);
            if (cachedStats) return cachedStats.data;
            throw new Error("No offline data available for stats.");
            
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    return {
        loading,
        error,
        getPaginatedAppointments,
        getAppointmentsByBranch,
        getAppointmentById,
        createAppointment,
        updateAppointment,
        removeAppointment,
        getPaymentStats,
        triggerSync,
        populateOfflineDatabase
    };
};

export default useAppointment;