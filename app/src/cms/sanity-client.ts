// Sanity project config — set via environment variables
const SANITY_PROJECT_ID = import.meta.env.VITE_SANITY_PROJECT_ID || '';
const SANITY_DATASET = import.meta.env.VITE_SANITY_DATASET || 'production';
const SANITY_API_VERSION = '2024-01-01';

export const isSanityConfigured = (): boolean => {
  return !!SANITY_PROJECT_ID && SANITY_PROJECT_ID.length > 0;
};

// Lazy-loaded Sanity client to avoid importing @sanity/client when not configured
let _client: any = null;

export async function getSanityClient() {
  if (!_client) {
    const { createClient } = await import('@sanity/client');
    _client = createClient({
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      apiVersion: SANITY_API_VERSION,
      useCdn: true,
    });
  }
  return _client;
}
