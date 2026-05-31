export const RESERVED_SUBDOMAINS = new Set(['www','admin','seller','account','api','auth','shop','support','help','mail','app','dashboard','static','assets','cdn','blog']);

export function isValidSubdomain(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length >= 3 && value.length <= 40 && !RESERVED_SUBDOMAINS.has(value);
}

export function getHostname(headersList: Headers) {
  return (headersList.get('x-forwarded-host') || headersList.get('host') || '').split(':')[0].toLowerCase();
}