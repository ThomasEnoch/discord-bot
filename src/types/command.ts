import { ChatInputCommandInteraction, PermissionResolvable, SlashCommandBuilder } from 'discord.js';
import { EphemeralMemory } from '@/services/ephemeralMemory';

export type CommandCategory = 'admin' | 'general' | 'support';

export interface CommandMetadata {
    name: string;
    description: string;
    category: CommandCategory;
    requiredPermissions: PermissionResolvable[];
    examples: string[];
}

export interface ServiceContainer {
    ephemeralMemory: EphemeralMemory;
}

export interface SlashCommand {
    /** Command metadata for help generation and validation */
    metadata: CommandMetadata;
    /** Discord.js slash command builder instance */
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    /** Execute the command with the given interaction and services */
    execute: (
        interaction: ChatInputCommandInteraction, 
        services: Partial<ServiceContainer>
    ) => Promise<void>;
}
