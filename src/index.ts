import { Client, Events, GatewayIntentBits, TextChannel } from 'discord.js';
import dotenv from 'dotenv';
import { SupportChannelValidator } from '@/services/channelValidator';
import { EphemeralMemory } from '@/services/ephemeralMemory';
import { PersonalityService } from '@/services/personalityService';
import { slashCommands } from '@/commands/slash-commands';
import { validatePermissions, handleValidationFailure } from '@/services/commandValidator';
import { logger } from '@/utils/logger';

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

// Initialize services
const channelValidator = new SupportChannelValidator(
    process.env.SUPPORT_CHANNEL_PREFIX || 'support-'
);
const ephemeralMemory = new EphemeralMemory(
    parseInt(process.env.MAX_CONTEXT_SIZE || '10'),
    parseInt(process.env.CONTEXT_MAX_AGE_MINUTES || '30')
);
const personalityService = new PersonalityService();

// Add more detailed ready event logging
client.once(Events.ClientReady, (readyClient) => {
    logger.info({
        botTag: readyClient.user.tag,
        supportPrefix: process.env.SUPPORT_CHANNEL_PREFIX || 'support-'
    }, 'Bot is ready and listening for messages');
});

// Handle slash commands
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = slashCommands.get(interaction.commandName);
    if (!command) {
        logger.warn({ commandName: interaction.commandName }, 'Unknown command');
        return;
    }

    try {
        // Validate permissions
        const validationResult = validatePermissions(interaction, command.metadata);
        if (!validationResult.isValid) {
            await handleValidationFailure(interaction, validationResult.reason!);
            return;
        }

        // Pass services to commands that need them
        await command.execute(interaction, { ephemeralMemory });
        logger.debug({ 
            commandName: interaction.commandName,
            userId: interaction.user.id
        }, 'Command executed successfully');
    } catch (error) {
        logger.error({ error, commandName: interaction.commandName }, 'Error executing command');
        const errorMessage = 'There was an error executing this command.';
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
});

// Handle message creation for support channels
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
        // Add message to ephemeral memory
        ephemeralMemory.addMessage(message);
        
        // Get conversation context
        const context = ephemeralMemory.getContext(message.channelId);
        
        // If this is the first message in the context, send a greeting
        if (context.length === 1) {
            await message.reply(personalityService.getRandomGreeting());
        } else {
            // TODO: Implement FAQ-based response logic here
            await message.reply(personalityService.getDefaultResponse());
        }
        
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
