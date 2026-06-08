import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveAttachment } from "../src/utils/resolveAttachment";
import { RESTManager, AttachmentBuilder, type CDNTag } from "../src";

describe("resolveAttachment", () => {
  let mockRest: RESTManager;
  const mockTag: CDNTag = "avatars";

  beforeEach(() => {
    mockRest = {
      uploadFile: vi.fn(),
    } as unknown as RESTManager;
  });

  it("should return the original string when a raw CDN ID is passed", async () => {
    const rawId = "123456789012345678";

    const result = await resolveAttachment(mockRest, rawId, mockTag);

    expect(result).toBe(rawId);
    expect(mockRest.uploadFile).not.toHaveBeenCalled();
  });

  it("should return null when null is passed", async () => {
    const result = await resolveAttachment(mockRest, null, mockTag);

    expect(result).toBeNull();
    expect(mockRest.uploadFile).not.toHaveBeenCalled();
  });

  it("should return undefined when undefined is passed", async () => {
    const result = await resolveAttachment(mockRest, undefined, mockTag);

    expect(result).toBeUndefined();
    expect(mockRest.uploadFile).not.toHaveBeenCalled();
  });

  it("should upload the file and return the ID when an AttachmentBuilder is passed", async () => {
    const expectedUploadedId = "uploaded_999888777";

    vi.mocked(mockRest.uploadFile).mockResolvedValue(expectedUploadedId);

    const dummyBuffer = Buffer.from("test file content");
    const builder = new AttachmentBuilder(dummyBuffer, "profile.png");

    const result = await resolveAttachment(mockRest, builder, mockTag);

    expect(mockRest.uploadFile).toHaveBeenCalledTimes(1);
    expect(mockRest.uploadFile).toHaveBeenCalledWith(mockTag, dummyBuffer, "profile.png");
    expect(result).toBe(expectedUploadedId);
  });
});
