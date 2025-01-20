import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { logger } from '@/utils/logger';
import { SlashCommand } from '@/types/command';

export const adminTestCommand: SlashCommand = {
    metadata: {
        name: 'admintest',
        description: 'Test command to verify admin role permissions',
        category: 'admin',
        requiredPermissions: [PermissionFlagsBits.Administrator],
        examples: [
            '/admintest - Verify you have admin privileges'
        ]
    },
    data: new SlashCommandBuilder()
        .setName('admintest')
        .setDescription('Test command to verify admin role permissions')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            logger.info({
                userId: interaction.user.id,
                guildId: interaction.guildId,
                command: 'admintest'
            }, 'Admin test command executed');
            
            await interaction.reply({
                content: 'Success! You have admin privileges.',
                ephemeral: true
            });

            logger.debug({
                userId: interaction.user.id,
                guildId: interaction.guildId,
                command: 'admintest'
            }, 'Admin test command completed successfully');
        } catch (error) {
            logger.error({
                error,
                userId: interaction.user.id,
                guildId: interaction.guildId,
                command: 'admintest'
            }, 'Failed to execute admin test command');

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: 'There was an error executing the admin test command.',
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: 'There was an error executing the admin test command.',
                    ephemeral: true
                });
            }
        }
    }
};
