import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { searchOffenses, fetchJSON, ApiError } from "./api";
const originalFetch = global.fetch;
beforeEach((): void => {
  global.fetch = jest.fn<typeof fetch>();
});
afterEach((): void => {
  global.fetch = originalFetch;
});
describe("Online API contract", (): void => {
  it("parses the server's array envelope and offset pagination", async (): Promise<void> => {
    jest
      .mocked(global.fetch)
      .mockResolvedValue({
        ok: true,
        json: async (): Promise<unknown> => ({
          data: [{ id: "fixture" }],
          pagination: { cursor: 20, has_more: true, total: 45 },
        }),
      } as Response);
    const result = await searchOffenses("test");
    expect(result.nextCursor).toBe("20");
    expect(result.total).toBe(45);
    expect(result.data[0].id).toBe("fixture");
  });
  it("rejects malformed successful responses", async (): Promise<void> => {
    jest
      .mocked(global.fetch)
      .mockResolvedValue({
        ok: true,
        json: async (): Promise<unknown> => ({ unexpected: [] }),
      } as Response);
    await expect(fetchJSON("/offenses")).rejects.toThrow("unexpected response");
  });
  it("gives a connection error and sends no credentials or persistent cache", async (): Promise<void> => {
    jest
      .mocked(global.fetch)
      .mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(fetchJSON("/legislation")).rejects.toThrow(
      "Check your internet connection",
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ cache: "no-store", credentials: "omit" }),
    );
  });
  it("handles unpublished records and rate limits", async (): Promise<void> => {
    jest
      .mocked(global.fetch)
      .mockResolvedValue({ ok: false, status: 404 } as Response);
    await expect(fetchJSON("/offenses/draft")).rejects.toBeInstanceOf(ApiError);
    jest
      .mocked(global.fetch)
      .mockResolvedValue({ ok: false, status: 429 } as Response);
    await expect(fetchJSON("/offenses")).rejects.toThrow("wait a minute");
  });
});
