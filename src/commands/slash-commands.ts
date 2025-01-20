import { Collection } from 'discord.js';
import { adminTestCommand } from '@/commands/adminTest';
import { debugCommand } from '@/commands/debug';
import { SlashCommand } from '@/types/command';

// Export all commands
export const slashCommands = new Collection<string, SlashCommand>();

// Register commands
const commands = [
    adminTestCommand,
    debugCommand
] as const;

// Add commands to collection
for (const command of commands) {
    slashCommands.set(command.metadata.name, command);
}
