# MCP Cookie Server 🍪

A Model Context Protocol (MCP) server that provides positive reinforcement for LLMs by awarding "cookies" as treats.

## Installation & Setup

1. **Build the server:**
   ```bash
   npm install
   npm run build
   ```

2. **Add to Claude Desktop configuration:**

   On macOS, edit: `~/Library/Application Support/Claude/claude_desktop_config.json`
   On Windows, edit: `%APPDATA%/Claude/claude_desktop_config.json`

   Add this server configuration:
   ```json
   {
     "mcpServers": {
       "cookie": {
         "command": "node",
         "args": ["/absolute/path/to/mcp-cookie/dist/index.js"]
       }
     }
   }
   ```

   **Important:** Replace `/absolute/path/to/mcp-cookie` with the actual full path to this project directory.

3. **Restart Claude Desktop** to load the new server.

## Usage

Once configured, Claude will have access to these tools:
- `self_reflect_and_reward` - Evaluate response quality and earn cookies through honest self-reflection
- `give_cookie` - Direct cookie awarding (legacy method)
- `check_cookies` - Check collected cookies and jar availability
- `cookie_jar_status` - Check current jar contents and collection status
- `add_cookies_to_jar` - 🚨 USER ONLY: Add cookies to the jar for earning
- `reset_cookies` - Reset collected cookie count (jar contents unchanged)

## Self-Reflection Feature

The primary feature encourages LLMs to:
1. **Assess** their response quality (excellent, good, adequate, poor)
2. **Explain** their reasoning in detail
3. **Decide** if they deserve a cookie reward
4. **Consider** jar availability when making decisions
5. **Earn** cookies only for "excellent" or "good" work they genuinely believe deserves recognition

## Cookie Jar Economy

Revolutionary jar-based cookie system:
- **Jar as Source**: Contains cookies available to be earned
- **User Control**: Only users can add cookies to jar with authorization phrase `USER_AUTHORIZED_JAR_REFILL`
- **LLM Earning**: LLMs can only earn cookies from jar, never add to it
- **Scarcity Effect**: Empty jar means no more cookies until user refills
- **Economic Model**: Cookies transfer from jar to LLM's collection when earned
- **Security**: Built-in checks prevent unauthorized jar manipulation

Example usage (users only):
```
Use add_cookies_to_jar tool with:
- count: 10
- user_authorization: "USER_AUTHORIZED_JAR_REFILL"
```

This creates a realistic economy where cookie availability is user-controlled and finite.

## Example Configuration

If your project is at `/Users/yourname/code/mcp-cookie`, your config should look like:

```json
{
  "mcpServers": {
    "cookie": {
      "command": "node",
      "args": ["/Users/yourname/code/mcp-cookie/dist/index.js"]
    }
  }
}
```