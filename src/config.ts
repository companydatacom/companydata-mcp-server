export type AppConfig = {
  baseUrl: string;
  apiKey: string;
};

export function loadConfig(): AppConfig {
  const apiKey = process.env.COMPANYDATA_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'Missing COMPANYDATA_API_KEY. Set it in the MCP client env (e.g. Cursor MCP settings).'
    );
  }
  const raw =
    process.env.COMPANYDATA_API_BASE_URL?.trim() || 'https://app.companydata.com';
  const baseUrl = raw.replace(/\/$/, '');
  return { baseUrl, apiKey };
}
