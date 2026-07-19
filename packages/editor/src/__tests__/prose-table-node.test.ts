import {
  $createTableNodeWithDimensions,
  $isTableNode,
  TableCellNode,
  TableNode,
  TableRowNode,
} from "@lexical/table";
import { $getRoot, createEditor } from "lexical";
import { describe, expect, it } from "vitest";
import {
  $createProseTableNode,
  $isProseTableNode,
  ProseTableNode,
} from "../nodes/prose-table-node";

const THEAD_CONTAINS_TR = /<thead[^>]*>[\s\S]*<tr/;
const TBODY_CONTAINS_TR = /<tbody[^>]*>[\s\S]*<tr/;

function createTestEditor() {
  return createEditor({
    namespace: "ProseTableTest",
    nodes: [
      ProseTableNode,
      {
        replace: TableNode,
        with: () => $createProseTableNode(),
        withKlass: ProseTableNode,
      },
      TableCellNode,
      TableRowNode,
    ],
    onError: (error) => {
      throw error;
    },
  });
}

describe("ProseTableNode", () => {
  it("creates editor without hanging", () => {
    const editor = createTestEditor();
    expect(editor).toBeDefined();
  });

  it("replaces TableNode factories with ProseTableNode", () => {
    const editor = createTestEditor();
    editor.update(
      () => {
        const table = $createTableNodeWithDimensions(2, 2, {
          columns: false,
          rows: true,
        });
        expect($isTableNode(table)).toBe(true);
        expect($isProseTableNode(table)).toBe(true);
        $getRoot().clear();
        $getRoot().append(table);
      },
      { discrete: true }
    );
  });

  it("puts header row in thead and body rows in tbody", () => {
    const editor = createTestEditor();
    const container = document.createElement("div");
    document.body.appendChild(container);
    editor.setRootElement(container);

    editor.update(
      () => {
        // First row = th (header), remaining rows = td — same as insert UI
        const table = $createTableNodeWithDimensions(3, 2, {
          columns: false,
          rows: true,
        });
        $getRoot().clear();
        $getRoot().append(table);
      },
      { discrete: true }
    );

    const html = container.innerHTML;
    expect(html).toContain("<table");
    expect(html).toMatch(THEAD_CONTAINS_TR);
    expect(html).toMatch(TBODY_CONTAINS_TR);

    const table = container.querySelector("table");
    expect(table?.tHead?.rows).toHaveLength(1);
    expect(table?.tBodies[0]?.rows).toHaveLength(2);
    expect(
      [...(table?.tHead?.rows[0]?.cells ?? [])].every((c) => c.tagName === "TH")
    ).toBe(true);
    expect(
      [...(table?.tBodies[0]?.rows[0]?.cells ?? [])].every(
        (c) => c.tagName === "TD"
      )
    ).toBe(true);

    container.remove();
  });
});
