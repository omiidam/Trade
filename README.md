# Veltrix Dashboard

A modern Android admin dashboard application inspired by the Veltrix design system, built with vanilla JavaScript, Bootstrap 5, Vite, and Capacitor.

## Features

- **Dashboard** — KPI cards, revenue/sales/traffic charts, activity feed, recent orders
- **Analytics** — Page views, unique visitors, traffic breakdown, top pages
- **Calendar** — Month view with event creation, editing, and deletion
- **Users** — User management with search, filter, CRUD operations
- **Forms** — Basic and advanced form elements with validation
- **Tables** — Searchable, sortable data tables with responsive card layout
- **Notifications** — Notification center with mark read, mark all, delete
- **Profile** — User profile with activity history
- **Settings** — Theme, language, notifications, security settings
- **Dark Mode** — Full dark theme with proper design tokens
- **RTL/Persian** — Complete right-to-left layout support
- **Mobile-First** — Bottom navigation, touch-friendly, responsive
- **Capacitor Android** — Native Android app with Capacitor

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES Modules)
- **Styling**: CSS Custom Properties + Bootstrap 5
- **Charts**: ApexCharts
- **Icons**: Bootstrap Icons
- **Build**: Vite
- **Mobile**: Capacitor 6
- **Backend**: Node.js + Express (REST API)

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Android Build

```bash
# Install dependencies
npm install

# Build web app
npm run build

# Add Android platform (first time only)
npx cap add android

# Sync web assets to Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

## GitHub Actions

The workflow automatically builds the Android release APK on push to `main`/`master`:

1. Go to **Actions** tab in GitHub
2. Click **Android Release** workflow
3. Download the `veltrix-release-apk` artifact

## Project Structure

```
veltrix-dashboard/
├── android/              # Capacitor Android project
├── server/               # Node.js REST API (optional)
├── src/
│   ├── pages/            # Page modules (auth, dashboard, etc.)
│   ├── services/         # Storage, toast, mock data
│   ├── styles/           # CSS design tokens + components
│   ├── app.js            # SPA router + state management
│   └── main.js           # Entry point
├── capacitor.config.json
├── vite.config.js
└── package.json
```

## Default Login

- Email: `admin@veltrix.com`
- Password: `password`

## Design System

The application uses CSS custom properties for theming:

| Token | Description |
|-------|-------------|
| `--v-primary` | Primary accent color (#556ee6) |
| `--v-success` | Success/positive (#34c38f) |
| `--v-warning` | Warning (#f1b44c) |
| `--v-danger` | Error/danger (#f46a6a) |
| `--v-bg` | Page background |
| `--v-card` | Card background |
| `--v-text` | Primary text |
| `--v-border` | Border color |

## License

MIT
