import QRCode from 'qrcode';
import type {
  ErrorCorrectionLevel,
  EyeStyle,
  LogoSettings,
  ModuleStyle,
  QRStyleSettings,
} from '../types';
import { buildQRPayload } from '../utils/canvasHelpers';
import type { QRContent } from '../types';

export interface GeneratedQR {
  dataUrl: string;
  canvas: HTMLCanvasElement;
  moduleCount: number;
  svg: string;
}

interface RenderOptions {
  content: QRContent;
  style: QRStyleSettings;
  logo?: LogoSettings;
}

function isFinderPattern(row: number, col: number, size: number): boolean {
  const inTopLeft = row < 7 && col < 7;
  const inTopRight = row < 7 && col >= size - 7;
  const inBottomLeft = row >= size - 7 && col < 7;
  return inTopLeft || inTopRight || inBottomLeft;
}

function drawRoundedRect(
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

function drawModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: ModuleStyle,
  cornerRadius: number,
): void {
  switch (style) {
    case 'dots': {
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size * 0.42, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'diamond': {
      ctx.beginPath();
      ctx.moveTo(x + size / 2, y + size * 0.08);
      ctx.lineTo(x + size * 0.92, y + size / 2);
      ctx.lineTo(x + size / 2, y + size * 0.92);
      ctx.lineTo(x + size * 0.08, y + size / 2);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'rounded': {
      drawRoundedRect(ctx, x, y, size, size, size * cornerRadius);
      ctx.fill();
      break;
    }
    case 'square':
    default: {
      ctx.fillRect(x, y, size, size);
      break;
    }
  }
}

function colorWithAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawEye(
  ctx: CanvasRenderingContext2D,
  originX: number,
  originY: number,
  moduleSize: number,
  style: EyeStyle,
  color: string,
  clearHole: boolean,
  holeColor: string,
): void {
  const outer = moduleSize * 7;
  const inner = moduleSize * 3;
  const ring = moduleSize;
  const centerOffset = moduleSize * 2;

  const punchHole = () => {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000';
    switch (style) {
      case 'circle': {
        ctx.beginPath();
        ctx.arc(originX + outer / 2, originY + outer / 2, outer / 2 - ring, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'leaf': {
        drawRoundedRect(
          ctx,
          originX + ring,
          originY + ring,
          outer - ring * 2,
          outer - ring * 2,
          moduleSize * 1.4,
        );
        ctx.fill();
        break;
      }
      case 'rounded': {
        drawRoundedRect(
          ctx,
          originX + ring,
          originY + ring,
          outer - ring * 2,
          outer - ring * 2,
          moduleSize,
        );
        ctx.fill();
        break;
      }
      default: {
        ctx.fillRect(originX + ring, originY + ring, outer - ring * 2, outer - ring * 2);
        break;
      }
    }
    ctx.restore();

    if (clearHole) return;

    ctx.fillStyle = holeColor;
    switch (style) {
      case 'circle': {
        ctx.beginPath();
        ctx.arc(originX + outer / 2, originY + outer / 2, outer / 2 - ring, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'leaf': {
        drawRoundedRect(
          ctx,
          originX + ring,
          originY + ring,
          outer - ring * 2,
          outer - ring * 2,
          moduleSize * 1.4,
        );
        ctx.fill();
        break;
      }
      case 'rounded': {
        drawRoundedRect(
          ctx,
          originX + ring,
          originY + ring,
          outer - ring * 2,
          outer - ring * 2,
          moduleSize,
        );
        ctx.fill();
        break;
      }
      default: {
        ctx.fillRect(originX + ring, originY + ring, outer - ring * 2, outer - ring * 2);
        break;
      }
    }
  };

  switch (style) {
    case 'circle': {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(originX + outer / 2, originY + outer / 2, outer / 2, 0, Math.PI * 2);
      ctx.fill();
      punchHole();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(originX + outer / 2, originY + outer / 2, inner / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'leaf': {
      ctx.fillStyle = color;
      drawRoundedRect(ctx, originX, originY, outer, outer, moduleSize * 2.2);
      ctx.fill();
      punchHole();
      ctx.fillStyle = color;
      drawRoundedRect(
        ctx,
        originX + centerOffset,
        originY + centerOffset,
        inner,
        inner,
        moduleSize * 1.1,
      );
      ctx.fill();
      break;
    }
    case 'rounded': {
      ctx.fillStyle = color;
      drawRoundedRect(ctx, originX, originY, outer, outer, moduleSize * 1.4);
      ctx.fill();
      punchHole();
      ctx.fillStyle = color;
      drawRoundedRect(
        ctx,
        originX + centerOffset,
        originY + centerOffset,
        inner,
        inner,
        moduleSize * 0.8,
      );
      ctx.fill();
      break;
    }
    case 'square':
    default: {
      ctx.fillStyle = color;
      ctx.fillRect(originX, originY, outer, outer);
      punchHole();
      ctx.fillStyle = color;
      ctx.fillRect(originX + centerOffset, originY + centerOffset, inner, inner);
      break;
    }
  }
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('errors.loadImageFailed'));
    img.src = src;
  });
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function generateQRCode(options: RenderOptions): Promise<GeneratedQR> {
  const { content, style, logo } = options;
  const payload = buildQRPayload(content);

  if (!payload) {
    throw new Error('errors.emptyQr');
  }

  const qr = QRCode.create(payload, {
    errorCorrectionLevel: style.errorCorrection as ErrorCorrectionLevel,
  });

  const modules = qr.modules;
  const moduleCount = modules.size;
  const quietZone = 2;
  const totalModules = moduleCount + quietZone * 2;
  const moduleSize = style.size / totalModules;
  const canvasSize = style.size;

  const canvas = document.createElement('canvas');
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('errors.exportCanvasFailed');
  }

  ctx.clearRect(0, 0, canvasSize, canvasSize);

  const backgroundOpacity = style.transparentBackground
    ? 0
    : Math.min(1, Math.max(0, style.backgroundOpacity ?? 1));

  if (backgroundOpacity > 0) {
    ctx.fillStyle = colorWithAlpha(style.backgroundColor, backgroundOpacity);
    if (style.cornerRadius > 0) {
      drawRoundedRect(ctx, 0, 0, canvasSize, canvasSize, canvasSize * 0.04);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, canvasSize, canvasSize);
    }
  }

  const moduleStyle: ModuleStyle = style.roundedModules ? 'rounded' : style.moduleStyle;
  const cornerRadius = style.cornerRadius;

  ctx.fillStyle = style.foregroundColor;

  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      if (!modules.get(row, col)) continue;
      if (isFinderPattern(row, col, moduleCount)) continue;

      const x = (col + quietZone) * moduleSize;
      const y = (row + quietZone) * moduleSize;
      drawModule(ctx, x, y, moduleSize, moduleStyle, cornerRadius);
    }
  }

  const eyes = [
    { row: 0, col: 0 },
    { row: 0, col: moduleCount - 7 },
    { row: moduleCount - 7, col: 0 },
  ];

  const clearEyeHoles = backgroundOpacity <= 0.001;
  const holeColor = colorWithAlpha(style.backgroundColor, backgroundOpacity);

  for (const eye of eyes) {
    const x = (eye.col + quietZone) * moduleSize;
    const y = (eye.row + quietZone) * moduleSize;
    drawEye(
      ctx,
      x,
      y,
      moduleSize,
      style.eyeStyle,
      style.foregroundColor,
      clearEyeHoles,
      holeColor,
    );
  }

  if (logo?.dataUrl) {
    const logoImg = await loadImage(logo.dataUrl);
    const logoSize = canvasSize * (logo.sizePercent / 100);
    const margin = logoSize * (logo.marginPercent / 100);
    const box = logoSize + margin * 2;
    const boxX = (canvasSize - box) / 2;
    const boxY = (canvasSize - box) / 2;

    // Safe margin behind logo stays readable even when QR fill is transparent
    ctx.fillStyle = colorWithAlpha(style.backgroundColor, Math.max(backgroundOpacity, 0.92));
    drawRoundedRect(ctx, boxX, boxY, box, box, box * 0.18);
    ctx.fill();

    const drawX = boxX + margin;
    const drawY = boxY + margin;
    ctx.save();
    drawRoundedRect(ctx, drawX, drawY, logoSize, logoSize, logoSize * 0.12);
    ctx.clip();
    ctx.drawImage(logoImg, drawX, drawY, logoSize, logoSize);
    ctx.restore();
  }

  const dataUrl = canvas.toDataURL('image/png');
  const svg = await generateQRSvg({ content, style, logo, moduleCount, modules });

  return { dataUrl, canvas, moduleCount, svg };
}

async function generateQRSvg(params: {
  content: QRContent;
  style: QRStyleSettings;
  logo?: LogoSettings;
  moduleCount: number;
  modules: { get: (row: number, col: number) => number | boolean; size: number };
}): Promise<string> {
  const { content, style, logo, moduleCount, modules } = params;
  const quietZone = 2;
  const totalModules = moduleCount + quietZone * 2;
  const moduleSize = style.size / totalModules;
  const size = style.size;
  const fg = escapeXml(style.foregroundColor);
  const bg = escapeXml(style.backgroundColor);
  const backgroundOpacity = style.transparentBackground
    ? 0
    : Math.min(1, Math.max(0, style.backgroundOpacity ?? 1));

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
  );

  if (backgroundOpacity > 0) {
    parts.push(
      `<rect width="100%" height="100%" fill="${bg}" fill-opacity="${backgroundOpacity}" rx="${size * 0.04}"/>`,
    );
  }

  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      if (!modules.get(row, col)) continue;
      if (isFinderPattern(row, col, moduleCount)) continue;
      const x = (col + quietZone) * moduleSize;
      const y = (row + quietZone) * moduleSize;
      const r = style.roundedModules || style.moduleStyle === 'rounded' ? moduleSize * style.cornerRadius : 0;

      if (style.moduleStyle === 'dots' && !style.roundedModules) {
        parts.push(
          `<circle cx="${x + moduleSize / 2}" cy="${y + moduleSize / 2}" r="${moduleSize * 0.42}" fill="${fg}"/>`,
        );
      } else {
        parts.push(
          `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" rx="${r}" fill="${fg}"/>`,
        );
      }
    }
  }

  const eyes = [
    { row: 0, col: 0 },
    { row: 0, col: moduleCount - 7 },
    { row: moduleCount - 7, col: 0 },
  ];

  for (const eye of eyes) {
    const x = (eye.col + quietZone) * moduleSize;
    const y = (eye.row + quietZone) * moduleSize;
    const outer = moduleSize * 7;
    const ring = moduleSize;
    const inner = moduleSize * 3;
    const rx = style.eyeStyle === 'square' ? 0 : moduleSize * 1.2;
    parts.push(`<rect x="${x}" y="${y}" width="${outer}" height="${outer}" rx="${rx}" fill="${fg}"/>`);
    if (backgroundOpacity > 0) {
      parts.push(
        `<rect x="${x + ring}" y="${y + ring}" width="${outer - ring * 2}" height="${outer - ring * 2}" rx="${rx * 0.7}" fill="${bg}" fill-opacity="${backgroundOpacity}"/>`,
      );
    } else {
      parts.push(
        `<rect x="${x + ring}" y="${y + ring}" width="${outer - ring * 2}" height="${outer - ring * 2}" rx="${rx * 0.7}" fill="#000" fill-opacity="0"/>`,
      );
    }
    parts.push(
      `<rect x="${x + moduleSize * 2}" y="${y + moduleSize * 2}" width="${inner}" height="${inner}" rx="${rx * 0.5}" fill="${fg}"/>`,
    );
  }

  if (logo?.dataUrl) {
    const logoSize = size * (logo.sizePercent / 100);
    const margin = logoSize * (logo.marginPercent / 100);
    const box = logoSize + margin * 2;
    const boxX = (size - box) / 2;
    const boxY = (size - box) / 2;
    parts.push(
      `<rect x="${boxX}" y="${boxY}" width="${box}" height="${box}" rx="${box * 0.18}" fill="${bg}" fill-opacity="${Math.max(backgroundOpacity, 0.92)}"/>`,
    );
    parts.push(
      `<image href="${logo.dataUrl}" x="${boxX + margin}" y="${boxY + margin}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid slice"/>`,
    );
  }

  parts.push(`<!-- payload: ${escapeXml(buildQRPayload(content))} -->`);
  parts.push('</svg>');
  return parts.join('');
}

export async function generatePlainQRDataUrl(
  text: string,
  size: number,
  errorCorrection: ErrorCorrectionLevel,
): Promise<string> {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 2,
    errorCorrectionLevel: errorCorrection,
    color: { dark: '#000000', light: '#ffffff' },
  });
}
