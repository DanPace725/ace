# Local dev workflow

Next dev and Next build both use `.next` by default. If `npm run build` runs
while `npm run dev` is still serving the app, the build can overwrite the dev
server's compiled CSS and route manifests. The result is a page that renders
unstyled HTML until the dev server is restarted.

Use this command for local verification while the dev server is running:

```powershell
npm run build:check
```

`build:check` writes to `.next-build`, leaving the active `.next` dev output
alone. Keep using `npm run build` for a normal production build when no local dev
server is running.
