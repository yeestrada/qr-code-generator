import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useQRCode } from '../hooks/useQRCode';
import { useValidation } from '../hooks/useValidation';
import { useLocalStorageState } from '../hooks/useLocalStorage';
import { composePreviewLikeExport } from '../services/imageProcessor';
import { downloadDataUrl, downloadSvg, ensureFileExtension } from '../utils/downloadHelpers';
import {
  DEFAULT_STATE,
  type DesignerState,
  type ExportOptions,
  type LogoSettings,
  type QRContent,
  type QRStyleSettings,
  type QRTransform,
  type BackgroundSettings,
} from '../types';

interface DesignerContextValue {
  state: DesignerState;
  qrDataUrl: string | null;
  qrSvg: string | null;
  moduleCount: number | null;
  isGenerating: boolean;
  generationError: string | null;
  validation: ReturnType<typeof useValidation>['validation'];
  canUndo: boolean;
  canRedo: boolean;
  exportOpen: boolean;
  setExportOpen: (open: boolean) => void;
  updateContent: (content: Partial<QRContent>) => void;
  updateStyle: (style: Partial<QRStyleSettings>) => void;
  updateLogo: (logo: Partial<LogoSettings>) => void;
  updateBackground: (background: Partial<BackgroundSettings>) => void;
  updateTransform: (transform: Partial<QRTransform>) => void;
  setZoom: (zoom: number) => void;
  toggleDarkMode: () => void;
  undo: () => void;
  redo: () => void;
  resetAll: () => void;
  centerQrOnCanvas: () => void;
  registerCenterHandler: (handler: (() => void) | null) => void;
  registerExportCanvas: (handler: (() => Promise<HTMLCanvasElement | null>) | null) => void;
  exportDesign: (options: ExportOptions) => Promise<void>;
  validateCurrentDesign: () => Promise<boolean>;
}

const DesignerContext = createContext<DesignerContextValue | null>(null);

function cloneState(state: DesignerState): DesignerState {
  return structuredClone(state);
}

