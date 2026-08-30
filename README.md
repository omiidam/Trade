# TradeFinex | تریدفینکس

**AI-Powered Market Research & Analysis Application**

TradeFinex is a professional financial market research and technical analysis application that combines real-time web research with AI-powered analysis. It renders interactive charts and provides deep market insights using configurable LLM APIs.

---

## Features

- **Real-Time Web Research** — Automatically searches the web for market data from multiple sources
- **TradingView Integration** — Discovers and references TradingView chart pages
- **Interactive Charts** — Professional candlestick, line, and area charts with technical indicators
- **AI Analysis** — Natural language market analysis powered by any OpenAI-compatible LLM API
- **Technical Indicators** — SMA, EMA, RSI, MACD, Bollinger Bands, ATR calculated locally
- **Multi-Market Support** — Crypto, Forex, Stocks, Indices, and Commodities
- **Persian/English** — Full bilingual support with RTL layout
- **Dark/Light Theme** — Trading terminal-inspired dark mode with light mode option
- **Offline History** — Previous charts and analyses available offline
- **Android App** — Packaged with Capacitor for native Android installation
- **GitHub Actions CI/CD** — Automated APK build and artifact upload

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui components |
| Charts | TradingView Lightweight Charts |
| Validation | Zod schemas |
| Animation | Framer Motion |
| Routing | React Router v6 |
| Icons | Lucide React |
| Android | Capacitor 6 |
| CI/CD | GitHub Actions |

---

## Project Structure

```
tradefinex/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── chart/           # TradingChart component
│   │   ├── analysis/        # Analysis input & result
│   │   └── market/          # Market selector
│   ├── pages/               # Route pages
│   ├── services/
│   │   ├── web/             # Search, fetch, extract, TradingView
│   │   ├── llm/             # LLM API service
│   │   ├── market/          # Indicator calculations
│   │   └── storage/         # Local storage
│   ├── schemas/             # Zod validation schemas
│   ├── types/               # TypeScript types
│   ├── prompts/             # LLM prompt templates
│   ├── i18n/                # English/Persian translations
│   ├── context/             # React context
│   └── utils/               # Utilities
├── android/                 # Capacitor Android project
├── .github/workflows/       # CI/CD
├── capacitor.config.ts
└── package.json
```

---

## Installation

### Prerequisites

- Node.js 20+
- npm or bun

### Web Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Android Build (Local)

```bash
# Install dependencies
npm install

# Build web app
npm run build

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

### Android Build (Command Line)

```bash
npm install
npm run build
npx cap sync android

cd android
./gradlew assembleRelease

# APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## LLM API Configuration

TradeFinex supports any OpenAI-compatible API. Configure through the Settings page:

| Setting | Description | Default |
|---------|-------------|---------|
| API Base URL | LLM API endpoint | `https://api.openai.com/v1` |
| API Key | Your API key | (empty) |
| Model | Model identifier | `gpt-4o-mini` |
| Temperature | Response randomness | `0.3` |
| Max Tokens | Maximum response tokens | `4096` |

### Supported Providers

- OpenAI (GPT-4o, GPT-4o-mini, GPT-3.5-turbo)
- Anthropic (via OpenAI-compatible proxy)
- Local LLMs (Ollama, LM Studio, vLLM, etc.)
- Any OpenAI-compatible API endpoint

---

## Web Research Architecture

TradeFinex performs real web searches without requiring any paid search API:

```
User selects market
    ↓
Symbol normalization & category detection
    ↓
DuckDuckGo HTML search (no API key)
    ↓
Multi-source web page fetching (with CORS proxy fallback)
    ↓
Content extraction & price parsing
    ↓
TradingView URL resolution
    ↓
Research package assembly
    ↓
LLM API #1 → Structured JSON normalization
    ↓
Local indicator calculation (SMA, EMA, RSI, MACD, BB, ATR)
    ↓
Interactive chart rendering
    ↓
User enters analysis request
    ↓
LLM API #2 → AI market analysis
    ↓
Professional analysis UI
```

### Key Design Principles

- **No fabricated data** — Uses `null` for unavailable information
- **Source attribution** — Every data point traces to a source URL
- **Local calculations** — Indicators computed deterministically in JavaScript
- **Graceful degradation** — Falls back when sources are unavailable

---

## Chart System

Built on TradingView's open-source Lightweight Charts library:

- **Chart Types**: Candlestick, Line, Area
- **Overlays**: SMA 20, SMA 50, Support/Resistance levels
- **Features**: Crosshair, zoom, pan, tooltips, time axis
- **Volume**: Histogram overlay with color-coded bars
- **Responsive**: Adapts to all screen sizes

---

## Capacitor Android Build

The web application is packaged into a native Android app using Capacitor:

- **App Name**: TradeFinex
- **Package ID**: `com.qali.tradefinex`
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 36

---

## GitHub Actions APK Artifact

The CI/CD workflow automatically:

1. Checks out the repository
2. Installs Node.js dependencies
3. Builds the web application
4. Sets up Java JDK 17
5. Sets up Android SDK
6. Generates a release keystore
7. Builds the release APK with Gradle
8. Uploads the APK as a GitHub Actions artifact

### Artifact Location

After a successful workflow run:

```
GitHub → Actions → Android Release → Artifacts → tradefinex-release-apk
```

---

## Release Signing

Release builds use a keystore generated during the CI build. For production signing:

### Option 1: GitHub Actions Secrets

Set these secrets in your repository:

| Secret | Description |
|--------|-------------|
| `KEYSTORE_BASE64` | Base64-encoded keystore file |
| `KEYSTORE_PASSWORD` | Keystore password |
| `KEY_ALIAS` | Key alias |
| `KEY_PASSWORD` | Key password |

### Option 2: Default Signing

The project includes a default signing configuration for development/testing:

- Store password: `tradefinex123`
- Key alias: `tradefinex`
- Key password: `tradefinex123`

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Development server port | No (default: 5173) |

LLM API keys are configured through the app's Settings page, not environment variables.

---

## Troubleshooting

### Build Fails

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Android Build Issues

```bash
# Re-sync Capacitor
npx cap sync android

# Clean Android build
cd android && ./gradlew clean && ./gradlew assembleRelease
```

### Chart Not Displaying

- Ensure the market has price data available
- Check that web search returned results
- Verify LLM API key is configured for data normalization

### LLM API Errors

- Verify API key is correct in Settings
- Check API base URL includes `/v1` for OpenAI
- Ensure model name matches your API plan
- Check rate limits and increase timeout if needed

---

## License

MIT License

---

## Disclaimer

TradeFinex is an analysis and research tool. It does not provide financial advice. Always conduct your own research before making investment decisions. AI-generated analysis is for informational purposes only and should not be considered a guarantee of future performance.
