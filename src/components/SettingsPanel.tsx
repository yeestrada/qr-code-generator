import type { ChangeEvent, ReactNode } from 'react';
import {
  Box,
  Stack,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import { useDesigner } from '../context/DesignerContext';
import { useTranslation } from '../context/LanguageContext';
import type { EyeStyle, ModuleStyle, QRContentType } from '../types';
import { BackgroundUploader } from './BackgroundUploader';
import { LogoUploader } from './LogoUploader';

export function SettingsPanel() {
  const { state, updateContent, updateStyle, updateTransform, updateBackground } = useDesigner();
  const { t } = useTranslation();

  const contentTypes: { value: QRContentType; icon: ReactNode; label: string }[] = [
    { value: 'url', icon: <LinkIcon fontSize="small" />, label: t('content.url') },
    { value: 'text', icon: <TextFieldsIcon fontSize="small" />, label: t('content.text') },
    { value: 'email', icon: <EmailOutlinedIcon fontSize="small" />, label: t('content.email') },
    { value: 'phone', icon: <PhoneOutlinedIcon fontSize="small" />, label: t('content.phoneShort') },
  ];

  const contentLabelKey: Record<QRContentType, string> = {
    url: 'content.url',
    text: 'content.text',
    email: 'content.email',
    phone: 'content.phone',
  };

  const placeholderKey: Record<QRContentType, string> = {
    url: 'content.placeholders.url',
    text: 'content.placeholders.text',
    email: 'content.placeholders.email',
    phone: 'content.placeholders.phone',
  };

  return (
    <Stack spacing={3} sx={{ p: 2.5, pb: 4 }}>
      <Box>
        <Typography variant="overline" color="text.secondary" letterSpacing={1.2}>
          {t('content.section')}
        </Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={state.content.type}
          onChange={(_, value: QRContentType | null) => {
            if (value) updateContent({ type: value });
          }}
          sx={{ mt: 1, mb: 1.5 }}
        >
          {contentTypes.map((item) => (
            <ToggleButton key={item.value} value={item.value} sx={{ px: 1 }}>
              <Stack alignItems="center" spacing={0.25}>
                {item.icon}
                <Typography variant="caption">{item.label}</Typography>
              </Stack>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <TextField
          fullWidth
          size="small"
          label={t(contentLabelKey[state.content.type])}
          placeholder={t(placeholderKey[state.content.type])}
          value={state.content.value}
          onChange={(e) => updateContent({ value: e.target.value })}
          multiline={state.content.type === 'text'}
          minRows={state.content.type === 'text' ? 3 : 1}
        />
      </Box>

      <Divider />
      <BackgroundUploader />

      <Divider />
      <Box>
        <Typography variant="overline" color="text.secondary" letterSpacing={1.2}>
          {t('qrSettings.section')}
        </Typography>
        <Stack spacing={2} mt={1}>
          <Box>
            <Typography variant="caption">
              {t('qrSettings.size', { size: state.style.size })}
            </Typography>
            <Slider
              min={120}
              max={640}
              step={10}
              value={state.style.size}
              onChange={(_, value) => updateStyle({ size: value as number })}
            />
          </Box>
          <TextField
            select
            size="small"
            label={t('qrSettings.errorCorrection')}
            value={state.style.errorCorrection}
            onChange={(e) =>
              updateStyle({
                errorCorrection: e.target.value as typeof state.style.errorCorrection,
              })
            }
          >
            <MenuItem value="L">{t('qrSettings.errorL')}</MenuItem>
            <MenuItem value="M">{t('qrSettings.errorM')}</MenuItem>
            <MenuItem value="Q">{t('qrSettings.errorQ')}</MenuItem>
            <MenuItem value="H">{t('qrSettings.errorH')}</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label={t('qrSettings.moduleStyle')}
            value={state.style.moduleStyle}
            onChange={(e) => updateStyle({ moduleStyle: e.target.value as ModuleStyle })}
          >
            <MenuItem value="square">{t('qrSettings.moduleSquare')}</MenuItem>
            <MenuItem value="rounded">{t('qrSettings.moduleRounded')}</MenuItem>
            <MenuItem value="dots">{t('qrSettings.moduleDots')}</MenuItem>
            <MenuItem value="diamond">{t('qrSettings.moduleDiamond')}</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label={t('qrSettings.eyeStyle')}
            value={state.style.eyeStyle}
            onChange={(e) => updateStyle({ eyeStyle: e.target.value as EyeStyle })}
          >
            <MenuItem value="square">{t('qrSettings.eyeSquare')}</MenuItem>
            <MenuItem value="rounded">{t('qrSettings.eyeRounded')}</MenuItem>
            <MenuItem value="circle">{t('qrSettings.eyeCircle')}</MenuItem>
            <MenuItem value="leaf">{t('qrSettings.eyeLeaf')}</MenuItem>
          </TextField>
          <FormControlLabel
            control={
              <Switch
                checked={state.style.roundedModules}
                onChange={(e) => updateStyle({ roundedModules: e.target.checked })}
              />
            }
            label={t('qrSettings.roundedModules')}
          />
          <Box>
            <Typography variant="caption">
              {t('qrSettings.cornerRadius', {
                value: Math.round(state.style.cornerRadius * 100),
              })}
            </Typography>
            <Slider
              min={0}
              max={0.5}
              step={0.05}
              value={state.style.cornerRadius}
              onChange={(_, value) => updateStyle({ cornerRadius: value as number })}
            />
          </Box>
        </Stack>
      </Box>

      <Divider />
      <LogoUploader />

      <Divider />
      <Box>
        <Typography variant="overline" color="text.secondary" letterSpacing={1.2}>
          {t('colors.section')}
        </Typography>
        <Stack direction="row" spacing={2} mt={1.5}>
          <Stack spacing={0.5} flex={1}>
            <Typography variant="caption">{t('colors.foreground')}</Typography>
            <Box
              component="input"
              type="color"
              value={state.style.foregroundColor}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateStyle({ foregroundColor: e.target.value })
              }
              sx={{
                width: '100%',
                height: 40,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                p: 0.5,
                bgcolor: 'transparent',
                cursor: 'pointer',
              }}
            />
          </Stack>
          <Stack spacing={0.5} flex={1}>
            <Typography variant="caption">{t('colors.fill')}</Typography>
            <Box
              component="input"
              type="color"
              value={state.style.backgroundColor}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                updateStyle({ backgroundColor: e.target.value })
              }
              sx={{
                width: '100%',
                height: 40,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                p: 0.5,
                bgcolor: 'transparent',
                cursor: 'pointer',
              }}
            />
          </Stack>
        </Stack>
        <Box mt={2}>
          <Typography variant="caption">
            {t('colors.fillOpacity', {
              value: Math.round(state.style.backgroundOpacity * 100),
            })}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
            {state.background.dataUrl
              ? t('colors.fillHintWithImage')
              : t('colors.fillHintNoImage')}
          </Typography>
          <Slider
            min={0}
            max={1}
            step={0.05}
            value={state.style.backgroundOpacity}
            onChange={(_, value) => {
              const backgroundOpacity = value as number;
              updateStyle({
                backgroundOpacity,
                transparentBackground: backgroundOpacity <= 0.001,
              });
            }}
          />
        </Box>
      </Box>

      <Divider />
      <Box>
        <Typography variant="overline" color="text.secondary" letterSpacing={1.2}>
          {t('designer.section')}
        </Typography>
        <Stack spacing={2} mt={1}>
          <Box>
            <Typography variant="caption">
              {t('designer.imageTransparency', {
                value: Math.round((1 - state.background.opacity) * 100),
              })}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              {t('designer.imageTransparencyHint')}
            </Typography>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={1 - state.background.opacity}
              disabled={!state.background.dataUrl}
              onChange={(_, value) => {
                const transparency = value as number;
                updateBackground({ opacity: 1 - transparency });
              }}
            />
          </Box>
          <Box>
            <Typography variant="caption">
              {t('designer.rotation', { value: Math.round(state.transform.angle) })}
            </Typography>
            <Slider
              min={-45}
              max={45}
              step={1}
              value={state.transform.angle}
              onChange={(_, value) => updateTransform({ angle: value as number })}
            />
          </Box>
          <Box>
            <Typography variant="caption">
              {t('designer.scale', { value: state.transform.scaleX.toFixed(2) })}
            </Typography>
            <Slider
              min={0.3}
              max={3}
              step={0.05}
              value={state.transform.scaleX}
              onChange={(_, value) => {
                const scale = value as number;
                updateTransform({ scaleX: scale, scaleY: scale });
              }}
            />
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
