# Discord LLM Customer Support Bot

A Discord bot that responds to customer support queries using LLM-based FAQ retrieval, with JIRA integration for ticket creation.

## Features

### Implemented
- **Channel Validation**: Bot only responds in channels with configured prefix (e.g., `support-*`)
- **Role-Based Access Control**: Admin commands restricted to users with specific roles
- **Structured Logging**: Comprehensive logging system with contextual information
- **Command System**: Extensible command handler with permission checks

### Planned
- LLM-based FAQ retrieval
- JIRA ticket creation
- Ephemeral conversation memory
- Admin configuration commands

## Project Structure

```
bot/
├── src/
│   ├── commands/       # Bot commands (admin + user)
│   ├── config/         # Configuration files and loaders
│   ├── integrations/   # JIRA or other API integrations
│   ├── services/       # Core services (message handling, validation)
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
   - `DISCORD_TOKEN`: Your bot's token
   - `DISCORD_CLIENT_ID`: Your bot's client ID
   - `SUPPORT_CHANNEL_PREFIX`: Prefix for support channels (default: 'support-')
   - `ADMIN_ROLE_IDS`: Comma-separated Discord role IDs for admin access
   
4. Build the project:
   ```bash
   npm run build
   ```
5. Start the bot:
   ```bash
   npm start
   ```

## Usage

### Channel Management
- Bot only responds to messages in channels starting with the configured prefix
- Other channels are ignored for regular messages
- Commands work in any channel

### Admin Commands
- Admin commands are restricted to users with configured admin roles
- To get a role ID:
  1. Enable Developer Mode in Discord (User Settings > Advanced)
  2. Right-click the role in Server Settings > Roles
  3. Click "Copy Role ID"

Current admin commands:
- `!admintest` - Test command to verify admin privileges

### Regular Commands
- Commands start with `!` prefix
- Work in any channel, regardless of channel prefix

## Development

- `npm run dev` - Run the bot in development mode with hot-reload
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Logging

The bot implements comprehensive logging with the following levels:
- `debug`: Detailed troubleshooting information
- `info`: General operational events
- `warn`: Concerning but non-critical issues
- `error`: Failures and errors

Logs include contextual information such as:
- Channel names and IDs
- User IDs
- Message content (for debugging)
- Command execution status

## Configuration

Environment variables (see `.env.example` for details):
- `DISCORD_TOKEN`: Bot authentication token
- `DISCORD_CLIENT_ID`: Bot's client ID
- `SUPPORT_CHANNEL_PREFIX`: Channel prefix for support channels
- `ADMIN_ROLE_IDS`: Admin role IDs (comma-separated)

## Contributing

1. Follow TypeScript best practices
2. Implement comprehensive logging for new features
3. Add proper error handling
4. Test thoroughly before submitting changes

## Security

- Admin commands are role-restricted
- Logging excludes sensitive information
- Channel validation prevents unwanted responses
- Bot messages are properly filtered to prevent loops
