import { Box, Paper, Stack, Typography, CircularProgress } from '@mui/material';
import { useDesigner } from '../context/DesignerContext';
import { useTranslation } from '../context/LanguageContext';
import { FRAME_CORNER_RADIUS_RATIO, FRAME_PADDING_RATIO, FRAME_QR_RATIO } from '../utils/frameLayout';

export function QRPreview() {
  const { qrDataUrl, isGenerating, generationError, state } = useDesigner();
  const { t } = useTranslation();
  const hasBackgroundImage = Boolean(state.background.dataUrl);
  const showImageThroughQr = state.style.backgroundOpacity < 1;
  const paddingPercent = `${FRAME_PADDING_RATIO * 100}%`;
  const qrPercent = `${FRAME_QR_RATIO * 100}%`;

  const translatedError =
    generationError && generationError.startsWith('errors.')
      ? t(generationError)
      : generationError;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background:
          'linear-gradient(160deg, rgba(13,148,136,0.08), transparent 45%), linear-gradient(20deg, rgba(249,115,22,0.06), transparent 40%)',
      }}
    >
      <Typography variant="subtitle2" gutterBottom>
        {t('preview.title')}
      </Typography>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: `${FRAME_CORNER_RADIUS_RATIO * 100}%`,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: '#ffffff',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {!hasBackgroundImage && showImageThroughQr && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
            }}
          />
        )}

        {hasBackgroundImage && (
          <Box
            component="img"
            src={state.background.dataUrl!}
            alt=""
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: state.background.opacity,
              pointerEvents: 'none',
            }}
          />
        )}

        {!showImageThroughQr && !hasBackgroundImage && (
          <Box
            sx={{
              position: 'absolute',
              inset: paddingPercent,
              borderRadius: 2,
              bgcolor: state.style.backgroundColor,
            }}
          />
        )}

        {isGenerating && (
          <CircularProgress size={28} sx={{ position: 'relative', zIndex: 2 }} />
        )}

        {!isGenerating && qrDataUrl && (
          <Box
            component="img"
            src={qrDataUrl}
            alt="QR preview"
            sx={{
              position: 'relative',
              zIndex: 2,
              width: qrPercent,
              height: qrPercent,
              objectFit: 'contain',
              transform: state.transform.angle
                ? `rotate(${state.transform.angle}deg)`
                : undefined,
            }}
          />
        )}

        {!isGenerating && !qrDataUrl && (
          <Typography
            variant="caption"
            color="text.secondary"
            px={2}
            textAlign="center"
            sx={{ position: 'relative', zIndex: 2 }}
          >
            {translatedError ?? t('preview.empty')}
          </Typography>
        )}
      </Box>
      <Stack mt={1.5} spacing={0.5}>
        <Typography variant="caption" color="text.secondary">
          {t('preview.type', { type: state.content.type.toUpperCase() })}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {state.content.value || '—'}
        </Typography>
      </Stack>
    </Paper>
  );
}
