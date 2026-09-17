# mtsinaitransgendervictims

Public accountability site documenting complaints from transgender patients about care at Mount Sinai. Parody of the hospital website theme; not affiliated with the Mount Sinai Health System.

Split like cruush: a Vite frontend at the repository root, an API in `server/`, and Postgres.

## Development

```bash
# frontend
npm install
npm run dev            # http://localhost:5317, reads VITE_API_BASE_URL

# api
cd server
npm install
createdb mtstv_dev
export DATABASE_URL=postgres://localhost:5432/mtstv_dev
npm run migrate:dev
npm run import -- seed/reports.json
npm run dev            # http://localhost:3001 by default, PORT to change
```

Copy `.env.example` to `.env.local` and point `VITE_API_BASE_URL` at the API.

## Structure

- `src/views/MyStory.tsx` renders `content/my-story.md` and the correspondence chronology built from published emails.
- `src/views/WallOfShame.tsx` lists reports with keyword search and hospital, department, staff, category, and evidence-kind filters.
- `src/views/Emails.tsx` lists published emails only, searchable and filterable by direction.
- `src/views/RecordsVsEmails.tsx` places medical records and emails side by side on a shared timeline.
- `src/api.ts` is the API client; `src/types.ts` holds the shared shapes.
- `server/src/app.ts` serves `/api/emails`, `/api/records`, `/api/reports`, `/api/filters`, and `/api/health`.
- `server/sql/` holds numbered migrations, run by `server/src/migrate.ts`.
- `server/seed/` holds reviewed material imported by `server/src/import.ts`.
- `private/` holds raw, unreviewed source material and is ignored by Git.

## Publication gate

Every row has a `published` flag and the API serves only published rows. Staff names are served only when `report_staff.publishable` is true. Search runs in Postgres (`tsvector` columns with GIN indexes), so it stays usable as the database grows.
