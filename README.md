# cf-pages-logs

A simple Cloudflare Worker for viewing Cloudflare Pages deployment history and logs.

## Setup

```bash
pnpm install
```

Configure the following environment variables:

- `CLOUDFLARE_API_TOKEN`: Cloudflare API token (with `Pages Read` permission)
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID
- `CLOUDFLARE_PROJECT_NAME`: Cloudflare Pages project name
- `SITE_TITLE`: Title for the site

## Development

```bash
pnpm run dev
```

## Deploy

```bash
pnpm run deploy
```

## Q & A

### Why?

For projects deploying to Cloudflare Pages, the `cloudflare-workers-and-pages`
bot comments publicly on pull requests with a `View logs` link, but viewing
logs requires authentication. I found this restriction unnecessary for the
projects I'm working on, so I made this.

### Why no CSS?

This project uses zero CSS because I think there's no significant necessity
styling it. I may try to style it like Cloudflare's dashboard in the future.
