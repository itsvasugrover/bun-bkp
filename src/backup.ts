import { Buffer } from 'buffer';
import { S3Client } from 'bun';
import crypto from 'crypto';
import type { Logger } from 'pino';
import type {
  BackupConfig,
  BackupData,
  BackupOptions,
  DatabaseAdapter,
  RestoreOptions,
} from './types';

/**
 * Modular Backup Service for Bun applications
 * Supports backup and restore operations to/from R2 storage
 */
export class BackupService {
  private r2Client: S3Client | null = null;
  private config: BackupConfig;
  private logger?: Logger;

  constructor(
    private dbAdapter: DatabaseAdapter,
    config: BackupConfig = {},
    logger?: Logger,
  ) {
    this.config = {
      backupKeyPattern: 'backups/app-{date}.json',
      maxRetries: 3,
      timeoutMs: 60000,
      ...config,
    };
    this.logger = logger;
    this.initializeR2Client();
  }

  /**
   * Initialize R2 client if credentials are available
   */
  private initializeR2Client(): void {
    if (this.config.accessKeyId && this.config.secretAccessKey && this.config.bucket) {
      try {
        this.r2Client = new S3Client({
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey,
          bucket: this.config.bucket,
          endpoint: this.config.endpoint,
          region: this.config.region,
        });
        this.logger?.info('R2 client initialized for backups');
      } catch (error) {
        this.logger?.error(error, 'Failed to initialize R2 client');
      }
    } else {
      this.logger?.warn('R2 credentials not configured, backups disabled');
    }
  }

  /**
   * Check if R2 is configured and available
   */
  isR2Available(): boolean {
    return this.r2Client !== null;
  }

  /**
   * Generate backup key from pattern
   */
  private generateBackupKey(): string {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const pattern = this.config.backupKeyPattern || 'backups/app-{date}.json';
    return pattern.split('{date}').join(date);
  }

  /**
   * Export data from database adapter
   */
  async exportData(): Promise<BackupData> {
    this.logger?.info('Starting data export...');
    return await this.dbAdapter.exportData();
  }

  /**
   * Import data using database adapter
   */
  async importData(data: BackupData): Promise<void> {
    this.logger?.info('Starting data import...');
    return await this.dbAdapter.importData(data);
  }

  /**
   * Check if database is empty
   */
  async isDatabaseEmpty(): Promise<boolean> {
    return await this.dbAdapter.isEmpty();
  }

  /**
   * Upload backup to R2
   */
  async uploadBackup(data: Uint8Array, key?: string): Promise<string> {
    const client = this.r2Client;
    if (!client) {
      throw new Error('R2 client not available');
    }

    const backupKey = key || this.generateBackupKey();

    this.logger?.info({ key: backupKey }, 'Uploading backup to R2...');

    try {
      await client.write(backupKey, data);

      this.logger?.info({ key: backupKey }, 'Backup uploaded successfully');
      return backupKey;
    } catch (error) {
      this.logger?.error(error, 'Failed to upload backup to R2');
      throw error;
    }
  }

  /**
   * Download backup from R2
   */
  async downloadBackup(key: string): Promise<Uint8Array> {
    const client = this.r2Client;
    if (!client) {
      throw new Error('R2 client not available');
    }

    this.logger?.info({ key }, 'Downloading backup from R2...');

    try {
      const s3file = client.file(key);
      const buffer = await s3file.bytes();
      if (!buffer || buffer.length === 0) {
        throw new Error(`Backup not found: ${key}`);
      }

      this.logger?.info({ key }, 'Backup downloaded successfully');
      return buffer;
    } catch (error) {
      this.logger?.error(error, 'Failed to download backup from R2');
      throw error;
    }
  }

  /**
   * Get the latest backup key from R2
   */
  async getLatestBackupKey(): Promise<string | null> {
    if (!this.isR2Available()) {
      return null;
    }

    try {
      const result = await this.r2Client?.list({ prefix: 'backups/' });
      const files = result?.contents?.map((f) => f.key) ?? [];
      if (files.length === 0) {
        return null;
      }

      // For single backup file, check if the fixed key exists
      const backupKey = this.generateBackupKey();
      if (files.includes(backupKey)) {
        return backupKey;
      }

      return null;
    } catch (error) {
      this.logger?.error(error, 'Failed to list backup files');
      return null;
    }
  }

