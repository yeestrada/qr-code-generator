import { useCallback } from 'react';
import { Box, Stack, Typography, Alert } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Button from '@mui/material/Button';
import { DROPZONE_ACCEPT, processBackgroundImage } from '../services/imageProcessor';
import { useDesigner } from '../context/DesignerContext';
import { useTranslation } from '../context/LanguageContext';

export function BackgroundUploader() {
  const { state, updateBackground } = useDesigner();
  const { t } = useTranslation();

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      const processed = await processBackgroundImage(file);
      updateBackground({
        dataUrl: processed.dataUrl,
        width: processed.width,
        height: processed.height,
        fileName: processed.fileName,
        opacity: 1,
      });
    },
    [updateBackground],
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
        {t('background.title')}
      </Typography>

      <Box
        {...getRootProps()}
        sx={{
          border: '1.5px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          borderRadius: 2.5,
          p: 2.5,
          cursor: 'pointer',
          textAlign: 'center',
          bgcolor: isDragActive ? 'action.hover' : 'action.selected',
          transition: 'all 0.2s ease',
          '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadOutlinedIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
        <Typography variant="body2" fontWeight={600}>
          {isDragActive ? t('background.dropActive') : t('background.dropIdle')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('background.formats')}
        </Typography>
      </Box>

      {fileRejections.length > 0 && (
        <Alert severity="error">{t('background.invalidFile')}</Alert>
      )}

      {state.background.dataUrl && (
        <Stack spacing={1}>
          <Box
            component="img"
            src={state.background.dataUrl}
            alt="Background"
            sx={{
              width: '100%',
              height: 120,
              objectFit: 'cover',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {state.background.fileName} · {state.background.width}×{state.background.height}px
          </Typography>
          <Button
            size="small"
            color="inherit"
            startIcon={<DeleteOutlineIcon />}
            onClick={() =>
              updateBackground({
                dataUrl: null,
                width: 1080,
                height: 1080,
                fileName: null,
                opacity: 1,
              })
            }
          >
            {t('background.remove')}
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
