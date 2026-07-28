import { useCallback, useEffect, useRef, useState } from 'react';
import { validateCompositeCanvas, validateQRFromDataUrl } from '../services/qrValidator';
import type { ValidationResult } from '../types';

const INITIAL: ValidationResult = {
  isValid: false,
  isChecking: false,
  decodedText: null,
  error: null,
  lastCheckedAt: null,
};

export function useValidation() {
  const [validation, setValidation] = useState<ValidationResult>(INITIAL);
  const requestId = useRef(0);

  const validateDataUrl = useCallback(async (dataUrl: string | null) => {
    const current = ++requestId.current;

    if (!dataUrl) {
      setValidation({
        isValid: false,
        isChecking: false,
        decodedText: null,
        error: 'errors.noQrToValidate',
        lastCheckedAt: Date.now(),
      });
      return false;
    }

    setValidation((prev) => ({ ...prev, isChecking: true, error: null }));

    try {
      const result = await validateQRFromDataUrl(dataUrl);
      if (current !== requestId.current) return false;

      setValidation({
        ...result,
        isChecking: false,
        lastCheckedAt: Date.now(),
      });
      return result.isValid;
    } catch {
      if (current !== requestId.current) return false;
      setValidation({
        isValid: false,
        isChecking: false,
        decodedText: null,
        error: 'errors.validateFailed',
        lastCheckedAt: Date.now(),
      });
      return false;
    }
  }, []);

  const validateCanvas = useCallback(async (canvas: HTMLCanvasElement | null) => {
    const current = ++requestId.current;

    if (!canvas) {
      setValidation({
        isValid: false,
        isChecking: false,
        decodedText: null,
        error: 'errors.canvasUnavailable',
        lastCheckedAt: Date.now(),
      });
      return false;
    }

    setValidation((prev) => ({ ...prev, isChecking: true, error: null }));

    try {
      const result = await validateCompositeCanvas(canvas);
      if (current !== requestId.current) return false;

      setValidation({
        ...result,
        isChecking: false,
        lastCheckedAt: Date.now(),
      });
      return result.isValid;
    } catch {
      if (current !== requestId.current) return false;
      setValidation({
        isValid: false,
        isChecking: false,
        decodedText: null,
        error: 'errors.validateFailed',
        lastCheckedAt: Date.now(),
      });
      return false;
    }
  }, []);

  const resetValidation = useCallback(() => {
    requestId.current += 1;
    setValidation(INITIAL);
  }, []);

  useEffect(() => {
    return () => {
      requestId.current += 1;
    };
  }, []);

  return {
    validation,
    validateDataUrl,
    validateCanvas,
    resetValidation,
  };
}
