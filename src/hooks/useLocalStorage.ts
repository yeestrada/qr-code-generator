import { useEffect, useState } from 'react';
import { DEFAULT_STATE, STORAGE_KEY, type DesignerState } from '../types';

function loadState(): DesignerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw) as DesignerState;
    const style = { ...DEFAULT_STATE.style, ...parsed.style };
    if (style.backgroundOpacity === undefined) {
      style.backgroundOpacity = style.transparentBackground ? 0 : 1;
    }

    return {
      ...structuredClone(DEFAULT_STATE),
      ...parsed,
      content: { ...DEFAULT_STATE.content, ...parsed.content },
      style,
      logo: { ...DEFAULT_STATE.logo, ...parsed.logo },
      background: {
        ...DEFAULT_STATE.background,
        ...parsed.background,
        opacity: parsed.background?.opacity ?? 1,
      },
      transform: { ...DEFAULT_STATE.transform, ...parsed.transform },
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

export function useLocalStorageState() {
  const [state, setState] = useState<DesignerState>(() => loadState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Ignore quota errors for large images
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [state, hydrated]);

  return { state, setState, hydrated };
}
