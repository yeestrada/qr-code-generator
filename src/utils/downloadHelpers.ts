import { toPng, toSvg } from 'html-to-image';

export function downloadDataUrl(dataUrl: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, fileName);
  URL.revokeObjectURL(url);
}

export function downloadSvg(svgMarkup: string, fileName: string): void {
  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, fileName.endsWith('.svg') ? fileName : `${fileName}.svg`);
}

export function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  type: 'image/png' | 'image/jpeg' = 'image/png',
  quality = 1,
): string {
  return canvas.toDataURL(type, quality);
}

export function ensureFileExtension(name: string, extension: string): string {
  const normalized = extension.startsWith('.') ? extension : `.${extension}`;
  if (name.toLowerCase().endsWith(normalized)) return name;
  return `${name}${normalized}`;
}

export async function exportElementAsPng(
  element: HTMLElement,
  fileName: string,
  options?: { pixelRatio?: number; backgroundColor?: string | null },
): Promise<void> {
  const dataUrl = await toPng(element, {
    pixelRatio: options?.pixelRatio ?? 2,
    cacheBust: true,
    backgroundColor: options?.backgroundColor ?? undefined,
  });
  downloadDataUrl(dataUrl, ensureFileExtension(fileName, 'png'));
}

export async function exportElementAsSvg(element: HTMLElement, fileName: string): Promise<void> {
  const dataUrl = await toSvg(element, { cacheBust: true });
  downloadDataUrl(dataUrl, ensureFileExtension(fileName, 'svg'));
}
