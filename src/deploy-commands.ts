import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { slashCommands } from '@/commands/slash-commands';
import { logger } from '@/utils/logger';

dotenv.config();

const token = process.env.DISCORD_TOKEN as string;
const clientId = process.env.DISCORD_CLIENT_ID as string;

if (!token || !clientId) {
    logger.error('Missing required environment variables: DISCORD_TOKEN or DISCORD_CLIENT_ID');
    process.exit(1);
}

const commands = Array.from(slashCommands.values()).map(command => {
    logger.debug({ command: command.metadata.name }, 'Processing command for deployment');
    return command.data.toJSON();
});

const rest = new REST({ version: '10' }).setToken(token);

// Deploy commands
async function deployCommands(): Promise<void> {
    try {
        logger.info({ 
            commandCount: commands.length,
            clientId 
        }, 'Started refreshing application (/) commands.');

        // Register commands globally
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        logger.info({ commandCount: commands.length }, 'Successfully reloaded application (/) commands.');
    } catch (error) {
        logger.error({ 
            error,
            commandCount: commands.length,
            clientId
        }, 'Failed to deploy commands');
        process.exit(1);
    }
}

deployCommands();
