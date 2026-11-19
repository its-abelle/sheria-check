import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { renderHook, act } from "@testing-library/react-native";
import { searchOffenses } from "../services/api";
import { useSearch } from "./useSearch";
import type { Offense } from "../types";
jest.mock("../services/api", (): object => ({ searchOffenses: jest.fn() }));
const mock = jest.mocked(searchOffenses);
const record = (id: string): Offense => ({
  id,
  name: id,
  aliases: [],
  category: "test",
  citation: "TEST ONLY",
  act: "TEST ONLY",
  section: "1",
  law_version: "2024",
  defining_provision_id: "1",
  penalty_provision_id: "2",
  defining_text: "TEST ONLY",
  penalty_text: "TEST ONLY",
  source_url: "https://new.kenyalaw.org/",
  penalty_source_url: "https://new.kenyalaw.org/",
  penalty_act: "TEST ONLY",
  penalty_section: "2",
  penalty_source_version: "2024",
  source_version: "2024",
  verified_at: "2024-01-01",
  updated_at: "2024-01-01",
});
beforeEach((): void => {
  jest.useFakeTimers();
  mock.mockReset();
  mock.mockResolvedValue({ data: [], nextCursor: null, total: 0 });
});
afterEach((): void => {
  jest.useRealTimers();
});
async function debounce(): Promise<void> {
  await act(async (): Promise<void> => {
    jest.advanceTimersByTime(250);
  });
}
describe("Online search", (): void => {
  it("debounces input, ignores stale results and cancels on unmount", async (): Promise<void> => {
    let resolveOld:
      ((value: Awaited<ReturnType<typeof searchOffenses>>) => void) | undefined;
    mock.mockImplementation(
      (query: string): ReturnType<typeof searchOffenses> =>
        query === "old"
          ? new Promise((resolve): void => {
              resolveOld = resolve;
            })
          : Promise.resolve({
              data: [record(query)],
              nextCursor: null,
              total: 1,
            }),
    );
    const { result, unmount } = renderHook(useSearch);
    act((): void => result.current.setQuery("old"));
    await debounce();
    const oldSignal = mock.mock.calls[0][3];
    act((): void => result.current.setQuery("new"));
    await debounce();
    expect(oldSignal?.aborted).toBe(true);
    await act(async (): Promise<void> => {
      resolveOld?.({ data: [record("old")], nextCursor: null, total: 1 });
    });
    expect(result.current.results[0].id).toBe("new");
    const latestSignal = mock.mock.calls[1][3];
    unmount();
    expect(latestSignal?.aborted).toBe(true);
  });
  it("appends pagination once and handles unchanged input without getting stuck", async (): Promise<void> => {
    mock
      .mockResolvedValueOnce({
        data: [record("first")],
        nextCursor: "20",
        total: 2,
      })
      .mockResolvedValueOnce({
        data: [record("second")],
        nextCursor: null,
        total: 2,
      });
    const { result } = renderHook(useSearch);
    await debounce();
    await act(async (): Promise<void> => {
      result.current.loadMore();
      result.current.loadMore();
    });
    expect(
      result.current.results.map((item: Offense): string => item.id),
    ).toEqual(["first", "second"]);
    expect(mock).toHaveBeenCalledTimes(2);
    expect(result.current.hasMore).toBe(false);
    act((): void => result.current.setQuery(""));
    expect(result.current.loading).toBe(false);
  });
});
