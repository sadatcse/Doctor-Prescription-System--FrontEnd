// src/db/db.js
import Dexie from 'dexie';
import CryptoJS from 'crypto-js';

// ⚠️ SECURITY NOTE: Do NOT hardcode this in production!
const SECRET_KEY = process.env.REACT_APP_SECRET_KEY || 'super-secure-offline-key-123';

export const db = new Dexie('ClinicHybridDB_v3');

// --- DATABASE VERSIONS ---
// Keep version 1 for backwards compatibility with existing users
db.version(1).stores({
    patients: 'localId, _id, branch, syncStatus',
    syncQueue: '++id, action, collection, targetId, timestamp, retryCount'
});

// Upgrade to version 2 to add the dashboard cache
db.version(2).stores({
    patients: 'localId, _id, branch, syncStatus',
    syncQueue: '++id, action, collection, targetId, timestamp, retryCount',
    dashboardCache: 'branch' // New table, indexing by branch ID
});

// --- UPDATED: Exported so it can be used manually during bulkPut ---
export const encryptText = (text) => {
    if (text === undefined || text === null || text === "") return text;
    return CryptoJS.AES.encrypt(text.toString(), SECRET_KEY).toString();
};

// --- UPDATED: Exported and Recursive Decryption ---
export const decryptText = (ciphertext) => {
    if (!ciphertext || typeof ciphertext !== 'string') return ciphertext;
    if (!ciphertext.startsWith('U2FsdGVkX1')) return ciphertext;

    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        
        // Auto-heal: If the result is ALSO encrypted (from the old sync bug), decrypt it again!
        if (originalText && originalText.startsWith('U2FsdGVkX1')) {
            return decryptText(originalText);
        }
        
        return originalText || ciphertext; 
    } catch (e) {
        return ciphertext; 
    }
};

// --- NEW: Exported Helpers for Full Objects (Used Manually by Dashboard) ---
export const encryptData = (dataObject) => {
    if (!dataObject) return dataObject;
    return CryptoJS.AES.encrypt(JSON.stringify(dataObject), SECRET_KEY).toString();
};

export const decryptData = (ciphertext) => {
    // If it's already an object or unencrypted string, return it safely
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

// --- UPDATED: Exported so it can be accessed in usePatient.js ---
export const sensitivePatientFields = ['fullName', 'phone', 'email', 'bloodGroup', 'age', 'gender'];

// --- DEXIE HOOKS FOR PATIENTS ---
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

// --- DEXIE HOOKS FOR SYNC QUEUE ---
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