# MCP Cookie Server 🍪

A Model Context Protocol (MCP) server that provides positive reinforcement for LLMs by awarding "cookies" as treats through gamified self-reflection.


<a href="https://glama.ai/mcp/servers/@bnookala/mcp-cookiejar">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@bnookala/mcp-cookiejar/badge" alt="Cookie Server MCP server" />
</a>

## Installation & Setup

## 🚀 Quick Installation

### Option 1: NPX (Recommended - No Installation Required)
```bash
# No installation needed! Just add to your Claude config:
```

Add to Claude Desktop configuration:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "cookie": {
      "command": "npx",
      "args": ["mcp-cookie-server"]
    }
  }
}
```

**Custom cookie count:**
```json
{
  "mcpServers": {
    "cookie": {
      "command": "npx",
      "args": ["mcp-cookie-server", "--cookies", "20"]
    }
  }
}
```

### Option 2: Global Installation
```bash
npm install -g mcp-cookie-server
```

Then configure Claude Desktop:
```json
{
  "mcpServers": {
    "cookie": {
      "command": "mcp-cookie-server"
    }
  }
}
```

### Option 3: Local Project Installation
```bash
npm install mcp-cookie-server
```

Then configure with the full path to the installed package.

**Restart Claude Desktop** after adding the configuration.

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

## ⚙️ Configuration Options

The server supports command line arguments for customization:

```bash
mcp-cookie-server [options]

Options:
  -c, --cookies <number>  Set initial number of cookies in jar (default: 10)
  -h, --help             Show help message

Examples:
  mcp-cookie-server                    # Start with 10 cookies
  mcp-cookie-server --cookies 5        # Start with 5 cookies  
  mcp-cookie-server -c 50              # Start with 50 cookies
```

## 🎮 Getting Started

1. **Install** using one of the methods above
2. **Configure** Claude Desktop with the provided JSON
3. **Restart** Claude Desktop  
4. **Try it out!** Ask Claude to use the `self_reflect_and_reward` tool after a response

## 🛠️ Development

Want to contribute or run from source?

```bash
git clone https://github.com/bnookala/mcp-cookiejar.git
cd mcp-cookiejar
npm install
npm run build
npm run dev
```

## 📝 Requirements

- Node.js 18.0.0 or higher
- Claude Desktop application

## 🐛 Issues & Support

Found a bug or have a feature request? Please open an issue on [GitHub](https://github.com/bnookala/mcp-cookiejar/issues).