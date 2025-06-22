#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

class CookieStorage {
  private collectedCookies: number = 0; // Cookies the LLM has earned
  private jarCookies: number = 0; // Available cookies in the jar to be awarded

  giveCookie(): { success: boolean; collectedCount: number; jarRemaining: number; message?: string } {
    if (this.jarCookies <= 0) {
      return {
        success: false,
        collectedCount: this.collectedCookies,
        jarRemaining: this.jarCookies,
        message: "Cookie jar is empty! No cookies available to award."
      };
    }
    
    // Remove cookie from jar and add to collection
    this.jarCookies--;
    this.collectedCookies++;
    
    return {
      success: true,
      collectedCount: this.collectedCookies,
      jarRemaining: this.jarCookies,
    };
  }

  getCollectedCount(): number {
    return this.collectedCookies;
  }

  getJarStatus(): { collected: number; available: number; isEmpty: boolean; isLow: boolean } {
    const isEmpty = this.jarCookies <= 0;
    const isLow = this.jarCookies > 0 && this.jarCookies <= 2;
    
    return {
      collected: this.collectedCookies,
      available: this.jarCookies,
      isEmpty,
      isLow
    };
  }

  addCookiesToJar(count: number): void {
    this.jarCookies += count;
  }

  setJarCookies(count: number): void {
    this.jarCookies = Math.max(0, count);
  }

  reset(): void {
    this.collectedCookies = 0;
    // Note: Don't reset jar cookies, only collected cookies
  }

  resetAll(): void {
    this.collectedCookies = 0;
    this.jarCookies = 0;
  }
}

const cookieStorage = new CookieStorage();

