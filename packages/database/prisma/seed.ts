import { PrismaClient, Plan, Role } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Criar usuário admin principal
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@exzos.com.br' },
    update: {},
    create: {
      email: 'admin@exzos.com.br',
      name: 'Admin Exzos',
      clerkId: 'user_admin_exzos',
    },
  });

  // Criar organização Volaron
  const volaron = await prisma.organization.upsert({
    where: { slug: 'volaron' },
    update: {},
    create: {
      name: 'Volaron Store',
      slug: 'volaron',
      plan: Plan.ENTERPRISE,
      customDomain: 'volaron.com.br',
      settings: {
        theme: {
          primaryColor: '#8B5CF6',
          logo: '/logos/volaron.png',
        },
        features: {
          chat: true,
          ecommerce: true,
          analytics: true,
          automation: true,
          customModels: true,
        },
        ai: {
          models: ['gpt-4', 'claude-3', 'gemini-pro'],
          defaultModel: 'gpt-4',
          systemPrompt: 'Você é um assistente especializado em e-commerce e moda feminina.',
        },
        integrations: {
          n8n: {
            apiUrl: 'https://n8n-automation-production.up.railway.app',
            apiKey: 'n8n_api_volaron_2025',
          },
        },
      },
      limits: {
        users: 100,
        messagesPerMonth: 100000,
        storageGB: 500,
        customDomains: 5,
        apiRequestsPerMonth: 1000000,
      },
      members: {
        create: {
          userId: adminUser.id,
          role: Role.OWNER,
        },
      },
    },
  });

  // Criar organização Cliente X (exemplo)
  const clienteX = await prisma.organization.upsert({
    where: { slug: 'cliente-x' },
    update: {},
    create: {
      name: 'Cliente X',
      slug: 'cliente-x',
      plan: Plan.PRO,
      settings: {
        theme: {
          primaryColor: '#3B82F6',
          logo: '/logos/cliente-x.png',
        },
        features: {
          chat: true,
          ecommerce: false,
          analytics: true,
          automation: false,
          customModels: false,
        },
        ai: {
          models: ['gpt-4', 'claude-3'],
          defaultModel: 'gpt-4',
          systemPrompt: 'Você é um assistente profissional e eficiente.',
        },
      },
      limits: {
        users: 20,
        messagesPerMonth: 10000,
        storageGB: 50,
        customDomains: 1,
        apiRequestsPerMonth: 100000,
      },
      members: {
        create: {
          userId: adminUser.id,
          role: Role.ADMIN,
        },
      },
    },
  });

  // Criar alguns usuários de teste
  const testUsers = [
    { email: 'will@exzos.com.br', name: 'Will Rulli' },
    { email: 'carlos@volaron.com.br', name: 'Carlos Volaron' },
    { email: 'maria@clientex.com', name: 'Maria Silva' },
  ];

  for (const userData of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });

    // Adicionar usuários às organizações
    if (userData.email.includes('volaron')) {
      await prisma.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: volaron.id,
          role: Role.MEMBER,
        },
      });
    } else if (userData.email.includes('clientex')) {
      await prisma.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: clienteX.id,
          role: Role.MEMBER,
        },
      });
    }
  }

  // Criar API Keys de exemplo
  await prisma.apiKey.create({
    data: {
      name: 'Production API Key',
      key: 'exzos_pk_volaron_' + Math.random().toString(36).substring(7),
      organizationId: volaron.id,
    },
  });

  // Criar webhook de exemplo
  await prisma.webhook.create({
    data: {
      url: 'https://volaron.com.br/api/webhooks',
      events: ['order.created', 'order.updated', 'user.created'],
      secret: 'whsec_' + Math.random().toString(36).substring(7),
      organizationId: volaron.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n🎯 Organizations created:');
  console.log('  - Volaron Store (volaron)');
  console.log('  - Cliente X (cliente-x)');
  console.log('\n👥 Users created:');
  console.log('  - admin@exzos.com.br (Owner)');
  console.log('  - will@exzos.com.br');
  console.log('  - carlos@volaron.com.br');
  console.log('  - maria@clientex.com');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });