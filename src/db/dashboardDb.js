import Dexie from 'dexie';
import CryptoJS from 'crypto-js';

// ⚠️ SECURITY NOTE: Do NOT hardcode this in production! Use environment variables.
const SECRET_KEY = process.env.REACT_APP_SECRET_KEY || 'super-secure-offline-key-123';

// Initialize a separate database for the Dashboard cache
export const dashboardDb = new Dexie('ClinicDashboardDB');

// Version 1: Define the schema
dashboardDb.version(1).stores({
    // 'branch' is the primary key. 
    dashboards: 'branch' 
});

// ==========================================
// 🔐 SPECIFIC FIELD ENCRYPTION HELPERS
// ==========================================

export const encryptText = (text) => {
    if (text === undefined || text === null || text === "") return text;
    return CryptoJS.AES.encrypt(text.toString(), SECRET_KEY).toString();
};

export const decryptText = (ciphertext) => {
    if (!ciphertext || typeof ciphertext !== 'string') return ciphertext;
    if (!ciphertext.startsWith('U2FsdGVkX1')) return ciphertext;

    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        
        // Auto-heal double encryption
        if (originalText && originalText.startsWith('U2FsdGVkX1')) {
            return decryptText(originalText);
        }
        
        return originalText || ciphertext; 
    } catch (e) {
        return ciphertext; 
    }
};

// Define exactly which fields in the doctor profile are sensitive
const sensitiveDoctorFields = ['name', 'email', 'phone'];


// ==========================================
// 🛠️ EXPORTED DB FUNCTIONS
// ==========================================

/**
 * Saves or updates dashboard data for a specific branch.
 * @param {string} branch - The branch ID
 * @param {object} data - The full dashboard payload (doctorProfile, charts, tables, etc.)
 */
export const saveDashboardOffline = async (branch, data) => {
    try {
        // 1. Create a deep copy so we don't accidentally encrypt the active UI state
        const dataToSave = JSON.parse(JSON.stringify(data));

        // 2. Manually encrypt ONLY the specific doctor fields
        if (dataToSave && dataToSave.doctorProfile) {
            sensitiveDoctorFields.forEach(field => {
                if (dataToSave.doctorProfile[field]) {
                    dataToSave.doctorProfile[field] = encryptText(dataToSave.doctorProfile[field]);
                }
            });
        }

        // 3. Save to IndexedDB
        await dashboardDb.dashboards.put({
            branch,
            data: dataToSave, 
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error("Failed to save dashboard to IndexedDB:", error);
    }
};

/**
 * Retrieves cached dashboard data for a specific branch.
 * @param {string} branch - The branch ID
 * @returns {object|null} - The decrypted dashboard record, or null if none exists.
 */
export const getOfflineDashboard = async (branch) => {
    try {
        const record = await dashboardDb.dashboards.get(branch);
        
        // Manually decrypt ONLY the specific doctor fields before returning to UI
        if (record && record.data && record.data.doctorProfile) {
            sensitiveDoctorFields.forEach(field => {
                if (record.data.doctorProfile[field]) {
                    record.data.doctorProfile[field] = decryptText(record.data.doctorProfile[field]);
                }
            });
        }

        return record ? record : null; 
    } catch (error) {
        console.error("Failed to retrieve dashboard from IndexedDB:", error);
        return null;
    }
};