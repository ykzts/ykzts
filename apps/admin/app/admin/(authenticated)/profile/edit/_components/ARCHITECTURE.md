# Lexical Portable Text Editor - Architecture

## Component Structure

```
ProfileForm (profile-form.tsx)
  └─> PortableTextEditor (portable-text-editor.tsx)
       ├─> LexicalComposer (Lexical core)
       │    ├─> ToolbarPlugin (toolbar-plugin.tsx)
       │    │    └─> Format buttons (Bold, Italic, Link)
       │    ├─> RichTextPlugin (editing area)
       │    ├─> LinkPlugin (link-plugin.tsx)
       │    ├─> HistoryPlugin (undo/redo)
       │    ├─> AutoFocusPlugin
       │    └─> EditorStatePlugin (state management)
       ├─> Hidden input (form submission)
       └─> Preview toggle (optional JSON display)
```

## Data Flow

### Initialization Flow
```
Portable Text JSON (from database)
  ↓
initializeEditorWithPortableText() (portable-text-serializer.ts)
  ↓
Lexical EditorState
  ↓
Visual Editor Display
```

### Editing Flow
```
User Input
  ↓
Lexical EditorState Update
  ↓
EditorStatePlugin.onChange()
  ↓
lexicalToPortableText() (portable-text-serializer.ts)
  ↓
Portable Text JSON
  ↓
Hidden Input Value (for form submission)
```

## Portable Text Format

The editor serializes content to Portable Text format, which is used by:
- Portfolio site (`apps/portfolio`) for rendering
- Database storage (profiles.about column, JSONB type)

### Example Transformations

**Plain Text:**
```
User input: "Hello world"
```
↓
```json
[{
  "_type": "block",
  "children": [{"_type": "span", "text": "Hello world"}],
  "markDefs": [],
  "style": "normal"
}]
```

**Formatted Text:**
```
User input: "Hello **bold** world"
```
↓
```json
[{
  "_type": "block",
  "children": [
    {"_type": "span", "text": "Hello "},
    {"_type": "span", "marks": ["strong"], "text": "bold"},
    {"_type": "span", "text": " world"}
  ],
  "markDefs": [],
  "style": "normal"
}]
```

**Link:**
```
User input: "[Click here](https://example.com)"
```
↓
```json
[{
  "_type": "block",
  "children": [
    {"_type": "span", "marks": ["link-abc123"], "text": "Click here"}
  ],
  "markDefs": [
    {"_key": "link-abc123", "_type": "link", "href": "https://example.com"}
  ],
  "style": "normal"
}]
```

## Supported Features

| Feature | Status | Implementation |
|---------|--------|----------------|
| Bold | ✅ | TextNode.setFormat(1) |
| Italic | ✅ | TextNode.setFormat(2) |
| Links | ✅ | LinkNode + markDefs |
| Undo/Redo | ✅ | HistoryPlugin |
| Preview | ✅ | JSON display |
| Lists | ❌ | Future enhancement |
| Headings | ❌ | Future enhancement |
| Code blocks | ❌ | Future enhancement |

## Files Overview

### portable-text-editor.tsx (Main Component)
- **Purpose**: Main editor component wrapper
- **Key Features**:
  - Lexical initialization with custom theme
  - Client-side only rendering (SSR safe)
  - Hidden input for form submission
  - Preview toggle
  - Integration with all plugins

### toolbar-plugin.tsx
- **Purpose**: Formatting toolbar
- **Features**:
  - Bold/Italic/Link buttons
  - Active state tracking
  - Keyboard shortcuts support
  - Accessible button labels

### link-plugin.tsx
- **Purpose**: Link validation and management
- **Features**:
  - URL validation
  - Link insertion/removal
  - Link editing

### portable-text-serializer.ts
- **Purpose**: Bidirectional conversion between Lexical and Portable Text
- **Key Functions**:
  - `lexicalToPortableText()`: Lexical EditorState → Portable Text JSON
  - `initializeEditorWithPortableText()`: Portable Text JSON → Lexical EditorState
- **Handles**:
  - Text formatting (bold, italic)
  - Links with markDefs
  - Empty content edge cases
  - Nested formatting

## Integration Points

### Profile Form
- **File**: `profile-form.tsx`
- **Integration**: Replaces `<textarea>` with `<PortableTextEditor>`
- **Form Submission**: Uses hidden input with name="about"

### Database
- **Table**: `profiles`
- **Column**: `about` (JSONB)
- **Format**: Portable Text array

### Portfolio Site
- **Component**: `apps/portfolio/app/_components/portable-text.tsx`
- **Rendering**: Uses `@portabletext/react` to render content
- **Styling**: Custom prose classes for rich display

## Testing Notes

To test the editor:
1. Set up Supabase environment variables
2. Navigate to `/admin/profile/edit`
3. The "自己紹介" (About) field now shows the rich text editor
4. Test formatting with toolbar buttons
5. Use preview to verify Portable Text output
6. Submit form to save to database
7. View on portfolio site to verify rendering

## Performance Considerations

- **Client-only rendering**: Editor only renders on client to avoid SSR hydration issues
- **Lazy loading**: Editor shows loading skeleton until client-side hydration
- **Optimized updates**: EditorState updates are batched for performance
- **Hidden input**: Minimal DOM manipulation for form submission
