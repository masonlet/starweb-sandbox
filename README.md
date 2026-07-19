# Starweb Sandbox

A stress test and sandbox environment for [@starweb-libs/engine](https://github.com/starweb-libs/engine/), built with TypeScript and Vite.

[![CI](https://github.com/masonlet/starweb-sandbox/actions/workflows/ci.yml/badge.svg)](https://github.com/masonlet/starweb-sandbox/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

## Website
- [**masonletoile.ca/starweb-sandbox**](https://www.masonletoile.ca/starweb-sandbox/)

## Tech Stack
<p align="left">
  <img height="35" src="https://img.shields.io/badge/TypeScript-%23007ACC?logo=typescript&logoColor=white&style=for-the-badge"/>
  <img height="35" src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white&style=for-the-badge"/>
</p>

## Levels
| Level | Description |
| ----- | ----------- |
| Physics Stress | 500 rotating OBB rects bouncing off walls and an inner barrier |
| Circle Stress  | 500 circles with full circle-circle and circle-wall collision   |

## Controls
| Key | Action |
| --- | ------ |
| `1` | Skip to next level |

## Deployment & Configuration

### Prerequisites

- npm
- Node.js 18+ (for local development and building only)

### 1. Clone the Repository

```bash
# Clone Starweb Sandbox
git clone https://github.com/masonlet/starweb-sandbox.git
cd starweb-sandbox
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run Locally

```bash
npm run dev     # Local development http://localhost:5173
npm run build   # Vite build
npm run preview # Preview production Vite build http://localhost:4173
```
### 4. Deployment

The production build outputs static files to the `dist/` directory which can be hosted on any static hosting provider. Node.js is **not required** to run the deployed site.

## License
MIT License - see [LICENSE](./LICENSE) for details.
