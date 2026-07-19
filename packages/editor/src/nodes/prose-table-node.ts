import {
  $isScrollableTablesActive,
  type SerializedTableNode,
  TableNode,
} from "@lexical/table";
import type {
  DOMExportOutput,
  EditorConfig,
  ElementDOMSlot,
  LexicalEditor,
  LexicalNode,
} from "lexical";
import {
  $getDocument,
  addClassNamesToElement,
  isHTMLElement,
  isHTMLTableRowElement,
  setDOMStyleFromCSS,
  setDOMUnmanaged,
} from "lexical";

const PATCHED = Symbol.for("ykzts.proseTable.removeChildPatched");

function isHTMLTableElement(node: unknown): node is HTMLTableElement {
  return isHTMLElement(node) && node.nodeName === "TABLE";
}

function getTableElementFromDOM(dom: HTMLElement): HTMLTableElement {
  if (isHTMLTableElement(dom)) {
    return dom;
  }
  const table = dom.querySelector("table");
  if (!isHTMLTableElement(table)) {
    throw new Error("ProseTableNode: expected a <table> in createDOM output");
  }
  return table;
}

function isHeaderRow(row: HTMLTableRowElement): boolean {
  const cells = [...row.cells];
  return cells.length > 0 && cells.every((cell) => cell.tagName === "TH");
}

/**
 * Ensure thead + tbody exist (published Portable Text shape).
 * Rows are placed by the DOM slot, not left as direct table children.
 */
function ensureTableSections(table: HTMLTableElement): {
  thead: HTMLTableSectionElement;
  tbody: HTMLTableSectionElement;
} {
  const thead = table.tHead ?? table.createTHead();
  const tbody = table.tBodies[0] ?? table.createTBody();
  return { tbody, thead };
}

/**
 * Lexical's $destroyNode only detaches when `dom.parentNode === slot.element`.
 * Rows live under thead/tbody, so teach <table> to remove descendants too.
 */
function patchTableRemoveChild(table: HTMLTableElement): void {
  const patched = table as HTMLTableElement & {
    [PATCHED]?: boolean;
  };
  if (patched[PATCHED]) {
    return;
  }
  patched[PATCHED] = true;
  const nativeRemoveChild = table.removeChild.bind(table);
  table.removeChild = ((child: Node) => {
    if (child.parentNode && child.parentNode !== table) {
      return child.parentNode.removeChild(child);
    }
    return nativeRemoveChild(child);
  }) as typeof table.removeChild;
}

function insertRowIntoSection(
  table: HTMLTableElement,
  row: HTMLTableRowElement,
  before: Node | null
): void {
  const { thead, tbody } = ensureTableSections(table);
  const section = isHeaderRow(row) ? thead : tbody;

  if (before && before.parentNode === section) {
    section.insertBefore(row, before);
    return;
  }

  if (before && isHTMLTableRowElement(before)) {
    if (section === tbody && thead.contains(before)) {
      // Body row inserted "before" a header-relative anchor → start of tbody
      tbody.insertBefore(row, tbody.firstChild);
      return;
    }
    if (section === thead && tbody.contains(before)) {
      thead.appendChild(row);
      return;
    }
  }

  section.appendChild(row);
}

/**
 * TableNode that matches published Portable Text HTML:
 * `table > thead? > tr` (all-th rows) + `table > tbody > tr` (body rows).
 *
 * Core Lexical mounts every row as `table > tr`, so typography's
 * `thead` / `tbody` selectors never fire. This node routes rows into sections
 * while editing (same structure as apps/blog portable-text tables).
 */
export class ProseTableNode extends TableNode {
  static override getType(): string {
    return "prose-table";
  }

  static override clone(node: ProseTableNode): ProseTableNode {
    return new ProseTableNode(node.__key);
  }

  static override importJSON(
    serializedNode: SerializedTableNode
  ): ProseTableNode {
    return new ProseTableNode().updateFromJSON(serializedNode);
  }

