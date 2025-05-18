---
title: Managing Sentry Client Keys with Alchemy
description: Learn how to create, configure, and manage Sentry client keys using Alchemy.
---

# Sentry Client Key

Create and manage Sentry client keys.

## Authentication

You can authenticate with Sentry in two ways:

1. Environment variable (recommended):
   ```bash
   # .env
   SENTRY_AUTH_TOKEN=your_auth_token
   ```

2. Pass the token directly:
   ```typescript
   const key = await ClientKey("my-key", {
     name: "My Key",
     project: "my-project",
     organization: "my-org",
     authToken: "your_auth_token"
   });
   ```

Get your auth token from [Sentry's API settings](https://sentry.io/settings/account/api/auth-tokens/).

## Usage

```typescript
import { ClientKey } from "@alchemy/providers/sentry";

// Create a basic client key
const key = await ClientKey("my-key", {
  name: "My Key",
  project: "my-project",
  organization: "my-org"
});

// Create a client key with rate limiting
const key = await ClientKey("rate-limited-key", {
  name: "Rate Limited Key",
  project: "my-project",
  organization: "my-org",
  rateLimit: {
    window: 3600, // 1 hour
    count: 1000   // 1000 events per hour
  }
});

// Create a client key with a custom auth token
const key = await ClientKey("my-key", {
  name: "My Key",
  project: "my-project",
  organization: "my-org",
  authToken: alchemy.secret("my-auth-token")
});
```

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | No | The name of the key |
| `project` | `string` | Yes | The project slug that owns the key |
| `organization` | `string` | Yes | The organization ID or slug that owns the key |
| `rateLimit` | `object` | No | Rate limit configuration |
| `useCase` | `string` | No | The use case for the key |
| `authToken` | `Secret` | No | Auth token to use (overrides environment variable) |
| `adopt` | `boolean` | No | Whether to adopt an existing key with the same name if it exists |

## Output

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | The ID of the key |
| `name` | `string` | The name of the key |
| `label` | `string` | The label of the key |
| `public` | `string` | The public key |
| `secret` | `string` | The secret key |
| `projectId` | `number` | The project ID |
| `isActive` | `boolean` | Whether the key is active |
| `dsn` | `object` | DSN configuration |
| `browserSdkVersion` | `string` | Browser SDK version |
| `browserSdk` | `object` | Browser SDK choices |
| `dateCreated` | `string` | Time at which the key was created |
| `dynamicSdkLoaderOptions` | `object` | Dynamic SDK loader options |

# ClientKey

The ClientKey resource lets you create and manage [Sentry](https://sentry.io) client keys for your projects.

## Minimal Example

Create a basic Sentry client key:

```ts
import { ClientKey } from "alchemy/sentry";

const key = await ClientKey("my-key", {
  name: "My Key",
  project: "my-project",
  organization: "my-org"
});
```

## Rate Limited Key

Create a client key with rate limiting:

```ts
import { ClientKey } from "alchemy/sentry";

const key = await ClientKey("rate-limited-key", {
  name: "Rate Limited Key",
  project: "my-project",
  organization: "my-org",
  rateLimit: {
    window: 3600, // 1 hour
    count: 1000   // 1000 events per hour
  }
});
```

## Use Case Specific Key

Create a client key for a specific use case:

```ts
import { ClientKey } from "alchemy/sentry";

const key = await ClientKey("profiling-key", {
  name: "Profiling Key",
  project: "my-project",
  organization: "my-org",
  useCase: "profiling"
});
```

## Adopt Existing Key

Create or adopt an existing key with the same name:

```ts
import { ClientKey } from "alchemy/sentry";

const key = await ClientKey("existing-key", {
  name: "Existing Key",
  project: "my-project",
  organization: "my-org",
  adopt: true
});
``` 