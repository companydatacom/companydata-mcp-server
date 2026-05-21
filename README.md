# CompanyData MCP server

Model Context Protocol (stdio) server that exposes the [CompanyData HTTP API](https://companydata.com/api-docs/) as tools: **company search**, **company export (enrich)**, and **location lookup** (cities).

Product overview and setup guide: [companydata.com/product/mcp-server/](https://companydata.com/product/mcp-server/).

OpenAPI contract: [https://companydata.com/openapi.json](https://companydata.com/openapi.json).

## Prerequisites

- Node.js 18+
- A CompanyData API key ([get one](https://app.companydata.com/signup-api))

## Install and build

```bash
git clone https://github.com/companydatacom/companydata-mcp-server.git
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
| `field_lookup` | `GET /api/cities` |

## Cursor & Claude Desktop

1. Build the project (`npm run build`).
2. In your MCP host (e.g. **Cursor Settings → MCP** or Claude Desktop config), add a server (adjust paths):

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

## Smoke checklist

- Server starts without errors (`npm run build && node dist/index.js` with env set).
- MCP host lists tools: `company_search`, `company_enrich`, `field_lookup`.
- `company_search` returns 200 payload for a simple query (e.g. `search=BoldData`).
- `field_lookup` returns city suggestions (e.g. `search=amst`).

Development without a separate build step:

```json
{
  "mcpServers": {
    "companydata": {
      "command": "npx",
      "args": ["tsx", "/ABSOLUTE/PATH/TO/companydata-mcp-server/src/index.ts"],
      "env": {
        "COMPANYDATA_API_KEY": "your-api-key-here",
        "COMPANYDATA_API_BASE_URL": "https://app.companydata.com"
      }
    }
  }
}
```

## CLI

After `npm run build`, the package exposes `companydata-mcp` when linked (`npm link`) or when `node_modules/.bin` is on `PATH`.

## Distribution

Current distribution mode is **GitHub/clone-based**:

1. Clone the repository.
2. Run `npm install && npm run build`.
3. Configure MCP host to execute `dist/index.js` (or `src/index.ts` via `tsx` for dev).

If you later want npm distribution, the package is already set up with `bin` and `files` fields.

## License

ISC
