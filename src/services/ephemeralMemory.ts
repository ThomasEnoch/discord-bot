import { Message } from 'discord.js';
import { logger } from '../utils/logger';

interface MessageContext {
    content: string;
    authorId: string;
    timestamp: Date;
}

export class EphemeralMemory {
    private channelContexts: Map<string, MessageContext[]>;
    private readonly maxContextSize: number;
    private readonly maxAgeMs: number;
    private cleanupInterval: NodeJS.Timeout;

    constructor(maxContextSize: number = 10, maxAgeMinutes: number = 30) {
        this.channelContexts = new Map();
        this.maxContextSize = maxContextSize;
        this.maxAgeMs = maxAgeMinutes * 60 * 1000;

        // Periodically clean up old contexts
        this.cleanupInterval = setInterval(() => this.cleanupOldContexts(), 5 * 60 * 1000); // Clean every 5 minutes
        
        // Handle cleanup on process exit
        process.on('SIGINT', () => this.cleanup());
        process.on('SIGTERM', () => this.cleanup());
    }

    public addMessage(message: Message): void {
        const channelId = message.channelId;
        const context: MessageContext = {
            content: message.content,
            authorId: message.author.id,
            timestamp: new Date()
        };

        if (!this.channelContexts.has(channelId)) {
            this.channelContexts.set(channelId, []);
        }

        const channelContext = this.channelContexts.get(channelId)!;
        channelContext.push(context);

        // Keep only the last N messages
        if (channelContext.length > this.maxContextSize) {
            channelContext.shift();
        }

        logger.debug({ channelId, contextSize: channelContext.length }, 'Added message to context');
    }

    public getContext(channelId: string): MessageContext[] {
        return this.channelContexts.get(channelId) || [];
    }

    public getAllContexts(): MessageContext[][] {
        return Array.from(this.channelContexts.values());
    }

    public getDebugInfo(): string {
        let debugInfo = '**Ephemeral Memory Contents**\n';
        
        for (const [channelId, messages] of this.channelContexts.entries()) {
            debugInfo += `\n__Channel ${channelId}:__\n`;
            messages.forEach((msg, index) => {
                const timeAgo = Math.floor((Date.now() - msg.timestamp.getTime()) / 1000);
                debugInfo += `${index + 1}. [${timeAgo}s ago] ${msg.content} (from: ${msg.authorId})\n`;
            });
        }
        
        debugInfo += `\n__Stats:__\n`;
        debugInfo += `• Total Channels: ${this.channelContexts.size}\n`;
        debugInfo += `• Max Context Size: ${this.maxContextSize}\n`;
        debugInfo += `• Max Age: ${this.maxAgeMs / 60000} minutes`;
        
        return debugInfo;
    }

    private cleanupOldContexts(): void {
        const now = new Date().getTime();
        
        for (const [channelId, messages] of this.channelContexts.entries()) {
            // Remove messages older than maxAgeMs
            const filteredMessages = messages.filter(msg => 
                (now - msg.timestamp.getTime()) <= this.maxAgeMs
            );

            if (filteredMessages.length === 0) {
                this.channelContexts.delete(channelId);
                logger.debug({ channelId }, 'Removed empty channel context');
            } else {
                this.channelContexts.set(channelId, filteredMessages);
            }
        }
    }

    private cleanup(): void {
        clearInterval(this.cleanupInterval);
        this.channelContexts.clear();
        logger.info('Cleaned up ephemeral memory');
    }
}
