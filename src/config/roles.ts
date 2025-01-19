import { RoleResolvable } from 'discord.js';

export interface RoleConfig {
    adminRoles: RoleResolvable[];
}

// Default roles configuration
export const defaultRoleConfig: RoleConfig = {
    adminRoles: [
        // Add default admin role IDs here
        // Example: '123456789012345678'
    ]
};

// Load role configuration from environment or use defaults
export function loadRoleConfig(): RoleConfig {
    const envAdminRoles = process.env.ADMIN_ROLE_IDS?.split(',') || [];
    return {
        adminRoles: envAdminRoles.length > 0 ? envAdminRoles : defaultRoleConfig.adminRoles
    };
}