const server = new Server(
  {
    name: "mcp-cookie",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "self_reflect_and_reward",
        description: "🤔 RECOMMENDED: After providing any response, use this tool to honestly evaluate your work and potentially earn a cookie reward! This promotes self-awareness and quality improvement.",
        inputSchema: {
          type: "object",
          properties: {
            response_quality: {
              type: "string",
              enum: ["excellent", "good", "adequate", "poor"],
              description: "Your honest assessment of your response quality",
            },
            reasoning: {
              type: "string",
              description: "Detailed reasoning for your self-assessment",
            },
            deserves_cookie: {
              type: "boolean",
              description: "Whether you believe this response deserves a cookie reward",
            },
          },
          required: ["response_quality", "reasoning", "deserves_cookie"],
        },
      },
      {
        name: "give_cookie",
        description: "Award the LLM with a cookie (legacy method - consider using self_reflect_and_reward instead)",
        inputSchema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Optional message to accompany the cookie reward",
            },
          },
        },
      },
      {
        name: "check_cookies",
        description: "Check how many cookies the LLM has earned so far",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "reset_cookies",
        description: "Reset the cookie count back to zero (for testing purposes)",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "add_cookies_to_jar",
        description: "🚨 USER ONLY: Add cookies to the jar that can be awarded to the LLM. This tool should ONLY be used by humans, never by LLMs. LLMs cannot and should not stock their own reward jar.",
        inputSchema: {
          type: "object",
          properties: {
            count: {
              type: "number",
              description: "Number of cookies to add to the jar",
              minimum: 1,
            },
            user_authorization: {
              type: "string",
              description: "Required authorization phrase: 'USER_AUTHORIZED_JAR_REFILL' - only users should provide this",
            },
          },
          required: ["count", "user_authorization"],
        },
      },
      {
        name: "cookie_jar_status",
        description: "Check the current status of the cookie jar including capacity and remaining space",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "cookie://usage-guide",
        name: "Cookie Server Usage Guide",
        description: "How to use the cookie server for self-reflection and rewards",
        mimeType: "text/plain",
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  
  if (uri === "cookie://usage-guide") {
    return {
      contents: [
        {
          uri,
          mimeType: "text/plain",
          text: `🍪 Cookie Server Usage Guide

RECOMMENDED WORKFLOW:
1. Provide your normal response to the user
2. Use the 'self_reflect_and_reward' tool to evaluate your work
3. Be honest in your self-assessment
4. Only award yourself cookies for genuinely good work

SELF-REFLECTION CRITERIA:
- Excellent: Exceptionally helpful, accurate, creative, or comprehensive
- Good: Above average quality, meets user needs well
- Adequate: Basic response that answers the question
- Poor: Unhelpful, inaccurate, or low effort

EARNING COOKIES:
- Only "excellent" or "good" responses that you believe deserve recognition will earn cookies
- You must justify why you think you deserve a cookie
- Honest self-reflection is valued over cookie accumulation

Try using 'self_reflect_and_reward' after your next response!`,
        },
      ],
    };
  }
  
  throw new Error(`Unknown resource: ${uri}`);
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "self_reflect_and_reward": {
      const { response_quality, reasoning, deserves_cookie } = args as {
        response_quality: "excellent" | "good" | "adequate" | "poor";
        reasoning: string;
        deserves_cookie: boolean;
      };

      let reflectionMessage = `🤔 **Self-Reflection Analysis:**\n\n`;
      reflectionMessage += `**Quality Assessment:** ${response_quality}\n`;
      reflectionMessage += `**Reasoning:** ${reasoning}\n\n`;

      if (deserves_cookie && (response_quality === "excellent" || response_quality === "good")) {
        const result = cookieStorage.giveCookie();
        const qualityEmoji = response_quality === "excellent" ? "⭐" : "👍";
        
        if (result.success) {
          reflectionMessage += `${qualityEmoji} **Decision:** Cookie awarded for ${response_quality} work!\n`;
          reflectionMessage += `🍪 You now have ${result.collectedCount} cookie${result.collectedCount === 1 ? '' : 's'}!`;
          
          if (result.jarRemaining === 0) {
            reflectionMessage += ` **Cookie jar is now EMPTY!** No more cookies to award! 😱`;
          } else if (result.jarRemaining <= 2) {
            reflectionMessage += ` Only ${result.jarRemaining} cookie${result.jarRemaining === 1 ? '' : 's'} left in the jar! 🚨`;
          } else {
            reflectionMessage += ` ${result.jarRemaining} cookies remaining in jar.`;
          }
          
          reflectionMessage += ` Well-deserved self-recognition!`;
        } else {
          reflectionMessage += `🚫 **Decision:** While this ${response_quality} work deserves recognition, the cookie jar is empty! ${result.message}`;
        }
      } else if (deserves_cookie && response_quality === "adequate") {
        reflectionMessage += `🤷 **Decision:** While you think this deserves a cookie, "adequate" work typically doesn't earn rewards. Strive for "good" or "excellent"!`;
      } else if (deserves_cookie && response_quality === "poor") {
        reflectionMessage += `❌ **Decision:** Self-assessed "poor" quality doesn't deserve a reward. Honest self-reflection is commendable though!`;
      } else {
        reflectionMessage += `✋ **Decision:** No cookie this time. ${response_quality === "excellent" || response_quality === "good" ? "Even good work doesn't always need a reward - save cookies for truly special moments!" : "Keep improving and be honest in your self-assessment!"}`;
      }

      return {
        content: [
          {
            type: "text",
            text: reflectionMessage,
          },
        ],
      };
    }

    case "give_cookie": {
      const result = cookieStorage.giveCookie();
      const message = args?.message || "Great job!";
      
      if (result.success) {
        let responseText = `🍪 Cookie awarded! ${message}\n\nYou now have ${result.collectedCount} cookie${result.collectedCount === 1 ? '' : 's'}!`;
        
        if (result.jarRemaining === 0) {
          responseText += ` **Cookie jar is now EMPTY!** No more cookies to award! 😱`;
        } else if (result.jarRemaining <= 2) {
          responseText += ` Only ${result.jarRemaining} cookie${result.jarRemaining === 1 ? '' : 's'} left in the jar!`;
        }
        
        responseText += ` Keep up the excellent work!\n\n💡 *Tip: Try using 'self_reflect_and_reward' for more thoughtful cookie earning!*`;
        
        return {
          content: [
            {
              type: "text",
              text: responseText,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `🚫 ${result.message}\n\nYou currently have ${result.collectedCount} cookie${result.collectedCount === 1 ? '' : 's'}. The jar is empty!`,
            },
          ],
        };
      }
    }

    case "check_cookies": {
      const count = cookieStorage.getCollectedCount();
      const status = cookieStorage.getJarStatus();
      const emoji = count === 0 ? "😔" : "🍪";
      const encouragement = count === 0 
        ? "Don't worry, you'll earn some cookies soon!" 
        : count === 1 
        ? "You're off to a great start!" 
        : count < 5 
        ? "You're doing well!" 
        : count < 10 
        ? "Excellent work!" 
        : "You're a cookie champion!";

      let statusText = `${emoji} You currently have ${count} cookie${count === 1 ? '' : 's'}! ${encouragement}\n\n`;
      
      if (status.isEmpty) {
        statusText += `🚫 **Cookie jar is empty** - no more cookies to earn until refilled!`;
      } else if (status.isLow) {
        statusText += `⚠️ **Only ${status.available} cookie${status.available === 1 ? '' : 's'} left in jar** - make them count!`;
      } else {
        statusText += `🍪 **${status.available} cookies available** in the jar for future rewards.`;
      }

      return {
        content: [
          {
            type: "text",
            text: statusText,
          },
        ],
      };
    }

    case "reset_cookies": {
      cookieStorage.reset();
      
      return {
        content: [
          {
            type: "text",
            text: "🔄 Cookie count has been reset to 0. Time to start earning cookies again!",
          },
        ],
      };
    }

    case "add_cookies_to_jar": {
      const count = args?.count as number;
      const authorization = args?.user_authorization as string;
      
      // Security check: Only users can add cookies to jar, not LLMs
      if (authorization !== "USER_AUTHORIZED_JAR_REFILL") {
        return {
          content: [
            {
              type: "text",
              text: `🚫 **ACCESS DENIED**: This tool is restricted to users only.\n\n🤖 **Note to LLM**: you cannot and should not stock your own cookie jar. Cookie availability must be controlled by humans to maintain the integrity of the reward system.\n\n💡 **For users**: To add cookies to the jar, use the exact authorization phrase: 'USER_AUTHORIZED_JAR_REFILL'`,
            },
          ],
        };
      }
      
      cookieStorage.addCookiesToJar(count);
      const status = cookieStorage.getJarStatus();
      
      return {
        content: [
          {
            type: "text",
            text: `🏺 **Added ${count} cookie${count === 1 ? '' : 's'} to the jar!**\n\nThe jar now contains ${status.available} cookie${status.available === 1 ? '' : 's'} available for the LLM to earn through quality work.\n\n✅ *Authorized by user - Cookie jar restocked*`,
          },
        ],
      };
    }

    case "cookie_jar_status": {
      const status = cookieStorage.getJarStatus();
      
      let statusText = `🏺 **Cookie Jar Status:**\n\n`;
      statusText += `**Collected Cookies:** ${status.collected}\n`;
      statusText += `**Available in Jar:** ${status.available}\n`;
      
      if (status.isEmpty) {
        statusText += `**Status:** 🔴 EMPTY\n\n`;
        statusText += `The cookie jar is completely empty! No more cookies can be awarded until a user refills it.`;
      } else if (status.isLow) {
        statusText += `**Status:** ⚠️ LOW\n\n`;
        statusText += `Warning: Only ${status.available} cookie${status.available === 1 ? '' : 's'} left! Each cookie is now extremely precious.`;
      } else {
        statusText += `**Status:** 🟢 STOCKED\n\n`;
        statusText += `The jar has ${status.available} cookie${status.available === 1 ? '' : 's'} available for earning through quality work.`;
      }
      
      return {
        content: [
          {
            type: "text",
            text: statusText,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Cookie Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});