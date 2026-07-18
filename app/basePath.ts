// Must match `basePath` in next.config.ts. Empty now that the site is served
// from the root of the custom domain (www.unsorted.ai); the helper stays so a
// future basePath change is a one-line edit.
export const basePath = "";

export const asset = (path: string) => `${basePath}${path}`;
