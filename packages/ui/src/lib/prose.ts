import type { ClassValue } from "clsx";
import { cn } from "./utils";

/**
 * Shared `@tailwindcss/typography` class names for Portable Text / rich text.
 * Keep editor preview and published content on the same scale and link/paragraph styles.
 */
export const proseContentClassName =
  "prose prose-theme prose-p:leading-relaxed prose-a:no-underline prose-a:hover:underline" as const;

/**
 * Compose prose content styles with layout / context classes via `cn` (tailwind-merge).
 * Prefer this over string concatenation so conflicting utilities resolve predictably.
 */
export function proseContent(...inputs: ClassValue[]) {
  return cn(proseContentClassName, ...inputs);
}
