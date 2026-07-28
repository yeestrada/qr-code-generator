import { getCoverCrop, FRAME_QR_RATIO, FRAME_CORNER_RADIUS_RATIO } from '../utils/frameLayout';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type AcceptedImageType = (typeof ACCEPTED_IMAGE_TYPES)[number];

export function isAcceptedImageType(type: string): type is AcceptedImageType {
  return (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(type);
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('errors.readFileFailed'));
    };
    reader.onerror = () => reject(new Error('errors.readFileFailed'));
    reader.readAsDataURL(file);
  });
}

export function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('errors.invalidImage'));
    img.src = dataUrl;
  });
}

/** Keep original image for the free canvas editor. */
export async function processBackgroundImage(file: File): Promise<{
  dataUrl: string;
  width: number;
  height: number;
  fileName: string;
}> {
  if (!isAcceptedImageType(file.type)) {
    throw new Error('errors.unsupportedFormat');
  }

  const dataUrl = await fileToDataUrl(file);
  const image = await loadImageFromDataUrl(dataUrl);

  return {
    dataUrl,
    width: image.naturalWidth,
    height: image.naturalHeight,
    fileName: file.name,
  };
}

export async function processLogoImage(file: File): Promise<string> {
  if (!isAcceptedImageType(file.type)) {
    throw new Error('errors.unsupportedFormat');
  }

  const dataUrl = await fileToDataUrl(file);
  const image = await loadImageFromDataUrl(dataUrl);

  const maxSize = 512;
  const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.round(image.naturalWidth * scale);
  const height = Math.round(image.naturalHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('errors.processLogoFailed');

  ctx.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/png');
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
): void {
  const crop = getCoverCrop(image.naturalWidth || image.width, image.naturalHeight || image.height);
  ctx.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, dx, dy, dw, dh);
}

/**
 * Export matches the preview card:
 * square frame, rounded corners, cover background, QR centered at ~88%.
 */
export async function composePreviewLikeExport(options: {
  qrDataUrl: string;
  backgroundDataUrl: string | null;
  backgroundOpacity: number;
  frameSize?: number;
  scale?: number;
  transparentBackground?: boolean;
  qrAngle?: number;
}): Promise<HTMLCanvasElement> {
  const scale = options.scale ?? 1;
  const baseFrame = options.frameSize ?? 1080;
  const frameSize = Math.round(baseFrame * scale);
  const backgroundOpacity = Math.min(1, Math.max(0, options.backgroundOpacity));
  const angle = options.qrAngle ?? 0;
  const cornerRadius = frameSize * FRAME_CORNER_RADIUS_RATIO;

  const canvas = document.createElement('canvas');
  canvas.width = frameSize;
  canvas.height = frameSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('errors.exportCanvasFailed');

  ctx.clearRect(0, 0, frameSize, frameSize);
  drawRoundedRectPath(ctx, 0, 0, frameSize, frameSize, cornerRadius);
  ctx.clip();

  if (!options.transparentBackground) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, frameSize, frameSize);
  }

  if (options.backgroundDataUrl) {
    const bg = await loadImageFromDataUrl(options.backgroundDataUrl);
    ctx.save();
    ctx.globalAlpha = backgroundOpacity;
    drawImageCover(ctx, bg, 0, 0, frameSize, frameSize);
    ctx.restore();
  }

  const qr = await loadImageFromDataUrl(options.qrDataUrl);
  const qrSize = Math.round(frameSize * FRAME_QR_RATIO);
  const qrX = Math.round((frameSize - qrSize) / 2);
  const qrY = Math.round((frameSize - qrSize) / 2);

  ctx.save();
  if (angle !== 0) {
    ctx.translate(qrX + qrSize / 2, qrY + qrSize / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.drawImage(qr, -qrSize / 2, -qrSize / 2, qrSize, qrSize);
  } else {
    ctx.drawImage(qr, qrX, qrY, qrSize, qrSize);
  }
  ctx.restore();

  return canvas;
}

export async function composeExportCanvas(options: {
  backgroundDataUrl: string | null;
  backgroundWidth: number;
  backgroundHeight: number;
  backgroundOpacity?: number;
  qrDataUrl: string;
  qrX: number;
  qrY: number;
  qrWidth: number;
  qrHeight: number;
  qrOpacity: number;
  qrAngle: number;
  transparentBackground: boolean;
  scale?: number;
}): Promise<HTMLCanvasElement> {
  return composePreviewLikeExport({
    qrDataUrl: options.qrDataUrl,
    backgroundDataUrl: options.backgroundDataUrl,
    backgroundOpacity: options.backgroundOpacity ?? 1,
    frameSize: 1080,
    scale: options.scale,
    transparentBackground: options.transparentBackground,
    qrAngle: options.qrAngle,
  });
}

export const DROPZONE_ACCEPT = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
} as const;
