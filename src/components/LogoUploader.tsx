import { useCallback } from 'react';
import { Box, Stack, Typography, Slider, Button, Alert } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { DROPZONE_ACCEPT, processLogoImage } from '../services/imageProcessor';
import { useDesigner } from '../context/DesignerContext';
import { useTranslation } from '../context/LanguageContext';

export function LogoUploader() {
  const { state, updateLogo } = useDesigner();
  const { t } = useTranslation();

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      const dataUrl = await processLogoImage(file);
      updateLogo({ dataUrl });
    },
    [updateLogo],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: DROPZONE_ACCEPT,
    maxFiles: 1,
    multiple: false,
  });

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" color="text.secondary">
        {t('logo.title')}
      </Typography>

      <Box
        {...getRootProps()}
        sx={{
          border: '1.5px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          borderRadius: 2.5,
          p: 2,
          cursor: 'pointer',
          textAlign: 'center',
          bgcolor: isDragActive ? 'action.hover' : 'transparent',
        }}
      >
        <input {...getInputProps()} />
        <ImageOutlinedIcon color="primary" sx={{ mb: 0.5 }} />
        <Typography variant="body2" fontWeight={600}>
          {t('logo.upload')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('logo.hint')}
        </Typography>
      </Box>

      {fileRejections.length > 0 && <Alert severity="error">{t('logo.invalid')}</Alert>}

      {state.logo.dataUrl && (
        <Stack spacing={1.5} alignItems="center">
          <Box
            component="img"
            src={state.logo.dataUrl}
            alt="Logo"
            sx={{
              width: 72,
              height: 72,
              objectFit: 'contain',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              p: 1,
            }}
          />
          <Box width="100%">
            <Typography variant="caption">
              {t('logo.size', { value: state.logo.sizePercent })}
            </Typography>
            <Slider
              min={10}
              max={35}
              value={state.logo.sizePercent}
              onChange={(_, value) => updateLogo({ sizePercent: value as number })}
            />
          </Box>
          <Box width="100%">
            <Typography variant="caption">
              {t('logo.margin', { value: state.logo.marginPercent })}
            </Typography>
            <Slider
              min={0}
              max={20}
              value={state.logo.marginPercent}
              onChange={(_, value) => updateLogo({ marginPercent: value as number })}
            />
          </Box>
          <Button
            size="small"
            color="inherit"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => updateLogo({ dataUrl: null })}
          >
            {t('logo.remove')}
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
