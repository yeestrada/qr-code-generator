import { Box, Drawer, IconButton, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useEffect, useState } from 'react';
import { Toolbar } from '../Toolbar';
import { SettingsPanel } from '../SettingsPanel';
import { QRCanvas } from '../QRCanvas';
import { InfoPanel } from '../InfoPanel';
import { ExportDialog } from '../ExportDialog';
import { useDesigner } from '../../context/DesignerContext';

const LEFT_WIDTH = 320;
const RIGHT_WIDTH = 300;

export function AppLayout() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const { undo, redo, setExportOpen, centerQrOnCanvas, toggleDarkMode } = useDesigner();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      if ((meta && event.key.toLowerCase() === 'y') || (meta && event.shiftKey && event.key.toLowerCase() === 'z')) {
        event.preventDefault();
        redo();
      }
      if (meta && event.key.toLowerCase() === 'e') {
        event.preventDefault();
        setExportOpen(true);
      }
      if (meta && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        toggleDarkMode();
      }
      if (event.key === 'c' && !meta && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        centerQrOnCanvas();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo, setExportOpen, centerQrOnCanvas, toggleDarkMode]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Toolbar />

      <Box sx={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
        {!isMdUp && (
          <IconButton
            onClick={() => setLeftOpen(true)}
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 5,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {!isLgUp && (
          <IconButton
            onClick={() => setRightOpen(true)}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 5,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <InfoOutlinedIcon />
          </IconButton>
        )}

        {isMdUp ? (
          <Box
            sx={{
              width: LEFT_WIDTH,
              flexShrink: 0,
              borderRight: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              overflow: 'auto',
            }}
          >
            <SettingsPanel />
          </Box>
        ) : (
          <Drawer open={leftOpen} onClose={() => setLeftOpen(false)}>
            <Box sx={{ width: LEFT_WIDTH, height: '100%', overflow: 'auto' }}>
              <SettingsPanel />
            </Box>
          </Drawer>
        )}

        <QRCanvas />

        {isLgUp ? (
          <Box
            sx={{
              width: RIGHT_WIDTH,
              flexShrink: 0,
              borderLeft: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              overflow: 'auto',
            }}
          >
            <InfoPanel />
          </Box>
        ) : (
          <Drawer anchor="right" open={rightOpen} onClose={() => setRightOpen(false)}>
            <Box sx={{ width: Math.min(RIGHT_WIDTH, 320), height: '100%', overflow: 'auto' }}>
              <InfoPanel />
            </Box>
          </Drawer>
        )}
      </Box>

      <ExportDialog />
    </Box>
  );
}
