# AgentPay Frontend

Dashboard and Stellar wallet integration for the AgentPay protocol (machine-to-machine payments on Stellar).

## Overview

- **Stack:** Next.js 16, React, TypeScript, Tailwind CSS
- **Purpose:** AgentPay dashboard for services, usage, agents, admin controls, exports, events, webhooks, API keys, and project documentation

## Prerequisites

- Node.js 18+
- npm

## Setup for contributors

1. **Clone the repo** (or add remote and pull):
   ```bash
   git clone <repo-url> && cd agentpay-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Verify setup**:
   ```bash
   npm run build
   npm test
   ```

4. **Run locally**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
agentpay-frontend/
|-- src/
|   |-- app/                  # Next.js app routes, route tests, and global UI states
|   |   |-- page.tsx          # Home/dashboard landing page
|   |   |-- services/         # Service list, create, detail, edit, and service-agent views
|   |   |-- usage/            # Usage record/query UI
|   |   |-- agents/           # Agent summary and detail pages
|   |   |-- admin/            # Pause/unpause controls
|   |   |-- stats/            # Backend stats snapshot
|   |   |-- events/           # Event log viewer
|   |   |-- webhooks/         # Webhook management
|   |   |-- api-keys/         # API key management
|   |   |-- search/           # Service search
|   |   |-- settings/         # Runtime configuration notes
|   |   |-- docs/             # API prose reference
|   |   |-- export/           # CSV/JSON export links
|   |   |-- about/            # Project overview
|   |   `-- changelog/        # Backend changelog view
|   |-- components/           # Shared UI primitives and layout components
|   `-- lib/                  # API client, formatting, theme, security header helpers
|-- public/                   # Static assets
|-- package.json              # npm scripts and dependencies
|-- jest.config.ts            # Jest configuration
|-- jest.setup.ts             # Test environment setup
`-- .github/workflows/        # CI workflow
```

## Route map

All API calls resolve through `NEXT_PUBLIC_AGENTPAY_API_BASE`; by default this points to `http://localhost:3001`.

| Route | Purpose | Backend endpoints |
|-------|---------|-------------------|
| `/` | Home dashboard and entry point | None |
| `/about` | AgentPay project overview | None |
| `/admin` | Read and toggle global pause state | `GET /api/v1/admin/status`, `POST /api/v1/admin/pause`, `POST /api/v1/admin/unpause` |
| `/agents` | Agent summary backed by aggregate stats | `GET /api/v1/stats` |
| `/agents/[agent]` | Per-agent usage and lifetime total | `GET /api/v1/agents/:agent/usage`, `GET /api/v1/agents/:agent/total` |
| `/api-keys` | List, create, and revoke API keys | `GET /api/v1/api-keys`, `POST /api/v1/api-keys`, `DELETE /api/v1/api-keys/:prefix` |
| `/changelog` | Backend changelog view | `GET /api/v1/changelog` |
| `/docs` | Short API reference for common endpoints | Links to `GET /api/v1/openapi.json`; documents usage, settle, services, and admin endpoints |
| `/events` | Event log viewer | `GET /api/v1/events?limit=100` |
| `/export` | Download usage exports | `GET /api/v1/usage/export.json`, `GET /api/v1/usage/export.csv` |
| `/search` | Search services by query | `GET /api/v1/services?q=:query&limit=50` |
| `/services` | Service registry list | `GET /api/v1/services` |
| `/services/new` | Register a service | `POST /api/v1/services` |
| `/services/[serviceId]` | Service detail and usage rollup | `GET /api/v1/services/:serviceId`, `GET /api/v1/services/:serviceId/usage` |
| `/services/[serviceId]/agents` | Top agents for a service | `GET /api/v1/services/:serviceId/agents/top?limit=25` |
| `/services/[serviceId]/edit` | Edit service pricing | `GET /api/v1/services/:serviceId`, `PATCH /api/v1/services/:serviceId/price` |
| `/settings` | Runtime configuration notes | None |
| `/stats` | Aggregate backend stats | `GET /api/v1/stats` |
| `/usage` | Record usage and query totals | `POST /api/v1/usage`, `GET /api/v1/usage/:agent/:serviceId` |
| `/webhooks` | List, create, and delete webhooks | `GET /api/v1/webhooks`, `POST /api/v1/webhooks`, `DELETE /api/v1/webhooks/:id` |

## Environment variables

| Variable | Visibility | Default | Purpose |
|----------|------------|---------|---------|
| `NEXT_PUBLIC_AGENTPAY_API_BASE` | public (bundled into client JS) | `http://localhost:3001` | Base URL for the AgentPay backend. Validated by `resolveApiBase()` in `src/lib/resolveApiBase.ts` and rejected in production if non-https except for `localhost` / `127.0.0.1`. |

Because the variable is `NEXT_PUBLIC_*`, its value is exposed to the browser. Never put API secrets in it - it is used only for routing public HTTP requests.

## Security headers

A baseline security header set (CSP, `X-Frame-Options: DENY`, `Referrer-Policy`, `X-Content-Type-Options`, `Permissions-Policy`, HSTS) is wired up in `next.config.ts` via `src/lib/securityHeaders.ts`. The CSP `connect-src` directive tracks `NEXT_PUBLIC_AGENTPAY_API_BASE` automatically; `<a href>` links to external sites (`https://stellar.org`, etc.) remain navigable.

## Event log rendering

The `/events` page renders server-supplied JSON payloads. Each payload is serialised through `safeStringify` (`src/lib/format.ts`) with a hard cap (`EVENT_PAYLOAD_MAX_CHARS`, default 5,000 chars) and a visible `...truncated)` marker. Circular references, `BigInt`, functions, and malformed timestamps are replaced with safe sentinels so a bad payload can't crash the page.

## Commands

| Command | Description |
|--------|-------------|
| `npm run build` | Production build |
| `npm test` | Run Jest tests |
| `npm run dev` | Development server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler |

## CI/CD

On push/PR to `main`, GitHub Actions runs:

- `npm ci`
- `npm run build`
- `npm test`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contributor workflow, branch naming convention, local checks, and UI accessibility expectations.

## License

MIT
