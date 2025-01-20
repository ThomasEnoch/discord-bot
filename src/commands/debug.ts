import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { logger } from '@/utils/logger';
import { SlashCommand, ServiceContainer } from '@/types/command';

export const debugCommand: SlashCommand = {
    metadata: {
        name: 'debug',
        description: 'Debug commands for administrators',
        category: 'admin',
        requiredPermissions: [PermissionFlagsBits.Administrator],
        examples: [
            '/debug memory - View current ephemeral memory contents'
        ]
    },
    data: new SlashCommandBuilder()
        .setName('debug')
        .setDescription('Debug commands for administrators')
        .addSubcommand(subcommand =>
            subcommand
                .setName('memory')
                .setDescription('View the current ephemeral memory contents')
        ) as SlashCommandBuilder,
    async execute(interaction: ChatInputCommandInteraction, services: Partial<ServiceContainer>): Promise<void> {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'memory') {
            if (!services.ephemeralMemory) {
                const error = 'Ephemeral memory service not available';
                logger.error({
                    userId: interaction.user.id,
                    command: 'debug memory',
                    error
                }, error);
                await interaction.reply({
                    content: 'Command failed: Ephemeral memory service not available',
                    ephemeral: true
                });
                return;
            }

            try {
                const debugInfo = services.ephemeralMemory.getDebugInfo();
                await interaction.reply({
                    content: debugInfo,
                    ephemeral: true
                });
                logger.debug({ 
                    userId: interaction.user.id,
                    command: 'debug memory'
                }, 'Debug memory info displayed');
            } catch (error) {
                logger.error({ 
                    error,
                    userId: interaction.user.id,
                    command: 'debug memory'
                }, 'Failed to get debug info');
                await interaction.reply({
                    content: 'Failed to get memory debug info. Please check the logs.',
                    ephemeral: true
                });
            }
        } else {
            logger.warn({
                userId: interaction.user.id,
                subcommand
            }, 'Unknown debug subcommand');
            await interaction.reply({
                content: 'Unknown debug command',
                ephemeral: true
            });
        }
    }
};
