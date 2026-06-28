import { describe, expect, it } from "vitest";
import { getBlogPostUrl, getPostUrl } from "./blog-urls";

const publishedPost = {
  slug: "my-post",
  published_at: "2024-02-15T10:30:00.000Z",
};

describe("getPostUrl", () => {
  it("should build a date-based path", () => {
    expect(getPostUrl(publishedPost)).toBe("/blog/2024/02/15/my-post");
  });

  it("should encode special characters in slug", () => {
    expect(
      getPostUrl({
        slug: "my awesome post",
        published_at: "2024-02-15T10:30:00.000Z",
      })
    ).toBe("/blog/2024/02/15/my%20awesome%20post");
  });

  it("should return a draft path when published_at is null", () => {
    expect(getPostUrl({ slug: "my-post", published_at: null })).toBe(
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
});

describe("getBlogPostUrl", () => {
  it("should generate correct URL for a valid post", () => {
    const url = getBlogPostUrl("my-awesome-post", "2024-02-15T10:30:00.000Z");
    expect(url).toBe("https://example.com/blog/2024/02/15/my-awesome-post");
  });

  it("should return null when publishedAt is null", () => {
    expect(getBlogPostUrl("my-post", null)).toBeNull();
  });

  it("should return null when slug is empty", () => {
    expect(getBlogPostUrl("", "2024-02-15T10:30:00.000Z")).toBeNull();
  });

  it("should encode special characters in slug", () => {
    const url = getBlogPostUrl("my awesome post", "2024-02-15T10:30:00.000Z");
    expect(url).toBe("https://example.com/blog/2024/02/15/my%20awesome%20post");
  });
});
