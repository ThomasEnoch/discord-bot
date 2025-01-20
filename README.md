# Discord LLM Customer Support Bot

A Discord bot that responds to customer support queries using LLM-based FAQ retrieval, with JIRA integration for ticket creation.

## Features

### Implemented
- **Slash Commands**: Modern Discord slash command system with TypeScript type safety
- **Admin Commands**: 
  - `/admintest` - Verify admin privileges
  - `/debug memory` - View ephemeral memory contents
- **Channel Validation**: Bot only responds in channels with configured prefix (e.g., `support-*`)
- **Permission System**: Admin commands restricted using Discord's built-in permission system
- **Ephemeral Memory**: Short-term conversation context with configurable size and duration
- **Structured Logging**: Comprehensive logging system with contextual information

### Planned
- LLM-based FAQ retrieval
- JIRA ticket creation
- Admin configuration commands
- Support channel auto-responses

## Project Structure

```
bot/
├── src/
│   ├── commands/       # Slash commands and command registration
│   ├── services/       # Core services (validation, memory management)
│   ├── utils/          # Reusable helper functions
│   ├── types/          # TypeScript interfaces and types
│   └── index.ts        # Main entry point
```

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure:
   - `DISCORD_TOKEN`: Your bot's token (from Discord Developer Portal > Bot)
   - `DISCORD_CLIENT_ID`: Your application ID (from Discord Developer Portal > General Information)
   - `SUPPORT_CHANNEL_PREFIX`: Prefix for support channels (default: 'support-')
   - `MAX_CONTEXT_SIZE`: Number of messages to keep in memory (default: 10)
   - `CONTEXT_MAX_AGE_MINUTES`: How long to keep context (default: 30)
   
4. Build the project:
   ```bash
   npm run build
   ```

5. Deploy slash commands:
   ```bash
   npm run deploy-commands
   ```

6. Start the bot:
   ```bash
   # For development (with hot reload):
   npm run dev

   # For production:
   npm run build && npm start
   ```

## Development

### Available Scripts
- `npm run build` - Build the TypeScript code
- `npm run dev` - Run with ts-node and path aliases for development
- `npm run deploy-commands` - Deploy slash commands to Discord
- `npm run lint` - Run ESLint
- `npm test` - Run tests

### Path Aliases
The project uses TypeScript path aliases for cleaner imports. The `@/*` alias points to the `src/` directory. For example:
```typescript
import { logger } from '@/utils/logger';
```

### Adding New Commands
1. Create a new command file in `src/commands/`
2. Implement the `SlashCommand` interface
3. Register the command in `src/commands/slash-commands.ts`
4. Run `npm run deploy-commands` to update Discord

### Environment Variables
See `.env.example` for all available configuration options and their descriptions.

## Security
- Bot token and other credentials are stored in environment variables
- Admin commands use Discord's permission system
- Channel validation prevents unauthorized usage
- Ephemeral memory automatically cleans up old data

## Logging
The bot uses structured logging with the following levels:
- `ERROR`: For errors that need immediate attention
- `WARN`: For potentially problematic situations
- `INFO`: For important state changes
- `DEBUG`: For detailed debugging information

## Contributing
1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes using semantic commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `refactor:` for code changes
   - `docs:` for documentation
   - `style:` for formatting
   - `test:` for adding tests
   - `chore:` for maintenance
3. Push to the branch
4. Open a Pull Request
