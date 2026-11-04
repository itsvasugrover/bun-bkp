# @vasugrover/bun-bkp

> [!WARNING]
> **This repository is now archived and read-only.** It is no longer actively maintained — no further commits, issues, or pull requests will be accepted. The code remains available for reference.

A modular backup and restore service for Bun applications. Built to integrate with Cloudflare R2 storage, it provides database export and import workflows with AES-256-CBC encryption, structured logging via Pino, and a flexible adapter pattern for supporting different database clients.

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Initializing the Service](#initializing-the-service)
  - [Performing a Backup](#performing-a-backup)
  - [Performing a Restore](#performing-a-restore)
  - [Using the Drizzle Adapter](#using-the-drizzle-adapter)
  - [Implementing a Custom Adapter](#implementing-a-custom-adapter)
- [API Reference](#api-reference)
  - [BackupService](#backupservice)
  - [Types](#types)
- [Project Structure](#project-structure)
- [Development](#development)
- [License](#license)

---

## Requirements

- [Bun](https://bun.sh) >= 1.3
- TypeScript >= 5 (peer dependency)
- A Cloudflare R2 bucket (or any S3-compatible storage)
- PostgreSQL (when using the built-in Drizzle adapter)

---

## Installation

```sh
bun add @vasugrover/bun-bkp
```

---

## Architecture

`bun-bkp` is built around three core concepts:

- **BackupService** — The central class that orchestrates backup and restore operations. It manages the S3/R2 client, handles encryption and decryption, and delegates data export/import to a database adapter.
- **DatabaseAdapter** — An interface that abstracts the database layer. You can use the built-in Drizzle adapter or implement your own to support any database.
- **Cloudflare R2 / S3 Storage** — Backup artifacts are uploaded to and downloaded from R2 using Bun's native S3Client.

```
BackupService
├── DatabaseAdapter (exportData / importData / isEmpty)
├── S3Client (Bun native, targets R2)
├── AES-256-CBC encryption/decryption
└── Pino logger (optional)
```

---

## Configuration

`BackupConfig` controls the behaviour of the service. All fields are optional unless your environment requires them.

| Field             | Type     | Default                         | Description                                              |
|-------------------|----------|---------------------------------|----------------------------------------------------------|
| `accessKeyId`     | `string` | —                               | S3/R2 access key ID                                      |
| `secretAccessKey` | `string` | —                               | S3/R2 secret access key                                  |
| `bucket`          | `string` | —                               | S3/R2 bucket name                                        |
| `endpoint`        | `string` | —                               | S3-compatible endpoint URL (e.g. Cloudflare R2, MinIO)  |
| `region`          | `string` | —                               | Storage region                                           |
| `backupKeyPattern`| `string` | `"backups/app-{date}.json"`     | Key pattern; `{date}` is replaced with `YYYY-MM-DD`     |
| `maxRetries`      | `number` | `3`                             | Maximum operation retries                                |
| `timeoutMs`       | `number` | `60000`                         | Operation timeout in milliseconds                        |
| `databaseUrl`     | `string` | —                               | PostgreSQL connection URL for `pg_dump` / `psql`        |
| `encryptionKey`   | `string` | —                               | AES-256-CBC encryption key for backup data              |

---

## Usage

### Initializing the Service

```ts
import { BackupService } from '@vasugrover/bun-bkp';
import { pino } from 'pino';

const logger = pino();

const backupService = new BackupService(
  myDatabaseAdapter,
  {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: process.env.R2_BUCKET,
    endpoint: process.env.R2_ENDPOINT,
    region: 'auto',
    databaseUrl: process.env.DATABASE_URL,
    encryptionKey: process.env.BACKUP_ENCRYPTION_KEY,
  },
  logger,
);
```

### Performing a Backup

```ts
const backupKey = await backupService.performBackup();

if (backupKey) {
  console.log(`Backup stored at: ${backupKey}`);
}
```

You can also supply a custom key for the backup artifact:

```ts
const backupKey = await backupService.performBackup({ key: 'backups/manual-2026-03-07.json' });
```

### Performing a Restore

Restore from the latest available backup:

```ts
await backupService.performRestore();
```

Restore from a specific backup key:

```ts
await backupService.performRestore({ key: 'backups/app-2026-03-07.json' });
```

Optionally clear existing data before restoring:

```ts
await backupService.performRestore({ clearExisting: true });
```

### Using the Drizzle Adapter

`BackupService` includes a built-in static factory for Drizzle ORM projects backed by PostgreSQL. It uses `pg_dump` and `psql` under the hood, both of which are invoked via `Bun.spawn`.

```ts
import { BackupService } from '@vasugrover/bun-bkp';
import { db } from './db'; // your Drizzle database instance
import * as schema from './db/schema'; // your table schemas

const config = {
  databaseUrl: process.env.DATABASE_URL,
  encryptionKey: process.env.BACKUP_ENCRYPTION_KEY,
  // ... R2 credentials
};

const adapter = BackupService.createDrizzleAdapter(db, schema, config);

const backupService = new BackupService(adapter, config, logger);
```

### Implementing a Custom Adapter

You can implement the `DatabaseAdapter` interface to support any database client:

```ts
import type { DatabaseAdapter, BackupData } from '@vasugrover/bun-bkp';

const myAdapter: DatabaseAdapter = {
  exportData: async (): Promise<BackupData> => {
    const sql = await myDb.dump(); // your export logic
    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      sql,
    };
  },

  importData: async (data: BackupData): Promise<void> => {
    await myDb.exec(data.sql); // your import logic
  },

  isEmpty: async (): Promise<boolean> => {
    const count = await myDb.query('SELECT COUNT(*) FROM users');
    return count === 0;
  },
};
```

---

## API Reference

### BackupService

#### Constructor

```ts
new BackupService(
  dbAdapter: DatabaseAdapter,
  config?: BackupConfig,
  logger?: Logger,
)
```

#### Instance Methods

| Method                              | Returns                  | Description                                                   |
|-------------------------------------|--------------------------|---------------------------------------------------------------|
| `performBackup(options?)`           | `Promise<string \| null>` | Exports, encrypts, and uploads a backup to R2                 |
| `performRestore(options?)`          | `Promise<void>`           | Downloads, decrypts, and imports a backup from R2             |
| `exportData()`                      | `Promise<BackupData>`     | Exports data from the database adapter                        |
| `importData(data)`                  | `Promise<void>`           | Imports data via the database adapter                         |
| `uploadBackup(data, key?)`          | `Promise<string>`         | Uploads raw bytes to R2 and returns the key                   |
| `downloadBackup(key)`               | `Promise<Uint8Array>`     | Downloads a backup artifact from R2                           |
| `getLatestBackupKey()`              | `Promise<string \| null>` | Lists R2 backups and returns the latest key                   |
| `isDatabaseEmpty()`                 | `Promise<boolean>`        | Checks if the database is empty via the adapter               |
| `isR2Available()`                   | `boolean`                 | Returns whether the R2 client is initialised                  |

#### Static Methods

| Method                                               | Returns           | Description                                     |
|------------------------------------------------------|-------------------|-------------------------------------------------|
| `BackupService.createDrizzleAdapter(db, schemas, config)` | `DatabaseAdapter` | Creates a Drizzle ORM adapter using pg_dump/psql |

---

### Types

#### `DatabaseAdapter`

```ts
type DatabaseAdapter = {
  exportData: () => Promise<BackupData>;
  importData: (data: BackupData) => Promise<void>;
  isEmpty: () => Promise<boolean>;
};
```

#### `BackupData`

```ts
type BackupData = {
  version: string;
  timestamp: string;
  sql: string;
};
```

#### `BackupConfig`

See [Configuration](#configuration) table above. Full type is available in `src/types.ts`.

#### `BackupOptions`

```ts
type BackupOptions = {
  key?: string;    // Custom backup key
  force?: boolean; // Force backup regardless of conditions
};
```

#### `RestoreOptions`

```ts
type RestoreOptions = {
  key?: string;            // Specific backup key to restore from
  clearExisting?: boolean; // Whether to clear existing data before restore
};
```

---

## Project Structure

```
src/
  backup.ts   — BackupService class implementation
  types.ts    — TypeScript type definitions
  index.ts    — Public exports
```

---

## Development

All development tasks are run with Bun.

```sh
# Lint
bun run lint

# Format
bun run format

# Lint + format (auto-fix)
bun run check

# CI check (no writes)
bun run ci:check

# Type check
bun run typecheck
```

---

## Contributing

Contributions are welcome. Please review the [contribution guidelines](CONTRIBUTING.md) before submitting changes. Ensure that:

1. All changes are backward compatible
2. TypeScript types are updated as needed
3. Documentation is kept current
4. All checks pass using Bun (`bun run typecheck`, `bun run lint`, `bun run build`)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Repository

- GitHub: [https://github.com/itsvasugrover/hono-openapi](https://github.com/itsvasugrover/hono-openapi)
- Issues: [https://github.com/itsvasugrover/hono-openapi/issues](https://github.com/itsvasugrover/hono-openapi/issues)

## Support

For questions or support, please open an issue on the GitHub repository.

---

**Status**: ⚠️ No longer maintained — this repository has been archived and is read-only. The npm package `@vasugrover/bun-bkp` is deprecated.
