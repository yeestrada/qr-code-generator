import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { Canvas, FabricImage, Line, Point, type FabricObject } from 'fabric';
import type { BackgroundSettings, QRTransform } from '../types';
import { snapToCenter } from '../utils/canvasHelpers';

const QR_OBJECT_NAME = 'qr-code';
const GUIDE_NAME = 'guide-line';

interface UseCanvasParams {
  containerRef: RefObject<HTMLCanvasElement | null>;
  background: BackgroundSettings;
  qrDataUrl: string | null;
  transform: QRTransform;
  styleSize: number;
  onTransformChange: (transform: Partial<QRTransform>) => void;
  onReady?: (canvas: Canvas) => void;
  enabled?: boolean;
}

export function useCanvas({
  containerRef,
  background,
  qrDataUrl,
  transform,
  styleSize,
  onTransformChange,
  onReady,
  enabled = true,
}: UseCanvasParams) {
  const fabricRef = useRef<Canvas | null>(null);
  const syncingRef = useRef(false);
  const transformRef = useRef(transform);
  const onTransformChangeRef = useRef(onTransformChange);
  const skipNextTransformSync = useRef(false);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  useEffect(() => {
    onTransformChangeRef.current = onTransformChange;
  }, [onTransformChange]);

  const clearGuides = useCallback((canvas: Canvas) => {
    const guides = canvas.getObjects().filter((obj) => obj.get('name') === GUIDE_NAME);
    guides.forEach((guide) => canvas.remove(guide));
  }, []);

  const drawGuides = useCallback(
    (canvas: Canvas, showVertical: boolean, showHorizontal: boolean) => {
      clearGuides(canvas);
      const width = canvas.getWidth();
      const height = canvas.getHeight();

      if (showVertical) {
        const line = new Line([width / 2, 0, width / 2, height], {
          stroke: '#14b8a6',
          strokeWidth: 1,
          selectable: false,
          evented: false,
          excludeFromExport: true,
        });
        line.set('name', GUIDE_NAME);
        canvas.add(line);
      }

      if (showHorizontal) {
        const line = new Line([0, height / 2, width, height / 2], {
          stroke: '#14b8a6',
          strokeWidth: 1,
          selectable: false,
          evented: false,
          excludeFromExport: true,
        });
        line.set('name', GUIDE_NAME);
        canvas.add(line);
      }
    },
    [clearGuides],
  );

  const getQrObject = useCallback((canvas: Canvas): FabricObject | undefined => {
    return canvas.getObjects().find((obj) => obj.get('name') === QR_OBJECT_NAME);
  }, []);

  useEffect(() => {
    if (!enabled || !containerRef.current || fabricRef.current) return;

    const canvas = new Canvas(containerRef.current, {
      selection: true,
      preserveObjectStacking: true,
      backgroundColor: '#e8edf2',
      stopContextMenu: true,
    });

    fabricRef.current = canvas;
    onReady?.(canvas);

    const handleObjectMoving = (event: { target?: FabricObject }) => {
      const target = event.target;
      if (!target || target.get('name') !== QR_OBJECT_NAME) return;

      const width = canvas.getWidth();
      const height = canvas.getHeight();
      const center = target.getCenterPoint();

      const snappedX = snapToCenter(center.x, width / 2);
      const snappedY = snapToCenter(center.y, height / 2);

      if (snappedX.snapped || snappedY.snapped) {
        target.setPositionByOrigin(
          new Point(snappedX.value, snappedY.value),
          'center',
          'center',
        );
        target.setCoords();
      }

      drawGuides(canvas, snappedX.snapped, snappedY.snapped);
    };

    const commitTransform = (target: FabricObject) => {
      if (syncingRef.current) return;
      clearGuides(canvas);
      skipNextTransformSync.current = true;

      const natural = target.width || 1;
      const baseScale = styleSize / natural;

      onTransformChangeRef.current({
        x: target.left ?? 0,
        y: target.top ?? 0,
        scaleX: (target.scaleX ?? 1) / baseScale,
        scaleY: (target.scaleY ?? 1) / baseScale,
        angle: target.angle ?? 0,
        opacity: 1,
      });
    };

    canvas.on('object:moving', handleObjectMoving);
    canvas.on('object:modified', (event) => {
      if (event.target) commitTransform(event.target);
    });
    canvas.on('mouse:up', () => clearGuides(canvas));

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [clearGuides, containerRef, drawGuides, enabled, onReady, styleSize]);

  // Full image at natural size — no crop, no viewport zoom.
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    let cancelled = false;

    const applyBackground = async () => {
      if (!background.dataUrl) {
        canvas.backgroundImage = undefined;
        canvas.backgroundColor = '#e8edf2';
        canvas.setDimensions({ width: 1080, height: 1080 });
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        canvas.requestRenderAll();
        return;
      }

      const image = await FabricImage.fromURL(background.dataUrl, { crossOrigin: 'anonymous' });
      if (cancelled) return;

      const width = image.width || background.width || 1080;
      const height = image.height || background.height || 1080;

      canvas.setDimensions({ width, height });
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

      image.set({
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'top',
        left: 0,
        top: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: background.opacity ?? 1,
      });

      canvas.backgroundColor = '#ffffff';
      canvas.backgroundImage = image;
      canvas.requestRenderAll();
    };

    void applyBackground();

    return () => {
      cancelled = true;
    };
  }, [background.dataUrl, background.width, background.height, background.opacity]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    let cancelled = false;

    const syncQr = async () => {
      const existing = getQrObject(canvas);

      if (!qrDataUrl) {
        if (existing) {
          canvas.remove(existing);
          canvas.requestRenderAll();
        }
        return;
      }

      const image = await FabricImage.fromURL(qrDataUrl, { crossOrigin: 'anonymous' });
      if (cancelled) return;

      const current = transformRef.current;
      const natural = image.width || styleSize;
      const baseScale = styleSize / natural;

      image.set({
        name: QR_OBJECT_NAME,
        left: current.x,
        top: current.y,
        scaleX: current.scaleX * baseScale,
        scaleY: current.scaleY * baseScale,
        angle: current.angle,
        opacity: 1,
        originX: 'left',
        originY: 'top',
        cornerColor: '#0d9488',
        cornerStyle: 'circle',
        borderColor: '#0d9488',
        transparentCorners: false,
        lockScalingFlip: true,
      });

      syncingRef.current = true;

      if (existing) {
        canvas.remove(existing);
      }

      canvas.add(image);
      canvas.setActiveObject(image);
      canvas.requestRenderAll();
      syncingRef.current = false;
    };

    void syncQr();

    return () => {
      cancelled = true;
    };
  }, [getQrObject, qrDataUrl, styleSize]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const qrObject = getQrObject(canvas);
    if (!qrObject) return;

    if (skipNextTransformSync.current) {
      skipNextTransformSync.current = false;
      return;
    }

    const natural = qrObject.width || styleSize;
    const baseScale = styleSize / natural;

    syncingRef.current = true;
    qrObject.set({
      left: transform.x,
      top: transform.y,
      scaleX: transform.scaleX * baseScale,
      scaleY: transform.scaleY * baseScale,
      angle: transform.angle,
      opacity: 1,
    });
    qrObject.setCoords();
    canvas.requestRenderAll();
    syncingRef.current = false;
  }, [
    getQrObject,
    styleSize,
    transform.angle,
    transform.scaleX,
    transform.scaleY,
    transform.x,
    transform.y,
  ]);

  const centerQr = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const qrObject = getQrObject(canvas);
    if (!qrObject) return;

    const center = new Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
    qrObject.setPositionByOrigin(center, 'center', 'center');
    qrObject.setCoords();
    canvas.requestRenderAll();
    skipNextTransformSync.current = true;

    const natural = qrObject.width || styleSize;
    const baseScale = styleSize / natural;

    onTransformChangeRef.current({
      x: qrObject.left ?? 0,
      y: qrObject.top ?? 0,
      scaleX: (qrObject.scaleX ?? 1) / baseScale,
      scaleY: (qrObject.scaleY ?? 1) / baseScale,
      angle: qrObject.angle ?? 0,
      opacity: 1,
    });
  }, [getQrObject, styleSize]);

  const exportCanvasElement = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    const canvas = fabricRef.current;
    if (!canvas) return null;

    clearGuides(canvas);
    const active = canvas.getActiveObject();
    canvas.discardActiveObject();
    canvas.requestRenderAll();

    const dataUrl = canvas.toDataURL({
      format: 'png',
      multiplier: 1,
      enableRetinaScaling: false,
    });

    if (active) {
      canvas.setActiveObject(active);
      canvas.requestRenderAll();
    }

    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const out = document.createElement('canvas');
        out.width = image.width;
        out.height = image.height;
        const ctx = out.getContext('2d');
        ctx?.drawImage(image, 0, 0);
        resolve(out);
      };
      image.onerror = () => resolve(null);
      image.src = dataUrl;
    });
  }, [clearGuides]);

  return {
    fabricCanvas: fabricRef,
    centerQr,
    exportCanvasElement,
    getQrObject,
  };
}
