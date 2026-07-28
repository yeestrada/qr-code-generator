import type { QRContent, QRContentType } from '../types';

export function buildQRPayload(content: QRContent): string {
  const value = content.value.trim();

  switch (content.type) {
    case 'url':
      return normalizeUrl(value);
    case 'email':
      return value.startsWith('mailto:') ? value : `mailto:${value}`;
    case 'phone':
      return value.startsWith('tel:') ? value : `tel:${value.replace(/\s+/g, '')}`;
    case 'text':
    default:
      return value;
  }
}

export function normalizeUrl(value: string): string {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[\w.-]+\.[a-z]{2,}/i.test(value)) return `https://${value}`;
  return value;
}

export function getContentPlaceholder(type: QRContentType): string {
  switch (type) {
    case 'url':
      return 'https://your-site.com';
    case 'email':
      return 'hello@example.com';
    case 'phone':
      return '+1 555 000 0000';
    case 'text':
    default:
      return 'Enter your text here';
  }
}

export function getContentLabel(type: QRContentType): string {
  switch (type) {
    case 'url':
      return 'URL';
    case 'email':
      return 'Email';
    case 'phone':
      return 'Phone';
    case 'text':
    default:
      return 'Text';
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function snapToCenter(
  value: number,
  center: number,
  threshold = 8,
): { value: number; snapped: boolean } {
  if (Math.abs(value - center) <= threshold) {
    return { value: center, snapped: true };
  }
  return { value, snapped: false };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}
