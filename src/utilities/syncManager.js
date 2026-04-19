// src/utils/syncManager.js
import { db } from '../db/db';

export const processSyncQueue = async (axiosSecure) => {
    if (!navigator.onLine) return;

    const queue = await db.syncQueue.orderBy('timestamp').toArray();
    if (queue.length === 0) return;

    console.log(`Processing ${queue.length} offline actions...`);

    for (const item of queue) {
        try {
            if (item.action === 'CREATE') {
                // Send data (omit localId if your backend strict-validates, or let backend ignore it)
                const { data } = await axiosSecure.post('/patients/post', item.data);
                
                // CRITICAL: Update local record with the real MongoDB _id and mark synced
                await db.patients.update(item.data.localId, { 
                    _id: data._id, 
                    syncStatus: 'synced' 
                });
            } 
            else if (item.action === 'UPDATE') {
                // Use the real Mongo _id if we have it. 
                const targetId = item.data._id || item.targetId; 
                await axiosSecure.put(`/patients/update/${targetId}`, item.data);
                await db.patients.update(item.data.localId, { syncStatus: 'synced' });
            } 
            else if (item.action === 'DELETE') {
                const targetId = item.data._id || item.targetId;
                if (targetId) {
                    await axiosSecure.delete(`/patients/delete/${targetId}`);
                }
                // Physically remove from local DB only after server confirms deletion
                await db.patients.delete(item.data.localId);
            }

            // Remove action from queue upon success
            await db.syncQueue.delete(item.id);
            
        } catch (error) {
            console.error("Sync failed for item:", item, error);
            const status = error.response?.status;
            
            // If 4xx error (e.g., Validation Failed, Unauthorized, Duplicate Phone)
            // It will never succeed. Delete from queue so it doesn't block other tasks.
            if (status >= 400 && status < 500) {
                console.warn("Unrecoverable error, dropping from queue and cleaning local DB.");
                
                // --- NEW UPDATE: Handle the stuck local record ---
                if (item.action === 'CREATE') {
                    // The server rejected the new patient entirely. 
                    // Delete it locally so the "Syncing..." row disappears from the UI.
                    await db.patients.delete(item.data.localId);
                } 
                else if (item.action === 'UPDATE') {
                    // The server rejected the update. 
                    // Revert status to 'synced' so the edit button works again.
                    await db.patients.update(item.data.localId, { syncStatus: 'synced' });
                } 
                else if (item.action === 'DELETE') {
                    // The server refused to delete it.
                    // Revert status to 'synced' so it reappears normally in the UI.
                    await db.patients.update(item.data.localId, { syncStatus: 'synced' });
                }

                // Finally, remove the doomed task from the queue
                await db.syncQueue.delete(item.id);
                
            } else {
                // 5xx error or Network Drop. Break loop and try again next time.
                break; 
            }
        }
    }
};