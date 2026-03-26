# Golden Principles

## Universal

1. **Evidence before assertions** — never claim done without verification
2. **Fix the environment, not the agent** — lint rules > documentation
3. **Corrections are cheap, waiting is expensive** — ship at 80%, fix at next checkpoint

## Project-Specific

4. **No feature changes during retrofit** — quality and security only, existing behavior must be preserved
5. **Firebase security rules must match client-side access patterns** — no open database
6. **All secrets via environment variables** — no hardcoded API keys in source code
7. **Hungarian UI text preserved** — all user-facing strings stay in Hungarian
