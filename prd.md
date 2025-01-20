# Product Requirements Document (PRD) - Discord LLM Customer Support Bot

This PRD is structured to capture the essential details of the MVP (minimum viable product) and outline how a developer should architect the application—**without including any direct code**. It includes **step-by-step** instructions and clearly defined requirements, user stories, acceptance criteria, and future enhancements.

## 1. Overview

**Product Name**: Discord LLM Customer Support Bot

**Goal**: Provide an automated, always-available support channel on Discord. Users can ask FAQs or troubleshoot product issues, while admins have special privileges, such as creating JIRA tickets for complex issues.

**Key Objectives**:
1. Provide **24/7** support through automated responses
2. Offer **quick and concise** help to users with minimal human intervention
3. Reduce **workload** on support teams by handling **FAQs** and **product troubleshooting** queries
4. Allow **administrators** to create JIRA tickets for escalated issues directly from Discord

## 2. Use Cases / User Stories

### 2.1 End User (Customer) Stories

#### Ask FAQ
**As a customer**, I want to type my question in a designated support channel and receive an automated response with relevant FAQ or troubleshooting steps.

**Acceptance Criteria**:
- The bot responds in under 5 seconds
- If the bot cannot match a known FAQ, it politely indicates it's not sure

#### General Troubleshooting
**As a customer**, I want to describe a problem I'm experiencing, and the bot responds with step-by-step instructions or potential solutions.

**Acceptance Criteria**:
- The bot uses a "friendly/helpful" tone
- The response references relevant solutions from the internal Markdown FAQ documents if available

### 2.2 Admin (Support Team) Stories

#### JIRA Ticket Creation
**As an admin**, I want to create a JIRA ticket when a user's issue is too complex to solve in Discord.

**Acceptance Criteria**:
- The bot accepts a specific admin-only command (e.g., `!createTicket`) that includes title, description, and priority
- The bot responds with the new JIRA ticket ID or link

#### Bot Personality & Tone Configuration
**As an admin**, I want to upload or set the bot's greeting and brand-voice so it aligns with our customer support style.

**Acceptance Criteria**:
- The bot stores the custom personality/tone in memory (or in a simple persistent store) so that all subsequent responses reflect this configuration

## 3. Functional Requirements

### 3.1 Discord Interaction

#### Target Channels
- The bot only responds to messages in channels named with a specific prefix (e.g., `#support-*`)
- **Acceptance Criteria**:
  - If a user types in any other channel, the bot ignores the message

#### User Role & Access Control
- Non-admin users can ask questions and receive answers from the bot
- Admin users have access to special commands (e.g., `!createTicket`)
- **Acceptance Criteria**:
  - The bot checks the user's role or permission in Discord before executing admin commands
  - The bot gracefully denies any admin-only commands from non-admins

#### Message Handling & Response Flow
- For each new user message, the bot uses ephemeral memory to maintain recent conversation context
- The bot should greet and maintain a friendly tone, referencing any admin-configured "Bot Personality" settings
- **Acceptance Criteria**:
  - The bot references the last N messages in the conversation to ensure context awareness
  - If no relevant context is found, it defaults to FAQ or a "please clarify" message

### 3.2 FAQ & Troubleshooting

#### FAQ Source
- FAQs or troubleshooting guides are stored in Markdown files locally
- The bot references these documents for relevant solutions
- **Acceptance Criteria**:
  - Markdown files are loaded on bot startup
  - The bot can retrieve partial or full answers from these documents to respond to users

#### Response Tone & Greeting
- The bot uses a consistent, gracious tone that an admin can override or set
- **Acceptance Criteria**:
  - The admin can issue a command like `!setBotPersonality` to update the greeting or brand voice
  - These settings persist across sessions until changed again

### 3.3 JIRA Ticket Creation (Admin Only)

#### Command Format
- Admin triggers a command (for example, `!createTicket [title] | [description] | [priority]`) in a support channel to create a JIRA ticket
- **Acceptance Criteria**:
  - The bot extracts the required fields and calls JIRA's API
  - The bot replies with the newly created ticket ID/link on success

#### Fields
- Minimum fields: title, description, priority
- Optional expansions (e.g., labeling, attachments) can come later
- **Acceptance Criteria**:
  - The bot only creates a ticket if all required fields are provided
  - The bot sets default values for any missing optional fields (e.g., priority defaults to "Medium")

