import { logger } from '../utils/logger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface BotPersonality {
    tone: string;
    greetings: string[];
    defaultResponse: string;
}

export class PersonalityService {
    private personality: BotPersonality;

    constructor() {
        // Default personality settings
        this.personality = {
            tone: process.env.BOT_TONE || 'friendly',
            greetings: [
                'Hi there! How can I help you today?',
                'Hello! I\'m here to assist you.',
                'Welcome! What can I do for you?'
            ],
            defaultResponse: 'I\'m not quite sure about that. Could you please clarify your question?'
        };
    }

    public getRandomGreeting(): string {
        const index = Math.floor(Math.random() * this.personality.greetings.length);
        return this.personality.greetings[index];
    }

    public getDefaultResponse(): string {
        return this.personality.defaultResponse;
    }

    public updatePersonality(newPersonality: Partial<BotPersonality>): void {
        this.personality = {
            ...this.personality,
            ...newPersonality
        };
        logger.info({ newPersonality }, 'Updated bot personality');
    }

    public getCurrentPersonality(): BotPersonality {
        return { ...this.personality };
    }
}
