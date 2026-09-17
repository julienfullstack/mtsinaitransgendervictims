# mtsinaitransgendervictims

Public accountability site documenting complaints from transgender patients about care at Mount Sinai. Parody of the hospital website theme; not affiliated with the Mount Sinai Health System.

## Development

```bash
npm install
npm run dev
npm run build
```

## Structure

- `src/views/MyStory.tsx` renders `content/my-story.md` and the correspondence chronology computed from imported emails.
- `src/views/WallOfShame.tsx` lists reports with keyword search and hospital, department, staff, category, and evidence-kind filters.
- `src/views/Emails.tsx` lists emails only, searchable and filterable by direction.
- `src/views/RecordsVsEmails.tsx` places medical records and emails side by side on a shared timeline, with shared keyword search and linked-email focus.
- `src/data/*.json` holds published data. Types are in `src/types.ts`; search indexes in `src/data.ts`.
- `private/` holds raw, unreviewed source material and is ignored by Git.