  /**
   * Perform full backup operation
   */
  async performBackup(options: BackupOptions = {}): Promise<string | null> {
    if (!this.isR2Available()) {
      this.logger?.warn('R2 not available, skipping backup');
      return null;
    }

    try {
      this.logger?.info('Starting backup operation...');

      // Export data
      const backupData = await this.exportData();

      // Encrypt
      const sql = backupData.sql;
      const sqlBytes = new TextEncoder().encode(sql);
      const password = this.config.encryptionKey || 'bhulgaya';
      const key_crypto = crypto.scryptSync(password, 'salt', 32);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', key_crypto, iv);
      let encrypted = cipher.update(sqlBytes);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      const finalData = Buffer.concat([iv, encrypted]);

      // Upload to R2
      const backupKey = await this.uploadBackup(finalData, options.key);

      this.logger?.info({ backupKey }, 'Backup operation completed successfully');
      return backupKey;
    } catch (error) {
      this.logger?.error(error, 'Backup operation failed');
      throw error;
    }
  }

  /**
   * Perform full restore operation
   */
  async performRestore(options: RestoreOptions = {}): Promise<void> {
    if (!this.isR2Available()) {
      throw new Error('R2 not available for restore');
    }

    try {
      this.logger?.info('Starting restore operation...');

      // Get backup key (latest if not specified)
      let key: string | undefined = options.key;
      if (!key) {
        key = (await this.getLatestBackupKey()) || undefined;
        if (!key) {
          throw new Error('No backup found');
        }
      }

      // Download backup
      const buffer = await this.downloadBackup(key);

      // Decrypt
      const iv = buffer.subarray(0, 16);
      const encrypted = buffer.subarray(16);
      const password = this.config.encryptionKey || 'bhulgaya';
      const key_crypto = crypto.scryptSync(password, 'salt', 32);
      const decipher = crypto.createDecipheriv('aes-256-cbc', key_crypto, iv);
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      const sql = new TextDecoder().decode(decrypted);

      const backupData: BackupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        sql,
      };

      // Optionally clear existing data
      if (options.clearExisting) {
        this.logger?.warn('Clear existing data option not implemented in base adapter');
      }

      // Import data
      await this.importData(backupData);

      this.logger?.info({ backupKey: key }, 'Restore operation completed successfully');
    } catch (error) {
      this.logger?.error(error, 'Restore operation failed');
      throw error;
    }
  }

  /**
   * Create a Drizzle ORM database adapter
   */
  static createDrizzleAdapter(
    db: { $count: (table: unknown) => Promise<number> },
    tableSchemas: Record<string, unknown>,
    config: BackupConfig,
  ): DatabaseAdapter {
    return {
      exportData: async (): Promise<BackupData> => {
        if (!config.databaseUrl) throw new Error('databaseUrl is required for pg_dump');
        // Run pg_dump to get SQL with clean options
        const proc = Bun.spawn(['pg_dump', '--clean', '--if-exists', config.databaseUrl], {
          stdout: 'pipe',
        });
        const sql = await new Response(proc.stdout).text();
        const exitCode = await proc.exited;
        if (exitCode !== 0) {
          throw new Error('pg_dump failed');
        }

        return {
          version: '1.0',
          timestamp: new Date().toISOString(),
          sql,
        };
      },

      importData: async (data: BackupData): Promise<void> => {
        const { sql } = data;

        if (!config.databaseUrl) throw new Error('databaseUrl is required for psql');
        // Run psql to import SQL
        const proc = Bun.spawn(['psql', config.databaseUrl], {
          stdin: 'pipe',
        });
        proc.stdin.write(sql);
        proc.stdin.end();
        const exitCode = await proc.exited;
        if (exitCode !== 0) {
          throw new Error('psql failed');
        }
      },

      isEmpty: async (): Promise<boolean> => {
        // Check if any table has data (using the first table as indicator)
        const firstTable = Object.values(tableSchemas)[0];
        if (!firstTable) return true;

        const result = await db.$count(firstTable);
        return result === 0;
      },
    };
  }
}
