# TODO - Planned Future Tools

This document outlines planned tools from `packages/core/src/tools/index.ts` that need implementation.

## Planned Tools

### send_keys

**Purpose:** Send keyboard shortcuts to the page.

**Description:** Send keyboard shortcuts (e.g., Ctrl+C, Ctrl+V, Ctrl+T for new tab, etc.) to the current page. Should support modifier keys and key combinations.

**Implementation Notes:**

- Needs `sendKeys()` method in `PageController` (packages/page-controller/src/actions.ts)
- Should dispatch keyboard events to the active element or document
- Support common shortcuts: copy, paste, select all, new tab, close tab, etc.

---

### upload_file

**Purpose:** Upload files to file input elements.

**Description:** Upload a file to an input element with `type="file"`. Takes a file path and element index.

**Implementation Notes:**

- Needs `uploadFile()` method in `PageController`
- Should validate the element is a file input
- May need file path resolution or file picker dialog handling

---

### go_back

**Purpose:** Navigate back in browser history.

**Description:** Navigate to the previous page in browser history. Equivalent to clicking the browser's back button.

**Implementation Notes:**

- Needs `goBack()` method in `PageController`
- Should handle history popstate events
- May need to wait for page load after navigation

---

### extract_structured_data

**Purpose:** Parse and extract tables and structured data from the page.

**Description:** Extract structured data from tables, lists, or other structured HTML elements. Returns data in a structured format (JSON, CSV, etc.).

**Implementation Notes:**

- Needs `extractStructuredData()` method in `PageController`
- Referenced in tools/index.ts:152-154: "Tables need a dedicated parser to extract structured data. This tool is useless."
- Should handle `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` elements
- May support other structured formats (JSON-LD, CSV-like data, lists)

---

## Related TODOs in Code

From `packages/core/src/tools/index.ts:187-190`:

```typescript
// @todo send_keys
// @todo upload_file
// @todo go_back
// @todo extract_structured_data
```

From `packages/core/src/tools/index.ts:152-154`:

```typescript
/**
 * @todo Tables need a dedicated parser to extract structured data. This tool is useless.
 */
```

## Implementation Order Recommendation

1. **go_back** - Simplest to implement, basic browser navigation
2. **send_keys** - Keyboard shortcuts are commonly needed
3. **upload_file** - File uploads are a common web interaction
4. **extract_structured_data** - Most complex, requires DOM parsing logic
