import type { LandingResponse } from '@/types/landing';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export async function getLanding(
  locale: string = 'vi',
): Promise<LandingResponse> {
  const res = await fetch(
    `${API_BASE_URL}/landing?locale=${encodeURIComponent(locale)}`,
    {
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch landing: ${res.status}`);
  }

  return res.json();
}
