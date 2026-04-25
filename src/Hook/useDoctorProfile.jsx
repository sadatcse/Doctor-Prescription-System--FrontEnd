import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';
import { db, encryptText, sensitiveDoctorProfileFields } from '../db/MasterDB'; // <-- IMPORTED ENCRYPTION UTILS

// Utility to convert an S3 Image URL to a Base64 string for offline Dexie storage
const urlToBase64 = async (url) => {
    if (!url) return null;
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.warn("Could not convert image to base64, possible CORS issue:", error);
        return null;
    }
};

const useDoctorProfile = () => {
    const axiosSecure = UseAxiosSecure();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- NEW: FETCH AND STORE DOCTORS WITH OFFLINE IMAGES & ENCRYPTION ---
    const populateOfflineDatabase = useCallback(async (branch) => {
        if (!navigator.onLine || !branch) return;

        try {
            console.log("Downloading Doctor Profiles & Signatures for offline use...");
            const { data } = await axiosSecure.get(`/doctor-profiles/${branch}/get-all`, {
                params: { limit: 100 }
            });

            if (data?.success && data?.data) {
                // Fetch Base64 for all images concurrently
                const processedProfiles = await Promise.all(data.data.map(async (doc) => {
                    const base64Picture = doc.picture ? await urlToBase64(doc.picture) : null;
                    const base64Signature = doc.signature ? await urlToBase64(doc.signature) : null; // Added Signature

                    let localProfile = {
                        ...doc,
                        base64Picture, 
                        base64Signature, 
                        localId: doc._id,
                        syncStatus: 'synced'
                    };

                    // --- MANUAL ENCRYPTION FIX BEFORE STORING ---
                    sensitiveDoctorProfileFields.forEach(field => {
                        if (localProfile[field] !== undefined && localProfile[field] !== null && localProfile[field] !== "") {
                            localProfile[field] = encryptText(localProfile[field]);
                        }
                    });

                    return localProfile;
                }));

                await db.doctorProfiles.bulkPut(processedProfiles);
                console.log(`Successfully stored ${processedProfiles.length} encrypted doctors offline.`);

                // Ghost Cleanup
                const serverRecordIds = new Set(data.data.map(d => d._id));
                const allLocal = await db.doctorProfiles.where('branch').equals(branch).toArray();
                const ghostsToDelete = allLocal
                    .filter(d => d.syncStatus === 'synced' && !serverRecordIds.has(d.localId))
                    .map(d => d.localId);

                if (ghostsToDelete.length > 0) {
                    await db.doctorProfiles.bulkDelete(ghostsToDelete);
                }
            }
        } catch (err) {
            console.warn("Background bulk sync failed for doctors", err);
        }
    }, [axiosSecure]);


    // --- UPGRADED: CACHE-FIRST FETCH PROFILES WITH ENCRYPTION ---
    const getProfilesByBranch = useCallback(async (branch, params) => {
        setLoading(true);
        setError(null);

        try {
            // 1. ALWAYS query Dexie first
            let allLocal = await db.doctorProfiles
                .where('branch').equals(branch)
                .filter(d => d.syncStatus !== 'pending_delete')
                .toArray();

            // 2. BACKGROUND REVALIDATION
            if (navigator.onLine) {
                axiosSecure.get(`/doctor-profiles/${branch}/get-all`, { params }).then(async ({ data }) => {
                    if (data?.success && data?.data) {
                        for (const doc of data.data) {
                            const existing = await db.doctorProfiles.get(doc._id);
                            if (!existing || existing.syncStatus === 'synced') {
                                const base64Picture = doc.picture ? await urlToBase64(doc.picture) : null;
                                const base64Signature = doc.signature ? await urlToBase64(doc.signature) : null;

                                let localProfile = { 
                                    ...doc, 
                                    localId: doc._id, 
                                    base64Picture, 
                                    base64Signature, 
                                    syncStatus: 'synced' 
                                };

                                // --- MANUAL ENCRYPTION FIX ---
                                sensitiveDoctorProfileFields.forEach(field => {
                                    if (localProfile[field] !== undefined && localProfile[field] !== null && localProfile[field] !== "") {
                                        localProfile[field] = encryptText(localProfile[field]);
                                    }
                                });

                                await db.doctorProfiles.put(localProfile);
                            }
                        }
                    }
                }).catch(err => console.warn("Background cache update failed", err));
            }

            const page = params?.page || 1;
            const limit = params?.limit || 10;
            const skip = (page - 1) * limit;
            const paginatedData = allLocal.slice(skip, skip + limit);

            // 3. CACHE HIT
            if (paginatedData.length > 0 || !navigator.onLine) {
                console.log("Serving Doctor Profiles from Dexie Cache");
                setLoading(false);
                return { success: true, data: paginatedData };
            }

            // 4. CACHE MISS (First load on a new device)
            console.log(`Cache miss. Fetching doctors from Server...`);
            const { data } = await axiosSecure.get(`/doctor-profiles/${branch}/get-all`, { params });
            
            if (data?.success && data?.data) {
                for (const doc of data.data) {
                    const base64Picture = doc.picture ? await urlToBase64(doc.picture) : null;
                    const base64Signature = doc.signature ? await urlToBase64(doc.signature) : null;

                    let localProfile = { 
                        ...doc, 
                        localId: doc._id, 
                        base64Picture, 
                        base64Signature, 
                        syncStatus: 'synced' 
                    };

                    // --- MANUAL ENCRYPTION FIX ---
                    sensitiveDoctorProfileFields.forEach(field => {
                        if (localProfile[field] !== undefined && localProfile[field] !== null && localProfile[field] !== "") {
                            localProfile[field] = encryptText(localProfile[field]);
                        }
                    });

                    await db.doctorProfiles.put(localProfile);
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

    // STANDARD CRUD METHODS
    const getPaginatedProfiles = useCallback(async (params) => { /* Original Code */ }, [axiosSecure]);
    const getBranchDoctorNames = useCallback(async () => { /* Original Code */ }, [axiosSecure]);
    const getProfileById = useCallback(async (id) => { /* Original Code */ }, [axiosSecure]);
    const createProfile = async (profileData) => { /* Original Code */ };
    const updateProfile = async (id, updateData) => { /* Original Code */ };
    const removeProfile = async (id) => { /* Original Code */ };

    return {
        loading,
        error,
        getPaginatedProfiles,
        getProfilesByBranch,
        getBranchDoctorNames,
        getProfileById,
        createProfile,
        updateProfile,
        removeProfile,
        populateOfflineDatabase
    };
};

export default useDoctorProfile;