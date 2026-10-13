"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/** Keep data visible during polling; never present failed reads as successful zeroes. */
export function useRemote<T>(
  load: () => Promise<T>,
  key: string,
  poll = false,
) {
  const [iteration, setIteration] = useState(0);
  const refreshVersion = useRef(0);
  const [state, setState] = useState<{
    key: string;
    data: T | null;
    loading: boolean;
    error: string | null;
    updatedAt: string | null;
    version: number;
  }>({
    key,
    data: null,
    loading: true,
    error: null,
    updatedAt: null,
    version: -1,
  });
  const refresh = useCallback(() => {
    const version = ++refreshVersion.current;
    setIteration(version);
    return version;
  }, []);
  useEffect(() => {
    let disposed = false;
    let pending = false;
    async function run() {
      if (pending || disposed) return;
      pending = true;
      setState((previous) =>
        previous.key === key
          ? { ...previous, loading: true }
          : {
              key,
              data: null,
              loading: true,
              error: null,
              updatedAt: null,
              version: -1,
            },
      );
      try {
        const data = await load();
        if (!disposed)
          setState({
            key,
            data,
            loading: false,
            error: null,
            updatedAt: new Date().toISOString(),
            version: iteration,
          });
      } catch (error) {
        if (!disposed)
          setState((previous) => ({
            ...previous,
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Data could not be loaded.",
          }));
      } finally {
        pending = false;
      }
    }
    void run();
    const timer = poll
      ? setInterval(() => {
          if (document.visibilityState === "visible") void run();
        }, 15000)
      : null;
    return () => {
      disposed = true;
      if (timer) clearInterval(timer);
    };
  }, [key, load, iteration, poll]);
  const current =
    state.key === key
      ? state
      : { data: null, loading: true, error: null, updatedAt: null, version: -1 };
  return {
    data: current.data,
    loading: current.loading,
    error: current.error,
    updatedAt: current.updatedAt,
    version: current.version,
    refresh,
  };
}
