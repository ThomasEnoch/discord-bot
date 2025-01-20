import { ChatInputCommandInteraction, PermissionResolvable } from 'discord.js';
import { logger } from '@/utils/logger';
import { CommandMetadata } from '@/types/command';

export interface ValidationResult {
    isValid: boolean;
    reason?: string;
}

/**
 * Validates if a user has the required permissions to execute a command
 * @param interaction - The command interaction to validate
 * @param metadata - The command metadata containing required permissions
 * @returns Validation result with reason if invalid
 */
export function validatePermissions(
    interaction: ChatInputCommandInteraction,
    metadata: CommandMetadata
): ValidationResult {
    if (!interaction.memberPermissions) {
        const error = 'Cannot verify permissions: no member permissions found';
        logger.warn({ 
            userId: interaction.user.id,
            command: metadata.name,
            error
        }, error);
        return { isValid: false, reason: error };
    }

    const missingPermissions = metadata.requiredPermissions.filter(
        permission => !interaction.memberPermissions?.has(permission)
    );

    if (missingPermissions.length > 0) {
        const error = `Missing required permissions: ${missingPermissions.join(', ')}`;
        logger.warn({ 
            userId: interaction.user.id,
            command: metadata.name,
            missingPermissions,
            error
        }, error);
        return { isValid: false, reason: error };
    }

    logger.debug({
        userId: interaction.user.id,
        command: metadata.name
    }, 'Permission validation successful');
    return { isValid: true };
}

/**
 * Handles sending validation failure messages to users
 * @param interaction - The command interaction that failed validation
 * @param reason - The reason for validation failure
 */
export async function handleValidationFailure(
    interaction: ChatInputCommandInteraction,
    reason: string
): Promise<void> {
    const response = `You cannot use this command. ${reason}`;
    try {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: response, ephemeral: true });
        } else {
            await interaction.reply({ content: response, ephemeral: true });
        }
        logger.debug({
            userId: interaction.user.id,
            command: interaction.commandName,
            reason
        }, 'Sent validation failure message');
    } catch (error) {
        logger.error({
            error,
            userId: interaction.user.id,
            command: interaction.commandName,
            reason
        }, 'Failed to send validation failure message');
    }
}
