import { useCallback, useEffect, useRef, useState } from 'react';
import { generateQRCode, type GeneratedQR } from '../services/qrGenerator';
import type { LogoSettings, QRContent, QRStyleSettings } from '../types';

interface UseQRCodeParams {
  content: QRContent;
  style: QRStyleSettings;
  logo: LogoSettings;
}

interface UseQRCodeResult {
  qr: GeneratedQR | null;
  isGenerating: boolean;
  error: string | null;
  regenerate: () => Promise<GeneratedQR | null>;
}

export function useQRCode({ content, style, logo }: UseQRCodeParams): UseQRCodeResult {
  const [qr, setQr] = useState<GeneratedQR | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const regenerate = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setIsGenerating(true);
    setError(null);

    try {
      const generated = await generateQRCode({ content, style, logo });
      if (currentRequest !== requestId.current) return null;
      setQr(generated);
      return generated;
    } catch (err) {
      if (currentRequest !== requestId.current) return null;
      const message = err instanceof Error ? err.message : 'errors.generateFailed';
      setError(message);
      setQr(null);
      return null;
    } finally {
      if (currentRequest === requestId.current) {
        setIsGenerating(false);
      }
    }
  }, [content, style, logo]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void regenerate();
    }, 180);

    return () => window.clearTimeout(timer);
  }, [regenerate]);

  return { qr, isGenerating, error, regenerate };
}
