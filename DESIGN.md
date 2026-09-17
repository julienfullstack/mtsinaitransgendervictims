# Design decisions

## Theme
- The site is an obvious parody of the Mount Sinai hospital website theme. Source: Julien, 2026-09-17: "make it based on the theme of the mt sinai in a way that is obviously parody, dont use the logos".
- No Mount Sinai logos or marks are used anywhere.
- Palette tokens in `src/index.css`: navy `#221f72`, magenta `#d80b8c`, cyan `#00aeef`, institutional sans-serif. Every page shows the parody disclaimer bar.

## Structure
- Two sides: "My Story" and a filterable, searchable "Wall of Shame". Source: Julien, 2026-09-17.
- Emails and records are keyword searchable. There is an emails-only view and a combined view placing medical records against emails on one timeline. Source: Julien, 2026-09-17.
- Every item carries an evidence kind: patient allegation, documentary evidence, hospital response, or verifiable fact. Reports are filterable by hospital, department, and staff member; staff names appear only when marked publishable. Response tracking records complaint submitted, acknowledged, first response, and whether corrective action was communicated. Source: Julien's pasted email, 2026-09-17.

## Stack
- TypeScript, React, Vite, MiniSearch. Source: Julien, 2026-09-17: "type script react mini".

## Copy
- Page body copy, including `content/my-story.md`, is written by Julien.
