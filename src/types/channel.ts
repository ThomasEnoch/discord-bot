import { TextChannel } from 'discord.js';

export interface ChannelValidationResult {
    isValid: boolean;
    reason?: string;
}

export interface ChannelValidator {
    isValidChannel(channel: TextChannel): ChannelValidationResult;
}