export function DesignerProvider({ children }: { children: ReactNode }) {
  const { state, setState } = useLocalStorageState();
  const [history, setHistory] = useState<DesignerState[]>([cloneState(DEFAULT_STATE)]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const skipHistoryRef = useRef(false);
  const centerHandlerRef = useRef<(() => void) | null>(null);
  const exportCanvasRef = useRef<(() => Promise<HTMLCanvasElement | null>) | null>(null);
  const hydratedHistoryRef = useRef(false);

  const { qr, isGenerating, error: generationError } = useQRCode({
    content: state.content,
    style: state.style,
    logo: state.logo,
  });

  const { validation, validateDataUrl, validateCanvas } = useValidation();

  useEffect(() => {
    if (hydratedHistoryRef.current) return;
    hydratedHistoryRef.current = true;
    setHistory([cloneState(state)]);
    setHistoryIndex(0);
  }, [state]);

  const pushHistory = useCallback((next: DesignerState) => {
    if (skipHistoryRef.current) return;
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      const updated = [...trimmed, cloneState(next)].slice(-50);
      setHistoryIndex(updated.length - 1);
      return updated;
    });
  }, [historyIndex]);

  const commit = useCallback(
    (updater: (prev: DesignerState) => DesignerState) => {
      setState((prev) => {
        const next = updater(prev);
        pushHistory(next);
        return next;
      });
    },
    [pushHistory, setState],
  );

  const updateContent = useCallback(
    (content: Partial<QRContent>) => {
      commit((prev) => ({ ...prev, content: { ...prev.content, ...content } }));
    },
    [commit],
  );

  const updateStyle = useCallback(
    (style: Partial<QRStyleSettings>) => {
      commit((prev) => ({ ...prev, style: { ...prev.style, ...style } }));
    },
    [commit],
  );

  const updateLogo = useCallback(
    (logo: Partial<LogoSettings>) => {
      commit((prev) => ({ ...prev, logo: { ...prev.logo, ...logo } }));
    },
    [commit],
  );

  const updateBackground = useCallback(
    (background: Partial<BackgroundSettings>) => {
      commit((prev) => {
        const nextBackground = { ...prev.background, ...background };
        const hasImage = Boolean(nextBackground.dataUrl);

        const nextStyle =
          background.dataUrl !== undefined
            ? {
                ...prev.style,
                backgroundOpacity: hasImage ? 0 : 1,
                transparentBackground: hasImage,
              }
            : prev.style;

        let nextTransform = { ...prev.transform, opacity: 1 };

        // Editor: full image canvas; center QR without shrinking the artwork.
        if (background.dataUrl !== undefined || background.width !== undefined) {
          if (hasImage) {
            const width = nextBackground.width || 1080;
            const height = nextBackground.height || 1080;
            nextTransform = {
              ...nextTransform,
              x: Math.max(0, (width - prev.style.size) / 2),
              y: Math.max(0, (height - prev.style.size) / 2),
              scaleX: 1,
              scaleY: 1,
              angle: 0,
            };
          } else {
            nextTransform = {
              ...nextTransform,
              x: Math.max(0, (1080 - prev.style.size) / 2),
              y: Math.max(0, (1080 - prev.style.size) / 2),
              scaleX: 1,
              scaleY: 1,
              angle: 0,
            };
          }
        }

        return {
          ...prev,
          background: nextBackground,
          transform: nextTransform,
          style: nextStyle,
          zoom: background.dataUrl ? 1 : prev.zoom,
        };
      });
    },
    [commit],
  );

  const updateTransform = useCallback(
    (transform: Partial<QRTransform>) => {
      commit((prev) => ({ ...prev, transform: { ...prev.transform, ...transform } }));
    },
    [commit],
  );

  const setZoom = useCallback(
    (zoom: number) => {
      setState((prev) => ({ ...prev, zoom }));
    },
    [setState],
  );

  const toggleDarkMode = useCallback(() => {
    commit((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  }, [commit]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const nextIndex = historyIndex - 1;
    skipHistoryRef.current = true;
    setHistoryIndex(nextIndex);
    setState(cloneState(history[nextIndex]));
    queueMicrotask(() => {
      skipHistoryRef.current = false;
    });
  }, [history, historyIndex, setState]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    skipHistoryRef.current = true;
    setHistoryIndex(nextIndex);
    setState(cloneState(history[nextIndex]));
    queueMicrotask(() => {
      skipHistoryRef.current = false;
    });
  }, [history, historyIndex, setState]);

  const resetAll = useCallback(() => {
    const fresh = cloneState(DEFAULT_STATE);
    setState(fresh);
    setHistory([fresh]);
    setHistoryIndex(0);
  }, [setState]);

  const registerCenterHandler = useCallback((handler: (() => void) | null) => {
    centerHandlerRef.current = handler;
  }, []);

  const registerExportCanvas = useCallback(
    (handler: (() => Promise<HTMLCanvasElement | null>) | null) => {
      exportCanvasRef.current = handler;
    },
    [],
  );

  const centerQrOnCanvas = useCallback(() => {
    centerHandlerRef.current?.();
  }, []);

  const buildPreviewExport = useCallback(async (scale = 1, transparentBackground = false) => {
    if (!qr?.dataUrl) return null;

    return composePreviewLikeExport({
      qrDataUrl: qr.dataUrl,
      backgroundDataUrl: state.background.dataUrl,
      backgroundOpacity: state.background.dataUrl ? state.background.opacity : 0,
      frameSize: 1080,
      scale,
      transparentBackground,
      qrAngle: state.transform.angle,
    });
  }, [qr?.dataUrl, state.background.dataUrl, state.background.opacity, state.transform.angle]);

  const validateCurrentDesign = useCallback(async () => {
    const previewCanvas = await buildPreviewExport(1, false);
    if (previewCanvas) return validateCanvas(previewCanvas);
    return validateDataUrl(qr?.dataUrl ?? null);
  }, [buildPreviewExport, qr?.dataUrl, validateCanvas, validateDataUrl]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void validateCurrentDesign();
    }, 350);
    return () => window.clearTimeout(timer);
  }, [
    qr?.dataUrl,
    state.background.dataUrl,
    state.background.opacity,
    state.style,
    state.transform.angle,
    validateCurrentDesign,
  ]);

  const exportDesign = useCallback(
    async (options: ExportOptions) => {
      const isValid = await validateCurrentDesign();
      if (!isValid) {
        throw new Error('errors.notReadableExport');
      }

      if (options.format === 'svg' && qr?.svg && !state.background.dataUrl) {
        downloadSvg(qr.svg, ensureFileExtension(options.fileName, 'svg'));
        return;
      }

      const canvas = await buildPreviewExport(options.scale, options.transparentBackground);
      if (!canvas) {
        throw new Error('errors.nothingToExport');
      }

      if (options.format === 'svg') {
        const png = canvas.toDataURL('image/png');
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}"><image href="${png}" width="${canvas.width}" height="${canvas.height}"/></svg>`;
        downloadSvg(svg, ensureFileExtension(options.fileName, 'svg'));
        return;
      }

      downloadDataUrl(canvas.toDataURL('image/png'), ensureFileExtension(options.fileName, 'png'));
    },
    [buildPreviewExport, qr?.svg, state.background.dataUrl, validateCurrentDesign],
  );

  const value = useMemo<DesignerContextValue>(
    () => ({
      state,
      qrDataUrl: qr?.dataUrl ?? null,
      qrSvg: qr?.svg ?? null,
      moduleCount: qr?.moduleCount ?? null,
      isGenerating,
      generationError,
      validation,
      canUndo: historyIndex > 0,
      canRedo: historyIndex < history.length - 1,
      exportOpen,
      setExportOpen,
      updateContent,
      updateStyle,
      updateLogo,
      updateBackground,
      updateTransform,
      setZoom,
      toggleDarkMode,
      undo,
      redo,
      resetAll,
      centerQrOnCanvas,
      registerCenterHandler,
      registerExportCanvas,
      exportDesign,
      validateCurrentDesign,
    }),
    [
      state,
      qr?.dataUrl,
      qr?.svg,
      qr?.moduleCount,
      isGenerating,
      generationError,
      validation,
      historyIndex,
      history.length,
      exportOpen,
      updateContent,
      updateStyle,
      updateLogo,
      updateBackground,
      updateTransform,
      setZoom,
      toggleDarkMode,
      undo,
      redo,
      resetAll,
      centerQrOnCanvas,
      registerCenterHandler,
      registerExportCanvas,
      exportDesign,
      validateCurrentDesign,
    ],
  );

  return <DesignerContext.Provider value={value}>{children}</DesignerContext.Provider>;
}

export function useDesigner(): DesignerContextValue {
  const ctx = useContext(DesignerContext);
  if (!ctx) {
    throw new Error('errors.useDesignerOutside');
  }
  return ctx;
}
