# AGENTS.md for bun-bkp

## Purpose

This file provides a comprehensive prompt for LLMs to understand and use the `bun-bkp` package effectively, minimizing hallucinations and errors.

---

## Package Overview

- **Name:** bun-bkp
- **Type:** Node.js/TypeScript package
- **Location:** /src/backup.ts, /src/index.ts, /src/types.ts
- **Main Entry:** src/index.ts
- **Description:**
  `bun-bkp` is a backup utility package designed for Bun runtime environments. It provides robust backup and restore functionality for files, directories, and data, with a focus on speed, reliability, and ease of integration.

---

## Key Features

- Backup files and directories efficiently
- Restore from backup archives
- Supports Bun runtime (not Node.js)
- TypeScript types for strong typing
- CLI and programmatic API

---

## Usage Instructions

### Importing

```ts
import { backup, restore } from 'bun-bkp';
```

### Backup Example

```ts
await backup({
  source: '/path/to/data',
  destination: '/path/to/backup',
  options: {
    compress: true,
    exclude: ['node_modules'],
  }
});
```

### Restore Example

```ts
await restore({
  backupPath: '/path/to/backup',
  targetPath: '/path/to/restore',
});
```

---

## API Reference

- **backup(options: BackupOptions): Promise<void>**
  - Backs up files/directories from source to destination
  - Options: compress, exclude, etc.
- **restore(options: RestoreOptions): Promise<void>**
  - Restores files/directories from backup archive

Types are defined in `src/types.ts`.

---

## Best Practices

- Always specify absolute paths for source and destination
- Use Bun runtime for execution
- Check for sufficient disk space before backup/restore
- Handle errors using try/catch

---

## Common Pitfalls

- Using with Node.js (not supported)
- Incorrect path specification
- Not handling errors

---

## Additional Resources

- See [CHANGELOG.md](CHANGELOG.md) for updates
- See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
- See [LICENSE](LICENSE) for license info

---

## LLM Prompt

You are an expert in using the `bun-bkp` package. Always:

- Use Bun runtime
- Reference API as described above
- Avoid hallucinating unsupported features
- Follow best practices and avoid common pitfalls
- Provide concise, accurate code examples

If unsure, refer to the API reference and package documentation.

---

## End of AGENTS.md
