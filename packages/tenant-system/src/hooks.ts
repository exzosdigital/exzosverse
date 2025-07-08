import { useEffect, useState } from 'react';
import { Organization, User } from './types';
import { useTenant } from './context';

export function useOrganization() {
  const { organization } = useTenant();
  return organization;
}

export function useUser() {
  const { user } = useTenant();
  return user;
}

export function useOrganizationFeature(feature: string) {
  const organization = useOrganization();
  
  if (!organization) return false;
  
  const features = organization.settings.features as any;
  return features[feature] === true;
}

export function useOrganizationTheme() {
  const organization = useOrganization();
  
  useEffect(() => {
    if (!organization) return;
    
    const theme = organization.settings.theme;
    
    // Aplicar cores do tema
    if (theme.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
    }
    
    // Aplicar CSS customizado
    if (theme.customCSS) {
      const styleId = 'tenant-custom-css';
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;
      
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      
      styleElement.textContent = theme.customCSS;
    }
    
    // Aplicar favicon
    if (theme.favicon) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = theme.favicon;
      }
    }
    
    return () => {
      // Limpar estilos ao desmontar
      const styleElement = document.getElementById('tenant-custom-css');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [organization]);
  
  return organization?.settings.theme;
}