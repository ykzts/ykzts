import { portableTextToHTML } from "@ykzts/utils/portable-text";
import { describe, expect, it } from "vitest";

describe("portableTextToHTML", () => {
  it("should convert simple PortableText to HTML", () => {
    const content = [
      {
        _type: "block",
        children: [{ _type: "span", text: "Hello, world!" }],
        style: "normal",
      },
    ];

    const result = portableTextToHTML(content);
    expect(result).toContain("Hello, world!");
    expect(result).toContain("<p>");
  });

  it("should return empty string for null content", () => {
    const result = portableTextToHTML(null);
    expect(result).toBe("");
  });

  it("should return empty string for undefined content", () => {
    const result = portableTextToHTML(undefined);
    expect(result).toBe("");
  });

  it("should handle heading blocks", () => {
    const content = [
      {
        _type: "block",
        children: [{ _type: "span", text: "A Heading" }],
        style: "h2",
      },
    ];

    const result = portableTextToHTML(content);
    expect(result).toContain("A Heading");
    expect(result).toContain("<h2>");
  });

  it("should handle multiple paragraphs", () => {
    const content = [
      {
        _type: "block",
        children: [{ _type: "span", text: "First paragraph" }],
        style: "normal",
      },
      {
        _type: "block",
        children: [{ _type: "span", text: "Second paragraph" }],
        style: "normal",
      },
    ];

    const result = portableTextToHTML(content);
    expect(result).toContain("First paragraph");
    expect(result).toContain("Second paragraph");
  });
});
