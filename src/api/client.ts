export type JsonResult = {
  ok: boolean;
  status: number;
  body: unknown;
};

/** HTTP client aligned with companydata-website-nextjs/public/openapi.json */
export class CompanyDataHttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string
  ) {}

  async getJson(path: string, query: Record<string, unknown>): Promise<JsonResult> {
    const url = new URL(path.startsWith('/') ? path : `/${path}`, `${this.baseUrl}/`);
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      if (value === '') continue;
      url.searchParams.set(key, String(value));
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60_000);
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'x-api-key': this.apiKey },
        signal: controller.signal,
      });
      const text = await res.text();
      let body: unknown = text;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        /* keep raw text */
      }
      return { ok: res.ok, status: res.status, body };
    } finally {
      clearTimeout(timer);
    }
  }
}
