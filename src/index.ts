#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { loadConfig } from './config.js';
import { CompanyDataHttpClient } from './api/client.js';

function toolResponse(result: { ok: boolean; status: number; body: unknown }) {
  const text =
    typeof result.body === 'string' ? result.body : JSON.stringify(result.body, null, 2);
  if (!result.ok) {
    return {
      isError: true as const,
      content: [{ type: 'text' as const, text: `HTTP ${result.status}: ${text}` }],
    };
  }
  return {
    content: [{ type: 'text' as const, text }],
  };
}

async function main() {
  const { baseUrl, apiKey } = loadConfig();
  const http = new CompanyDataHttpClient(baseUrl, apiKey);

  const server = new McpServer(
    { name: 'companydata-mcp', version: '1.0.0' },
    {
      instructions:
        'CompanyData MCP: company_search, company_enrich, field_lookup (cities). Docs: https://companydata.com/product/mcp-server/ — set COMPANYDATA_API_KEY and optional COMPANYDATA_API_BASE_URL (default https://app.companydata.com).',
    }
  );

  const filtersSchema = z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .describe(
      'Query parameters for GET /api/company/search, e.g. search, countryCode, page, pageSize, statusCode.'
    );

  server.registerTool(
    'company_search',
    {
      title: 'Company search',
      description: 'GET /api/company/search with the same query parameters as the CompanyData HTTP API.',
      inputSchema: { filters: filtersSchema },
      annotations: { readOnlyHint: true },
    },
    async ({ filters }) => {
      const result = await http.getJson('/api/company/search', filters);
      return toolResponse(result);
    }
  );

  server.registerTool(
    'company_enrich',
    {
      title: 'Company export (enrich)',
      description:
        'GET /api/company/export with ID and export=true for the field set in your subscription.',
      inputSchema: {
        ID: z.string().describe('Company ID from search results.'),
        page: z.number().int().positive().optional(),
        pageSize: z.number().int().positive().optional(),
        useScroll: z.boolean().optional(),
        scrollId: z.string().optional(),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ ID, page, pageSize, useScroll, scrollId }) => {
      const query: Record<string, unknown> = { ID, export: true };
      if (page !== undefined) query.page = page;
      if (pageSize !== undefined) query.pageSize = pageSize;
      if (useScroll !== undefined) query.useScroll = useScroll;
      if (scrollId !== undefined) query.scrollId = scrollId;
      const result = await http.getJson('/api/company/export', query);
      return toolResponse(result);
    }
  );

  server.registerTool(
    'field_lookup',
    {
      title: 'Location lookup',
      description:
        'GET /api/cities for exact city values used by search/export.',
      inputSchema: {
        search: z.string().describe('Autocomplete search string (query param search).'),
        countries: z.string().optional().describe('Optional countries query param (ISO code).'),
        limit: z.number().int().positive().optional().describe('Optional limit (default 100).'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ search, countries, limit }) => {
      const query: Record<string, unknown> = { search };
      if (countries !== undefined) query.countries = countries;
      if (limit !== undefined) query.limit = limit;
      const result = await http.getJson('/api/cities', query);
      return toolResponse(result);
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
