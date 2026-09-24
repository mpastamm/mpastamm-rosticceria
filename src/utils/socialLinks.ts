export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok';

const SOCIAL_BASE_URLS: Record<SocialPlatform, string> = {
  instagram: 'https://instagram.com/',
  facebook: 'https://facebook.com/',
  tiktok: 'https://tiktok.com/@',
};

export function getSocialUrl(platform: SocialPlatform, value?: string): string {
  const trimmed = value?.trim() || '';
  if (!trimmed) return '';

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const handle = trimmed.replace(/^@/, '').replace(/^\/+/, '');
  if (!handle) return '';

  return `${SOCIAL_BASE_URLS[platform]}${handle}`;
}
