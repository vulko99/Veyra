/** @type {import('next').NextConfig} */

// When API_PROXY_TARGET is set (e.g. in GitHub Codespaces), the Next.js server
// proxies /api/* to the backend so the browser only ever talks to a single
// origin (this frontend). This avoids cross-origin/forwarded-port auth issues.
// On a normal machine / Docker Compose this is unset and the frontend calls the
// backend directly via NEXT_PUBLIC_API_URL.
const apiProxyTarget = process.env.API_PROXY_TARGET;

const nextConfig = {
  reactStrictMode: true,
  // The backend API uses trailing slashes; don't let Next redirect them away
  // before the proxy rewrite runs.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    if (!apiProxyTarget) return [];
    // Every backend endpoint uses a trailing slash; re-add it so Django does
    // not 301 (which would also break POST bodies).
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*/`,
      },
    ];
  },
};

export default nextConfig;
