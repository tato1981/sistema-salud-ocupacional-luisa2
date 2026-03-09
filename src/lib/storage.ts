import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

// Environment variables
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // Optional custom domain

// Check if R2 is configured
const isR2Configured = R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME;

let s3Client: S3Client | null = null;

if (isR2Configured) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID!,
      secretAccessKey: R2_SECRET_ACCESS_KEY!,
    },
  });
}

export class StorageService {
  /**
   * Upload a file to storage (R2 or local filesystem)
   * @param buffer File content buffer
   * @param key File path/key (e.g., 'signatures/doctor-123.png')
   * @param contentType MIME type of the file
   * @returns The public URL or path to the file
   */
  static async uploadFile(buffer: Buffer, key: string, contentType: string): Promise<string> {
    if (isR2Configured && s3Client) {
      try {
        await s3Client.send(new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }));

        if (R2_PUBLIC_URL) {
          return `${R2_PUBLIC_URL}/${key}`;
        }
        
        // If no public URL is configured, we might return a signed URL or just the key
        // For now, let's return the key if no public URL, but ideally we want a distinct URL.
        // If the bucket allows public access (which R2 often does via custom domain), we construct it.
        return `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`; 
      } catch (error) {
        console.error('Error uploading to R2:', error);
        throw new Error('Failed to upload file to storage');
      }
    } else {
      // Fallback to local filesystem
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      const fullPath = path.join(uploadDir, key);
      const dir = path.dirname(fullPath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(fullPath, buffer);
      
      // Return URL path relative to public
      return `/uploads/${key}`;
    }
  }

  /**
   * Delete a file from storage
   * @param key File path/key
   */
  static async deleteFile(key: string): Promise<void> {
    if (isR2Configured && s3Client) {
      try {
        await s3Client.send(new DeleteObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
        }));
      } catch (error) {
        console.error('Error deleting from R2:', error);
        // Don't throw, just log
      }
    } else {
      // Local filesystem
      // Handle both full URL path or just key
      const cleanKey = key.startsWith('/uploads/') ? key.replace('/uploads/', '') : key;
      const fullPath = path.join(process.cwd(), 'public', 'uploads', cleanKey);
      
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
  }

  /**
   * Get a signed URL for a private file (valid for 1 hour)
   * Only applicable if using R2/S3
   */
  static async getSignedUrl(key: string): Promise<string | null> {
    if (isR2Configured && s3Client) {
      try {
        const command = new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
        });
        return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      } catch (error) {
        console.error('Error generating signed URL:', error);
        return null;
      }
    }
    return null;
  }
}
