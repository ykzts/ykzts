import { createDraftPreviewToken } from "@ykzts/utils/draft-preview";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.stubEnv("DRAFT_SECRET", "test-draft-secret");

const mockEnable = vi.fn();
const mockDraftMode = vi.fn().mockResolvedValue({
  enable: mockEnable,
});

vi.mock("next/headers", () => ({
  draftMode: mockDraftMode,
}));

const mockSupabase = {
  from: vi.fn(),
};

vi.mock("@/lib/supabase/client", () => ({
  supabase: mockSupabase,
  supabaseAdmin: null,
}));

function createRequest(token: string) {
  return new NextRequest(
    `http://localhost:3000/api/blog/draft/${encodeURIComponent(token)}`,
    {
      method: "GET",
    }
  );
}

describe("GET /api/blog/draft/[token]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 for an invalid token", async () => {
    const { GET } = await import("../route");

    const response = await GET(createRequest("invalid-token"), {
      params: Promise.resolve({ token: "invalid-token" }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe("Invalid token");
    expect(mockDraftMode).not.toHaveBeenCalled();
  });

  it("should return 401 for malformed percent-encoding", async () => {
    const { GET } = await import("../route");

    const response = await GET(
      new NextRequest("http://localhost:3000/api/blog/draft/%FF", {
        method: "GET",
      }),
      {
        params: Promise.resolve({ token: "%FF" }),
      }
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe("Invalid token");
    expect(mockDraftMode).not.toHaveBeenCalled();
  });

  it("should return 401 for an expired token", async () => {
    const { GET } = await import("../route");
    const token = createDraftPreviewToken("test-post", "test-draft-secret", {
      now: 1_700_000_000,
      ttlSeconds: 1,
    });

    const response = await GET(createRequest(token), {
      params: Promise.resolve({ token }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe("Invalid token");
    expect(mockDraftMode).not.toHaveBeenCalled();
  });

  it("should enable draft mode and redirect to post with a valid token", async () => {
    const { GET } = await import("../route");
    const token = createDraftPreviewToken("test-post", "test-draft-secret", {
      now: Math.floor(Date.now() / 1000),
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        published_at: "2024-01-15T12:00:00Z",
        slug: "test-post",
      },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      eq: mockEq,
      maybeSingle: mockMaybeSingle,
      select: mockSelect,
    });

    const response = await GET(createRequest(token), {
      params: Promise.resolve({ token }),
    });

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/blog/draft/test-post"
    );
    expect(mockDraftMode).toHaveBeenCalled();
    expect(mockEnable).toHaveBeenCalled();
  });

  it("should not enable draft mode when the post is not found", async () => {
    const { GET } = await import("../route");
    const token = createDraftPreviewToken("missing-post", "test-draft-secret", {
      now: Math.floor(Date.now() / 1000),
    });

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      eq: mockEq,
      maybeSingle: mockMaybeSingle,
      select: mockSelect,
    });

    const response = await GET(createRequest(token), {
      params: Promise.resolve({ token }),
    });

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/blog");
    expect(mockDraftMode).not.toHaveBeenCalled();
    expect(mockEnable).not.toHaveBeenCalled();
  });
});
