import { createContext, useContext, ReactNode } from 'react';
import { Organization, User } from './types';

interface TenantContextValue {
  organization: Organization | null;
  user: User | null;
  isLoading: boolean;
  switchOrganization: (orgId: string) => Promise<void>;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({
  children,
  organization,
  user,
  isLoading = false
}: {
  children: ReactNode;
  organization: Organization | null;
  user: User | null;
  isLoading?: boolean;
}) {
  const switchOrganization = async (orgId: string) => {
    // Implementar lógica de troca de organização
    window.location.href = `/${orgId}`;
  };

  return (
    <TenantContext.Provider
      value={{
        organization,
        user,
        isLoading,
        switchOrganization
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}