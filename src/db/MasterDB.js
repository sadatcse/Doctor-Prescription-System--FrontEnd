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

// Version 3: Added centralized tables and the unencrypted chambers table
db.version(3).stores({
    patients: 'localId, _id, branch, syncStatus',
    syncQueue: '++id, action, collection, targetId, timestamp, retryCount',
    dashboardCache: 'branch', 
    dashboards: 'branch',       
    rolePermissions: 'role',
    chambers: 'localId, _id, branch, syncStatus', // <-- ADDED THIS LINE
    preCheckups: 'localId, _id, branch, syncStatus', // <-- ADDED THIS LINE
    
});





// Version 4: Added appointments and appointment stats
db.version(4).stores({
    patients: 'localId, _id, branch, syncStatus',
    syncQueue: '++id, action, collection, targetId, timestamp, retryCount',
    dashboardCache: 'branch', 
    dashboards: 'branch',       
    rolePermissions: 'role',
    chambers: 'localId, _id, branch, syncStatus', 
    preCheckups: 'localId, _id, branch, syncStatus',
    // --- NEW TABLES ---
    appointments: 'localId, _id, branch, syncStatus',
    appointmentStats: 'branch'
});



// ==========================================
// 🚀 VERSION 5: DOCTORS & PRESCRIPTIONS
// ==========================================
db.version(5).stores({
    patients: 'localId, _id, branch, syncStatus',
    syncQueue: '++id, action, collection, targetId, timestamp, retryCount',
    dashboardCache: 'branch', 
    dashboards: 'branch',       
    rolePermissions: 'role',
    chambers: 'localId, _id, branch, syncStatus', 
    preCheckups: 'localId, _id, branch, syncStatus',
    appointments: 'localId, _id, branch, syncStatus',
    appointmentStats: 'branch',
    // --- NEW TABLES ADDED ---
    doctorProfiles: 'localId, _id, branch, syncStatus',
   
});


db.version(6).stores({
    patients: 'localId, _id, branch, syncStatus',
    syncQueue: '++id, action, collection, targetId, timestamp, retryCount',
    dashboardCache: 'branch', 
    dashboards: 'branch',       
    rolePermissions: 'role',
    chambers: 'localId, _id, branch, syncStatus', 
    preCheckups: 'localId, _id, branch, syncStatus',
    appointments: 'localId, _id, branch, syncStatus',
    appointmentStats: 'branch',
    // --- NEW TABLES ADDED ---
    doctorProfiles: 'localId, _id, branch, syncStatus',
    prescriptions: 'localId, _id, prescriptionId, branch, patientId, doctorId, syncStatus'
});



