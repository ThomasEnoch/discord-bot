import { TextChannel } from 'discord.js';
import { ChannelValidator, ChannelValidationResult } from '../types/channel';
import { logger } from '../utils/logger';

export class SupportChannelValidator implements ChannelValidator {
    private readonly prefix: string;

    constructor(prefix: string = 'support-') {
        this.prefix = prefix;
        logger.info({ prefix }, 'Initialized SupportChannelValidator');
    }

    public isValidChannel(channel: TextChannel): ChannelValidationResult {
        logger.debug({ channelName: channel.name, prefix: this.prefix }, 'Validating channel');
        
        if (!channel.name.startsWith(this.prefix)) {
            logger.info({ channelName: channel.name }, `Channel validation failed: missing prefix '${this.prefix}'`);
            return {
                isValid: false,
                reason: `This channel does not have the required prefix '${this.prefix}'`
            };
        }

        logger.debug({ channelName: channel.name }, 'Channel validation successful');
        return {
            isValid: true
        };
    }
}
