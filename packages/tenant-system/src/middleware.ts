import { NextRequest, NextResponse } from 'next/server';
import { Organization } from './types';

export async function tenantMiddleware(request: NextRequest) {
  const url = new URL(request.url);
  
  // Detectar tenant por subdomínio
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];
  
  // Detectar tenant por path
  const pathSegments = url.pathname.split('/');
  const possibleSlug = pathSegments[1];
  
  let tenantSlug: string | null = null;
  
  // Prioridade: subdomínio > path > header
  if (subdomain && subdomain !== 'www' && subdomain !== 'app') {
    tenantSlug = subdomain;
  } else if (possibleSlug && !['api', 'auth', 'assets'].includes(possibleSlug)) {
    tenantSlug = possibleSlug;
  } else {
    tenantSlug = request.headers.get('x-tenant-slug');
  }
  
  // Se não encontrou tenant, redirecionar para landing
  if (!tenantSlug && !url.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth/select-organization', url));
  }
  
  // Adicionar tenant ao header para uso posterior
  const response = NextResponse.next();
  if (tenantSlug) {
    response.headers.set('x-tenant-slug', tenantSlug);
  }
  
  return response;
}

export function createTenantMiddleware(config?: {
  publicPaths?: string[];
  defaultTenant?: string;
}) {
  return (request: NextRequest) => {
    const url = new URL(request.url);
    
    // Pular middleware para paths públicos
    if (config?.publicPaths?.some(path => url.pathname.startsWith(path))) {
      return NextResponse.next();
    }
    
    return tenantMiddleware(request);
  };
}