import {
  AppBar,
  Toolbar as MuiToolbar,
  Typography,
  IconButton,
  Button,
  Stack,
  Tooltip,
  Chip,
  Box,
  MenuItem,
  Select,
} from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { useDesigner } from '../context/DesignerContext';
import { useTranslation } from '../context/LanguageContext';
import { clamp } from '../utils/canvasHelpers';
import type { Locale } from '../lang';

export function Toolbar() {
  const {
    state,
    canUndo,
    canRedo,
    undo,
    redo,
    toggleDarkMode,
    centerQrOnCanvas,
    resetAll,
    setZoom,
    setExportOpen,
    validation,
  } = useDesigner();
  const { t, locale, setLocale, localeLabels } = useTranslation();

  return (
    <AppBar
      position="static"
      elevation={0}
      color="transparent"
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        backdropFilter: 'blur(12px)',
      }}
    >
      <MuiToolbar sx={{ gap: 1, minHeight: 64 }}>
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mr: 2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 55%, #f97316 140%)',
              color: '#fff',
            }}
          >
            <QrCode2Icon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" lineHeight={1.1}>
              {t('app.name')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('app.tagline')}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title={t('toolbar.undo')}>
            <span>
              <IconButton onClick={undo} disabled={!canUndo} size="small">
                <UndoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t('toolbar.redo')}>
            <span>
              <IconButton onClick={redo} disabled={!canRedo} size="small">
                <RedoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t('toolbar.center')}>
            <IconButton onClick={centerQrOnCanvas} size="small">
              <CenterFocusStrongIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('toolbar.reset')}>
            <IconButton onClick={resetAll} size="small">
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Box flex={1} />

        <Chip
          size="small"
          label={
            validation.isChecking
              ? t('toolbar.validating')
              : validation.isValid
                ? t('toolbar.readable')
                : t('toolbar.notReadable')
          }
          color={validation.isChecking ? 'default' : validation.isValid ? 'success' : 'error'}
          variant="outlined"
          sx={{ mr: 1, fontWeight: 600 }}
        />

        <Stack direction="row" spacing={0.5} alignItems="center">
          <IconButton
            size="small"
            onClick={() => setZoom(clamp(state.zoom - 0.1, 0.25, 2.5))}
          >
            <ZoomOutIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'center' }}>
            {Math.round(state.zoom * 100)}%
          </Typography>
          <IconButton
            size="small"
            onClick={() => setZoom(clamp(state.zoom + 0.1, 0.25, 2.5))}
          >
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Select
          size="small"
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          aria-label={t('toolbar.language')}
          sx={{ minWidth: 110, mr: 0.5 }}
        >
          {(Object.keys(localeLabels) as Locale[]).map((code) => (
            <MenuItem key={code} value={code}>
              {localeLabels[code]}
            </MenuItem>
          ))}
        </Select>

        <Tooltip title={state.darkMode ? t('toolbar.lightMode') : t('toolbar.darkMode')}>
          <IconButton onClick={toggleDarkMode} size="small">
            {state.darkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
          </IconButton>
        </Tooltip>

        <Button
          variant="contained"
          startIcon={<FileDownloadOutlinedIcon />}
          onClick={() => setExportOpen(true)}
          disabled={!validation.isValid}
        >
          {t('toolbar.export')}
        </Button>
      </MuiToolbar>
    </AppBar>
  );
}
