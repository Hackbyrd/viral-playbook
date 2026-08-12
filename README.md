# Viral Playbook

The public documentation site and downloadable resources for Jonathan Chen's Viral Video Playbook.

## Source and generated artifacts

- `content/Viral-Video-Playbook-v4.md` — canonical English playbook source
- `content/Viral-Video-Playbook-v4.zh-TW.md` — Traditional Chinese (Taiwan) playbook source
- `skills/viral-video-ideas/` — downloadable Cursor skill source
- `dist/index.html` — generated English website
- `dist/zh-TW/index.html` — generated Traditional Chinese website
- `dist/downloads/Viral-Video-Playbook-v4.pdf` — generated English PDF
- `dist/downloads/Viral-Video-Playbook-v4.zh-TW.pdf` — generated Traditional Chinese PDF
- `dist/downloads/Viral-Video-Ideas-Skill.zip` — generated skill download

Do not edit `dist/` by hand. Update the Markdown or skill source, then rebuild.
Both Markdown sources must contain exactly 38 ordered parts. While the translated source is being prepared, the build logs a warning and continues to produce the English site and PDF.

## Local build

```bash
npm install
npm run setup:browser
npm run build
npm run dev
```

## Cloudflare Pages

The site deploys as the `viral-playbook` Cloudflare Pages project. The GitHub Actions workflow builds the site, PDF, and skill bundle on every push to `main`, then deploys it.

Before enabling the workflow, add these repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The project initially uses its generated `pages.dev` address.
