# QR Designer

Aplicación React + TypeScript para diseñar códigos QR personalizables sobre imágenes de fondo, con validación automática de escaneo (ZXing) y exportación PNG/SVG.

## Características

- Generación desde URL, texto, email o teléfono
- Fondo JPG / PNG / WEBP con editor canvas (Fabric.js)
- Personalización: tamaño, colores, corrección de errores, módulos, ojos, logo
- Validación automática tras cada cambio (bloquea descarga si no es legible)
- Exportación PNG/SVG en alta resolución
- Undo/Redo, atajos de teclado, modo oscuro y auto-guardado en Local Storage
- UI responsive inspirada en editores tipo Canva

## Stack

- React 19 + TypeScript + Vite
- Material UI
- `qrcode`, `@zxing/browser`, `fabric`, `react-dropzone`, `html-to-image`

## Arranque

```bash
npm install
npm run dev
```

Build de producción:

```bash
npm run build
npm run preview
```

## Estructura

```
src/
  components/   # UI (canvas, paneles, export)
  hooks/        # useQRCode, useCanvas, useValidation…
  services/     # generación, validación e imágenes
  utils/        # helpers de canvas y descarga
  context/      # estado global del diseñador
  types/        # tipado fuerte del dominio
```

## Atajos

- `Ctrl/Cmd + Z` — Deshacer
- `Ctrl/Cmd + Y` / `Ctrl/Cmd + Shift + Z` — Rehacer
- `Ctrl/Cmd + E` — Exportar
- `Ctrl/Cmd + D` — Alternar modo oscuro
- `C` — Centrar QR
