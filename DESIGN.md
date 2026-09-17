# Design decisions

## Theme
- The site is an obvious parody of the mountsinai.org website. Source: Julien, 2026-09-17: "make it based on the theme of the mt sinai in a way that is obviously parody, dont use the logos"; correction the same day: "its not mt sdinai themed go their hosptial site", then "rather nt scrape, but uild the site as a parody of this one" with https://www.mountsinai.org/.
- No Mount Sinai logos or marks are used anywhere. The wordmark is plain serif text.
- Layout follows the observed mountsinai.org homepage: white header with text wordmark and blue utility line, sky-blue main navigation (`#00a6e5`, light `#7fd2f1` dividers), thin white headings on a deep blue band (`#0081b2`), three icon columns with square white buttons on the landing page, light gray page (`#eeeeee`), dark gray footer (`#3f4246`). Tokens live in `src/index.css`.
- The parody disclaimer appears in the header utility area and the footer.
- Literal homepage structure with parody wording (Julien, 2026-09-17: "literally the style but put the stuf i asked for ... it just needs be obiously a parody of mt sinai" and "Just make it read as a parody"): utility links with circle chevrons and a parody phone number, main nav with a Search cell, hero carousel with caption and magenta dots, three-column blue band (icon, underlined title, one line, white button), footer with blog/phone line and three link columns. Parody wording lives in `src/App.tsx` constants and awaits Julien's approval before publication.

## Structure
- Pages: "The Department of Sludge" added (Julien, 2026-09-17: "also gotta a oage for The Department of Sludge"); contents pending Julien.
- Two sides: "My Story" and a filterable, searchable "Wall of Shame". Source: Julien, 2026-09-17.
- Emails and records are keyword searchable. There is an emails-only view and a combined view placing medical records against emails on one timeline. Source: Julien, 2026-09-17.
- Every item carries an evidence kind: patient allegation, documentary evidence, hospital response, or verifiable fact. Reports are filterable by hospital, department, and staff member; staff names appear only when marked publishable. Response tracking records complaint submitted, acknowledged, first response, and whether corrective action was communicated. Source: Julien's pasted email, 2026-09-17.

## Stack
- TypeScript, React, Vite for the frontend. Source: Julien, 2026-09-17: "type script react mini".
- Split like cruush, with a separate frontend, API and database. Source: Julien, 2026-09-17: "So new project in coolify we should split front and backend the database will be extensive", "One repo build to cruush in terms split postsqel api and dataset", "Database rathwe".
- API: Fastify with pg and zod in `server/`, numbered SQL migrations in `server/sql/`, mirroring cruush's server layout. Keyword search runs in Postgres with `tsvector` columns and GIN indexes; the earlier browser-side MiniSearch index was removed because the database will be large.
- Deployment target: a new Coolify project (never an existing one) on the Hetzner server, with the frontend, API and Postgres as separate resources, on mtsinaitransgendervictims.com. Source: Julien, 2026-09-17: "Domain MtSinaiTransgenderVictims.com", "pla do not put on existing projexts".

## Publication gate
- Every database row has a `published` flag and the API serves only published rows, so raw scraped material stays private until reviewed. Staff names are served only when marked publishable.

## Copy
- Page body copy, including `content/my-story.md`, is written by Julien.
