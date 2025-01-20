# Functional Requirements (with Implementation Guidance)

## 3.1 Discord Interaction

### Target Channels

**Requirement:** The bot only responds to messages in channels named with a specific prefix (e.g., #support-*).

**Acceptance Criteria:**
- If a user types in any other channel, the bot ignores the message.

**Implementation Guidance:**
- Implement a listener that checks the channel name/ID of each incoming message.
- If it doesn't match #support-*, the bot does nothing.
- This helps ensure normal Discord channels are not flooded by bot messages.

### User Role & Access Control

**Requirement:**
- Non-admin users can ask questions and receive answers.
- Admin users have access to special bot commands (e.g., !createTicket).

**Acceptance Criteria:**
- The bot checks the user's Discord role before executing admin-only commands.
- The bot gracefully denies any admin-only commands from non-admins.

**Implementation Guidance:**
- Determine admin roles upfront (e.g., "Support Team" or "Moderator").
- On every admin command, verify the user's role.
- If validation fails, respond with a polite denial (e.g., "Sorry, this command is restricted.").

### Message Handling & Response Flow

**Requirement:**
- The bot maintains ephemeral conversation context for the current session.
- It should greet and maintain a friendly tone, referencing any admin-configured "Bot Personality" settings.

**Acceptance Criteria:**
- The bot references the last N messages (decided by configuration) in the conversation for context.
- If no relevant context is found, it defaults to an FAQ-based answer or a "please clarify" response.

**Implementation Guidance:**
- Use ephemeral/in-memory storage (like a short-term queue or data structure) to store recent messages.
- Ensure the bot's responses incorporate any "tone" or "personality" overrides set by admins (see 3.2.2 for more details on personality updates).

## 3.2 FAQ & Troubleshooting

### FAQ Source

**Requirement:**
- FAQ and troubleshooting guides are stored in local Markdown files.
- The bot must reference these documents for relevant solutions.

**Acceptance Criteria:**
- Markdown files are loaded on bot startup.
- The bot can retrieve partial or full answers from these documents to respond to users.

**Implementation Guidance:**
- At startup, load or parse all Markdown files into a searchable data structure (e.g., a simple text index or an in-memory array).
- When a user asks a question, the bot attempts to find a relevant section in these Markdown files and replies accordingly.
- If no match is found, it responds politely that it's unsure or asks for clarification.

### Response Tone & Greeting

**Requirement:**
- The bot must use a consistent, gracious tone that can be overridden or set by an admin command.

**Acceptance Criteria:**
- The admin can issue a command like !setBotPersonality [greeting or style text].
- The new greeting/brand voice persists across sessions until changed again.

**Implementation Guidance:**
- Store the updated personality/tone in a simple persistent store (e.g., a JSON file or a key-value store).
- On each response, prepend or incorporate the configured greeting/style so the bot's voice remains consistent.

## 3.3 JIRA Ticket Creation (Admin Only)

### Command Format

**Requirement:**
- Admin can trigger a command, e.g., !createTicket [title] | [description] | [priority], to create a JIRA ticket.

**Acceptance Criteria:**
- The bot must extract the required fields and call JIRA's API.
- The bot replies with the new ticket ID or link upon success.

**Implementation Guidance:**
- Implement a command parser that splits the text based on a delimiter (e.g., |).
- Validate that all required fields (title, description, priority) are present before calling the JIRA API.
- If any field is missing, respond with a reminder about the command format.

### Fields

**Requirement:**
- Minimum fields: title, description, priority.
- Optional expansions (labeling, attachments) are out of scope for MVP but can be added later.

**Acceptance Criteria:**
- If any of the required fields are missing, the bot refuses ticket creation.
- The bot sets default values for missing optional fields (e.g., default priority = "Medium").

**Implementation Guidance:**
- Use robust error-checking on command parsing.
- If a user fails to provide a priority, set the default.
- A well-defined function (e.g., createJiraTicket(title, description, priority)) handles the API call.

### Error Handling

**Requirement:**
- If the JIRA API is unavailable or returns an error, the bot must inform the admin.

**Acceptance Criteria:**
- The bot gracefully handles API failures or invalid data (e.g., "Invalid priority level. Please use Low, Medium, or High.").

**Implementation Guidance:**
- Wrap JIRA API calls in a try/catch block (or equivalent).
- On errors, send a short message indicating the nature of the failure (e.g., "Cannot reach JIRA," "Invalid credentials," etc.).

## 3.4 Implementation Guidance and Architecture

### 3.4.1 Architecture Approach

#### Listener
- The bot must listen for incoming messages in real-time for any channel that starts with #support-*.

#### LLM Integration
- The bot uses ephemeral memory to store recent conversation context.
- When a non-admin question arrives, pass that user input + the ephemeral context to the LLM (or simple rule-based FAQ lookup) to generate or select a response.

#### FAQ Retrieval
- On startup, load local Markdown files.
- Maintain them in ephemeral memory (or a simple in-memory data structure) for quick lookups.

#### Admin Ticket Creation
- When an admin types !createTicket, parse the command arguments.
- Call the JIRA API with the extracted fields.
- Reply with a success or failure message.

#### State & Data Storage
- Ephemeral Chat Context: Use an in-memory structure for the last N messages. This resets when the bot restarts.
- Persistent Bot Personality: Store in a simple file/DB so it survives restarts.

### 3.4.2 Step-by-Step Flow

#### Message Received
- Check if it's in a valid channel (#support-*).
- Determine user role (admin vs. non-admin).

#### Is Admin Command?
- If !createTicket, parse and create JIRA ticket.
- If !setBotPersonality, update and store the new tone/greeting.
- Otherwise, proceed to normal user handling.

#### Non-Admin or General Inquiry
- Use ephemeral memory + FAQ references (Markdown) to craft a response.
- If relevant solution is found, respond with that. Otherwise, ask for clarification or express uncertainty.

#### Send Response
- The bot posts the reply to the same channel (publicly or mentions the user if needed).

#### Error Handling
- For JIRA issues, respond with a helpful error message.
- For parsing or missing data, instruct the user to retry with correct format.

### 3.4.3 Testing

#### Unit Tests
- Verify the command parser for admin commands.
- Ensure correct channel detection.
- Confirm role-based access control.

#### Integration Tests
- Test the JIRA ticket creation end-to-end (with mock or sandbox environment).
- Test the FAQ retrieval from Markdown files.

#### Load Testing
- Simulate 100 concurrent users across multiple #support-* channels to ensure the bot remains responsive.