import { describe, it, expect, afterEach, jest } from "@jest/globals";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useResource } from "./useResource";
const originalFetch = global.fetch;
afterEach((): void => {
  global.fetch = originalFetch;
});
describe("Online resource lifecycle", (): void => {
  it("retries a connection failure and displays the successful response", async (): Promise<void> => {
    const mock = jest
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockResolvedValue({
        ok: true,
        json: async (): Promise<unknown> => ({ data: ["source"] }),
      } as Response);
    global.fetch = mock;
    const { result } = renderHook(() => useResource<string[]>("/legislation"));
    await waitFor((): void => {
      expect(result.current.error).toContain("internet connection");
    });
    act((): void => result.current.retry());
    await waitFor((): void => {
      expect(result.current.data).toEqual(["source"]);
    });
  });
  it("cancels an old route and never presents its response as the new record", async (): Promise<void> => {
    let resolveOld: ((value: Response) => void) | undefined;
    global.fetch = jest
      .fn<typeof fetch>()
      .mockImplementationOnce(
        (): Promise<Response> =>
          new Promise((resolve): void => {
            resolveOld = resolve;
          }),
      )
      .mockResolvedValue({
        ok: true,
        json: async (): Promise<unknown> => ({ data: "new" }),
      } as Response);
    const { result, rerender, unmount } = renderHook(
      (path: string) => useResource<string>(path),
      { initialProps: "/old" },
    );
    rerender("/new");
    await waitFor((): void => {
      expect(result.current.data).toBe("new");
    });
    await act(async (): Promise<void> => {
      resolveOld?.({
        ok: true,
        json: async (): Promise<unknown> => ({ data: "old" }),
      } as Response);
    });
    expect(result.current.data).toBe("new");
    unmount();
  });
});
