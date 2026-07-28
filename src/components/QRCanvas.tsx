import { useCallback, useEffect, useState, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { useCanvas } from '../hooks/useCanvas';
import { useDesigner } from '../context/DesignerContext';
import { useTranslation } from '../context/LanguageContext';

export function QRCanvas() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const { t } = useTranslation();
  const {
    state,
    qrDataUrl,
    updateTransform,
    registerCenterHandler,
    registerExportCanvas,
  } = useDesigner();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const canvas = document.createElement('canvas');
    host.innerHTML = '';
    host.appendChild(canvas);
    canvasElRef.current = canvas;
    setCanvasReady(true);

    return () => {
      setCanvasReady(false);
      host.innerHTML = '';
      canvasElRef.current = null;
    };
  }, []);

  const handleTransformChange = useCallback(
    (partial: Parameters<typeof updateTransform>[0]) => {
      updateTransform(partial);
    },
    [updateTransform],
  );

  const { centerQr, exportCanvasElement } = useCanvas({
    containerRef: canvasElRef,
    background: state.background,
    qrDataUrl,
    transform: state.transform,
    styleSize: state.style.size,
    onTransformChange: handleTransformChange,
    enabled: canvasReady,
  });

  useEffect(() => {
    registerCenterHandler(centerQr);
    return () => registerCenterHandler(null);
  }, [centerQr, registerCenterHandler]);

  useEffect(() => {
    registerExportCanvas(exportCanvasElement);
    return () => registerExportCanvas(null);
  }, [exportCanvasElement, registerExportCanvas]);

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        position: 'relative',
        overflow: 'auto',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        p: { xs: 1.5, md: 3 },
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? `
              radial-gradient(circle at 20% 20%, rgba(13,148,136,0.12), transparent 28%),
              radial-gradient(circle at 80% 10%, rgba(249,115,22,0.1), transparent 24%),
              linear-gradient(180deg, #0b1220 0%, #111827 100%)
            `
            : `
              radial-gradient(circle at 15% 20%, rgba(13,148,136,0.1), transparent 30%),
              radial-gradient(circle at 85% 15%, rgba(249,115,22,0.08), transparent 26%),
              linear-gradient(180deg, #eef3f7 0%, #e2e8f0 100%)
            `,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          transform: `scale(${state.zoom})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 24px 60px rgba(0,0,0,0.45)'
              : '0 24px 60px rgba(15,23,42,0.12)',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: '#fff',
          lineHeight: 0,
          mb: 4,
        }}
      >
        <Box ref={hostRef} />
      </Box>

      {!state.background.dataUrl && (
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'rgba(15,23,42,0.72)',
            color: '#fff',
            px: 1.5,
            py: 0.75,
            borderRadius: 999,
            pointerEvents: 'none',
          }}
        >
          {t('canvas.hint')}
        </Typography>
      )}
    </Box>
  );
}
