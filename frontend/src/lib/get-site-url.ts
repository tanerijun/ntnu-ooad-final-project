export function getSiteURL(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // automatically set by Vercel.
    'http://localhost:3000/';
  // Include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  url = url.endsWith('/') ? url : `${url}/`;
  return url;
}
