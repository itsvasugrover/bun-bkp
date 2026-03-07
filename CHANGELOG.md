# Changelog

All notable changes to `@vasugrover/bun-bkp` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2027-03-07

### Added

- Initial release of `@vasugrover/bun-bkp`
- `BackupService` class for modular backup and restore operations
- Database adapter pattern with `DatabaseAdapter` interface
- Drizzle ORM adapter via `createDrizzleAdapter()` static method
- Cloudflare R2 storage integration for backup storage
- Automatic backup key generation with date-based patterns
- Encryption support for backups using AES-256-CBC
- `performBackup()` method for full backup operations
- `performRestore()` method for full restore operations
- `exportData()` method for database export
- `importData()` method for database import
- `uploadBackup()` method for R2 upload
- `downloadBackup()` method for R2 download
- `getLatestBackupKey()` method for finding latest backup
- `isDatabaseEmpty()` method for checking database state
- `isR2Available()` method for checking R2 client availability
- TypeScript support with full type definitions
- Integration with @vasugrover/bun-r2 for storage operations
- Integration with Pino for logging

### Features

- **Modular adapter pattern**: Extensible database adapter system for different database types
- **R2 storage**: Cloudflare R2 integration for reliable backup storage
- **Encryption**: AES-256-CBC encryption for secure backups
- **Drizzle ORM support**: Built-in adapter for Drizzle ORM databases
- **Automatic scheduling**: Easy integration with cron jobs or task schedulers
- **Configurable patterns**: Customizable backup key patterns with date placeholders
- **Latest backup detection**: Automatic detection of most recent backup
- **Retry logic**: Configurable retry settings for operations
- **Timeout control**: Configurable timeouts for backup operations
- **Type-safe**: Full TypeScript support with type inference

### Database Operations

- **Export**: Uses `pg_dump` with `--clean` and `--if-exists` flags
- **Import**: Uses `psql` for SQL restoration
- **Empty check**: Verifies database state before operations

### Backup Features

- **Date-based keys**: Automatic key generation with `{date}` placeholder
- **Custom keys**: Support for custom backup keys
- **Force mode**: Option to force backup even if conditions aren't met
- **Latest detection**: Finds most recent backup from R2

### Restore Features

- **Selective restore**: Restore from specific backup key
- **Latest restore**: Automatic restoration from latest backup
- **Clear option**: Optional clearing of existing data before restore
- **Decryption**: Automatic decryption of encrypted backups

### Encryption Details

- **Algorithm**: AES-256-CBC
- **Key derivation**: scrypt with salt
- **IV**: Random 16-byte initialization vector per backup
- **Default password**: Configurable via `encryptionKey` config

### Configuration Options

- `backupKeyPattern`: Backup key pattern (default: "backups/app-{date}.json")
- `maxRetries`: Maximum retry attempts (default: 3)
- `timeoutMs`: Operation timeout in milliseconds (default: 60000)
- `databaseUrl`: PostgreSQL connection URL for pg_dump/psql
- `encryptionKey`: Custom encryption key for backups
- Plus all R2 configuration options from @vasugrover/bun-r2

### Technical Details

- **Storage format**: Encrypted binary with IV prefix
- **Backup pattern**: `backups/app-YYYY-MM-DD.json` by default
- **Encryption**: IV (16 bytes) + encrypted data
- **Database tools**: Uses native `pg_dump` and `psql` for PostgreSQL
