export type QRContentType = 'url' | 'text' | 'email' | 'phone';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type ModuleStyle = 'square' | 'rounded' | 'dots' | 'diamond';

export type EyeStyle = 'square' | 'rounded' | 'circle' | 'leaf';

export type ExportFormat = 'png' | 'svg';

export interface QRContent {
  type: QRContentType;
  value: string;
}

export interface QRStyleSettings {
  size: number;
  foregroundColor: string;
  backgroundColor: string;
  /** Opacidad del relleno claro del QR (0 = se ve la imagen de fondo, 1 = relleno sólido). */
  backgroundOpacity: number;
  errorCorrection: ErrorCorrectionLevel;
  moduleStyle: ModuleStyle;
  eyeStyle: EyeStyle;
  cornerRadius: number;
  roundedModules: boolean;
  transparentBackground: boolean;
}

export interface LogoSettings {
  dataUrl: string | null;
  sizePercent: number;
  marginPercent: number;
}

export interface BackgroundSettings {
  dataUrl: string | null;
  width: number;
  height: number;
  fileName: string | null;
  /** Opacidad de la imagen de fondo (0 = invisible, 1 = opaca). */
  opacity: number;
}

export interface QRTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  angle: number;
}

export interface DesignerState {
  content: QRContent;
  style: QRStyleSettings;
  logo: LogoSettings;
  background: BackgroundSettings;
  transform: QRTransform;
  zoom: number;
  darkMode: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  isChecking: boolean;
  decodedText: string | null;
  error: string | null;
  lastCheckedAt: number | null;
}

export interface ExportOptions {
  format: ExportFormat;
  scale: number;
  transparentBackground: boolean;
  fileName: string;
}

export interface HistoryEntry {
  state: DesignerState;
  timestamp: number;
}

export const DEFAULT_STYLE: QRStyleSettings = {
  size: 280,
  foregroundColor: '#0f172a',
  backgroundColor: '#ffffff',
  backgroundOpacity: 1,
  errorCorrection: 'H',
  moduleStyle: 'rounded',
  eyeStyle: 'rounded',
  cornerRadius: 0.35,
  roundedModules: true,
  transparentBackground: false,
};

export const DEFAULT_LOGO: LogoSettings = {
  dataUrl: null,
  sizePercent: 22,
  marginPercent: 8,
};

export const DEFAULT_BACKGROUND: BackgroundSettings = {
  dataUrl: null,
  width: 1080,
  height: 1080,
  fileName: null,
  opacity: 1,
};

export const DEFAULT_TRANSFORM: QRTransform = {
  x: 400,
  y: 400,
  scaleX: 1,
  scaleY: 1,
  opacity: 1,
  angle: 0,
};

export const DEFAULT_CONTENT: QRContent = {
  type: 'url',
  value: 'https://example.com',
};

export const DEFAULT_STATE: DesignerState = {
  content: DEFAULT_CONTENT,
  style: DEFAULT_STYLE,
  logo: DEFAULT_LOGO,
  background: DEFAULT_BACKGROUND,
  transform: DEFAULT_TRANSFORM,
  zoom: 1,
  darkMode: false,
};

export const STORAGE_KEY = 'qr-designer-state-v3';
