import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Typography,
  Slider,
} from '@mui/material';
import { useDesigner } from '../context/DesignerContext';
import { useTranslation } from '../context/LanguageContext';
import type { ExportFormat } from '../types';

export function ExportDialog() {
  const { exportOpen, setExportOpen, exportDesign, validation } = useDesigner();
  const { t } = useTranslation();
  const [format, setFormat] = useState<ExportFormat>('png');
  const [scale, setScale] = useState(2);
  const [transparentBackground, setTransparentBackground] = useState(false);
  const [fileName, setFileName] = useState('qr-designer');
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setError(null);
    setExporting(true);
    try {
      await exportDesign({
        format,
        scale,
        transparentBackground,
        fileName: fileName.trim() || 'qr-designer',
      });
      setExportOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'errors.generateFailed';
      setError(message.startsWith('errors.') ? t(message) : message || t('export.error'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={exportOpen} onClose={() => setExportOpen(false)} fullWidth maxWidth="xs">
      <DialogTitle>{t('export.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {!validation.isValid && (
            <Alert severity="error">{t('export.notReadable')}</Alert>
          )}

          <TextField
            label={t('export.fileName')}
            size="small"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            fullWidth
          />

          <TextField
            select
            label={t('export.format')}
            size="small"
            value={format}
            onChange={(e) => setFormat(e.target.value as ExportFormat)}
            fullWidth
          >
            <MenuItem value="png">PNG</MenuItem>
            <MenuItem value="svg">SVG</MenuItem>
          </TextField>

          <Stack>
            <Typography variant="caption">
              {t('export.highRes', { scale, percent: Math.round(scale * 100) })}
            </Typography>
            <Slider
              min={1}
              max={4}
              step={1}
              marks
              value={scale}
              onChange={(_, value) => setScale(value as number)}
              valueLabelDisplay="auto"
            />
          </Stack>

          <FormControlLabel
            control={
              <Switch
                checked={transparentBackground}
                onChange={(e) => setTransparentBackground(e.target.checked)}
              />
            }
            label={t('export.transparent')}
          />

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => setExportOpen(false)} color="inherit">
          {t('export.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleExport()}
          disabled={!validation.isValid || exporting}
        >
          {exporting ? t('export.exporting') : t('export.download')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
