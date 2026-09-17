# Design decisions

## Theme
- The site is an obvious parody of the mountsinai.org website. Source: Julien, 2026-09-17: "make it based on the theme of the mt sinai in a way that is obviously parody, dont use the logos"; correction the same day: "its not mt sdinai themed go their hosptial site", then "rather nt scrape, but uild the site as a parody of this one" with https://www.mountsinai.org/.
- No Mount Sinai logos or marks are used anywhere. The wordmark is plain serif text.
- Layout follows the observed mountsinai.org homepage: white header with text wordmark and blue utility line, sky-blue main navigation (`#00a6e5`, light `#7fd2f1` dividers), thin white headings on a deep blue band (`#0081b2`), three icon columns with square white buttons on the landing page, light gray page (`#eeeeee`), dark gray footer (`#3f4246`). Tokens live in `src/index.css`.
- The parody disclaimer appears in the header utility line and the footer.

## Structure
- Pages: "The Department of Sludge" added (Julien, 2026-09-17: "also gotta a oage for The Department of Sludge"); contents pending Julien.
- Two sides: "My Story" and a filterable, searchable "Wall of Shame". Source: Julien, 2026-09-17.
- Emails and records are keyword searchable. There is an emails-only view and a combined view placing medical records against emails on one timeline. Source: Julien, 2026-09-17.
- Every item carries an evidence kind: patient allegation, documentary evidence, hospital response, or verifiable fact. Reports are filterable by hospital, department, and staff member; staff names appear only when marked publishable. Response tracking records complaint submitted, acknowledged, first response, and whether corrective action was communicated. Source: Julien's pasted email, 2026-09-17.

## Stack
- TypeScript, React, Vite, MiniSearch. Source: Julien, 2026-09-17: "type script react mini".

## Copy
- Page body copy, including `content/my-story.md`, is written by Julien.
