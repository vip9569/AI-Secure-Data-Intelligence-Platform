# SDIP React Frontend
> AI Secure Data Intelligence Platform — React + Vite + Tailwind CSS

## Quick Start

```bash
npm install
npm run dev
```

App runs at: http://localhost:3000

The Vite dev server proxies `/api/*` → `http://localhost:8000` automatically,
so make sure the Python backend is running on port 8000.

## Build for production

```bash
npm run build
# Output goes to dist/
```

## Project Structure

```
src/
├── main.jsx                  ← React entry point
├── App.jsx                   ← Root component, all state + logic
├── index.css                 ← Tailwind + global styles + animations
│
├── components/
│   ├── Header.jsx            ← Top bar with logo + status
│   ├── Sidebar.jsx           ← Input type tabs, options toggles, history
│   ├── Toggle.jsx            ← Reusable toggle switch
│   ├── FileUploadZone.jsx    ← Drag-and-drop file uploader
│   ├── TextInputZone.jsx     ← Textarea for text/sql/chat input
│   ├── LoadingBar.jsx        ← Animated progress bar
│   ├── StatsRow.jsx          ← Critical / High / Medium / Total counts
│   ├── LogViewer.jsx         ← Line-by-line log with risk highlighting
│   ├── RiskBadge.jsx         ← Colored severity pill (critical/high/...)
│   ├── RightPanel.jsx        ← Risk score gauge, summary, insights, findings
│   ├── EmptyState.jsx        ← Shown before first analysis
│   └── Toast.jsx             ← Bottom-right notification
│
├── hooks/
│   └── useToast.js           ← Toast state management hook
│
└── utils/
    ├── api.js                ← Backend API calls (analyze, upload, history)
    └── scanner.js            ← Client-side regex scanner (demo/offline mode)
```

## How It Works

1. **With backend running** — calls `/api/analyze` or `/api/upload`,
   gets full AI-powered results from Ollama via the FastAPI backend.

2. **Demo mode** (no backend) — the client-side scanner in `utils/scanner.js`
   runs 11 regex patterns directly in the browser. All UI features still work,
   just without the Ollama AI summary.

## Responsive Breakpoints

- `≥ 1100px` — full 3-column layout (sidebar + main + right panel)
- `< 1100px`  — right panel hidden
- `< 750px`   — sidebar hidden, single column

## Customisation

- **Colors** — edit `tailwind.config.js`, the custom color palette maps directly
  to Tailwind utilities like `text-accent`, `bg-critical`, etc.
- **Add a pattern** — edit `src/utils/scanner.js`, add to the `PATTERNS` array.
- **Add an input type** — add to `INPUT_TYPES` in `Sidebar.jsx` and
  `PLACEHOLDERS` in `TextInputZone.jsx`.
