# TM Card Maker (React)

A modern React-based web app for creating fan-made Terraforming Mars cards. Rewritten from the original vanilla JS version with a focus on better usability.

## Tech Stack

- **React 18** + **TypeScript** — Component-based UI with type safety
- **Vite 5** — Fast dev server with HMR
- **Konva.js** + **react-konva** — Canvas rendering with built-in selection, resize handles, drag/drop
- **Zustand** — Lightweight state management with undo/redo support

## Getting Started

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## Features

- **Template system** — Start from Green, Blue, Red, Prelude, or Corporation card templates
- **Visual asset picker** — Browse and search 90+ assets (tags, resources, tiles, VPs, etc.) with thumbnails
- **Layer-based editing** — Add, reorder, and delete layers with drag/drop
- **Direct manipulation** — Click to select, drag to move, resize handles on corners
- **Property editor** — Fine-tune position, size, font, color, and more
- **Presets** — One-click positioning for common placements (tag slots, requirements, etc.)
- **Undo/Redo** — Ctrl+Z / Ctrl+Y with 50 levels of history
- **PNG Export** — Export at full resolution for printing
- **Custom fonts** — Prototype and Pagella (Palatino) fonts included

## Project Structure

```
src/
├── components/          # React components
│   ├── layers/          # Konva layer renderers (Block, Text, Production, Effect, Base)
│   ├── CardCanvas.tsx   # Main canvas with Konva Stage
│   ├── Toolbar.tsx      # Top toolbar (templates, undo/redo, add, export)
│   ├── LayerPanel.tsx   # Layer list with drag reorder
│   ├── AssetPicker.tsx  # Searchable asset browser
│   └── PropertyEditor.tsx # Context-sensitive property editing
├── store/               # Zustand store (cardStore.ts)
├── data/                # Asset catalog + card templates
├── types/               # TypeScript type definitions
├── hooks/               # Custom hooks (TBD)
└── utils/               # Utility functions (TBD)

public/assets/           # All image assets & fonts (from original project)
```

## Next Steps

- [ ] User image upload (local + web URL)
- [ ] Project save/load (localStorage + file export)
- [ ] Line layer renderer
- [ ] Production box with tiled texture
- [ ] Web font loading
- [ ] Group selection and multi-move
- [ ] Keyboard shortcuts for nudging
- [ ] Mobile-responsive layout

## Credits

Original TM Card Maker by sliceofbread: https://sliceofbread.neocities.org/tm/tm_cardmaker.html

Fan-made content for Terraforming Mars. Not affiliated with FryxGames.