#### Error Handling
- If the JIRA API is unavailable, the bot notifies the admin
- **Acceptance Criteria**:
  - The bot gracefully handles API failures or invalid data (e.g., "Invalid priority level. Please use Low, Medium, or High.")

## 4. Non-Functional Requirements

1. **Performance**
   - The bot should respond to user queries within **5 seconds** on average (considering LLM processing time)

2. **Scalability**
   - Support up to **100 concurrent** Discord users actively chatting across multiple support channels without crashing

3. **Security**
   - Keep JIRA credentials safe; do not expose them in logs or public channels
   - Restrict admin commands only to assigned Discord roles

4. **Reliability**
   - Bot restarts automatically in case of crashes or major errors
   - Should persist any admin-configured personality or tone settings across restarts

## 5. External Integrations

### JIRA API
- Bot uses standard OAuth or an API token with necessary permissions
- Should handle the following endpoints:
  - Ticket creation with `title`, `description`, `priority`
  - Optionally, we can expand to support querying existing tickets or adding comments in the future

### Markdown FAQ Files
- Located in a directory accessible by the bot at runtime
- The bot scans or loads them into ephemeral memory on startup

## 6. Assumptions & Constraints

1. **Discord Bot Setup**
   - We assume the bot has valid permissions to read/write messages in the `#support-*` channels
   - We assume there is a role or user list that identifies "admins"

2. **Ephemeral Memory**
   - The bot maintains a conversation thread in local memory for context. This memory resets on bot restart or redeployment
   - We are not storing chat logs in a long-term database in this MVP

3. **FAQ Availability**
   - We assume the FAQ content is stable enough that frequent updates aren't needed daily. Manual updates to the Markdown files suffice for the MVP

## 7. Future Enhancements / Post-MVP

1. **Vector Search Integration**
   - Migrate from a manual markdown approach to a vector database for more robust question-answer matching

2. **Confidence Scoring & Escalation**
   - Introduce thresholds; if confidence is too low, automatically escalate or tag an admin

3. **Reporting & Analytics**
   - Track usage statistics, top-asked questions, time to resolution, etc.

4. **Expanded JIRA Workflow**
   - Allow the bot to add watchers, labels, or attachments to JIRA tickets
   - Possibly integrate auto-prioritization based on question sentiment

5. **Fallback Options**
   - If the bot cannot find a relevant answer, prompt the user with forms or direct them to next-level support

6. **Slash Commands**
   - Convert core commands to Discord's slash commands for easier discoverability and better user interface

## Implementation Guidance (No Code)

### Architecture Approach
- Implement a **listener** for messages in the designated channels
- **Parse** incoming messages to differentiate normal user questions from admin commands
- **LLM Integration**: Use ephemeral memory to store recent conversation context
- **FAQ Retrieval**: Load or parse the local Markdown files at startup. For each incoming question, the bot attempts to find relevant content
- **Admin Ticket Creation**: Only process `!createTicket` commands if the user is an admin. Use a simple text parser to separate "title," "description," and "priority" before calling the JIRA API

### Step-by-Step Flow
1. **Message Received** → Check user role and channel
2. **Is Admin Command?**
   - If `!createTicket`, parse input and call JIRA
   - If `!setBotPersonality`, store personality data for future responses
3. **Else** → Pass user input + ephemeral memory to the LLM. Return the response
4. **Send Message** → Post the response publicly in the support channel (or privately if needed)
5. **Error Handling** → If an error occurs (JIRA offline, missing data, etc.), notify the user or admin

### Testing
- **Unit Tests**: Test the command parsing for admin vs. non-admin
- **Integration Tests**: Confirm JIRA ticket creation works end to end
- **Load Testing**: Verify the bot can handle multiple channels concurrently

## Conclusion

This PRD outlines an MVP **Discord LLM Customer Support Bot** that handles **FAQ/troubleshooting** queries from non-admin users and **JIRA ticket creation** from admins. We covered the **functional** and **non-functional** requirements, identified **external dependencies**, stated the **assumptions** for ephemeral memory usage, and provided a roadmap for **future enhancements**.

By following these requirements and the outlined architecture approach, a developer can build a working bot that meets the immediate needs for automated Discord support—and provides a solid foundation for more advanced features down the line.