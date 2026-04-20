import Dexie from 'dexie';
import CryptoJS from 'crypto-js';

// ⚠️ SECURITY NOTE: Do NOT hardcode this in production! Use environment variables.
const SECRET_KEY = process.env.REACT_APP_SECRET_KEY || 'super-secure-offline-key-123';

// Initialize the single Master Database
export const db = new Dexie('ClinicHybridDB_v3');

// --- DATABASE VERSIONS ---
// Keep version 1 for backwards compatibility
db.version(1).stores({
    patients: 'localId, _id, branch, syncStatus',
    syncQueue: '++id, action, collection, targetId, timestamp, retryCount'
});

// Version 2 (Legacy dashboard cache)
db.version(2).stores({
    patients: 'localId, _id, branch, syncStatus',
    syncQueue: '++id, action, collection, targetId, timestamp, retryCount',
    dashboardCache: 'branch' 
});


// Old Volt 
// Version 3: Added new centralized tables for dashboards and permissions
// db.version(3).stores({
//     patients: 'localId, _id, branch, syncStatus',
//     syncQueue: '++id, action, collection, targetId, timestamp, retryCount',
//     dashboardCache: 'branch', 
//     dashboards: 'branch',       // Merged from ClinicDashboardDB
//     rolePermissions: 'role'     // Merged from ClinicPermissionsDB
// });




// Version 3: Added centralized tables and the unencrypted chambers table
db.version(3).stores({
    patients: 'localId, _id, branch, syncStatus',
    syncQueue: '++id, action, collection, targetId, timestamp, retryCount',
    dashboardCache: 'branch', 
    dashboards: 'branch',       
    rolePermissions: 'role',
    chambers: 'localId, _id, branch, syncStatus' // <-- ADDED THIS LINE
});
// ==========================================
// 🔐 CORE ENCRYPTION HELPERS
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

export const encryptData = (dataObject) => {
    if (!dataObject) return dataObject;
    return CryptoJS.AES.encrypt(JSON.stringify(dataObject), SECRET_KEY).toString();
};

export const decryptData = (ciphertext) => {
    if (!ciphertext || typeof ciphertext !== 'string' || !ciphertext.startsWith('U2FsdGVkX1')) {
        return ciphertext; 
    }
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (e) {
        console.error("Failed to decrypt object payload");
        return null;
    }
};

// ==========================================
// 🧑‍⚕️ PATIENTS & SYNC HOOKS
// ==========================================

export const sensitivePatientFields = ['fullName', 'phone', 'email', 'bloodGroup', 'age', 'gender'];

db.patients.hook('creating', function (primKey, obj, trans) {
    sensitivePatientFields.forEach(field => {
        if (obj[field] !== undefined && obj[field] !== null && obj[field] !== "") {
            obj[field] = encryptText(obj[field]);
        }
    });
});

db.patients.hook('updating', function (mods, primKey, obj, trans) {
    sensitivePatientFields.forEach(field => {
        if (mods.hasOwnProperty(field) && mods[field] !== undefined && mods[field] !== null && mods[field] !== "") {
            mods[field] = encryptText(mods[field]);
        }
    });
});

db.patients.hook('reading', function (obj) {
    if (!obj) return obj;
    sensitivePatientFields.forEach(field => {
        if (obj[field] !== undefined && obj[field] !== null) {
            obj[field] = decryptText(obj[field]);
        }
    });
    return obj;
});

db.syncQueue.hook('creating', function (primKey, obj, trans) {
    if (obj.data !== undefined && obj.data !== null) {
        obj.data = encryptText(JSON.stringify(obj.data));
    }
});

db.syncQueue.hook('updating', function (mods, primKey, obj, trans) {
    if (mods.hasOwnProperty('data') && mods.data !== undefined && mods.data !== null) {
        mods.data = encryptText(JSON.stringify(mods.data));
    }
});

db.syncQueue.hook('reading', function (obj) {
    if (obj && obj.data) {
        try { obj.data = JSON.parse(decryptText(obj.data)); } 
        catch (e) { console.error("Failed to decrypt sync queue data"); }
    }
    return obj;
});

// ==========================================
// 📊 DASHBOARD FUNCTIONS
// ==========================================

const sensitiveDoctorFields = ['name', 'email', 'phone'];

export const saveDashboardOffline = async (branch, data) => {
    try {
        const dataToSave = JSON.parse(JSON.stringify(data));

        if (dataToSave && dataToSave.doctorProfile) {
            sensitiveDoctorFields.forEach(field => {
                if (dataToSave.doctorProfile[field]) {
                    dataToSave.doctorProfile[field] = encryptText(dataToSave.doctorProfile[field]);
                }
            });
        }

        // Updated to use the master 'db'
        await db.dashboards.put({
            branch,
            data: dataToSave, 
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error("Failed to save dashboard to IndexedDB:", error);
    }
};

export const getOfflineDashboard = async (branch) => {
    try {
        // Updated to use the master 'db'
        const record = await db.dashboards.get(branch);
        
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

// ==========================================
// 🔒 PERMISSION FUNCTIONS
// ==========================================

export const savePermissionsOffline = async (role, allowedRoutes) => {
    try {
        // Updated to use the master 'db'
        await db.rolePermissions.put({
            role,
            allowedRoutes,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error("Failed to save permissions to IndexedDB:", error);
    }
};

export const getOfflinePermissions = async (role) => {
    try {
        // Updated to use the master 'db'
        const data = await db.rolePermissions.get(role);
        return data ? data.allowedRoutes : null;
    } catch (error) {
        console.error("Failed to retrieve permissions from IndexedDB:", error);
        return null;
    }
};