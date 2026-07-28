import { BrowserQRCodeReader } from '@zxing/browser';
import type { ValidationResult } from '../types';

const reader = new BrowserQRCodeReader();

export async function validateQRFromCanvas(
  canvas: HTMLCanvasElement,
): Promise<Omit<ValidationResult, 'isChecking' | 'lastCheckedAt'>> {
  try {
    const result = reader.decodeFromCanvas(canvas);
    return {
      isValid: true,
      decodedText: result.getText(),
      error: null,
    };
  } catch {
    return {
      isValid: false,
      decodedText: null,
      error: 'errors.decodeFailed',
    };
  }
}

export async function validateQRFromDataUrl(
  dataUrl: string,
): Promise<Omit<ValidationResult, 'isChecking' | 'lastCheckedAt'>> {
  try {
    const result = await reader.decodeFromImageUrl(dataUrl);
    return {
      isValid: true,
      decodedText: result.getText(),
      error: null,
    };
  } catch {
    return {
      isValid: false,
      decodedText: null,
      error: 'errors.decodeFailed',
    };
  }
}

export async function validateCompositeCanvas(
  canvas: HTMLCanvasElement,
): Promise<Omit<ValidationResult, 'isChecking' | 'lastCheckedAt'>> {
  const primary = await validateQRFromCanvas(canvas);
  if (primary.isValid) return primary;

  // Retry with a high-contrast clone to improve scan reliability on busy backgrounds
  const clone = document.createElement('canvas');
  clone.width = canvas.width;
  clone.height = canvas.height;
  const ctx = clone.getContext('2d');
  if (!ctx) return primary;

  ctx.drawImage(canvas, 0, 0);
  const imageData = ctx.getImageData(0, 0, clone.width, clone.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const luminance = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    const value = luminance < 140 ? 0 : 255;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }

  ctx.putImageData(imageData, 0, 0);
  return validateQRFromCanvas(clone);
}
