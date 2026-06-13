import {
  markdownToPortableText as convertFromMarkdown,
  portableTextToMarkdown as convertToMarkdown,
  type PortableTextBlockRenderer,
} from "@portabletext/markdown";
import { escapeHTML, toHTML, uriLooksSafe } from "@portabletext/to-html";
import type { PortableTextBlock } from "@portabletext/types";
import matter from "gray-matter";

/**
 * Extracts plain text from a PortableText block's children
 */
function extractTextFromBlock(block: PortableTextBlock): string {
  if (!("children" in block && Array.isArray(block.children))) {
    return "";
  }

  return block.children
    .map((child) => {
      if (typeof child === "object" && child !== null && "text" in child) {
        return String(child.text);
      }
      return "";
    })
    .join("");
}

/**
 * Extract the first paragraph from PortableText content
 * @param content - PortableText content (array of blocks, or Json from DB)
 * @param maxLength - Maximum length of content before ellipsis (default: 150). The returned string may be up to maxLength + 3 characters when truncated.
 * @returns Extracted text or empty string
 */
export function extractFirstParagraph(
  content: unknown,
  maxLength = 150
): string {
  if (!(content && Array.isArray(content))) {
    return "";
  }

  for (const block of content) {
    if (typeof block !== "object" || block === null) {
      continue;
    }

    // Only process text blocks (not code, image, etc.)
    if (!("_type" in block) || block._type !== "block") {
      continue;
    }

    // Look for text blocks with 'normal' style (paragraphs)
    if (
      "style" in block &&
      block.style === "normal" &&
      "children" in block &&
      Array.isArray(block.children)
    ) {
      const text = extractTextFromBlock(block as PortableTextBlock);
      const trimmedText = text.trim();

      if (trimmedText) {
        // Truncate to maxLength and add ellipsis if needed
        // Use spreading to handle Unicode code points correctly (emoji, surrogate pairs)
        const codePoints = [...trimmedText];
        if (codePoints.length > maxLength) {
          return `${codePoints.slice(0, maxLength).join("")}...`;
        }
        return trimmedText;
      }
    }
  }

  return "";
}

/**
 * Extract plain text content from PortableText (or Json from DB) for use cases
 * like AI embeddings generation. Collects text from *all* text-bearing blocks
 * (unlike extractFirstParagraph which targets only leading normal paragraphs).
 */
export function extractTextFromPortableText(content: unknown): string {
  if (!content || typeof content !== "object") {
    return "";
  }

  const blocks = Array.isArray(content) ? content : [content];
  const texts: string[] = [];

  for (const block of blocks) {
    if (
      typeof block === "object" &&
      block !== null &&
      "children" in block &&
      Array.isArray(block.children)
    ) {
      for (const child of block.children) {
        if (
          typeof child === "object" &&
          child !== null &&
          "text" in child &&
          typeof child.text === "string"
        ) {
          texts.push(child.text);
        }
      }
    }
  }

  return texts.join(" ").trim();
}

/**
 * Convert PortableText to HTML string
 * @param content - PortableText content
 * @returns HTML string
 */
export function portableTextToHTML(
  content: PortableTextBlock[] | null | undefined
): string {
  if (!content) {
    return "";
  }

  return toHTML(content, {
    components: {
      block: {
        code: ({ children }) => `<pre><code>${children}</code></pre>`,
      },
      marks: {
        link: ({ children, value }) => {
          const href = value?.href as string | undefined;
          const title = value?.title as string | undefined;
          if (!(href && uriLooksSafe(href))) {
            return children;
          }
          const titleAttr = title ? ` title="${escapeHTML(title)}"` : "";
          const rel =
            href.startsWith("/") || href.startsWith("#")
              ? ""
              : ' rel="noreferrer noopener"';
          return `<a href="${escapeHTML(href)}"${titleAttr}${rel}>${children}</a>`;
        },
      },
      types: {
        code: ({ value }) => {
          const language = (value as Record<string, unknown>).language as
            | string
            | undefined;
          const code = escapeHTML(
            ((value as Record<string, unknown>).code as string | undefined) ??
              ""
          );
          const langAttr = language
            ? ` class="language-${escapeHTML(language)}"`
            : "";
          return `<pre><code${langAttr}>${code}</code></pre>`;
        },
        image: ({ value }) => {
          const v = value as Record<string, unknown>;
          const alt = escapeHTML((v.alt as string | undefined) ?? "");
          const asset = v.asset as { url?: string } | undefined;
          const src = asset?.url;
          if (!(src && uriLooksSafe(src))) {
            return "";
          }
          const figcaption = alt ? `<figcaption>${alt}</figcaption>` : "";
          return `<figure><img alt="${alt}" src="${escapeHTML(src)}" />${figcaption}</figure>`;
        },
      },
    },
  });
}

