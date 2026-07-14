import { describe, expect, it } from "vitest";
import { getPostUrl } from "./blog-urls.js";

const publishedPost = {
  published_at: "2024-02-15T10:30:00.000Z",
  slug: "my-post",
};

describe("getPostUrl", () => {
  it("should build a date-based path", () => {
    expect(getPostUrl(publishedPost)).toBe("/blog/2024/02/15/my-post");
  });

  it("should encode special characters in slug", () => {
    expect(
      getPostUrl({
        published_at: "2024-02-15T10:30:00.000Z",
        slug: "my awesome post",
      })
    ).toBe("/blog/2024/02/15/my%20awesome%20post");
  });

  it("should return a draft path when published_at is null", () => {
    expect(getPostUrl({ published_at: null, slug: "my-post" })).toBe(
      "/blog/draft/my-post"
    );
  });

  it("should append .md when markdown is true", () => {
    expect(getPostUrl(publishedPost, { markdown: true })).toBe(
      "/blog/2024/02/15/my-post.md"
    );
  });

  it("should return an absolute URL when full is true", () => {
    expect(
      getPostUrl(publishedPost, {
        full: true,
        origin: "https://example.com",
      })
    ).toBe("https://example.com/blog/2024/02/15/my-post");
  });

  it("should return an absolute markdown URL when full and markdown are true", () => {
    expect(
      getPostUrl(publishedPost, {
        full: true,
        markdown: true,
        origin: "https://example.com",
      })
    ).toBe("https://example.com/blog/2024/02/15/my-post.md");
  });

  it("should throw when full is true without origin", () => {
    expect(() => getPostUrl(publishedPost, { full: true })).toThrow(
      "origin is required when full is true"
    );
  });

  it("should return a full draft URL when published_at is null", () => {
    expect(
      getPostUrl(
        { published_at: null, slug: "my-post" },
        { full: true, origin: "https://example.com" }
      )
    ).toBe("https://example.com/blog/draft/my-post");
  });

  it("should return null when slug is empty", () => {
    expect(
      getPostUrl({ published_at: "2024-02-15T10:30:00.000Z", slug: "" })
    ).toBeNull();
  });

  it("should return null when published_at is invalid", () => {
    expect(
      getPostUrl({ published_at: "invalid-date", slug: "my-post" })
    ).toBeNull();
  });
});
