import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import Redis from 'ioredis';

/**
 * Health check endpoint que verifica todos os serviços
 * Baseado na documentação do LobeChat
 */
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mode: process.env.NEXT_PUBLIC_SERVICE_MODE,
    services: {
      database: { status: 'unknown' },
      redis: { status: 'unknown' },
      s3: { status: 'unknown' },
      auth: { status: 'unknown' },
    },
  };
  
  // Verificar PostgreSQL
  try {
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    
    // Verificar se pgvector está instalado
    const pgvector = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
      ) as installed
    `;
    
    health.services.database = {
      status: 'healthy',
      driver: process.env.DATABASE_DRIVER || 'node',
      pgvector: pgvector[0]?.installed || false,
    };
    
    await prisma.$disconnect();
  } catch (error) {
    health.services.database = {
      status: 'unhealthy',
      error: error.message,
    };
    health.status = 'degraded';
  }
  
  // Verificar Redis
  try {
    const redis = new Redis(process.env.REDIS_URL!);
    await redis.ping();
    
    health.services.redis = {
      status: 'healthy',
    };
    
    redis.disconnect();
  } catch (error) {
    health.services.redis = {
      status: 'unhealthy',
      error: error.message,
    };
    health.status = 'degraded';
  }
  
  // Verificar S3
  if (process.env.S3_ENDPOINT) {
    try {
      const s3 = new S3Client({
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'auto',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
      });
      
      await s3.send(new HeadBucketCommand({
        Bucket: process.env.S3_BUCKET!,
      }));
      
      health.services.s3 = {
        status: 'healthy',
        bucket: process.env.S3_BUCKET,
      };
    } catch (error) {
      health.services.s3 = {
        status: 'unhealthy',
        error: error.message,
      };
      health.status = 'degraded';
    }
  }
  
  // Verificar Auth (Clerk ou NextAuth)
  if (process.env.CLERK_SECRET_KEY) {
    health.services.auth = {
      status: 'healthy',
      provider: 'clerk',
    };
  } else if (process.env.NEXTAUTH_SECRET) {
    health.services.auth = {
      status: 'healthy',
      provider: 'nextauth',
    };
  } else {
    health.services.auth = {
      status: 'unhealthy',
      error: 'No auth provider configured',
    };
    health.status = 'unhealthy';
  }
  
  return NextResponse.json(health, {
    status: health.status === 'healthy' ? 200 : 503,
  });
}