# @ykzts/portable-text-utils

Shared utilities for working with PortableText content.

## Functions

### `extractFirstParagraph(content, maxLength?)`

Extracts the first paragraph from PortableText content and optionally truncates it.

**Parameters:**

- `content: PortableTextBlock[] | null | undefined` - PortableText content array
- `maxLength: number` (optional, default: 150) - Maximum length before truncation

**Returns:** `string` - Extracted text or empty string

**Example:**

```typescript
import { extractFirstParagraph } from '@ykzts/portable-text-utils'

const preview = extractFirstParagraph(post.content, 200)
```
