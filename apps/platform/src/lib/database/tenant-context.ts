import { PrismaClient } from '@prisma/client';
import { getCurrentOrganization } from '@/lib/auth';

/**
 * Cliente Prisma com contexto de tenant
 * Automaticamente filtra todas as queries pelo organization_id atual
 */
export class TenantPrismaClient extends PrismaClient {
  constructor() {
    super();
    
    // Interceptar todas as queries para adicionar filtro de tenant
    this.$use(async (params, next) => {
      const organization = await getCurrentOrganization();
      
      if (!organization) {
        throw new Error('No organization context found');
      }
      
      // Definir o organization_id no contexto do PostgreSQL
      await this.$executeRaw`SET LOCAL app.current_organization_id = ${organization.id}::text`;
      
      // Para operações de criação, adicionar organization_id
      if (params.action === 'create' || params.action === 'createMany') {
        if (params.args.data) {
          if (Array.isArray(params.args.data)) {
            params.args.data = params.args.data.map(item => ({
              ...item,
              organization_id: organization.id
            }));
          } else {
            params.args.data.organization_id = organization.id;
          }
        }
      }
      
      // Para queries, adicionar filtro de organization_id
      if (['findUnique', 'findFirst', 'findMany', 'update', 'updateMany', 'delete', 'deleteMany'].includes(params.action)) {
        if (!params.args.where) {
          params.args.where = {};
        }
        params.args.where.organization_id = organization.id;
      }
      
      return next(params);
    });
  }
}

// Singleton do cliente
let prisma: TenantPrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new TenantPrismaClient();
} else {
  // Em desenvolvimento, reusar a mesma instância
  if (!global.prisma) {
    global.prisma = new TenantPrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;