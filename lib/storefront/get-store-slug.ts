import { RESERVED_SUBDOMAINS } from './get-hostname';

export function getStoreSlugFromHostname(hostname: string, rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
  if (!rootDomain || !hostname.endsWith(rootDomain)) return null;
  const subdomain = hostname.slice(0, -rootDomain.length).replace(/\.$/, '');
  if (!subdomain || subdomain.includes('.') || RESERVED_SUBDOMAINS.has(subdomain)) return null;
  return subdomain;
}