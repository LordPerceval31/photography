"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

export const useMedia = (
  queries: string[],
  values: number[],
  defaultValue: number,
): number => {
  const [value, setValue] = useState<number>(defaultValue);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const get = () =>
      values[queries.findIndex((q) => window.matchMedia(q).matches)] ??
      defaultValue;
    const timeoutId = setTimeout(() => setValue(get()), 0);
    const handler = () => setValue(get());
    const matchers = queries.map((q) => window.matchMedia(q));
    matchers.forEach((m) => m.addEventListener("change", handler));
    return () => {
      clearTimeout(timeoutId);
      matchers.forEach((m) => m.removeEventListener("change", handler));
    };
  }, [queries, values, defaultValue]);
  return value;
};

export const useMeasure = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    if (!ref.current || typeof window === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
};
