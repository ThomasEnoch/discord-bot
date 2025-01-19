import { Client, Events, GatewayIntentBits, TextChannel } from 'discord.js';
import dotenv from 'dotenv';
import { SupportChannelValidator } from './services/channelValidator';
import { CommandHandler } from './services/commandHandler';
import { commands } from './commands';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

// Initialize Discord client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
    ],
});

// Initialize channel validator and command handler
const channelValidator = new SupportChannelValidator(
    process.env.SUPPORT_CHANNEL_PREFIX || 'support-'
);
const commandHandler = new CommandHandler();

// Register all commands
commands.forEach(command => commandHandler.registerCommand(command));

// Add more detailed ready event logging
client.once(Events.ClientReady, (readyClient) => {
    logger.info({
        botTag: readyClient.user.tag,
        supportPrefix: process.env.SUPPORT_CHANNEL_PREFIX || 'support-'
    }, 'Bot is ready and listening for messages');
});

// Handle message creation
client.on(Events.MessageCreate, async (message) => {
    // Ignore bot messages first
    if (message.author.bot) {
        logger.debug({ authorId: message.author.id }, 'Ignoring bot message');
        return;
    }

    // Ensure the message is in a text channel
    if (!(message.channel instanceof TextChannel)) {
        logger.debug({ channelType: message.channel.type }, 'Message not in a text channel');
        return;
    }

    logger.debug({
        content: message.content,
        channelName: message.channel.name,
        authorId: message.author.id
    }, 'Received message');

    // Handle commands first (these work in any channel)
    if (message.content.startsWith('!')) {
        await commandHandler.handleCommand(message, '!');
        return;
    }

    // Validate the channel
    const validationResult = channelValidator.isValidChannel(message.channel);
    
    if (!validationResult.isValid) {
        logger.info({
            channelName: message.channel.name,
            reason: validationResult.reason
        }, 'Channel validation failed');
        return;
    }

    logger.debug({ channelName: message.channel.name }, 'Processing message in support channel');
    
    try {
        await message.reply('I received your message in a support channel!');
        logger.debug({ messageId: message.id }, 'Successfully replied to message');
    } catch (error) {
        logger.error({ error, messageId: message.id }, 'Failed to reply to message');
    }
});

// Add error event handling
client.on('error', (error) => {
    logger.error({ error }, 'Discord client error');
});

// Login to Discord with error handling
logger.info('Attempting to connect to Discord...');
client.login(process.env.DISCORD_TOKEN)
    .catch(error => {
        logger.error({ error }, 'Failed to login to Discord');
        process.exit(1);
    });
