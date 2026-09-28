# LEXA catalog readiness - proposal site

Static site (HTML, CSS, JS). No build step, no dependencies.

## Tabs
- Tracker: interactive master tracker with sample SKUs, follow-ups by owner, naming check, customer preview, and Shopify CSV export
- How I'd run it: process, where data lives, file naming, updates
- First look at your site: three findings from the public Product Details page

## Run locally
    npm run dev
Open http://localhost:3000

## Deploy to Vercel
CLI: `npm run deploy`, log in, accept the defaults.

GitHub: push this folder, then in Vercel choose Add New > Project, import the repo, framework preset "Other", leave build settings empty.

## Before sending
- Rename the Vercel project, for example `josinaldo-lexa-catalog.vercel.app`
- Do not add email, phone, or booking links (Upwork rules)
- Direct tab links: `/#plan`, `/#audit`
