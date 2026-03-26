# Tech Debt

## Open

| ID | Description | Severity | Added | Phase |
|----|-------------|----------|-------|-------|
| TD-6 | 3 JSX files are very large (54KB, 85KB, 113KB) — future refactor candidate | LOW | 2026-03-25 | Audit |
| TD-8 | 19 ESLint warnings (unused vars, exhaustive-deps) — not auto-fixable without behavior changes | LOW | 2026-03-25 | Retrofit |
| TD-9 | Vite chunk size warning (583KB) — consider code-splitting | LOW | 2026-03-25 | Retrofit |
| TD-10 | npm audit: 10 vulnerabilities (9 moderate, 1 high) — run npm audit fix | MEDIUM | 2026-03-25 | Retrofit |
| TD-11 | User must set GitHub Secrets for CI/CD Firebase env vars | MEDIUM | 2026-03-25 | Retrofit |

## Resolved

| ID | Description | Resolved | How |
|----|-------------|----------|-----|
| TD-1 | Firebase API key hardcoded in hobbit-game.jsx:5 | 2026-03-25 | Extracted to .env with VITE_ prefix |
| TD-2 | No .gitignore | 2026-03-25 | Created .gitignore with node_modules, dist, .env, etc. |
| TD-3 | No test framework or tests | 2026-03-25 | Added Vitest + React Testing Library, 4 smoke tests |
| TD-4 | No lint or formatting config | 2026-03-25 | Added ESLint 9 (flat config) + Prettier |
| TD-5 | README.md is empty | 2026-03-25 | Full README with setup, env vars, commands |
| TD-7 | No package-lock.json | 2026-03-25 | Generated via npm install |
