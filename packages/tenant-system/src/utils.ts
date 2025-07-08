import { Organization } from './types';

export function getTenantUrl(organization: Organization, path = '') {
  if (organization.customDomain) {
    return `https://${organization.customDomain}${path}`;
  }
  
  // Usar subdomínio
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://exzosverse.com';
  const url = new URL(baseUrl);
  url.hostname = `${organization.slug}.${url.hostname}`;
  url.pathname = path;
  
  return url.toString();
}

export function isWithinLimit(organization: Organization, resource: keyof Organization['limits'], current: number) {
  const limit = organization.limits[resource];
  return current < limit;
}

export function canAccessFeature(organization: Organization, feature: keyof Organization['settings']['features']) {
  return organization.settings.features[feature] === true;
}

export function generateOrgSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}