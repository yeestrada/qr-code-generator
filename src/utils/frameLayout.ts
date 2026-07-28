/** Shared proportions for preview card and export (not the free editor). */
export const FRAME_QR_RATIO = 0.88;
export const FRAME_PADDING_RATIO = (1 - FRAME_QR_RATIO) / 2;
export const FRAME_CORNER_RADIUS_RATIO = 0.055;

export interface SquareFrameLayout {
  frameSize: number;
  qrSize: number;
  padding: number;
  qrX: number;
  qrY: number;
  qrScale: number;
}

/** Center crop like CSS object-fit: cover into a square. */
export function getCoverCrop(
  sourceWidth: number,
  sourceHeight: number,
): { sx: number; sy: number; sw: number; sh: number; size: number } {
  const size = Math.min(sourceWidth, sourceHeight);
  return {
    sx: Math.round((sourceWidth - size) / 2),
    sy: Math.round((sourceHeight - size) / 2),
    sw: size,
    sh: size,
    size,
  };
}

/** Centered QR layout used by preview/export. */
export function getPreviewMatchedLayout(
  frameSize: number,
  qrBaseSize: number,
): SquareFrameLayout {
  const padding = Math.round(frameSize * FRAME_PADDING_RATIO);
  const qrSize = Math.round(frameSize * FRAME_QR_RATIO);
  const qrScale = qrSize / qrBaseSize;

  return {
    frameSize,
    qrSize,
    padding,
    qrX: padding,
    qrY: padding,
    qrScale,
  };
}
