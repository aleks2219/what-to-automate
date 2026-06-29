// Shared helper to fetch a company website and extract meaningful text.
// Used by extract + match-deck routes to personalize recommendations
// based on the user's actual company.

const MAX_CONTENT_LENGTH = 2000; // chars — keeps Groq token count manageable
const FETCH_TIMEOUT_MS = 8000;

export interface WebsiteFetchResult {
  url: string;
  title: string | null;
  content: string; // extracted text, truncated to MAX_CONTENT_LENGTH
  error?: string;
}

export async function fetchWebsiteContent(
  url: string
): Promise<WebsiteFetchResult | null> {
  // Normalize URL — add https:// if missing
  let normalizedUrl = url.trim();
  if (!normalizedUrl) return null;
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  try {
    // Validate URL
    const parsed = new URL(normalizedUrl);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'AutoScore-Bot/1.0 (research tool; +https://what-to-automate.vercel.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return {
        url: normalizedUrl,
        title: null,
        content: '',
        error: `HTTP ${res.status}`,
      };
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return {
        url: normalizedUrl,
        title: null,
        content: '',
        error: `Unsupported content type: ${contentType}`,
      };
    }

    const html = await res.text();
    const extracted = extractTextFromHtml(html, parsed.hostname);

    return {
      url: normalizedUrl,
      title: extracted.title,
      content: extracted.content.slice(0, MAX_CONTENT_LENGTH),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      url: normalizedUrl,
      title: null,
      content: '',
      error: message,
    };
  }
}

// Basic HTML-to-text extraction. Strips scripts, styles, nav, footer.
// Not perfect but good enough for the LLM to get company context.
function extractTextFromHtml(html: string, hostname: string): {
  title: string | null;
  content: string;
} {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;

  // Remove scripts, styles, and other non-content elements
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '');

  // Convert common block elements to newlines for readability
  cleaned = cleaned
    .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|tr|br)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ');

  // Strip all remaining tags
  cleaned = cleaned.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  cleaned = cleaned
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…');

  // Normalize whitespace
  cleaned = cleaned
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();

  // Remove lines that are just punctuation or very short (likely UI cruft)
  const lines = cleaned.split('\n');
  const meaningfulLines = lines.filter((line) => {
    const trimmed = line.trim();
    if (trimmed.length < 3) return false;
    // Skip lines that are just menu items / buttons
    if (/^(home|about|contact|login|sign up|menu|search|close)$/i.test(trimmed)) return false;
    return true;
  });

  return {
    title,
    content: meaningfulLines.join('\n').slice(0, MAX_CONTENT_LENGTH * 2), // a bit more, will be truncated by caller
  };
}

// Format the website content for inclusion in an LLM prompt.
// Returns null if there's no useful content.
export function formatWebsiteForPrompt(result: WebsiteFetchResult | null): string | null {
  if (!result) return null;
  if (!result.content || result.content.trim().length < 50) return null;

  const titleLine = result.title ? `"${result.title}"` : '';
  const truncated = result.content.slice(0, 1500); // tighter limit for prompt

  return `Company website: ${result.url}
${titleLine}

Website content (extracted, may be imperfect):
${truncated}

Use this company context to personalize your recommendations. Reference their actual product/service/industry when explaining why a tool fits.`;
}