// MUST be bumped to version 6 because you added new tables!
db.version(7).stores({
    patients: 'localId, _id, branch, syncStatus',
    syncQueue: '++id, action, collection, targetId, timestamp, retryCount',
    dashboardCache: 'branch', 
    dashboards: 'branch',       
    rolePermissions: 'role',
    chambers: 'localId, _id, branch, syncStatus', 
    preCheckups: 'localId, _id, branch, syncStatus',
    appointments: 'localId, _id, branch, syncStatus',
    appointmentStats: 'branch',
    // --- NEW TABLES ADDED ---
    doctorProfiles: 'localId, _id, branch, syncStatus',
    prescriptions: 'localId, _id, prescriptionId, branch, patientId, doctorId, syncStatus',
    medicines: '_id, brandName, genericName, syncStatus' // <-- Don't forget your new medicine table!
});
// MUST be bumped to version 6 because you added new tables!
db.version(8).stores({
    patients: 'localId, _id, branch, syncStatus',
    syncQueue: '++id, action, collection, targetId, timestamp, retryCount',
    dashboardCache: 'branch', 
    dashboards: 'branch',       
    rolePermissions: 'role',
    chambers: 'localId, _id, branch, syncStatus', 
    preCheckups: 'localId, _id, branch, syncStatus',
    appointments: 'localId, _id, branch, syncStatus',
    appointmentStats: 'branch',
    // --- NEW TABLES ADDED ---
    doctorProfiles: 'localId, _id, branch, syncStatus',
    prescriptions: 'localId, _id, prescriptionId, branch, patientId, doctorId, syncStatus',
    medicines: '_id, brandName, genericName, syncStatus', // <-- Don't forget your new medicine table!
    labtests: '_id, testName, status, syncStatus' // <-- ADD THIS
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
    
    // DEEP CLONE: Prevent mutating Dexie's internal cache
    const clonedObj = JSON.parse(JSON.stringify(obj));
    
    sensitivePatientFields.forEach(field => {
        if (clonedObj[field] !== undefined && clonedObj[field] !== null) {
            clonedObj[field] = decryptText(clonedObj[field]);
        }
    });
    return clonedObj;
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



// ==========================================
// 🩺 PRE-CHECKUPS HOOKS
// ==========================================

// Define fields in the PreCheckup object that need encryption.
// Modify this array based on your actual PreCheckup Mongoose schema.
export const sensitivePreCheckupFields = ['symptoms', 'vitals', 'medicalHistory', 'chiefComplaint'];

db.preCheckups.hook('creating', function (primKey, obj, trans) {
    sensitivePreCheckupFields.forEach(field => {
        if (obj[field] !== undefined && obj[field] !== null && obj[field] !== "") {
            // Use encryptData for objects/arrays, encryptText for standard strings
            obj[field] = typeof obj[field] === 'object' ? encryptData(obj[field]) : encryptText(obj[field]);
        }
    });
});

db.preCheckups.hook('updating', function (mods, primKey, obj, trans) {
    sensitivePreCheckupFields.forEach(field => {
        if (mods.hasOwnProperty(field) && mods[field] !== undefined && mods[field] !== null && mods[field] !== "") {
            mods[field] = typeof mods[field] === 'object' ? encryptData(mods[field]) : encryptText(mods[field]);
        }
    });
});

db.preCheckups.hook('reading', function (obj) {
    if (!obj) return obj;
    
    // DEEP CLONE: Prevent mutating Dexie's internal cache
    const clonedObj = JSON.parse(JSON.stringify(obj));
    
    sensitivePreCheckupFields.forEach(field => {
        if (clonedObj[field] !== undefined && clonedObj[field] !== null) {
            const decryptedValue = decryptText(clonedObj[field]);
            
            // Attempt to parse back into an object/array if it was encrypted via encryptData
            try {
                // Only attempt JSON.parse if it looks like a JSON string
                if (typeof decryptedValue === 'string' && (decryptedValue.startsWith('{') || decryptedValue.startsWith('['))) {
                    clonedObj[field] = JSON.parse(decryptedValue);
                } else {
                    clonedObj[field] = decryptedValue;
                }
            } catch (e) {
                // Fallback if parsing fails (it's just a regular string)
                clonedObj[field] = decryptedValue;
            }
        }
    });
    return clonedObj;
});

// ==========================================
// 📅 APPOINTMENTS HOOKS (PRECISION NESTED ENCRYPTION)
// ==========================================

export const sensitiveAppointmentFields = ['notes', 'reasonForVisit', 'disease'];
export const sensitiveNestedPatientFields = ['fullName', 'phone', 'email', 'bloodGroup', 'address', 'age', 'gender', 'dateOfBirth'];

db.appointments.hook('creating', function (primKey, obj, trans) {
    // 1. Encrypt Root Fields
    sensitiveAppointmentFields.forEach(field => {
        if (obj[field] !== undefined && obj[field] !== null && obj[field] !== "") {
            obj[field] = encryptText(obj[field]);
        }
    });

    // 2. Encrypt Nested Patient Fields (LEAVING _id ALONE)
    if (obj.patientId && typeof obj.patientId === 'object') {
        sensitiveNestedPatientFields.forEach(field => {
            if (obj.patientId[field] !== undefined && obj.patientId[field] !== null && obj.patientId[field] !== "") {
                obj.patientId[field] = encryptText(obj.patientId[field].toString());
            }
        });
    }
});

db.appointments.hook('updating', function (mods, primKey, obj, trans) {
    // 1. Update Root Fields
    sensitiveAppointmentFields.forEach(field => {
        if (mods.hasOwnProperty(field) && mods[field] !== undefined && mods[field] !== null && mods[field] !== "") {
            mods[field] = encryptText(mods[field]);
        }
    });

    // 2. Update Nested Patient Fields
    if (mods.patientId && typeof mods.patientId === 'object') {
        sensitiveNestedPatientFields.forEach(field => {
            if (mods.patientId[field] !== undefined && mods.patientId[field] !== null && mods.patientId[field] !== "") {
                mods.patientId[field] = encryptText(mods.patientId[field].toString());
            }
        });
    }
});

db.appointments.hook('reading', function (obj) {
    if (!obj) return obj;
    
    const clonedObj = JSON.parse(JSON.stringify(obj));
    
    // 1. Decrypt Root Fields
    sensitiveAppointmentFields.forEach(field => {
        if (clonedObj[field] !== undefined && clonedObj[field] !== null) {
            clonedObj[field] = decryptText(clonedObj[field]);
        }
    });

    // 2. Decrypt Nested Patient Fields
    if (clonedObj.patientId && typeof clonedObj.patientId === 'object') {
        sensitiveNestedPatientFields.forEach(field => {
            if (clonedObj.patientId[field] !== undefined && clonedObj.patientId[field] !== null) {
                clonedObj.patientId[field] = decryptText(clonedObj.patientId[field]);
            }
        });
    }
    
    return clonedObj;
});






// / ==========================================
// 👨‍⚕️ DOCTOR PROFILE HOOKS
// ==========================================
// We only encrypt private info. Name, Degrees, and BMDC stay plain text for fast offline queries.
export const sensitiveDoctorProfileFields = ['phone', 'email'];

db.doctorProfiles.hook('creating', function (primKey, obj, trans) {
    sensitiveDoctorProfileFields.forEach(field => {
        if (obj[field] !== undefined && obj[field] !== null && obj[field] !== "") {
            obj[field] = encryptText(obj[field]);
        }
    });
});

db.doctorProfiles.hook('updating', function (mods, primKey, obj, trans) {
    sensitiveDoctorProfileFields.forEach(field => {
        if (mods.hasOwnProperty(field) && mods[field] !== undefined && mods[field] !== null && mods[field] !== "") {
            mods[field] = encryptText(mods[field]);
        }
    });
});

db.doctorProfiles.hook('reading', function (obj) {
    if (!obj) return obj;
    const clonedObj = JSON.parse(JSON.stringify(obj));
    sensitiveDoctorProfileFields.forEach(field => {
        if (clonedObj[field] !== undefined && clonedObj[field] !== null) {
            clonedObj[field] = decryptText(clonedObj[field]);
        }
    });
    return clonedObj;
});

// ==========================================
// 💊 PRESCRIPTION HOOKS
// ==========================================


// ==========================================
// 💊 PRESCRIPTION HOOKS (Implicit Encryption)
// ==========================================
export const sensitivePrescriptionFields = ['complaintsText', 'historyText', 'examinationText', 'diagnosisText', 'adviceText'];
export const sensitivePrescriptionObjects = [
    'patient', 'vitals', 'complaints', 'history', 
    'examination', 'diagnosis', 'investigations', 'medicines', 'advice'
];

db.prescriptions.hook('creating', function (primKey, obj, trans) {
    sensitivePrescriptionFields.forEach(field => {
        if (obj[field] !== undefined && obj[field] !== null && obj[field] !== "") {
            obj[field] = encryptText(obj[field]);
        }
    });
    sensitivePrescriptionObjects.forEach(field => {
        if (obj[field] !== undefined && obj[field] !== null) {
            obj[field] = typeof obj[field] === 'object' ? encryptData(obj[field]) : encryptText(obj[field]);
        }
    });
});

db.prescriptions.hook('updating', function (mods, primKey, obj, trans) {
    sensitivePrescriptionFields.forEach(field => {
        if (mods.hasOwnProperty(field) && mods[field] !== undefined && mods[field] !== null && mods[field] !== "") {
            mods[field] = encryptText(mods[field]);
        }
    });
    sensitivePrescriptionObjects.forEach(field => {
        if (mods.hasOwnProperty(field) && mods[field] !== undefined && mods[field] !== null) {
            mods[field] = typeof mods[field] === 'object' ? encryptData(mods[field]) : encryptText(mods[field]);
        }
    });
});

db.prescriptions.hook('reading', function (obj) {
    if (!obj) return obj;
    
    // Deep clone to prevent mutating Dexie's cache
    const clonedObj = JSON.parse(JSON.stringify(obj));
    
    sensitivePrescriptionFields.forEach(field => {
        if (clonedObj[field] !== undefined && clonedObj[field] !== null) {
            clonedObj[field] = decryptText(clonedObj[field]);
        }
    });

    sensitivePrescriptionObjects.forEach(field => {
        if (clonedObj[field] !== undefined && clonedObj[field] !== null) {
            const decryptedValue = decryptText(clonedObj[field]);
            try {
                if (typeof decryptedValue === 'string' && (decryptedValue.startsWith('{') || decryptedValue.startsWith('['))) {
                    clonedObj[field] = JSON.parse(decryptedValue);
                } else {
                    clonedObj[field] = decryptedValue;
                }
            } catch (e) {
                clonedObj[field] = decryptedValue;
            }
        }
    });
    return clonedObj;
});
// ==========================================
// 💊 MEDICINES HOOKS (For Offline Syncing)
// ==========================================

// We don't encrypt medicines because they are public data,
// but we DO need hooks to manage the syncQueue if a user creates one offline.

db.medicines.hook('creating', function (primKey, obj, trans) {
    // If it's created offline, ensure it has a syncStatus
    if (!obj.syncStatus) {
        obj.syncStatus = navigator.onLine ? 'synced' : 'pending_create';
    }
});

db.medicines.hook('updating', function (mods, primKey, obj, trans) {
    // If updated offline, mark it for sync
    if (mods.hasOwnProperty('syncStatus') === false && !navigator.onLine) {
        mods.syncStatus = 'pending_update';
    }
});





// Add hooks for custom offline lab tests
db.labtests.hook('creating', function (primKey, obj, trans) {
    if (!obj.syncStatus) obj.syncStatus = navigator.onLine ? 'synced' : 'pending_create';
});



