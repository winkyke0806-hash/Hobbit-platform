# Hobbit-platform

Hobbit / Gyuruek Ura temaju interaktiv jatekplatform. Valassz fajt (Hobbit, Torpe, Tunde, Ember, Varazslo), teljesits 15 kulonbozo kuldetest, es jatssz a tablas jatekkal!

## Tech Stack

- **Frontend:** React 18 + Vite 6
- **Backend:** Firebase Realtime Database
- **Hosting:** GitHub Pages (GitHub Actions CI/CD)

## Telepites

```bash
npm install
```

## Kornyezeti valtozok

Masold le az `.env.example` fajlt `.env`-kent es toltsd ki a Firebase konfigot:

```bash
cp .env.example .env
```

A kovetkezo valtozokat kell beallitani:

| Valtozo | Leiras |
|---------|--------|
| `VITE_FIREBASE_API_KEY` | Firebase API kulcs |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase projekt ID |
| `VITE_FIREBASE_DATABASE_URL` | Firebase Realtime DB URL |

## Fejlesztes

```bash
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Lint & Format

```bash
npm run lint
npm run format
npm run format:check
```

## Tesztek

```bash
npm test
```

## Deploy

A `main` branch-re push-olt valtoztatasok automatikusan deploy-olodnak GitHub Pages-re a GitHub Actions CI/CD pipeline-on keresztul.

**Fontos:** A GitHub repository Settings > Secrets and variables > Actions alatt be kell allitani a `VITE_FIREBASE_*` titkokat a sikeres build-hez.
