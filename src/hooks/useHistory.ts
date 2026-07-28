import { useCallback, useRef, useState } from 'react';
import type { DesignerState, HistoryEntry } from '../types';

const MAX_HISTORY = 50;

export function useHistory(initialState: DesignerState) {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { state: structuredClone(initialState), timestamp: Date.now() },
  ]);
  const [index, setIndex] = useState(0);
  const isApplyingRef = useRef(false);

  const current = history[index]?.state ?? initialState;

  const push = useCallback((state: DesignerState) => {
    if (isApplyingRef.current) return;

    setHistory((prev) => {
      const trimmed = prev.slice(0, index + 1);
      const next = [
        ...trimmed,
        { state: structuredClone(state), timestamp: Date.now() },
      ].slice(-MAX_HISTORY);
      setIndex(next.length - 1);
      return next;
    });
  }, [index]);

  const undo = useCallback(() => {
    setIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setIndex((prev) => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  const canUndo = index > 0;
  const canRedo = index < history.length - 1;

  const withHistoryGuard = useCallback(<T,>(fn: () => T): T => {
    isApplyingRef.current = true;
    try {
      return fn();
    } finally {
      queueMicrotask(() => {
        isApplyingRef.current = false;
      });
    }
  }, []);

  return {
    current,
    push,
    undo,
    redo,
    canUndo,
    canRedo,
    withHistoryGuard,
    historyLength: history.length,
  };
}
