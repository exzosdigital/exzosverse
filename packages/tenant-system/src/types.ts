export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'starter' | 'pro' | 'enterprise';
  customDomain?: string;
  createdAt: Date;
  updatedAt: Date;
  settings: OrganizationSettings;
  limits: OrganizationLimits;
}

export interface OrganizationSettings {
  theme: {
    primaryColor: string;
    logo?: string;
    favicon?: string;
    customCSS?: string;
  };
  features: {
    chat: boolean;
    ecommerce: boolean;
    analytics: boolean;
    automation: boolean;
    customModels: boolean;
  };
  ai: {
    models: string[];
    defaultModel: string;
    systemPrompt?: string;
  };
  integrations: {
    slack?: { webhookUrl: string };
    discord?: { webhookUrl: string };
    n8n?: { apiUrl: string; apiKey: string };
  };
}

export interface OrganizationLimits {
  users: number;
  messagesPerMonth: number;
  storageGB: number;
  customDomains: number;
  apiRequestsPerMonth: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  organizations: OrganizationMembership[];
  currentOrganizationId?: string;
}

export interface OrganizationMembership {
  organizationId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
}