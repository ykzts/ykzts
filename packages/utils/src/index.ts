/**
 * @ykzts/utils
 *
 * Shared generic utility functions for the ykzts monorepo.
 *
 * Domain-specific utilities are exposed via subpath exports to keep
 * dependency footprints small:
 *
 *   import { buildCsp, SELF, NONE } from '@ykzts/utils/csp';
 *   import { getSecurityHeaders } from '@ykzts/utils/security-headers';
 *   import { getVisiblePages } from '@ykzts/utils/pagination';
 *   import { extractFirstParagraph, portableTextToMarkdown } from '@ykzts/utils/portable-text';
 *   import { verifyFediverseHandle } from '@ykzts/utils/fediverse';
 *
 * Add only truly generic, cross-cutting helpers directly to the main entry.
 */

// Intentionally left mostly empty for focus.
// Other helpers live at '@ykzts/utils/*' subpaths (csp, security-headers, pagination, portable-text, fediverse).
export {};