// Simple type for Portable Text blocks accepted by @portabletext/markdown
interface PortableTextLike {
  _type: string;
  [key: string]: unknown;
}

export interface PortableTextToMarkdownOptions {
  /**
   * Number of heading levels to offset.
   * For example, 3 shifts h1→h4, h2→h5, h3→h6. Default: 0
   */
  headingOffset?: number;
}

/**
 * Convert PortableText to Markdown string
 * @param content - PortableText content (array of blocks)
 * @param options - Conversion options
 * @returns Markdown string or empty string if conversion fails
 */
export function portableTextToMarkdown(
  content: unknown,
  options?: PortableTextToMarkdownOptions
): string {
  if (!(content && Array.isArray(content)) || content.length === 0) {
    return "";
  }

  const headingOffset = options?.headingOffset ?? 0;

  const makeHeadingRenderer = (level: number): PortableTextBlockRenderer => {
    const adjustedLevel = Math.min(Math.max(level + headingOffset, 1), 6);
    return ({ children }) => `${"#".repeat(adjustedLevel)} ${children}`;
  };

  const getFence = (code: string): string => {
    const runs = code.match(/`+/g) ?? [];
    const maxRun = runs.reduce((max, run) => Math.max(max, run.length), 0);
    return "`".repeat(Math.max(3, maxRun + 1));
  };

  try {
    return convertToMarkdown(content as PortableTextLike[], {
      block: {
        code: ({ value, children }) => {
          const language = (value as unknown as PortableTextLike).language as
            | string
            | undefined;
          const code = String(children);
          const fence = getFence(code);
          return `${fence}${language ?? ""}\n${code}\n${fence}`;
        },
        h1: makeHeadingRenderer(1),
        h2: makeHeadingRenderer(2),
        h3: makeHeadingRenderer(3),
        h4: makeHeadingRenderer(4),
        h5: makeHeadingRenderer(5),
        h6: makeHeadingRenderer(6),
      },
      types: {
        code: ({ value }) => {
          const v = value as PortableTextLike;
          const language = (v.language as string | null | undefined) ?? "";
          const code = (v.code as string | undefined) ?? "";
          const fence = getFence(code);
          return `${fence}${language}\n${code}\n${fence}`;
        },
        image: ({ value }) => {
          const v = value as PortableTextLike;
          const alt = (v.alt as string | undefined) ?? "";
          const asset = v.asset as { url?: string } | undefined;
          const src = asset?.url ?? "";
          return src ? `![${alt}](${src})` : "";
        },
      },
    });
  } catch {
    return "";
  }
}

export type PortableTextValue = PortableTextBlock[];

export interface CodeBlock {
  _type: "code";
  code: string;
  language?: string;
}

export interface ImageBlock {
  _type: "image";
  alt?: string;
  asset: {
    _type: "reference";
    url: string;
  };
  height?: number;
  width?: number;
}

/**
 * Type guard to check if a value is a valid Portable Text array.
 * Used across apps for safe narrowing of content coming from Supabase/props.
 */
export function isPortableTextValue(
  value: unknown
): value is PortableTextValue {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((item) => {
    if (!item || typeof item !== "object") {
      return false;
    }

    const type = (item as { _type?: unknown })._type;

    return typeof type === "string";
  });
}

// --- Markdown <-> Portable Text parsing (inlined from previous separate module to avoid
// bundler resolution issues with explicit .js extension in relative re-exports under strict ESM + nodenext) ---

interface PortableTextCodeBlock {
  _key?: string;
  _type: "code";
  code?: string;
  language?: string;
  [key: string]: unknown;
}

interface PortableTextSpan {
  _key?: string;
  _type: "span";
  text?: string;
}

interface InternalPortableTextBlock {
  _key?: string;
  _type: string;
  children?: PortableTextSpan[];
  style?: string;
  [key: string]: unknown;
}

function isCodeBlock(
  block: InternalPortableTextBlock
): block is PortableTextCodeBlock {
  return block._type === "code";
}

/**
 * Transform blocks from @portabletext/markdown format to the internal format
 * used by initializeEditorWithPortableText.
 * Specifically, code blocks need to be transformed from:
 *   { _type: 'code', language: '...', code: '...' }
 * to:
 *   { _type: 'block', style: 'code', language: '...', children: [...] }
 */
function transformBlock(
  block: InternalPortableTextBlock
): InternalPortableTextBlock {
  if (isCodeBlock(block)) {
    return {
      _key: block._key,
      _type: "block",
      children: [
        {
          _key: crypto.randomUUID(),
          _type: "span",
          text: block.code ?? "",
        },
      ],
      language: block.language,
      markDefs: [],
      style: "code",
    };
  }
  return block;
}

/**
 * Extract plain text from a Portable Text block's span children.
 */
function extractBlockText(block: InternalPortableTextBlock): string {
  if (!Array.isArray(block.children)) {
    return "";
  }
  return block.children
    .map((span) => (span._type === "span" ? (span.text ?? "") : ""))
    .join("");
}

/**
 * Parse frontmatter tags value into a string array.
 * Accepts a YAML sequence (string[]) or a comma-separated string.
 */
function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Parse a frontmatter date/datetime value into an ISO 8601 string.
 * Returns null when the value is absent or cannot be parsed.
 */
function parsePublishedAt(raw: unknown): string | null {
  if (raw === null || raw === undefined || raw === "") {
    return null;
  }
  if (raw instanceof Date) {
    return Number.isNaN(raw.getTime()) ? null : raw.toISOString();
  }
  if (typeof raw === "string" || typeof raw === "number") {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  return null;
}

export interface MarkdownPostParseResult {
  contentJson: string;
  excerpt: string;
  publishedAt: string | null;
  tags: string[];
  title: string;
}

/**
 * Parse a markdown string and extract the title and body content.
 * Strips frontmatter first (using gray-matter), then converts the remaining
 * markdown to Portable Text. The first h1 block is used as the title when no
 * frontmatter title is present. Frontmatter fields title, tags, excerpt, and
 * date/published_at are extracted into the result.
 */
export function parseMarkdownForPost(
  markdown: string
): MarkdownPostParseResult {
  const { data: frontmatter, content: body } = matter(markdown);

  let allBlocks: InternalPortableTextBlock[] = [];
  try {
    const converted = convertFromMarkdown(body);
    allBlocks = converted as InternalPortableTextBlock[];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `Failed to convert Markdown to Portable Text: ${errorMessage}`
    );
    throw error;
  }

  let title =
    typeof frontmatter.title === "string" ? frontmatter.title.trim() : "";
  let titleBlockIndex = -1;

  if (!title) {
    for (let i = 0; i < allBlocks.length; i++) {
      const block = allBlocks[i];
      if (block._type === "block" && block.style === "h1") {
        title = extractBlockText(block);
        titleBlockIndex = i;
        break;
      }
    }
  }

  const bodyBlocks =
    titleBlockIndex >= 0
      ? [
          ...allBlocks.slice(0, titleBlockIndex),
          ...allBlocks.slice(titleBlockIndex + 1),
        ]
      : allBlocks;

  const portableText = bodyBlocks.map(transformBlock);

  const tags = parseTags(frontmatter.tags);
  const excerpt =
    typeof frontmatter.excerpt === "string" ? frontmatter.excerpt.trim() : "";
  const publishedAt =
    parsePublishedAt(frontmatter.published_at) ??
    parsePublishedAt(frontmatter.date);

  return {
    contentJson: JSON.stringify(portableText),
    excerpt,
    publishedAt,
    tags,
    title,
  };
}
