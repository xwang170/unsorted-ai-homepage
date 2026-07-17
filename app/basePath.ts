// Must match `basePath` in next.config.ts. next/image with `unoptimized`
// (required for static export) does not prepend basePath to string `src`,
// and metadata icon hrefs aren't prefixed either, so we do it explicitly for
// hardcoded /public asset paths. Empty during `next dev` (served at root).
export const basePath = process.env.NODE_ENV === "production" ? "/unsorted-ai-homepage" : "";

export const asset = (path: string) => `${basePath}${path}`;
