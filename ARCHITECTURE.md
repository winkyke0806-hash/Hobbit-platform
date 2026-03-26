# Architecture

## Overview

Hobbit-platform is a single-page React application themed around The Hobbit / Lord of the Rings. It runs entirely in the browser with Firebase Realtime Database for persistence and multiplayer features.

## Layer Diagram

```
+--------------------------------------------------+
|                   GitHub Pages                    |  Hosting
+--------------------------------------------------+
|                   Vite Build                      |  Build Tool
+--------------------------------------------------+
|                   React 18                        |  UI Framework
+--------------------------------------------------+
|  hobbit-app.jsx  |  hobbit-tasks.jsx  |  hobbit-game.jsx  |  Components
+--------------------------------------------------+
|              src/main.jsx (Router)                |  Entry Point
+--------------------------------------------------+
|         Firebase Realtime Database                |  Backend / DB
+--------------------------------------------------+
```

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| UI Framework | React 18 | Component-based, large ecosystem |
| Build Tool | Vite 6 | Fast HMR, simple config |
| Database | Firebase Realtime DB | Real-time sync, no backend needed |
| Hosting | GitHub Pages | Free, auto-deploy from CI |
| CI/CD | GitHub Actions | Auto build + deploy on push to main |

## Key Files

| File | Purpose | Size |
|------|---------|------|
| `src/main.jsx` | Entry point, auth routing | ~1KB |
| `hobbit-app.jsx` | Auth/registration, race selection | ~54KB |
| `hobbit-tasks.jsx` | 15 quest challenges, task system | ~113KB |
| `hobbit-game.jsx` | Board game, shop, multiplayer | ~85KB |

## Key Decisions

| ID | Decision | Rationale | Date |
|----|----------|-----------|------|
| AD-1 | Retrofit for quality without feature changes | Stabilize before adding new features | 2026-03-25 |
