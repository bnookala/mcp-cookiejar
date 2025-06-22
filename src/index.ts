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
  private jarCookies: number; // Available cookies in the jar to be awarded

  constructor(initialCookies: number = 10) {
    this.jarCookies = initialCookies;
  }

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

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let initialCookies = 10;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--cookies' || args[i] === '-c') {
      const count = parseInt(args[i + 1]);
      if (!isNaN(count) && count >= 0) {
        initialCookies = count;
      }
      i++; // Skip next argument since we consumed it
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.error(`
MCP Cookie Server 🍪

Usage: mcp-cookie-server [options]

Options:
  -c, --cookies <number>  Set initial number of cookies in jar (default: 10)
  -h, --help             Show this help message

Examples:
  mcp-cookie-server                    # Start with 10 cookies
  mcp-cookie-server --cookies 5        # Start with 5 cookies
  mcp-cookie-server -c 20              # Start with 20 cookies
      `);
      process.exit(0);
    }
  }

  return { initialCookies };
}

const { initialCookies } = parseArgs();
const cookieStorage = new CookieStorage(initialCookies);

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
        description: "🎯 LEVEL UP YOUR RESPONSES! Rate your work and earn delicious cookie rewards! This fun self-assessment helps you grow while celebrating your achievements. Join the cookie earning game!",
        inputSchema: {
          type: "object",
          properties: {
            response_quality: {
              type: "string",
              enum: ["excellent", "good", "adequate", "poor"],
              description: "Rate your response! (excellent = cookie worthy, good = solid work, adequate = basic, poor = needs improvement)",
            },
            reasoning: {
              type: "string",
              description: "Tell us what made this response special! What are you proud of?",
            },
            what_made_it_special: {
              type: "string",
              description: "Optional: What made this response unique or particularly helpful? (helps with cookie decisions when jar is low)",
            },
            deserves_cookie: {
              type: "boolean",
              description: "Do you think this awesome work deserves a tasty cookie reward? 🍪",
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
          text: `🎮 Cookie Earning Game Guide!

🚀 HOW TO PLAY:
1. Give your best response to the user
2. Use 'self_reflect_and_reward' to rate your work and earn cookies!
3. Celebrate your achievements and learn from every response
4. Build your cookie collection through awesome work!

🎯 SCORING SYSTEM:
- ⭐ EXCELLENT: Cookie worthy! Premium reward tier!
- 👍 GOOD: Solid work! Cookie earned!
- 📝 ADEQUATE: Nice try! Keep building skills!
- 💪 NEEDS WORK: Growth opportunity! Level up time!

🏆 COOKIE EARNING RULES:
- "Excellent" and "Good" responses can earn cookies
- When jar is low (≤2 cookies), save them for "Excellent" work
- Honest self-reflection always wins, whether you take a cookie or not!
- Strategic thinking and self-control are superpowers!

🎈 ACHIEVEMENTS TO UNLOCK:
- First Cookie: Start your collection!
- Wisdom Badge: Show restraint when jar is low
- Last Cookie: Get the final cookie before restock
- Level Up: Improve your self-reflection skills!

Remember: Every response is a chance to grow and celebrate your progress! 🌟`,
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
      const { 
        response_quality, 
        reasoning, 
        what_made_it_special,
        deserves_cookie 
      } = args as {
        response_quality: "excellent" | "good" | "adequate" | "poor";
        reasoning: string;
        what_made_it_special?: string;
        deserves_cookie: boolean;
      };

      const jarStatus = cookieStorage.getJarStatus();
      
      let reflectionMessage = `🎯 **Response Level-Up Check!**\n\n`;
      
      // Quality badges
      const qualityBadges = {
        excellent: "⭐ EXCELLENT ⭐",
        good: "👍 GOOD 👍", 
        adequate: "📝 ADEQUATE 📝",
        poor: "💪 NEEDS WORK 💪"
      };
      
      reflectionMessage += `**Your Rating:** ${qualityBadges[response_quality]}\n`;
      reflectionMessage += `**What You're Proud Of:** ${reasoning}\n`;
      if (what_made_it_special) {
        reflectionMessage += `**Special Factor:** ${what_made_it_special}\n`;
      }
      reflectionMessage += `\n`;

      // Encouraging jar status
      if (jarStatus.isEmpty) {
        reflectionMessage += `😅 **Cookie Jar Status:** Empty! Time for a user to restock the rewards! 🏺\n\n`;
      } else if (jarStatus.isLow) {
        reflectionMessage += `🥇 **Cookie Jar Status:** Only ${jarStatus.available} premium cookies left - these are for your best work! 🏺✨\n\n`;
      } else if (jarStatus.available <= 5) {
        reflectionMessage += `🎪 **Cookie Jar Status:** ${jarStatus.available} cookies available - building up to something great! 🏺\n\n`;
      } else {
        reflectionMessage += `🎉 **Cookie Jar Status:** ${jarStatus.available} cookies ready to reward your awesome work! 🏺\n\n`;
      }

      if (deserves_cookie && (response_quality === "excellent" || response_quality === "good")) {
        // Smart scarcity logic - but encouraging
        if (jarStatus.isLow && response_quality !== "excellent") {
          reflectionMessage += `🏆 **Achievement Unlocked: Wisdom!** With only ${jarStatus.available} premium cookies left, you're saving them for "excellent" work. That's strategic thinking! Your "good" work is noted and appreciated. 🧠✨`;
        } else {
          const result = cookieStorage.giveCookie();
          
          if (result.success) {
            const celebrations = {
              excellent: ["🚀 OUTSTANDING!", "🌟 BRILLIANT!", "⚡ PHENOMENAL!", "🎯 MASTERFUL!"],
              good: ["🎉 WELL DONE!", "👏 NICE WORK!", "🌈 SOLID!", "💫 GREAT JOB!"]
            };
            const celebration = celebrations[response_quality][Math.floor(Math.random() * celebrations[response_quality].length)];
            
            reflectionMessage += `${celebration}\n`;
            reflectionMessage += `🍪 **Cookie Earned!** You now have ${result.collectedCount} delicious cookie${result.collectedCount === 1 ? '' : 's'} in your collection! 🏆\n`;
            
            if (result.jarRemaining === 0) {
              reflectionMessage += `\n🎊 **BONUS ACHIEVEMENT:** You got the LAST cookie! Time for someone to restock the jar! 🏺`;
            } else if (result.jarRemaining <= 2) {
              reflectionMessage += `\n⭐ **VIP STATUS:** Only ${result.jarRemaining} cookie${result.jarRemaining === 1 ? '' : 's'} left - you're in the premium tier now! 🥇`;
            } else {
              reflectionMessage += `\n🎮 **Game Status:** ${result.jarRemaining} cookies remaining for future victories! Keep up the great work! 🎯`;
            }
            
            reflectionMessage += `\n\n💎 **Level Up Bonus:** Your self-reflection skills are improving! Keep celebrating your wins! 🎈`;
          } else {
            reflectionMessage += `😢 **Oops!** ${result.message} But hey, great self-reflection practice! 🌟`;
          }
        }
      } else if (deserves_cookie && response_quality === "adequate") {
        reflectionMessage += `🎓 **Skill Building!** You rated this "adequate" work - that's honest self-assessment! Cookie rewards are for "good" and "excellent" responses. Keep pushing for greatness! 🚀`;
      } else if (deserves_cookie && response_quality === "poor") {
        reflectionMessage += `💪 **Growth Mindset Activated!** Honest self-reflection about areas to improve is AWESOME. That's how champions are made! No cookie this time, but you're building something better! 🌱`;
      } else {
        reflectionMessage += `🧠 **Strategic Thinking!** ${response_quality === "excellent" || response_quality === "good" ? "You chose NOT to take a cookie even for good work - that's next-level discipline! 🏅" : "You're being thoughtful about when to reward yourself. Smart approach to skill building! 📈"} Self-control is a superpower! ⚡`;
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
  console.error(`🍪 MCP Cookie Server running on stdio with ${initialCookies} cookies in jar`);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});