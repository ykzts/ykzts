import { getImageDimensions } from "@ykzts/supabase/image-upload";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@ykzts/supabase/client", () => ({
  createBrowserClient: vi.fn(),
}));

let shouldLoadImage = true;

class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  width = 1920;
  height = 1080;
  set src(_: string) {
    if (shouldLoadImage) {
      this.onload?.();
    } else {
      this.onerror?.();
    }
  }
}

describe("getImageDimensions", () => {
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    shouldLoadImage = true;
    createObjectURLSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:http://localhost/test-object-url");
    revokeObjectURLSpy = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {
        /* no-op */
      });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves with width and height when image loads", async () => {
    vi.stubGlobal("Image", MockImage);

    const file = new File(["dummy"], "test.jpg", { type: "image/jpeg" });
    const result = await getImageDimensions(file);

    expect(result).toEqual({ height: 1080, width: 1920 });
    expect(createObjectURLSpy).toHaveBeenCalledWith(file);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith(
      "blob:http://localhost/test-object-url"
    );
  });

  it("rejects with error when image fails to load", async () => {
    shouldLoadImage = false;
    vi.stubGlobal("Image", MockImage);

    const file = new File(["dummy"], "bad.jpg", { type: "image/jpeg" });

    await expect(getImageDimensions(file)).rejects.toThrow(
      "Failed to load image for dimension extraction"
    );
    expect(revokeObjectURLSpy).toHaveBeenCalledWith(
      "blob:http://localhost/test-object-url"
    );
  });
});
