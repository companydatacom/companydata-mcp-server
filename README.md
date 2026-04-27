# CompanyData MCP server

Model Context Protocol (stdio) server that exposes the [CompanyData HTTP API](https://companydata.com/api-docs/) as tools: **company search**, **company export (enrich)**, and **location lookup** (cities / provinces / regions / countries).

Contract matches [`companydata-website-nextjs/public/openapi.json`](https://github.com/your-org/companydata-website-nextjs/blob/main/public/openapi.json) (sibling repo).

## Prerequisites

- Node.js 18+
- A CompanyData API key

## Install and build

```bash
cd companydata-mcp-server
npm install
npm run build
```

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `COMPANYDATA_API_KEY` | Yes | Sent as `x-api-key` on every request |
| `COMPANYDATA_API_BASE_URL` | No | API origin, default `https://app.companydata.com` (no trailing slash) |

Copy `.env.example` to `.env` for local testing with `npm run dev` (load env in shell: `set -a && source .env && set +a && npm run dev`).

## Tools

| Tool | API |
|------|-----|
| `company_search` | `GET /api/company/search` |
| `company_enrich` | `GET /api/company/export` with `ID` and `export=true` |
| `field_lookup` | `GET /api/cities`, `/api/provinces`, `/api/regions`, or `/api/countries` |

## Cursor

1. Build the project (`npm run build`).
2. In **Cursor Settings → MCP**, add a server (adjust paths):

```json
{
  "mcpServers": {
    "companydata": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/companydata-mcp-server/dist/index.js"],
      "env": {
        "COMPANYDATA_API_KEY": "your-api-key-here",
        "COMPANYDATA_API_BASE_URL": "https://app.companydata.com"
      }
    }
  }
}
```

3. Reload MCP / restart Cursor if needed.

Development without a separate build step:

```json
"command": "npx",
"args": ["tsx", "/ABSOLUTE/PATH/TO/companydata-mcp-server/src/index.ts"],
```

## CLI

After `npm run build`, the package exposes `companydata-mcp` when linked (`npm link`) or when `node_modules/.bin` is on `PATH`.

## License

ISC
