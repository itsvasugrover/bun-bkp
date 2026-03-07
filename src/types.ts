/**
 * Database adapter interface for backup operations
 */
export type DatabaseAdapter = {
  /**
   * Export all data from the database
   */
  exportData: () => Promise<BackupData>;

  /**
   * Import data into the database
   */
  importData: (data: BackupData) => Promise<void>;

  /**
   * Check if database is empty
   */
  isEmpty: () => Promise<boolean>;
};

/**
 * Backup data structure
 */
export type BackupData = {
  version: string;
  timestamp: string;
  sql: string;
};

/**
 * Backup service configuration
 */
export type BackupConfig = {
  /**
   * S3 access key ID
   */
  accessKeyId?: string;

  /**
   * S3 secret access key
   */
  secretAccessKey?: string;

  /**
   * S3 bucket name
   */
  bucket?: string;

  /**
   * S3 endpoint URL (e.g. Cloudflare R2, MinIO)
   */
  endpoint?: string;

  /**
   * S3 region
   */
  region?: string;
  /**
   * Backup prefix/key pattern (default: "backups/app-{date}.json")
   */
  backupKeyPattern?: string;

  /**
   * Maximum number of retries for operations
   */
  maxRetries?: number;

  /**
   * Timeout for operations in milliseconds
   */
  timeoutMs?: number;

  /**
   * Database URL for SQL dumps
   */
  databaseUrl?: string;

  /**
   * Encryption key for backups
   */
  encryptionKey?: string;
};

/**
 * Backup service options
 */
export type BackupOptions = {
  /**
   * Custom backup key
   */
  key?: string;

  /**
   * Force backup even if conditions aren't met
   */
  force?: boolean;
};

/**
 * Restore options
 */
export type RestoreOptions = {
  /**
   * Specific backup key to restore from
   */
  key?: string;

  /**
   * Whether to clear existing data before restore
   */
  clearExisting?: boolean;
};
