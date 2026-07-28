import { Box, Paper, Stack, Typography, Chip, Divider, LinearProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import { useDesigner } from '../context/DesignerContext';
import { useTranslation } from '../context/LanguageContext';
import { QRPreview } from './QRPreview';
import { buildQRPayload } from '../utils/canvasHelpers';

export function InfoPanel() {
  const { state, validation, moduleCount, isGenerating } = useDesigner();
  const { t } = useTranslation();
  const payload = buildQRPayload(state.content);

  const validationError =
    validation.error && validation.error.startsWith('errors.')
      ? t(validation.error)
      : validation.error;

  return (
    <Stack spacing={2} sx={{ p: 2.5 }}>
      <QRPreview />

      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          {t('info.validationTitle')}
        </Typography>
        {validation.isChecking || isGenerating ? (
          <Stack spacing={1}>
            <Chip
              icon={<HourglassTopIcon />}
              label={t('info.checking')}
              size="small"
              variant="outlined"
            />
            <LinearProgress color="primary" />
          </Stack>
        ) : validation.isValid ? (
          <Chip
            icon={<CheckCircleOutlineIcon />}
            label={t('info.readable')}
            color="success"
            sx={{ fontWeight: 700 }}
          />
        ) : (
          <Chip
            icon={<HighlightOffIcon />}
            label={t('info.notReadable')}
            color="error"
            sx={{ fontWeight: 700 }}
          />
        )}

        {validation.decodedText && (
          <Typography variant="caption" color="text.secondary" display="block" mt={1.5}>
            {t('info.decoded', { text: validation.decodedText })}
          </Typography>
        )}
        {validationError && !validation.isValid && (
          <Typography variant="caption" color="error" display="block" mt={1}>
            {validationError}
          </Typography>
        )}
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          {t('info.liveTitle')}
        </Typography>
        <Stack spacing={1.25} divider={<Divider flexItem />}>
          <InfoRow
            label={t('info.imageSize')}
            value={`${state.background.width} × ${state.background.height}px`}
          />
          <InfoRow label={t('info.qrBaseSize')} value={`${state.style.size}px`} />
          <InfoRow
            label={t('info.canvasScale')}
            value={`${state.transform.scaleX.toFixed(2)}× (${Math.round(state.style.size * state.transform.scaleX)}px)`}
          />
          <InfoRow label={t('info.errorCorrection')} value={state.style.errorCorrection} />
          <InfoRow
            label={t('info.modules')}
            value={moduleCount ? `${moduleCount} × ${moduleCount}` : '—'}
          />
          <InfoRow
            label={t('info.imageTransparency')}
            value={
              state.background.dataUrl
                ? `${Math.round((1 - state.background.opacity) * 100)}%`
                : '—'
            }
          />
          <InfoRow
            label={t('info.fillOpacity')}
            value={`${Math.round(state.style.backgroundOpacity * 100)}%`}
          />
          <InfoRow
            label={t('info.rotation')}
            value={`${Math.round(state.transform.angle)}°`}
          />
          <InfoRow label={t('info.payload')} value={payload || '—'} />
        </Stack>
      </Paper>
    </Stack>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  );
}
