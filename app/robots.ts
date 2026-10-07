import type { MetadataRoute } from "next"

// Search engines may index the site; known AI-training and dataset crawlers are asked not to.
// ponytail: robots.txt is honour-system only; it can't stop screenshots, pasted code, or scrapers that ignore it.
const AI_CRAWLERS = [
  "GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "Claude-Web", "anthropic-ai", "Google-Extended",
  "Applebot-Extended", "CCBot", "PerplexityBot", "Bytespider", "Meta-ExternalAgent", "FacebookBot",
  "Amazonbot", "cohere-ai", "Diffbot", "ImagesiftBot", "omgili", "Timpibot",
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_CRAWLERS, disallow: "/" },
      { userAgent: "*", allow: "/", disallow: ["/studio", "/api/"] },
    ],
  }
}
