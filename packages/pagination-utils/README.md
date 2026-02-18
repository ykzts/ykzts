# @ykzts/pagination-utils

Shared pagination utilities for calculating visible page numbers in pagination components.

## Usage

```typescript
import { getVisiblePages } from '@ykzts/pagination-utils'

const { pages, showStartEllipsis, showEndEllipsis } = getVisiblePages(
  currentPage,
  totalPages
)
```