  override createDOM(
    config: EditorConfig,
    editor?: LexicalEditor
  ): HTMLElement {
    const tableElement = $getDocument().createElement("table");
    if (this.__style) {
      setDOMStyleFromCSS(tableElement.style, this.__style);
    }

    const colGroup = $getDocument().createElement("colgroup");
    tableElement.appendChild(colGroup);
    setDOMUnmanaged(colGroup);

    // Sections ready for row routing in getDOMSlot
    tableElement.appendChild($getDocument().createElement("thead"));
    tableElement.appendChild($getDocument().createElement("tbody"));

    addClassNamesToElement(tableElement, config.theme.table);
    this.updateTableElement(null, tableElement, config);
    patchTableRemoveChild(tableElement);

    if (editor && $isScrollableTablesActive(editor)) {
      const wrapperElement = $getDocument().createElement("div");
      const classes = config.theme.tableScrollableWrapper;
      if (classes) {
        addClassNamesToElement(wrapperElement, classes);
      } else {
        wrapperElement.style.overflowX = "auto";
      }
      wrapperElement.appendChild(tableElement);
      this.updateTableWrapper(null, wrapperElement, tableElement, config);
      return wrapperElement;
    }

    return tableElement;
  }

  override getDOMSlot(element: HTMLElement): ElementDOMSlot<HTMLTableElement> {
    const tableElement = getTableElementFromDOM(element);
    ensureTableSections(tableElement);
    patchTableRemoveChild(tableElement);

    const colgroup = tableElement.querySelector("colgroup");
    const slot = super
      .getDOMSlot(element)
      .withElement(tableElement)
      .withAfter(colgroup);

    // Route rows into thead (all-th) / tbody so structure matches published HTML.
    // ElementDOMSlot is not constructable from outside Lexical; patch the instance.
    const originalInsertChild = slot.insertChild.bind(slot);
    const originalReplaceChild = slot.replaceChild.bind(slot);

    slot.insertChild = (dom: Node) => {
      if (isHTMLTableRowElement(dom)) {
        insertRowIntoSection(tableElement, dom, slot.getInsertionAnchor());
        return slot;
      }
      return originalInsertChild(dom);
    };

    slot.removeChild = (dom: Node) => {
      if (dom.parentNode) {
        dom.parentNode.removeChild(dom);
        return slot;
      }
      return slot;
    };

    slot.replaceChild = (dom: Node, prevDom: Node) => {
      if (prevDom.parentNode) {
        prevDom.parentNode.replaceChild(dom, prevDom);
        if (isHTMLTableRowElement(dom)) {
          insertRowIntoSection(
            tableElement,
            dom,
            isHTMLTableRowElement(dom.nextSibling) ? dom.nextSibling : null
          );
        }
        return slot;
      }
      return originalReplaceChild(dom, prevDom);
    };

    slot.getFirstChild = () =>
      tableElement.tHead?.rows[0] ?? tableElement.tBodies[0]?.rows[0] ?? null;

    return slot;
  }

  override exportDOM(editor: LexicalEditor): DOMExportOutput {
    const output = super.exportDOM(editor);
    const { after, element } = output;

    return {
      after: (dom) => {
        const exported = after ? after(dom) : dom;
        let tableElement: HTMLElement | null = null;
        if (isHTMLTableElement(exported)) {
          tableElement = exported;
        } else if (isHTMLElement(exported)) {
          tableElement = exported.querySelector("table");
        }
        if (!isHTMLTableElement(tableElement)) {
          return null;
        }

        // Drop empty sections (header-only or body-only tables)
        const thead = tableElement.tHead;
        if (thead && thead.rows.length === 0) {
          thead.remove();
        }
        for (const tbody of [...tableElement.tBodies]) {
          if (tbody.rows.length === 0) {
            tbody.remove();
          }
        }
        return tableElement;
      },
      element,
    };
  }
}

export function $createProseTableNode(): ProseTableNode {
  return new ProseTableNode();
}

export function $isProseTableNode(
  node: LexicalNode | null | undefined
): node is ProseTableNode {
  return node instanceof ProseTableNode;
}
