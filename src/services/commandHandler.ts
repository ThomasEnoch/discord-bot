import { Message } from 'discord.js';
import { RoleValidator } from './roleValidator';
import { logger } from '../utils/logger';

export interface Command {
    name: string;
    description: string;
    adminOnly: boolean;
    execute: (message: Message, args: string[]) => Promise<void>;
}

export class CommandHandler {
    private commands: Map<string, Command>;
    private roleValidator: RoleValidator;

    constructor() {
        this.commands = new Map();
        this.roleValidator = RoleValidator.getInstance();
    }

    /**
     * Register a new command
     * @param command Command to register
     */
    public registerCommand(command: Command): void {
        this.commands.set(command.name.toLowerCase(), command);
        logger.info({
            commandName: command.name,
            adminOnly: command.adminOnly
        }, 'Registered new command');
    }

    /**
     * Handle an incoming command message
     * @param message Discord message containing the command
     * @param prefix Command prefix (e.g., '!')
     */
    public async handleCommand(message: Message, prefix: string): Promise<void> {
        try {
            if (!message.content.startsWith(prefix) || message.author.bot) return;

            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift()?.toLowerCase();

            if (!commandName) return;

            const command = this.commands.get(commandName);
            if (!command) {
                logger.debug({
                    commandName,
                    userId: message.author.id
                }, 'Unknown command attempted');
                return;
            }

            // Check admin permissions if required
            if (command.adminOnly && message.member) {
                const validation = this.roleValidator.validateAdminCommand(message.member);
                if (!validation.isValid) {
                    await message.reply(validation.message || 'You do not have permission to use this command.');
                    logger.warn({
                        commandName,
                        userId: message.author.id
                    }, 'Unauthorized admin command attempt');
                    return;
                }
            }

            // Execute the command
            await command.execute(message, args);
            logger.info({
                commandName,
                userId: message.author.id,
                success: true
            }, 'Command executed successfully');

        } catch (error) {
            logger.error({
                error,
                messageContent: message.content
            }, 'Error handling command');
            await message.reply('There was an error executing that command.');
        }
    }
}
