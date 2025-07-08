import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getCurrentOrganization } from '@/lib/auth';

/**
 * Cliente S3 com isolamento por tenant
 * Cada organização tem seu próprio "namespace" no bucket
 */
export class TenantS3Client {
  private client: S3Client;
  private bucket: string;
  
  constructor() {
    this.client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || 'auto',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });
    
    this.bucket = process.env.S3_BUCKET || 'exzosverse';
  }
  
  /**
   * Gera o path com namespace da organização
   */
  private async getTenantPath(path: string): Promise<string> {
    const organization = await getCurrentOrganization();
    if (!organization) {
      throw new Error('No organization context found');
    }
    
    // Estrutura: organizations/{org_id}/{tipo}/{arquivo}
    return `organizations/${organization.id}/${path}`;
  }
  
  /**
   * Upload de arquivo com isolamento por tenant
   */
  async upload(key: string, body: Buffer | Uint8Array | string, contentType?: string) {
    const tenantKey = await this.getTenantPath(key);
    
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: tenantKey,
      Body: body,
      ContentType: contentType,
    });
    
    await this.client.send(command);
    return tenantKey;
  }
  
  /**
   * Gerar URL assinada para download
   */
  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const tenantKey = await this.getTenantPath(key);
    
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: tenantKey,
    });
    
    return getSignedUrl(this.client, command, { expiresIn });
  }
  
  /**
   * Deletar arquivo
   */
  async delete(key: string) {
    const tenantKey = await this.getTenantPath(key);
    
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: tenantKey,
    });
    
    await this.client.send(command);
  }
  
  /**
   * Calcular uso de armazenamento da organização
   */
  async calculateStorageUsage(): Promise<number> {
    const organization = await getCurrentOrganization();
    if (!organization) {
      throw new Error('No organization context found');
    }
    
    // Implementar lógica para calcular uso total
    // Pode usar ListObjectsV2Command com prefix
    return 0; // placeholder
  }
}

export const tenantS3 = new TenantS3Client();