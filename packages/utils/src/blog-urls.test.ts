import { describe, expect, it } from "vitest";
import { getPostUrl } from "./blog-urls.js";

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

  it("should return a full draft URL when published_at is null", () => {
    expect(
      getPostUrl(
        { slug: "my-post", published_at: null },
        { full: true, origin: "https://example.com" }
      )
    ).toBe("https://example.com/blog/draft/my-post");
  });

  it("should return null when slug is empty", () => {
    expect(
      getPostUrl({ slug: "", published_at: "2024-02-15T10:30:00.000Z" })
    ).toBeNull();
  });

  it("should return null when published_at is invalid", () => {
    expect(
      getPostUrl({ slug: "my-post", published_at: "invalid-date" })
    ).toBeNull();
  });
});
