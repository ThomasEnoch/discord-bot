import { GuildMember, Role } from 'discord.js';
import { loadRoleConfig } from '../config/roles';
import { logger } from '../utils/logger';

export class RoleValidator {
    private static instance: RoleValidator;
    private adminRoles: string[];

    private constructor() {
        const config = loadRoleConfig();
        this.adminRoles = config.adminRoles as string[];
    }

    public static getInstance(): RoleValidator {
        if (!RoleValidator.instance) {
            RoleValidator.instance = new RoleValidator();
        }
        return RoleValidator.instance;
    }

    /**
     * Check if a member has admin privileges
     * @param member The guild member to check
     * @returns boolean indicating if the member has admin role
     */
    public isAdmin(member: GuildMember): boolean {
        try {
            // Check if member has any of the admin roles
            const hasAdminRole = member.roles.cache.some(role => 
                this.adminRoles.includes(role.id)
            );

            logger.debug({
                memberId: member.id,
                memberRoles: member.roles.cache.map(r => r.id),
                isAdmin: hasAdminRole
            }, 'Checked admin status for member');

            return hasAdminRole;
        } catch (error) {
            logger.error({
                error,
                memberId: member.id
            }, 'Error checking admin status');
            return false;
        }
    }

    /**
     * Validate member has permission to execute an admin command
     * @param member The guild member attempting to execute the command
     * @returns Object containing validation result and optional error message
     */
    public validateAdminCommand(member: GuildMember): { 
        isValid: boolean; 
        message?: string; 
    } {
        if (!this.isAdmin(member)) {
            return {
                isValid: false,
                message: "Sorry, this command is restricted to admin users only."
            };
        }

        return {
            isValid: true
        };
    }

    /**
     * Update admin roles configuration
     * @param roles Array of role IDs that should have admin access
     */
    public updateAdminRoles(roles: string[]): void {
        this.adminRoles = roles;
        logger.info({
            newRoles: roles
        }, 'Updated admin roles configuration');
    }
}
