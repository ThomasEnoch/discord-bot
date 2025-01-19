import { Message } from 'discord.js';
import { Command } from '../services/commandHandler';
import { logger } from '../utils/logger';

export const adminTestCommand: Command = {
    name: 'admintest',
    description: 'Test command to verify admin role permissions',
    adminOnly: true,
    execute: async (message: Message, args: string[]) => {
        logger.info({
            userId: message.author.id,
            guildId: message.guild?.id
        }, 'Admin test command executed successfully');
        await message.reply('Success! You have admin privileges.');
    }
};
