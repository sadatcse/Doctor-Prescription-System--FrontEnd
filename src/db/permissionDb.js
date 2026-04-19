import Dexie from 'dexie';

// Initialize a separate database for Permissions
export const permissionDb = new Dexie('ClinicPermissionsDB');

// Version 1: Define the schema
permissionDb.version(1).stores({
    // 'role' is the primary key. We store the allowed routes array inside.
    rolePermissions: 'role' 
});

/**
 * Saves or updates allowed routes for a specific role in IndexedDB.
 */
export const savePermissionsOffline = async (role, allowedRoutes) => {
    try {
        await permissionDb.rolePermissions.put({
            role,
            allowedRoutes,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error("Failed to save permissions to IndexedDB:", error);
    }
};

/**
 * Retrieves cached allowed routes for a specific role from IndexedDB.
 */
export const getOfflinePermissions = async (role) => {
    try {
        const data = await permissionDb.rolePermissions.get(role);
        return data ? data.allowedRoutes : null;
    } catch (error) {
        console.error("Failed to retrieve permissions from IndexedDB:", error);
        return null;
    }
};